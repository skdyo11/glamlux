
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription,
  SheetHeader
} from '@/components/ui/sheet';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Navigation,
  Scissors,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Store,
  Camera,
  Upload,
  Check,
  RefreshCw,
  MapPin,
  Calendar,
  ShieldCheck,
  UserCheck,
  Truck,
  Package,
  Clock,
  TrendingUp,
  Users,
  QrCode,
  ScanLine,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { slugify } from '@/lib/utils';
import { signInAnonymously } from 'firebase/auth';
import { Html5Qrcode } from 'html5-qrcode';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />
});

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  const { getCurrency } = useStore();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  const [arrivals, setArrivals] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);

  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [activeSheet, setActiveSheet] = useState<'delivery' | 'service' | 'product' | 'profile' | 'image-upload' | 'survey' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageUploadType, setImageUploadType] = useState<'profile' | 'cover' | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [profilePreviews, setProfilePreviews] = useState<string[]>([]);
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mapLocation, setMapLocation] = useState<[number, number]>([31.5204, 74.3587]);
  const [addressInput, setAddressInput] = useState('');

  // Scanner State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRegionId = "qr-reader";

  // Survey State
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyData, setSurveyData] = useState({
    codeAgreed: false,
    capacity: '',
    logisticsPref: ''
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      signInAnonymously(auth).catch(err => console.error("Identity check failed", err));
    }
  }, [user, isUserLoading, isMounted, auth]);

  useEffect(() => {
    if (!user || !firestore) return;

    const checkBusiness = async () => {
      const q = query(collection(firestore, 'parlours'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const docId = docSnap.id;
        
        let currentSlug = data.slug;
        if (!currentSlug) {
          currentSlug = slugify(data.name || 'Artisan Studio');
          await updateDoc(doc(firestore, 'parlours', docId), { slug: currentSlug });
        }

        setHasBusiness(true);
        setMyBusiness({ ...data, id: docId, slug: currentSlug });
        setAddressInput(data.address || '');
        if (data.latitude && data.longitude) {
          setMapLocation([data.latitude, data.longitude]);
        }
      } else {
        setHasBusiness(false);
      }
    };

    checkBusiness();
  }, [user, firestore]);

  useEffect(() => {
    if (!user || !firestore || hasBusiness === false) return;

    const dealsQuery = query(collection(firestore, 'deals'), where('parlourOwnerId', '==', user.uid));
    const unsubDeals = onSnapshot(dealsQuery, (snapshot) => {
      setMyServices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const productsQuery = query(collection(firestore, 'products'), where('vendorId', '==', user.uid));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setMyProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const bookingsQuery = query(collection(firestore, 'bookings'), where('vendorId', '==', user.uid));
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setArrivals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubDeals();
      unsubProducts();
      unsubBookings();
    };
  }, [user, firestore, hasBusiness]);

  // Scanner Logic
  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    
    const html5QrCode = new Html5Qrcode(videoRegionId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Find matching arrival
          const found = arrivals.find(a => a.referenceCode === decodedText || a.id === decodedText);
          if (found) {
            html5QrCode.stop();
            scannerRef.current = null;
            setSelectedArrival(found);
            toast({ title: "Guest Recognized", description: `Scanned ${found.userName}` });
            setActiveTab('bookings');
          }
        },
        () => {} // Silent on failure
      );
      setHasCameraPermission(true);
    } catch (err) {
      setHasCameraPermission(false);
      scannerRef.current = null;
    }
  }, [arrivals, toast]);

  useEffect(() => {
    if (activeTab === 'scanner') {
      startScanner();
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current = null;
        }).catch(() => {
          scannerRef.current = null;
        });
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [activeTab, startScanner]);

  const globalOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !myBusiness?.isDeliveryTeam) return null;
    return query(collection(firestore, 'bookings'), where('deliveryStatus', '==', 'Pending'), where('riderId', '==', null));
  }, [firestore, myBusiness?.isDeliveryTeam]);

  const myCommitmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !myBusiness?.isDeliveryTeam) return null;
    return query(collection(firestore, 'bookings'), where('riderId', '==', user.uid));
  }, [firestore, user?.uid, myBusiness?.isDeliveryTeam]);

  const { data: globalOrders, isLoading: isLoadingGlobal } = useCollection(globalOrdersQuery);
  const { data: myCommitments, isLoading: isLoadingMyDeliveries } = useCollection(myCommitmentsQuery);

  const generatePreviews = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      const randomSeed = () => Math.random().toString(36).substring(7);
      const profs = [
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomSeed()}`,
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomSeed()}`,
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomSeed()}`,
      ];
      const covs = [
        `https://picsum.photos/seed/${randomSeed()}/1600/400`,
        `https://picsum.photos/seed/${randomSeed()}/1600/400`,
      ];
      setProfilePreviews(profs);
      setCoverPreviews(covs);
      setIsRolling(false);
    }, 400);
  }, []);

  const handleStartBusiness = async (type: 'parlour' | 'shop') => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Login Required" });
      return;
    }
    try {
      const businessName = type === 'parlour' ? `${user.displayName || 'My'} Parlour` : `${user.displayName || 'My'} Shop`;
      const baseSlug = slugify(businessName);
      const businessSlug = `${baseSlug}-${user.uid.slice(0, 5)}`;

      const batch = writeBatch(firestore);
      const bizRef = doc(firestore, 'parlours', user.uid);
      
      batch.set(bizRef, {
        id: user.uid,
        ownerId: user.uid,
        name: businessName,
        slug: businessSlug,
        areaTag: 'Select Area',
        latitude: 31.5204,
        longitude: 74.3587,
        rating: 5.0,
        imageUrls: [],
        description: type === 'parlour' ? 'High-end beauty services.' : 'Premium makeup products.',
        createdAt: serverTimestamp()
      });
      
      const pRef = doc(collection(firestore, 'products'));
      batch.set(pRef, {
        id: pRef.id,
        vendorId: user.uid, 
        name: 'Classic Foundation',
        brand: 'Your Brand',
        price: 120,
        currency: 'PKR',
        stockCount: 10,
        imageUrl: `https://picsum.photos/seed/p-${pRef.id}/600/800`,
        isDummy: true,
        createdAt: serverTimestamp()
      });

      const dRef = doc(collection(firestore, 'deals'));
      batch.set(dRef, {
        id: dRef.id,
        parlourId: user.uid,
        parlourOwnerId: user.uid,
        name: 'Transformation Package',
        category: 'Bridal',
        discountPrice: 21,
        basePrice: 45,
        currency: 'PKR',
        depositPercent: 10,
        isDummy: true,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      setHasBusiness(true);
      setMyBusiness({ id: user.uid, name: businessName, slug: businessSlug });
      toast({ title: "Shop Created" });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    }
  };

  const updateArrivalStatus = async (id: string, newStatus: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'bookings', id), { deliveryStatus: newStatus });
      toast({ title: "Status Saved" });
      setSelectedArrival(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleCommitToOrder = async (orderId: string) => {
    if (!firestore || !user) return;
    try {
      await updateDoc(doc(firestore, 'bookings', orderId), {
        riderId: user.uid,
        deliveryStatus: 'Committed',
        updatedAt: serverTimestamp()
      });
      toast({ title: "Order Accepted", description: "You are handling this delivery." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeSheet || !firestore) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const detail = formData.get('detail') as string;
    const priceVal = parseFloat(formData.get('price') as string);
    const basePriceVal = parseFloat(formData.get('basePrice') as string) || priceVal;
    const durationDays = parseInt(formData.get('duration') as string) || 0;
    const description = formData.get('description') as string;

    const expiryDate = durationDays > 0 
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    try {
      if (activeSheet === 'product') {
        const productData = {
          name, 
          brand: detail, 
          price: priceVal, 
          basePrice: basePriceVal,
          discountExpiry: expiryDate,
          stockCount: 50,
          updatedAt: serverTimestamp()
        };
        if (editingItem) {
          await updateDoc(doc(firestore, 'products', editingItem.id), productData);
        } else {
          await addDoc(collection(firestore, 'products'), {
            ...productData,
            vendorId: user.uid,
            imageUrl: 'https://picsum.photos/seed/v-new/400/500',
            currency: 'PKR',
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'service') {
        const dealData = {
          name, 
          category: detail, 
          discountPrice: priceVal, 
          basePrice: basePriceVal,
          expiryDate: expiryDate,
          updatedAt: serverTimestamp()
        };
        if (editingItem) {
          await updateDoc(doc(firestore, 'deals', editingItem.id), dealData);
        } else {
          await addDoc(collection(firestore, 'deals'), {
            ...dealData,
            parlourOwnerId: user.uid,
            parlourId: user.uid,
            depositPercent: 10,
            currency: 'PKR',
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'profile' && myBusiness) {
        await updateDoc(doc(firestore, 'parlours', myBusiness.id), {
          name, areaTag: detail, description: description, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1]
        });
        setMyBusiness({ ...myBusiness, name, areaTag: detail, description: description, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1] });
      }

      toast({ title: "Changes Saved" });
      setActiveSheet(null);
      setEditingItem(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  const handleEdit = (type: 'product' | 'service', item: any) => {
    setEditingItem(item);
    setActiveSheet(type);
  };

  const handleApplyIdentity = async (url: string) => {
    if (!firestore || !myBusiness || !imageUploadType) return;
    const field = imageUploadType === 'cover' ? 'myCover' : 'myImage';
    try {
      await updateDoc(doc(firestore, 'parlours', myBusiness.id), { [field]: url });
      setMyBusiness({ ...myBusiness, [field]: url });
      toast({ title: "Image Applied" });
      setActiveSheet(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && myBusiness && firestore) {
      setIsUploading(true);
      setUploadProgress(10);
      const reader = new FileReader();
      const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 200);
      reader.onloadend = async () => {
        clearInterval(interval);
        setUploadProgress(100);
        const base64String = reader.result as string;
        const field = imageUploadType === 'cover' ? 'myCover' : 'myImage';
        try {
          await updateDoc(doc(firestore, 'parlours', myBusiness.id), { [field]: base64String });
          setMyBusiness({ ...myBusiness, [field]: base64String });
          toast({ title: "Upload Successful" });
          setTimeout(() => { setIsUploading(false); setUploadProgress(0); setActiveSheet(null); }, 500);
        } catch (error) {
          setIsUploading(false);
          toast({ variant: "destructive", title: "Upload Failed" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openImageModal = (type: 'profile' | 'cover') => {
    setImageUploadType(type);
    generatePreviews();
    setActiveSheet('image-upload');
  };

  const handleSurveyComplete = async () => {
    if (!firestore || !myBusiness) return;
    try {
      await updateDoc(doc(firestore, 'parlours', myBusiness.id), { isDeliveryTeam: true });
      setMyBusiness({ ...myBusiness, isDeliveryTeam: true });
      toast({
        title: "Setup Complete",
        description: "You can now handle local deliveries.",
      });
      setActiveSheet(null);
      setSurveyStep(1);
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    }
  };

  if (!isMounted || isUserLoading) return null;

  if (hasBusiness === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-14 font-body">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-16">
          <header className="text-center space-y-6 max-w-2xl">
            <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">Set up your shop</span>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary leading-none">Setup your business.</h1>
            <p className="text-lg text-muted-foreground font-body italic">Choose your business type to start selling on GlamLux.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-primary/10 w-full max-w-4xl shadow-2xl bg-white dark:bg-card/20">
            <button onClick={() => handleStartBusiness('parlour')} className="group p-16 space-y-10 text-left border-r border-primary/10 hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <Scissors className="h-12 w-12 text-secondary transition-all group-hover:scale-110" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Beauty Parlour</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Offer beauty services and take online bookings.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Start <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
            <button onClick={() => handleStartBusiness('shop')} className="group p-16 space-y-10 text-left hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <ShoppingBag className="h-12 w-12 text-secondary transition-all group-hover:scale-110" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Product Shop</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Sell makeup and skincare items online.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Start <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const profileImageUrl = (myBusiness?.myImage && myBusiness.myImage !== "") ? myBusiness.myImage : (user ? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.uid}` : undefined);
  const coverImageUrl = myBusiness?.myCover || `https://picsum.photos/seed/vogue-portal/1600/400`;

  return (
    <div className="min-h-screen bg-background pb-32 font-body">
      <Navbar />
      
      <main className="container mx-auto px-6 py-14 md:py-32">
        <header className="relative mb-32 border border-primary/10 bg-white dark:bg-card shadow-2xl overflow-hidden">
          <div className="relative w-full h-48 md:h-80 overflow-hidden border-b border-primary/10 group">
            <Image src={coverImageUrl} alt="Cover" fill className="object-cover transition-all duration-1000" priority />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={() => openImageModal('cover')} className="rounded-none vogue-button bg-primary text-primary-foreground border-none h-14 px-10 text-[10px] shadow-2xl hover:scale-105 active:scale-95">Change Cover</Button>
            </div>
          </div>

          <div className="p-10 flex flex-col md:flex-row items-center md:items-end gap-12 -mt-20 md:-mt-24">
            <div className="relative h-40 w-40 md:h-56 md:w-56 overflow-hidden border-4 border-white dark:border-card bg-white dark:bg-background group shadow-2xl z-10">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={profileImageUrl} className="object-cover transition-all duration-1000" />
                <AvatarFallback className="bg-primary/5"><Store className="h-10 w-10 opacity-20" strokeWidth={1.5} /></AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => openImageModal('profile')}>
                <Camera className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="flex-grow space-y-6 pb-4">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary">{myBusiness?.name || 'Shop'}</h1>
                <div className="flex flex-wrap gap-8 text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground italic">
                  <span className="flex items-center gap-2 hover:text-secondary transition-all"><Navigation className="h-3 w-3 text-secondary" strokeWidth={1.5} /> {myBusiness?.areaTag}</span>
                  <span className="flex items-center gap-2 text-primary"><Sparkles className="h-3 w-3 text-secondary" strokeWidth={1.5} /> Verified</span>
                  {myBusiness?.isDeliveryTeam && (
                    <span className="flex items-center gap-2 text-emerald-600"><ShieldCheck className="h-3 w-3" strokeWidth={1.5} /> Delivery Team</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pb-4">
              <Button variant="outline" onClick={() => setActiveSheet('profile')} className="rounded-none border-primary/20 vogue-button text-[10px] h-14 px-10 hover:bg-primary/5">Edit Profile</Button>
              <Button onClick={() => setActiveSheet('survey')} className="rounded-none vogue-button bg-primary text-primary-foreground text-[10px] h-14 px-10 shadow-xl hover:scale-105 active:scale-95">Deliveries</Button>
            </div>
          </div>
        </header>

        <header className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="bg-primary p-10 rounded-none border-none shadow-xl text-primary-foreground flex items-center justify-between group">
            <div className="space-y-2">
               <p className="text-5xl font-bold font-headline">{arrivals.length}</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Total Orders</p>
            </div>
            <Users className="h-12 w-12 opacity-20 group-hover:scale-110 transition-transform" />
          </Card>
          <Card className="bg-white dark:bg-card p-10 rounded-none border border-primary/10 shadow-xl text-primary flex items-center justify-between group">
            <div className="space-y-2">
               <p className="text-5xl font-bold font-headline">{(arrivals.length * 12.5).toFixed(1)}k</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Est. Revenue</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-10 group-hover:scale-110 transition-transform text-secondary" />
          </Card>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
          <TabsList className="bg-transparent h-auto gap-12 border-b border-primary/10 w-full justify-start rounded-none p-0 overflow-x-auto scrollbar-hide">
            {[
              myBusiness?.isDeliveryTeam ? { id: 'dispatch', label: '01 Orders' } : null,
              { id: 'bookings', label: myBusiness?.isDeliveryTeam ? '02 Queue' : '01 Queue' },
              { id: 'items', label: myBusiness?.isDeliveryTeam ? '03 Items' : '02 Items' },
              { id: 'services', label: myBusiness?.isDeliveryTeam ? '04 Services' : '03 Services' },
              { id: 'scanner', label: myBusiness?.isDeliveryTeam ? '05 Scan QR' : '04 Scan QR' },
            ].filter(Boolean).map((tab: any) => (
              <TabsTrigger 
                key={tab.id} value={tab.id} 
                className="bg-transparent px-0 pb-6 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent font-bold text-[11px] uppercase tracking-[0.5em] text-primary/40 data-[state=active]:text-primary transition-all hover:text-primary whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dispatch" className="space-y-24">
             <section className="space-y-12">
               <div className="border-b border-primary/10 pb-8 space-y-2">
                 <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Available Deliveries.</h3>
                 <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/30">Orders in your area ready for pickup</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {isLoadingGlobal ? (
                   [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-none border border-primary/10" />)
                 ) : globalOrders?.map((order) => (
                   <article key={order.id} className="p-8 border border-primary/10 bg-white dark:bg-card space-y-6 shadow-sm hover:shadow-xl transition-all">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{order.referenceCode}</span>
                          <h4 className="font-headline text-2xl">{order.shippingAddress || 'Pickup'}</h4>
                        </div>
                        <Truck className="h-6 w-6 text-primary/10" strokeWidth={1} />
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <Package className="h-3 w-3" /> {order.cartItems?.length || 0} Items
                        <Clock className="h-3 w-3 ml-2" /> Pending
                     </div>
                     <Button 
                       onClick={() => handleCommitToOrder(order.id)}
                       className="w-full h-12 bg-primary text-primary-foreground rounded-none vogue-button text-[9px] shadow-lg"
                      >
                        Accept
                      </Button>
                   </article>
                 ))}
                 {!isLoadingGlobal && globalOrders?.length === 0 && (
                   <div className="col-span-full py-20 text-center border border-dashed border-primary/10">
                     <p className="font-headline text-2xl italic text-primary/20">No active delivery requests.</p>
                   </div>
                 )}
               </div>
             </section>

             <section className="space-y-12">
               <div className="border-b border-primary/10 pb-8 space-y-2">
                 <h3 className="text-4xl font-headline tracking-tighter text-primary italic">My Tasks.</h3>
                 <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/30">Your active delivery assignments</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {isLoadingMyDeliveries ? (
                   [1, 2].map(i => <Skeleton key={i} className="h-48 rounded-none border border-primary/10" />)
                 ) : myCommitments?.map((order) => (
                   <article key={order.id} className="p-8 border-2 border-primary bg-primary/5 space-y-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                       <ShieldCheck className="h-20 w-20" />
                     </div>
                     <div className="space-y-1">
                        <Badge className="bg-primary text-primary-foreground rounded-none text-[8px] uppercase font-black px-2 py-0.5 mb-2">My Task</Badge>
                        <span className="block text-[9px] font-black text-secondary uppercase tracking-widest">{order.referenceCode}</span>
                        <h4 className="font-headline text-2xl">{order.userName}</h4>
                        <p className="text-xs italic text-muted-foreground">{order.shippingAddress}</p>
                     </div>
                     <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Assigned</span>
                        <Button variant="outline" size="sm" onClick={() => setSelectedArrival(order)} className="rounded-none h-8 text-[8px] font-black uppercase border-primary/20">Update</Button>
                     </div>
                   </article>
                 ))}
               </div>
             </section>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-primary/10 shadow-2xl bg-white dark:bg-card/20">
              {arrivals.map((a) => (
                <article 
                  key={a.id} 
                  className="p-10 space-y-6 border-r border-primary/10 last:border-r-0 hover:bg-white dark:hover:bg-card transition-all cursor-pointer group"
                  onClick={() => setSelectedArrival(a)}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary group-hover:tracking-[0.2em] transition-all">{a.referenceCode}</span>
                    <h4 className="font-headline text-3xl text-primary">{a.userName || 'Guest'}</h4>
                  </div>
                  <Badge variant="outline" className="rounded-none border-primary/10 text-[9px] uppercase tracking-widest px-4 py-2 bg-primary/5 transition-all group-hover:bg-primary group-hover:text-primary-foreground">{a.deliveryStatus}</Badge>
                </article>
              ))}
              {arrivals.length === 0 && (
                <div className="col-span-full py-40 text-center space-y-4">
                   <p className="font-headline text-4xl italic text-primary/10">No bookings yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-12">
             <div className="border-b border-primary/10 pb-8 space-y-2">
               <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Verify Guest.</h3>
               <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/30">Scan the digital voucher to recognize guest</p>
             </div>
             
             <div className="max-w-xl mx-auto space-y-8">
               <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-primary/10 shadow-3xl bg-black">
                 <div id={videoRegionId} className="w-full h-full" />
                 {hasCameraPermission === false && (
                   <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-background/90 backdrop-blur-xl">
                      <div className="space-y-6">
                        <AlertCircle className="h-12 w-12 text-primary mx-auto opacity-20" />
                        <div className="space-y-2">
                          <p className="font-headline text-2xl text-primary">Camera Required.</p>
                          <p className="text-sm text-muted-foreground italic">Please enable camera access to verify arrivals.</p>
                        </div>
                        <Button onClick={startScanner} className="rounded-full px-8 h-14 font-bold uppercase tracking-widest text-[10px]">Retry Access</Button>
                      </div>
                   </div>
                 )}
                 <div className="absolute inset-0 pointer-events-none border-[4rem] border-black/20 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-white/40 border-dashed rounded-3xl animate-pulse" />
                 </div>
               </div>
               
               <Card className="p-8 rounded-[2rem] border-none shadow-xl bg-primary/5 border border-primary/5 flex items-center gap-6">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <ScanLine className="h-6 w-6" />
                 </div>
                 <div className="space-y-1">
                   <h4 className="font-headline text-xl italic">Instant Recognition</h4>
                   <p className="text-xs text-muted-foreground italic leading-relaxed">Position the guest's QR code within the frame to automatically retrieve their booking credentials.</p>
                 </div>
               </Card>
             </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-12">
            <div className="flex justify-between items-end border-b border-primary/10 pb-8">
              <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Catalogue.</h3>
              <Button onClick={() => { setEditingItem(null); setActiveSheet('product'); }} size="sm" className="rounded-none vogue-button text-[10px] h-12 px-8 bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95">
                <ShoppingBag className="h-4 w-4 mr-2" strokeWidth={1.5} /> Add Item
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {myProducts.map((p) => (
                <div key={p.id} className="space-y-6 group cursor-pointer" onClick={() => handleEdit('product', p)}>
                  <div className="relative aspect-square border border-primary/5 bg-muted overflow-hidden shadow-lg transition-all duration-700">
                    <Image src={p.imageUrl || 'https://picsum.photos/seed/p-1/400/500'} alt={p.name} fill className="object-cover transition-all duration-1000" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="secondary" className="rounded-none font-bold text-[10px] tracking-widest uppercase border-none">Edit</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline text-2xl text-primary transition-all group-hover:translate-x-1">{p.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold tracking-tighter text-secondary group-hover:text-primary transition-colors">{getCurrency()} {p.price?.toLocaleString()}</p>
                      {p.basePrice && p.basePrice > p.price && (
                        <p className="text-xs text-muted-foreground line-through opacity-40">{getCurrency()} {p.basePrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-12">
            <div className="flex justify-between items-end border-b border-primary/10 pb-8">
              <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Services.</h3>
              <Button onClick={() => { setEditingItem(null); setActiveSheet('service'); }} size="sm" className="rounded-none vogue-button text-[10px] h-12 px-8 bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95">
                <Scissors className="h-4 w-4 mr-2" strokeWidth={1.5} /> Add Service
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {myServices.map((d) => (
                <article key={d.id} className="p-12 border border-primary/10 bg-white dark:bg-card flex justify-between items-center group cursor-pointer transition-all hover:shadow-2xl" onClick={() => handleEdit('service', d)}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary group-hover:tracking-[0.6em] transition-all">{d.category}</span>
                      <h4 className="font-headline text-4xl text-primary leading-none">{d.name}</h4>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-2xl font-bold tracking-tighter text-primary">{getCurrency()} {d.discountPrice?.toLocaleString()}</p>
                      {d.basePrice && d.basePrice > d.discountPrice && (
                        <p className="text-sm text-muted-foreground line-through opacity-40">{getCurrency()} {d.basePrice.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 group-hover:text-secondary pt-4 flex items-center gap-2 transition-all">Edit <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={1.5} /></div>
                  </div>
                  <Scissors className="h-16 w-16 text-primary/5 group-hover:text-secondary/20 transition-all group-hover:rotate-45" strokeWidth={1} />
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Logistics Dialog */}
      <Dialog open={activeSheet === 'survey'} onOpenChange={() => { setActiveSheet(null); setSurveyStep(1); }}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden w-[95vw] max-w-xl animate-in zoom-in-95 duration-300">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8 md:p-12 space-y-12 font-body">
              <header className="space-y-4 border-b border-primary/10 pb-8">
                <div className="flex justify-between items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/5 border border-primary/10">
                    <ShieldCheck className="h-3 w-3 text-secondary" strokeWidth={1.5} />
                    <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[8px]">Delivery Setup</span>
                  </div>
                  <span className="text-[10px] font-black text-primary/20 uppercase tracking-widest">Step {surveyStep} / 3</span>
                </div>
                <DialogTitle className="text-4xl font-headline italic tracking-tighter text-primary leading-none">Partner Team.</DialogTitle>
                <DialogDescription className="font-body italic text-muted-foreground text-sm">Join the network to handle local area deliveries.</DialogDescription>
                <Progress value={(surveyStep / 3) * 100} className="h-0.5 rounded-none bg-primary/5 mt-4" />
              </header>

              <div className="min-h-[200px]">
                {surveyStep === 1 && (
                  <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-start gap-6 p-6 bg-primary/5 border border-primary/5">
                      <UserCheck className="h-10 w-10 text-secondary shrink-0" strokeWidth={1} />
                      <div className="space-y-2">
                        <h4 className="font-headline text-2xl italic">Guidelines</h4>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">By joining the team, you agree to provide timely deliveries and professional service.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setSurveyData(prev => ({ ...prev, codeAgreed: !prev.codeAgreed }))}>
                      <div className={cn(
                        "h-6 w-6 border-2 flex items-center justify-center transition-all",
                        surveyData.codeAgreed ? "bg-primary border-primary" : "border-primary/20 group-hover:border-secondary"
                      )}>
                        {surveyData.codeAgreed && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest">I agree to the terms.</span>
                    </div>
                  </section>
                )}

                {surveyStep === 2 && (
                  <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Daily Capacity</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {['1-5 Jobs', '6-12 Jobs', '13-20 Jobs', 'Unlimited'].map((opt) => (
                          <button 
                            key={opt}
                            onClick={() => setSurveyData(prev => ({ ...prev, capacity: opt }))}
                            className={cn(
                              "h-16 px-6 border text-[10px] font-bold uppercase tracking-widest transition-all",
                              surveyData.capacity === opt ? "bg-primary text-primary-foreground border-primary shadow-xl" : "border-primary/10 hover:border-secondary text-primary/60"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {surveyStep === 3 && (
                  <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2">
                        <Truck className="h-3 w-3 text-secondary" strokeWidth={1.5} /> Fulfillment
                      </Label>
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground italic leading-relaxed">How will you handle your shop's orders?</p>
                        <select 
                          value={surveyData.logisticsPref}
                          onChange={(e) => setSurveyData(prev => ({ ...prev, logisticsPref: e.target.value }))}
                          className="w-full h-14 bg-transparent border-b-2 border-primary/10 focus:border-secondary outline-none text-xl italic font-body px-0"
                        >
                          <option value="">Select Option...</option>
                          <option value="verified">Use Delivery Team</option>
                          <option value="independent">I will deliver items myself</option>
                        </select>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-4 pt-12 border-t border-primary/5">
                {surveyStep > 1 && (
                  <Button variant="ghost" onClick={() => setSurveyStep(s => s - 1)} className="rounded-none vogue-button text-[9px]">Back</Button>
                )}
                {surveyStep < 3 ? (
                  <Button 
                    onClick={() => setSurveyStep(s => s + 1)} 
                    disabled={(surveyStep === 1 && !surveyData.codeAgreed) || (surveyStep === 2 && !surveyData.capacity)}
                    className="flex-grow h-16 bg-primary text-primary-foreground rounded-none vogue-button text-[10px] shadow-2xl hover:scale-105"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSurveyComplete}
                    disabled={!surveyData.logisticsPref}
                    className="flex-grow h-16 bg-secondary text-secondary-foreground rounded-none vogue-button text-[10px] shadow-2xl hover:scale-105"
                  >
                    Finish
                  </Button>
                )}
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={activeSheet === 'image-upload'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none w-[92vw] sm:max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-300">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-8 md:p-10 space-y-12 font-body">
              <div className="border-b border-primary/10 pb-8 space-y-4">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-3xl font-headline italic text-primary">Identity.</DialogTitle>
                  <div className="group cursor-pointer p-2 rounded-full hover:bg-primary/5 transition-all" onClick={generatePreviews}>
                    <RefreshCw className={cn("h-5 w-5 text-primary/30 group-hover:text-secondary", isRolling && "animate-spin")} strokeWidth={1.5} />
                  </div>
                </div>
                <DialogDescription className="font-body text-muted-foreground italic text-sm">Choose a generated look or upload your own.</DialogDescription>
              </div>

              <div className="space-y-10">
                {isUploading ? (
                  <div className="space-y-6 py-10">
                    <Progress value={uploadProgress} className="h-1 rounded-none bg-primary/5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center animate-pulse">Uploading...</p>
                  </div>
                ) : (
                  <div className={cn("grid gap-4", imageUploadType === 'profile' ? "grid-cols-3" : "grid-cols-1")}>
                    {(imageUploadType === 'profile' ? profilePreviews : coverPreviews).map((url, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleApplyIdentity(url)} 
                        className="relative aspect-square border border-primary/10 group overflow-hidden bg-primary/5 shadow-inner transition-all hover:scale-105"
                      >
                        <img src={url} alt="Option" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Check className="h-8 w-8 text-white" strokeWidth={2} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="pt-6">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-16 rounded-none vogue-button border-primary/10 text-[10px] group shadow-sm hover:bg-primary/5 transition-all">
                    <Upload className="h-4 w-4 mr-3 transition-transform group-hover:-translate-y-1" strokeWidth={1.5} /> Custom Photo
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={activeSheet === 'product' || activeSheet === 'service' || activeSheet === 'profile'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className={cn("rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 w-[95vw] sm:w-full", activeSheet === 'profile' ? "max-w-4xl" : "max-w-md")}>
          <ScrollArea className="max-h-[90vh] font-body">
            <div className="p-8 md:p-12 space-y-12">
              <div className="border-b border-primary/10 pb-8 space-y-4">
                <DialogTitle className="text-4xl font-headline tracking-tighter italic leading-none">Edit Details.</DialogTitle>
                <DialogDescription className="font-body italic text-muted-foreground">Update your listing or profile information.</DialogDescription>
              </div>
              
              <form onSubmit={handleSheetSubmit} className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Name</Label>
                  <Input 
                    name="name" 
                    required 
                    placeholder={activeSheet === 'profile' ? "Business Name" : "Item Name"}
                    defaultValue={editingItem?.name || (activeSheet === 'profile' ? myBusiness?.name : '')}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-2xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">
                      {activeSheet === 'profile' ? 'Area' : activeSheet === 'product' ? 'Brand' : 'Category'}
                    </Label>
                    <Input 
                      name="detail" 
                      required 
                      placeholder={activeSheet === 'profile' ? "e.g. Gulberg, Lahore" : "Detail"}
                      defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.brand : editingItem.category) : (activeSheet === 'profile' ? myBusiness?.areaTag : '')}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                    />
                  </div>
                  
                  {activeSheet !== 'profile' ? (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Price ({getCurrency()})</Label>
                      <Input 
                        name="price" 
                        required 
                        type="number"
                        placeholder="Price"
                        defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.price : editingItem.discountPrice) : ''}
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">About</Label>
                      <Input 
                        name="description" 
                        required 
                        placeholder="Tell guests about your shop..."
                        defaultValue={myBusiness?.description || ''}
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                  )}
                </div>

                {activeSheet !== 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-primary/5 pt-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Full Price</Label>
                      <Input 
                        name="basePrice" 
                        type="number"
                        placeholder="Before discount"
                        defaultValue={editingItem?.basePrice || ''}
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> Expiry (Days)
                      </Label>
                      <Input 
                        name="duration" 
                        type="number"
                        placeholder="7"
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                  </div>
                )}

                {activeSheet === 'profile' && (
                  <div className="space-y-12 pt-8 border-t border-primary/10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2"><MapPin className="h-3 w-3 text-secondary fill-secondary" strokeWidth={1.5} /> Map Location</Label>
                      <Input 
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Full physical address..." 
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                    <div className="rounded-none border border-primary/10 overflow-hidden shadow-inner">
                      <Map center={mapLocation} onLocationSelect={(lat, lng) => setMapLocation([lat, lng])} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-20 bg-primary text-primary-foreground rounded-none vogue-button text-[12px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Save Changes</Button>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-none border-t border-primary/10 p-20 bg-background shadow-3xl font-body">
          <SheetHeader className="sr-only">
             <SheetTitle>Update Order</SheetTitle>
          </SheetHeader>
          {selectedArrival && (
            <div className="max-w-2xl mx-auto space-y-16 animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/5 border border-primary/10">
                  <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">Update Status</span>
                </div>
                <h2 className="text-6xl font-headline italic text-primary leading-none drop-shadow-sm">{selectedArrival.userName || 'Guest'}</h2>
                <p className="font-body text-lg italic text-muted-foreground tracking-tighter">Ref: {selectedArrival.referenceCode} • Status: {selectedArrival.deliveryStatus}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-primary/10 shadow-xl overflow-hidden">
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-20 bg-white dark:bg-card border-r border-primary/10 vogue-button text-[10px] text-emerald-600 hover:bg-emerald-50 transition-all group flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" strokeWidth={2} /> Verify
                </button>
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-20 bg-white dark:bg-card border-r border-primary/10 vogue-button text-[10px] text-amber-600 hover:bg-amber-50 transition-all group flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:animate-spin" strokeWidth={1.5} /> Active
                </button>
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'Delivered')} className="h-20 bg-primary text-primary-foreground vogue-button text-[10px] hover:bg-secondary hover:text-secondary-foreground transition-all shadow-inner">Finished</button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
