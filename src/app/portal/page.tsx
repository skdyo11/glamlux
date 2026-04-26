'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
} from '@/components/ui/sheet';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Plus, 
  Navigation,
  Scissors,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Store,
  Edit2,
  Settings,
  Camera,
  Dices,
  Upload,
  Trash2,
  Check,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, getDocs, deleteField } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { getCurrency } = useStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  const [arrivals, setArrivals] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myDeals, setMyDeals] = useState<any[]>([]);

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, isMounted, router]);

  useEffect(() => {
    if (!user || !firestore) return;

    const checkBusiness = async () => {
      const q = query(collection(firestore, 'parlours'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setHasBusiness(true);
        setMyBusiness({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
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
      setMyDeals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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
    // Add small delay for rolling animation
    setTimeout(() => {
      const profs = [
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36)}`,
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36)}`,
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36)}`,
      ];
      const covs = [
        `https://picsum.photos/seed/${Math.random().toString(36)}/1600/400`,
        `https://picsum.photos/seed/${Math.random().toString(36)}/1600/400`,
      ];
      setProfilePreviews(profs);
      setCoverPreviews(covs);
      setIsRolling(false);
    }, 600);
  }, []);

  const handleStartBusiness = async (type: 'parlour' | 'shop') => {
    if (!user || !firestore) return;
    
    try {
      const bizRef = await addDoc(collection(firestore, 'parlours'), {
        ownerId: user.uid,
        name: type === 'parlour' ? `${user.displayName || 'My'} Parlour` : `${user.displayName || 'My'} Shop`,
        areaTag: 'Select Area',
        rating: 5.0,
        imageUrls: [],
        description: type === 'parlour' ? 'A nice beauty parlour.' : 'A premium makeup shop.',
        createdAt: serverTimestamp()
      });
      
      setHasBusiness(true);
      setMyBusiness({ id: bizRef.id, name: type === 'parlour' ? `${user.displayName || 'My'} Parlour` : `${user.displayName || 'My'} Shop` });
      toast({
        title: "Success",
        description: `Your ${type} is ready.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    }
  };

  const updateArrivalStatus = async (id: string, newStatus: string) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'bookings', id);
      await updateDoc(docRef, { deliveryStatus: newStatus });
      toast({
        title: "Status Updated",
        description: `Guest status changed to ${newStatus}.`
      });
      setSelectedArrival(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
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
          await updateDoc(doc(firestore, 'products', editingItem.id), {
            name,
            brand: detail,
            price: parseFloat(value),
          });
        } else {
          await addDoc(collection(firestore, 'products'), {
            vendorId: user.uid,
            name,
            brand: detail,
            price: parseFloat(value),
            stockCount: 0,
            imageUrl: 'https://picsum.photos/seed/luxury-makeup-primer/400/500',
            currency: 'PKR',
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'service') {
        if (editingItem) {
          await updateDoc(doc(firestore, 'deals', editingItem.id), {
            name,
            category: detail,
            discountPrice: parseFloat(value),
            basePrice: parseFloat(value) * 1.2,
          });
        } else {
          await addDoc(collection(firestore, 'deals'), {
            parlourOwnerId: user.uid,
            parlourId: user.uid,
            name,
            category: detail,
            discountPrice: parseFloat(value),
            basePrice: parseFloat(value) * 1.2,
            depositPercent: 10,
            currency: 'PKR',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: serverTimestamp(),
          });
        }
      } else if (activeSheet === 'profile') {
        if (myBusiness) {
          await updateDoc(doc(firestore, 'parlours', myBusiness.id), {
            name,
            areaTag: detail,
            description: value,
          });
          setMyBusiness({ ...myBusiness, name, areaTag: detail, description: value });
        }
      }

      toast({ title: "Success", description: `${activeSheet} updated.` });
      setActiveSheet(null);
      setEditingItem(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update." });
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
      toast({ title: "Updated", description: `Your ${imageUploadType} identity has been refreshed.` });
      setActiveSheet(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleRemoveImage = async () => {
    if (!firestore || !myBusiness || !imageUploadType) return;
    const field = imageUploadType === 'cover' ? 'myCover' : 'myImage';
    try {
      await updateDoc(doc(firestore, 'parlours', myBusiness.id), { [field]: deleteField() });
      const updated = { ...myBusiness };
      delete updated[field];
      setMyBusiness(updated);
      toast({ title: "Reverted", description: `${imageUploadType} has been reset to default.` });
      setActiveSheet(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Reset Failed" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && myBusiness && firestore) {
      setIsUploading(true);
      setUploadProgress(10);
      
      const reader = new FileReader();
      
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      reader.onloadend = async () => {
        clearInterval(interval);
        setUploadProgress(100);
        const base64String = reader.result as string;
        const field = imageUploadType === 'cover' ? 'myCover' : 'myImage';
        try {
          await updateDoc(doc(firestore, 'parlours', myBusiness.id), { [field]: base64String });
          setMyBusiness({ ...myBusiness, [field]: base64String });
          toast({ title: "Upload Success", description: `Your ${imageUploadType} has been updated.` });
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setActiveSheet(null);
          }, 500);
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
  if (!user) return null;

  if (hasBusiness === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-12">
          <div className="text-center space-y-4 max-w-2xl">
            <Badge className="bg-primary/5 text-primary rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-black border-none">
              <Sparkles className="h-3 w-3 mr-2 inline" /> Partner Setup
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline tracking-tighter italic text-primary leading-none">Start Your Business</h1>
            <p className="text-lg text-muted-foreground italic font-body">Pick what kind of business you want to start.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card 
              onClick={() => handleStartBusiness('parlour')}
              className="group cursor-pointer rounded-2xl border-none bg-white dark:bg-card/40 backdrop-blur-xl p-10 space-y-6 shadow-xl transition-all hover:scale-[1.02] hover:bg-primary/5 ring-1 ring-primary/5"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Scissors className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-headline italic text-primary">Start Parlour</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Offer beauty services like makeup and hair styling.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary pt-2">
                Open Parlour <ArrowRight className="h-4 w-4" />
              </div>
            </Card>

            <Card 
              onClick={() => handleStartBusiness('shop')}
              className="group cursor-pointer rounded-2xl border-none bg-white dark:bg-card/40 backdrop-blur-xl p-10 space-y-6 shadow-xl transition-all hover:scale-[1.02] hover:bg-accent/10 ring-1 ring-accent/5"
            >
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-headline italic text-primary">Start Shop</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Sell professional makeup products and items.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-foreground pt-2">
                Open Shop <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const profileImageUrl = myBusiness?.myImage || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.uid}`;
  const coverImageUrl = myBusiness?.myCover || `https://picsum.photos/seed/${myBusiness?.id || 'portal'}/1600/400`;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-0 md:px-6 py-4 md:py-12 pt-14 md:pt-24">
        <div className="relative mb-12">
          {/* Cover Photo */}
          <div className="w-full h-48 md:h-64 lg:h-80 rounded-b-[2.5rem] md:rounded-[3rem] overflow-hidden relative shadow-xl group">
            <Image
              src={coverImageUrl}
              alt="Artisan Cover"
              fill
              className="object-cover brightness-[0.85] transition-all group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                onClick={() => openImageModal('cover')}
                className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-widest h-14 px-8 shadow-2xl hover:bg-white/40"
              >
                <Camera className="h-4 w-4 mr-2" /> Change Cover
              </Button>
            </div>
          </div>

          {/* Profile Section Overlap */}
          <div className="px-6 -mt-16 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="group relative h-32 w-32 md:h-44 md:w-44 rounded-[3rem] bg-white dark:bg-background p-2 shadow-2xl ring-4 ring-background overflow-hidden shrink-0 transition-transform active:scale-95">
              <Avatar className="h-full w-full rounded-[2.5rem] overflow-hidden border-none bg-primary/5">
                <AvatarImage src={profileImageUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary"><Store className="h-12 w-12 opacity-10" /></AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => openImageModal('profile')}>
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="flex-grow pb-2 space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl md:text-6xl font-headline tracking-tighter italic text-primary leading-none drop-shadow-sm">
                  {myBusiness?.name || 'Artisan Studio'}
                </h1>
                <Badge className="bg-primary/10 text-primary rounded-full px-3 py-1 uppercase tracking-widest text-[8px] font-black border-none h-fit shadow-sm">
                  Verified Artisan
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs font-bold uppercase tracking-widest text-primary/40">
                <span className="flex items-center gap-2"><Navigation className="h-4 w-4 text-rose-400" /> {myBusiness?.areaTag}</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary/30" /> {arrivals.length} Clients Today</span>
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> {arrivals.length * 15}K Revenue</span>
              </div>
            </div>

            <div className="pb-2 flex gap-3 w-full md:w-auto px-6 md:px-0">
              <Button 
                variant="outline" 
                onClick={() => setActiveSheet('profile')}
                className="flex-1 md:flex-none rounded-full border-primary/10 bg-white/60 dark:bg-card/60 backdrop-blur-md text-primary font-bold uppercase tracking-widest text-[10px] h-14 px-8 shadow-lg hover:bg-primary/5"
              >
                <Edit2 className="h-4 w-4 mr-2" /> Customize
              </Button>
              <Button 
                onClick={() => setActiveSheet('delivery')}
                className="flex-1 md:flex-none rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] h-14 px-8 shadow-lg transition-transform active:scale-95"
              >
                <Navigation className="h-4 w-4 mr-2" /> Logistics
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
            <TabsList className="bg-transparent h-auto gap-8 border-b w-full justify-center md:justify-start rounded-none overflow-x-auto scrollbar-hide">
              {['bookings', 'items', 'services'].map((id) => (
                <TabsTrigger 
                  key={id} value={id} 
                  className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] text-primary"
                >
                  {id === 'bookings' ? 'Queue' : id === 'items' ? 'Inventory' : 'Services'}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="bookings" className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-primary/40" />
                <h3 className="text-3xl font-headline italic text-primary">Arrival Queue</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
                {arrivals.map((a) => (
                  <Card 
                    key={a.id} 
                    className="min-w-[280px] rounded-2xl border-none bg-white/40 dark:bg-card/40 backdrop-blur-md p-6 space-y-4 cursor-pointer hover:bg-primary/10 transition-all shadow-sm ring-1 ring-primary/5"
                    onClick={() => setSelectedArrival(a)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary opacity-40">Identity</p>
                        <h4 className="font-headline text-2xl text-primary italic truncate max-w-[180px]">{a.userName || a.userPhone}</h4>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[8px] uppercase font-black">{a.deliveryStatus}</Badge>
                    </div>
                  </Card>
                ))}
                {arrivals.length === 0 && (
                  <div className="w-full py-20 text-center space-y-4">
                     <Users className="h-10 w-10 mx-auto text-primary/10" />
                     <p className="italic text-muted-foreground opacity-50">No active bookings detected.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Artisan Inventory</h3>
                <Button onClick={() => { setEditingItem(null); setActiveSheet('product'); }} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">
                  <Plus className="h-3 w-3 mr-2" /> Add Product
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {myProducts.map((p) => (
                  <div key={p.id} className="space-y-3 text-center group relative">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg ring-1 ring-primary/5">
                      <Image src={p.imageUrl || 'https://picsum.photos/seed/product-placeholder/400/500'} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <Button size="icon" variant="secondary" className="rounded-full" onClick={() => handleEdit('product', p)}>
                           <Edit2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-headline text-xl italic text-primary truncate px-2">{p.name}</h4>
                      <p className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">{getCurrency()} {p.price?.toLocaleString()}</p>
                      <Button variant="link" size="sm" onClick={() => handleEdit('product', p)} className="text-[8px] uppercase tracking-widest font-black text-primary/40 h-auto p-0">Customize</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Studio Services</h3>
                <Button onClick={() => { setEditingItem(null); setActiveSheet('service'); }} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">
                  <Plus className="h-3 w-3 mr-2" /> Add Service
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myDeals.map((d) => (
                  <Card key={d.id} className="p-8 rounded-2xl border-none bg-white dark:bg-card/40 backdrop-blur-md flex justify-between items-center shadow-xl ring-1 ring-primary/5 group relative">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase font-black tracking-widest text-primary/40">{d.category}</p>
                      <h4 className="font-headline text-3xl italic text-primary leading-none">{d.name}</h4>
                      <p className="text-xs font-bold text-accent-foreground">{getCurrency()} {d.discountPrice?.toLocaleString()}</p>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit('service', d)} className="text-[8px] uppercase tracking-widest font-black text-primary/40 h-auto p-0 mt-2 hover:bg-transparent">
                        <Edit2 className="h-3 w-3 mr-1" /> Customize
                      </Button>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary/30">
                      <Scissors className="h-6 w-6" />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Brand Identity Dialog */}
      <Dialog open={activeSheet === 'image-upload'} onOpenChange={() => { if (!isUploading) setActiveSheet(null); }}>
        <DialogContent className="rounded-3xl border-none bg-background text-foreground shadow-3xl max-w-md p-0 overflow-hidden flex flex-col max-h-[90dvh]">
          <ScrollArea className="flex-1 w-full">
            <div className="p-8 space-y-10">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <DialogTitle className="text-3xl font-headline italic text-primary">
                      Brand Identity
                    </DialogTitle>
                    <DialogDescription className="italic text-muted-foreground">
                      Choose a look for your {imageUploadType}.
                    </DialogDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={isRolling}
                    onClick={generatePreviews}
                    className="h-10 w-10 rounded-full hover:bg-primary/5 text-primary/40 hover:text-primary transition-all group"
                  >
                    <RefreshCw className={cn("h-5 w-5 transition-transform duration-500", isRolling && "animate-spin")} />
                  </Button>
                </div>
              </DialogHeader>

              {isUploading ? (
                <div className="py-12 space-y-6 text-center">
                   <Sparkles className="h-8 w-8 mx-auto animate-pulse text-primary" />
                   <p className="text-sm font-bold uppercase tracking-widest opacity-60">Synchronizing with Gallery...</p>
                   <Progress value={uploadProgress} className="h-1.5" />
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Profile Specific Previews (3 items) */}
                  {imageUploadType === 'profile' && (
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                      {isRolling ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="aspect-square rounded-[1.5rem]" />)
                      ) : profilePreviews.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleApplyIdentity(url)}
                          className="relative aspect-square rounded-[1.5rem] overflow-hidden group border-2 border-transparent hover:border-primary transition-all shadow-xl bg-primary/5 p-1 animate-in fade-in zoom-in duration-300"
                        >
                          <Image src={url} alt="Profile Option" fill className="object-cover rounded-[1.2rem]" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cover Specific Previews (2 items) */}
                  {imageUploadType === 'cover' && (
                    <div className="grid grid-cols-1 gap-4">
                      {isRolling ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
                      ) : coverPreviews.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleApplyIdentity(url)}
                          className="relative h-28 w-full rounded-2xl overflow-hidden group border-2 border-transparent hover:border-primary transition-all shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                          <Image src={url} alt="Cover Option" fill className="object-cover" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10" /></div>
                      <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest text-primary/30">
                        <span className="bg-background px-4">OR CUSTOM UPLOAD</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                       <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-grow h-16 rounded-2xl border-primary/10 bg-background/50 text-primary font-bold uppercase tracking-widest text-[10px] shadow-sm hover:bg-primary/5 active:scale-95"
                      >
                        <Upload className="h-5 w-5 mr-3" /> Select File
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </Button>

                      {((imageUploadType === 'cover' && myBusiness?.myCover) || (imageUploadType === 'profile' && myBusiness?.myImage)) && (
                        <Button 
                          variant="ghost"
                          onClick={handleRemoveImage}
                          className="w-16 h-16 rounded-2xl text-destructive hover:bg-destructive/10 border border-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-8 border-t border-primary/5 pt-6">
                 <p className="text-[9px] uppercase font-black tracking-[0.3em] text-primary/20 text-center w-full">Artisan Registry • Identity Management</p>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Item & Deal Listing Dialog */}
      <Dialog open={activeSheet === 'product' || activeSheet === 'service' || activeSheet === 'profile'} onOpenChange={() => { setActiveSheet(null); setEditingItem(null); }}>
        <DialogContent className="rounded-2xl border-none bg-background text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline italic text-primary">
              {activeSheet === 'profile' ? 'Business Profile' : editingItem ? 'Customize Item' : 'New Listing'}
            </DialogTitle>
            <DialogDescription className="italic text-muted-foreground">
              {activeSheet === 'profile' ? 'Update your artisan identity.' : 'Provide details for your marketplace offering.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSheetSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">
                {activeSheet === 'profile' ? 'Parlour/Shop Name' : 'Name'}
              </Label>
              <Input 
                name="name" 
                required 
                defaultValue={editingItem?.name || (activeSheet === 'profile' ? myBusiness?.name : '')}
                placeholder="Elite reference name..." 
                className="rounded-full h-12 bg-primary/5 border-none px-6" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">
                  {activeSheet === 'profile' ? 'Area/Location' : activeSheet === 'product' ? 'Brand' : 'Category'}
                </Label>
                <Input 
                  name="detail" 
                  required 
                  defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.brand : editingItem.category) : (activeSheet === 'profile' ? myBusiness?.areaTag : '')}
                  placeholder="Details..." 
                  className="rounded-full h-12 bg-primary/5 border-none px-6" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">
                  {activeSheet === 'profile' ? 'Studio Vision' : 'Price'}
                </Label>
                <Input 
                  name="value" 
                  required 
                  type={activeSheet === 'profile' ? 'text' : 'number'}
                  defaultValue={editingItem ? (activeSheet === 'product' ? editingItem.price : editingItem.discountPrice) : (activeSheet === 'profile' ? myBusiness?.description : '')}
                  placeholder={activeSheet === 'profile' ? "Vision..." : "0.00"}
                  className="rounded-full h-12 bg-primary/5 border-none px-6" 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">
              {editingItem || activeSheet === 'profile' ? 'Save Changes' : 'Publish Listing'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logistics Enrollment Dialog */}
      <Dialog open={activeSheet === 'delivery'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-2xl border-none bg-background text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline italic text-primary">Artisan Logistics</DialogTitle>
            <DialogDescription className="italic text-muted-foreground">Join our elite delivery network to reach more clients.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Enable professional shipping for your boutique items. Our logistics partners ensure your artistry reaches customers with the care it deserves.
            </p>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                <Navigation className="h-4 w-4" /> Service Features
              </div>
              <ul className="text-xs italic text-muted-foreground space-y-1">
                <li>• Real-time tracking for customers</li>
                <li>• Automated label generation</li>
                <li>• Insured high-value shipments</li>
              </ul>
            </div>
            <Button 
              onClick={() => {
                toast({ title: "Application Sent", description: "Your logistics request is under review." });
                setActiveSheet(null);
              }}
              className="w-full h-14 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg"
            >
              Enroll in Delivery Network
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-none p-10 bg-background text-foreground shadow-2xl">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 py-1.5 rounded-full">Ref: {selectedArrival.referenceCode}</Badge>
                <SheetTitle className="text-4xl font-headline italic text-primary">{selectedArrival.userName || selectedArrival.userPhone}</SheetTitle>
                <SheetDescription className="italic text-muted-foreground">Manage your guest booking status.</SheetDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl uppercase tracking-widest text-[10px]">Verify</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl uppercase tracking-widest text-[10px]">Active</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Delivered')} className="h-14 bg-primary text-primary-foreground font-bold rounded-xl uppercase tracking-widest text-[10px]">Finish</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
