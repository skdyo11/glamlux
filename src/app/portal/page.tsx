'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
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
  MapPin
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { slugify } from '@/lib/utils';
import { signInAnonymously } from 'firebase/auth';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />
});

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  const { getCurrency } = useStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  const [arrivals, setArrivals] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);

  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [activeSheet, setActiveSheet] = useState<'delivery' | 'service' | 'product' | 'profile' | 'image-upload' | null>(null);
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Frictionless Onboarding: Automatically sign in anonymously.
  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      signInAnonymously(auth).catch(err => console.error("Silent authentication failed", err));
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
      toast({ variant: "destructive", title: "Identity Pending", description: "Waiting for registry synchronization..." });
      return;
    }
    try {
      const businessName = type === 'parlour' ? `${user.displayName || 'The'} Sanctuary` : `${user.displayName || 'The'} House`;
      const baseSlug = slugify(businessName);
      const businessSlug = `${baseSlug}-${user.uid.slice(0, 5)}`;

      const batch = writeBatch(firestore);
      const bizRef = doc(collection(firestore, 'parlours'));
      const bizId = bizRef.id;

      batch.set(bizRef, {
        id: bizId,
        ownerId: user.uid,
        name: businessName,
        slug: businessSlug,
        areaTag: 'Select Region',
        latitude: 31.5204,
        longitude: 74.3587,
        rating: 5.0,
        imageUrls: [],
        description: type === 'parlour' ? 'An elite beauty sanctuary.' : 'A premium artistry house.',
        createdAt: serverTimestamp()
      });
      
      // Add one dummy product for the new artisan
      const pRef = doc(collection(firestore, 'products'));
      batch.set(pRef, {
        id: pRef.id,
        vendorId: bizId,
        vendorName: businessName,
        name: 'Signature Radiance Elixir',
        brand: 'Artisan Essence',
        price: 120,
        currency: 'PKR',
        imageUrl: `https://picsum.photos/seed/p-${pRef.id}/600/800`,
        isDummy: true,
        createdAt: serverTimestamp()
      });

      // Add one dummy service for the new artisan
      const dRef = doc(collection(firestore, 'deals'));
      batch.set(dRef, {
        id: dRef.id,
        parlourId: bizId,
        parlourOwnerId: user.uid,
        name: 'Royal Transformation Edit',
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
      setMyBusiness({ id: bizId, name: businessName, slug: businessSlug });
      toast({ title: "Portal Operational", description: `Your ${type} has been registered.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Registration Denied" });
    }
  };

  const updateArrivalStatus = async (id: string, newStatus: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'bookings', id), { deliveryStatus: newStatus });
      toast({ title: "Ledger Updated", description: `Status set to ${newStatus}.` });
      setSelectedArrival(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Ledger Error" });
    }
  };

  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeSheet || !firestore) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const detail = formData.get('detail') as string;
    const value = formData.get('value') as string;

    try {
      if (activeSheet === 'product') {
        if (editingItem) {
          await updateDoc(doc(firestore, 'products', editingItem.id), { name, brand: detail, price: parseFloat(value) });
        } else {
          await addDoc(collection(firestore, 'products'), {
            vendorId: user.uid,
            name,
            brand: detail,
            price: parseFloat(value),
            imageUrl: 'https://picsum.photos/seed/vogue-new-p/400/500',
            currency: 'PKR',
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'service') {
        if (editingItem) {
          await updateDoc(doc(firestore, 'deals', editingItem.id), { name, category: detail, discountPrice: parseFloat(value) });
        } else {
          await addDoc(collection(firestore, 'deals'), {
            parlourOwnerId: user.uid,
            parlourId: user.uid,
            name,
            category: detail,
            discountPrice: parseFloat(value),
            basePrice: parseFloat(value) * 1.25,
            depositPercent: 10,
            currency: 'PKR',
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'profile' && myBusiness) {
        await updateDoc(doc(firestore, 'parlours', myBusiness.id), {
          name, areaTag: detail, description: value, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1]
        });
        setMyBusiness({ ...myBusiness, name, areaTag: detail, description: value, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1] });
      }

      toast({ title: "Registry Updated" });
      setActiveSheet(null);
      setEditingItem(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
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
      toast({ title: "Identity Finalized" });
      setActiveSheet(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Registry Denied" });
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
          toast({ title: "Upload Confirmed" });
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

  if (!isMounted || isUserLoading) return null;

  if (hasBusiness === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-14 font-body">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-16">
          <header className="text-center space-y-6 max-w-2xl">
            <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">Registry Setup</span>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary leading-none">The Artisan Onboarding.</h1>
            <p className="text-lg text-muted-foreground font-body italic">Select your discipline to begin the registry process.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-primary/10 w-full max-w-4xl shadow-2xl bg-white dark:bg-card/20">
            <button onClick={() => handleStartBusiness('parlour')} className="group p-16 space-y-10 text-left border-r border-primary/10 hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <Scissors className="h-12 w-12 text-secondary transition-all group-hover:scale-110 group-hover:fill-current" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Service Sanctuary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Registration for elite beauty studios and transformation experts.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Begin <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
            <button onClick={() => handleStartBusiness('shop')} className="group p-16 space-y-10 text-left hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <ShoppingBag className="h-12 w-12 text-secondary transition-all group-hover:scale-110 group-hover:fill-current" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Artistry House</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Registration for professional makeup brands and curated boutique items.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Begin <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
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
            <Image src={coverImageUrl} alt="Artisan Cover" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" priority />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={() => openImageModal('cover')} className="rounded-none vogue-button bg-primary text-primary-foreground border-none h-14 px-10 text-[10px] shadow-2xl hover:scale-105 active:scale-95">Change Cover</Button>
            </div>
          </div>

          <div className="p-10 flex flex-col md:flex-row items-center md:items-end gap-12 -mt-20 md:-mt-24">
            <div className="relative h-40 w-40 md:h-56 md:w-56 overflow-hidden border-4 border-white dark:border-card bg-white dark:bg-background group shadow-2xl z-10">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={profileImageUrl} className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                <AvatarFallback className="bg-primary/5"><Store className="h-10 w-10 opacity-20" strokeWidth={1.5} /></AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer group-hover:scale-105" onClick={() => openImageModal('profile')}>
                <Camera className="h-8 w-8 text-white transition-all" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="flex-grow space-y-6 pb-4">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary drop-shadow-sm">{myBusiness?.name || 'Artisan Registry'}</h1>
                <div className="flex flex-wrap gap-8 text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground italic">
                  <span className="flex items-center gap-2 group cursor-default transition-all hover:text-secondary"><Navigation className="h-3 w-3 text-secondary transition-all group-hover:fill-current" strokeWidth={1.5} /> {myBusiness?.areaTag}</span>
                  <span className="flex items-center gap-2 text-primary group cursor-default transition-all hover:text-secondary"><Sparkles className="h-3 w-3 text-secondary group-hover:animate-spin" strokeWidth={1.5} /> Verified House MMXXIV</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pb-4">
              <Button variant="outline" onClick={() => setActiveSheet('profile')} className="rounded-none border-primary/20 vogue-button text-[10px] h-14 px-10 hover:bg-primary/5 transition-all">Auditing</Button>
              <Button onClick={() => setActiveSheet('delivery')} className="rounded-none vogue-button bg-primary text-primary-foreground text-[10px] h-14 px-10 shadow-xl hover:scale-105 active:scale-95 transition-all">Logistics</Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
          <TabsList className="bg-transparent h-auto gap-12 border-b border-primary/10 w-full justify-start rounded-none p-0 overflow-x-auto scrollbar-hide">
            {['bookings', 'items', 'services'].map((id) => (
              <TabsTrigger 
                key={id} value={id} 
                className="bg-transparent px-0 pb-6 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent font-bold text-[11px] uppercase tracking-[0.5em] text-primary/40 data-[state=active]:text-primary transition-all hover:text-primary whitespace-nowrap"
              >
                {id === 'bookings' ? '01 Queue' : id === 'items' ? '02 Catalogue' : '03 Edits'}
              </TabsTrigger>
            ))}
          </TabsList>

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
                    <h4 className="font-headline text-3xl text-primary">{a.userName || 'Artisan Guest'}</h4>
                  </div>
                  <Badge variant="outline" className="rounded-none border-primary/10 text-[9px] uppercase tracking-widest px-4 py-2 bg-primary/5 transition-all group-hover:bg-primary group-hover:text-primary-foreground">{a.deliveryStatus}</Badge>
                </article>
              ))}
              {arrivals.length === 0 && (
                <div className="col-span-full py-40 text-center space-y-4">
                   <p className="font-headline text-4xl italic text-primary/10">Ledger Empty.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-12">
            <div className="flex justify-between items-end border-b border-primary/10 pb-8">
              <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Catalogue Inventory.</h3>
              <Button onClick={() => { setEditingItem(null); setActiveSheet('product'); }} size="sm" className="rounded-none vogue-button text-[10px] h-12 px-8 bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95">
                <ShoppingBag className="h-4 w-4 mr-2" strokeWidth={1.5} /> Add Entry
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {myProducts.map((p) => (
                <div key={p.id} className="space-y-6 group cursor-pointer" onClick={() => handleEdit('product', p)}>
                  <div className="relative aspect-square border border-primary/5 bg-muted overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-700">
                    <Image src={p.imageUrl || 'https://picsum.photos/seed/v-prod/400/500'} alt={p.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="secondary" className="rounded-none font-bold text-[10px] tracking-widest uppercase border-none">Edit Entry</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline text-2xl text-primary transition-all group-hover:translate-x-1">{p.name}</h4>
                    <p className="text-xl font-bold tracking-tighter text-secondary group-hover:text-primary transition-colors">{getCurrency()} {p.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-12">
            <div className="flex justify-between items-end border-b border-primary/10 pb-8">
              <h3 className="text-4xl font-headline tracking-tighter text-primary italic">Service Edits.</h3>
              <Button onClick={() => { setEditingItem(null); setActiveSheet('service'); }} size="sm" className="rounded-none vogue-button text-[10px] h-12 px-8 bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95">
                <Scissors className="h-4 w-4 mr-2" strokeWidth={1.5} /> Add Edit
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
                    <p className="text-2xl font-bold tracking-tighter text-primary">{getCurrency()} {d.discountPrice?.toLocaleString()}</p>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 group-hover:text-secondary pt-4 flex items-center gap-2 transition-all">Customize Edit <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={1.5} /></div>
                  </div>
                  <Scissors className="h-16 w-16 text-primary/5 group-hover:text-secondary/20 transition-all group-hover:rotate-45" strokeWidth={1} />
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={activeSheet === 'image-upload'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none max-w-md p-10 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="space-y-12 font-body">
            <div className="border-b border-primary/10 pb-8 space-y-4">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-3xl font-headline italic text-primary">Artisan Identity.</DialogTitle>
                <div className="group cursor-pointer p-2 rounded-full hover:bg-primary/5 transition-all" onClick={generatePreviews}>
                  <RefreshCw className={cn("h-5 w-5 text-primary/30 group-hover:text-secondary transition-all", isRolling && "animate-spin")} strokeWidth={1.5} />
                </div>
              </div>
              <DialogDescription className="font-body text-muted-foreground italic text-sm">Select a curated look or upload a custom visual for the registry.</DialogDescription>
            </div>

            <div className="space-y-10">
              {isUploading ? (
                <div className="space-y-6 py-10">
                  <Progress value={uploadProgress} className="h-1 rounded-none bg-primary/5" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center animate-pulse">Synchronizing Vault...</p>
                </div>
              ) : (
                <div className={cn("grid gap-4", imageUploadType === 'profile' ? "grid-cols-3" : "grid-cols-1")}>
                  {(imageUploadType === 'profile' ? profilePreviews : coverPreviews).map((url, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleApplyIdentity(url)} 
                      className="relative aspect-square border border-primary/10 group overflow-hidden bg-primary/5 shadow-inner transition-all hover:scale-105 active:scale-95"
                    >
                      <img src={url} alt="Option" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Check className="h-8 w-8 text-white animate-in zoom-in duration-300" strokeWidth={2} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="pt-6">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-16 rounded-none vogue-button border-primary/10 text-[10px] group shadow-sm hover:bg-primary/5 transition-all">
                  <Upload className="h-4 w-4 mr-3 transition-transform group-hover:-translate-y-1" strokeWidth={1.5} /> Custom Entry
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeSheet === 'product' || activeSheet === 'service' || activeSheet === 'profile'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className={cn("rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500", activeSheet === 'profile' ? "max-w-4xl" : "max-w-md")}>
          <ScrollArea className="max-h-[90vh] font-body">
            <div className="p-12 space-y-12">
              <div className="border-b border-primary/10 pb-8 space-y-4">
                <DialogTitle className="text-4xl font-headline tracking-tighter italic leading-none">Registry Update.</DialogTitle>
                <DialogDescription className="font-body italic text-muted-foreground">A formal audit of artisan details and sanctuary location for the registry.</DialogDescription>
              </div>
              
              <form onSubmit={handleSheetSubmit} className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Reference Identity</Label>
                  <Input 
                    name="name" 
                    required 
                    defaultValue={editingItem?.name || (activeSheet === 'profile' ? myBusiness?.name : '')}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-2xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{activeSheet === 'profile' ? 'Registry Tag' : 'Classification'}</Label>
                    <Input 
                      name="detail" 
                      required 
                      defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.brand : editingItem.category) : (activeSheet === 'profile' ? myBusiness?.areaTag : '')}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{activeSheet === 'profile' ? 'Artisan Bio' : 'Valuation'}</Label>
                    <Input 
                      name="value" 
                      required 
                      type={activeSheet === 'profile' ? 'text' : 'number'}
                      defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.price : editingItem.discountPrice) : (activeSheet === 'profile' ? myBusiness?.description : '')}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                    />
                  </div>
                </div>

                {activeSheet === 'profile' && (
                  <div className="space-y-12 pt-8 border-t border-primary/10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2"><MapPin className="h-3 w-3 text-secondary fill-secondary" strokeWidth={1.5} /> Sanctuary Location</Label>
                      <Input 
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Street, Landmark, City..." 
                        className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-secondary transition-all" 
                      />
                    </div>
                    <div className="rounded-none border border-primary/10 overflow-hidden shadow-inner">
                      <Map center={mapLocation} onLocationSelect={(lat, lng) => setMapLocation([lat, lng])} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-20 bg-primary text-primary-foreground rounded-none vogue-button text-[12px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Finalize Registry Entry</Button>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-none border-t border-primary/10 p-20 bg-background shadow-3xl font-body">
          <SheetHeader className="sr-only">
             <SheetTitle>Registry Audit</SheetTitle>
          </SheetHeader>
          {selectedArrival && (
            <div className="max-w-2xl mx-auto space-y-16 animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/5 border border-primary/10">
                  <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">Registry Audit</span>
                </div>
                <h2 className="text-6xl font-headline italic text-primary leading-none drop-shadow-sm">{selectedArrival.userName || 'Guest Entry'}</h2>
                <p className="font-body text-lg italic text-muted-foreground tracking-tighter">Reference: {selectedArrival.referenceCode} • Status: {selectedArrival.deliveryStatus}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-primary/10 shadow-xl overflow-hidden">
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-20 bg-white dark:bg-card border-r border-primary/10 vogue-button text-[10px] text-emerald-600 hover:bg-emerald-50 transition-all group flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" strokeWidth={2} /> Verify
                </button>
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-20 bg-white dark:bg-card border-r border-primary/10 vogue-button text-[10px] text-amber-600 hover:bg-amber-50 transition-all group flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:animate-spin" strokeWidth={1.5} /> Active
                </button>
                <button onClick={() => updateArrivalStatus(selectedArrival.id, 'Delivered')} className="h-20 bg-primary text-primary-foreground vogue-button text-[10px] hover:bg-secondary hover:text-secondary-foreground transition-all shadow-inner">Delivered</button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
