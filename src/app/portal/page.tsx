'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Navigation,
  Scissors,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Camera,
  MessageSquare,
  Users,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  QrCode,
  Truck,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, updateDoc, serverTimestamp, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';
import { slugify } from '@/lib/utils';
import { signInAnonymously } from 'firebase/auth';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />
});

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  const { getCurrency } = useStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  const [arrivals, setArrivals] = useState<any[]>([]);
  const [activeSheet, setActiveSheet] = useState<'profile' | 'survey' | 'addItem' | 'addService' | null>(null);
  const [mapLocation, setMapLocation] = useState<[number, number]>([31.5204, 74.3587]);
  const [addressInput, setAddressInput] = useState('');

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        setHasBusiness(true);
        setMyBusiness({ ...data, id: docId });
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

    const bookingsQuery = query(collection(firestore, 'bookings'), where('vendorId', '==', user.uid));
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setArrivals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubBookings();
    };
  }, [user, firestore, hasBusiness]);

  // Items Query
  const itemsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'products'), where('vendorId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: myItems, isLoading: isLoadingItems } = useCollection(itemsQuery);

  // Services Query
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'deals'), where('parlourId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: myServices, isLoading: isLoadingServices } = useCollection(servicesQuery);

  const handleStartBusiness = async (type: 'parlour' | 'shop') => {
    if (!user || !firestore) return;
    try {
      const businessName = type === 'parlour' ? `My Parlour` : `My Shop`;
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
        createdAt: serverTimestamp(),
        isDeliveryTeam: false
      });
      
      await batch.commit();
      setHasBusiness(true);
      setMyBusiness({ id: user.uid, name: businessName, slug: businessSlug, isDeliveryTeam: false });
      toast({ title: "Business Established" });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !myBusiness || !firestore) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const areaTag = formData.get('areaTag') as string;
    const description = formData.get('description') as string;

    try {
      await updateDoc(doc(firestore, 'parlours', myBusiness.id), {
        name, areaTag, description, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1]
      });
      setMyBusiness({ ...myBusiness, name, areaTag, description, address: addressInput, latitude: mapLocation[0], longitude: mapLocation[1] });
      toast({ title: "Profile Updated" });
      setActiveSheet(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('itemName') as string;
    const brand = formData.get('itemBrand') as string;
    const price = parseFloat(formData.get('itemPrice') as string);
    const imageUrl = formData.get('itemImage') as string;

    try {
      const productRef = collection(firestore, 'products');
      addDocumentNonBlocking(productRef, {
        vendorId: user.uid,
        name,
        brand,
        price,
        imageUrl: imageUrl || `https://picsum.photos/seed/${Math.random()}/600/800`,
        currency: getCurrency(),
        stockCount: 10,
        createdAt: serverTimestamp()
      });

      toast({ title: "Item Registered", description: `${name} added to inventory.` });
      setActiveSheet(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Registration Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('serviceName') as string;
    const category = formData.get('serviceCategory') as any;
    const basePrice = parseFloat(formData.get('basePrice') as string);
    const discountPrice = parseFloat(formData.get('discountPrice') as string);

    try {
      const dealRef = collection(firestore, 'deals');
      addDocumentNonBlocking(dealRef, {
        parlourId: user.uid,
        parlourOwnerId: user.uid,
        name,
        category: category || 'Skin',
        basePrice,
        discountPrice,
        currency: getCurrency(),
        depositPercent: 10,
        createdAt: serverTimestamp()
      });

      toast({ title: "Transformation Defined", description: `${name} is now available for booking.` });
      setActiveSheet(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Setup Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || isUserLoading) return null;

  if (hasBusiness === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-14 font-body">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-16">
          <header className="text-center space-y-6 max-w-2xl">
            <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">Setup Business</span>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary leading-none">Register as Artisan.</h1>
            <p className="text-lg text-muted-foreground font-body italic">Begin your journey in the editorial registry.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-primary/10 w-full max-w-4xl shadow-2xl bg-white dark:bg-card/20">
            <button onClick={() => handleStartBusiness('parlour')} className="group p-12 md:p-16 space-y-10 text-left border-r border-primary/10 hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <Scissors className="h-12 w-12 text-primary transition-all group-hover:scale-110" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Beauty Parlour</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Offer elite transformations and manage bookings.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Start <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
            <button onClick={() => handleStartBusiness('shop')} className="group p-12 md:p-16 space-y-10 text-left hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <ShoppingBag className="h-12 w-12 text-primary transition-all group-hover:scale-110" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Artisan Shop</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">List professional makeup and skincare items.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Start <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const showFleetTab = myBusiness?.isDeliveryTeam === true;

  return (
    <div className="min-h-screen bg-background pb-32 font-body">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 md:pt-32">
        {/* Banner Section */}
        <div className="w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden relative shadow-lg">
          <Image 
            src={myBusiness?.myCover || `https://picsum.photos/seed/${myBusiness?.id || 'portal'}/1600/400`} 
            alt="Business Cover" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="px-6 -mt-16 md:-mt-24 relative z-10 space-y-8 md:space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
            <div className="relative group">
              <div className="h-32 w-32 md:h-44 md:w-44 bg-[#B8A85C] rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center shadow-2xl border-4 border-white dark:border-background overflow-hidden">
                {myBusiness?.myImage ? (
                  <Image src={myBusiness.myImage} alt="Avatar" fill className="object-cover" />
                ) : (
                  <Camera className="h-10 w-10 text-white/60" strokeWidth={1.5} />
                )}
              </div>
            </div>
            
            <div className="space-y-2 pb-2">
              <h1 className="text-5xl md:text-8xl font-headline tracking-tighter text-primary leading-none">{myBusiness?.name || 'My Parlour'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-[0.4em]">
                <Navigation className="h-3 w-3" /> {myBusiness?.areaTag || 'Region'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 md:pt-4">
            <button 
              onClick={() => setActiveSheet('profile')}
              className="h-14 rounded-[1.5rem] border border-primary/10 text-primary font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary/5 shadow-sm transition-all active:scale-95 bg-white dark:bg-white/5"
            >
              Edit Profile
            </button>
            <Button 
              asChild
              className="h-14 rounded-[1.5rem] bg-primary text-primary-foreground hover:bg-primary/95 font-black uppercase tracking-[0.3em] text-[10px] shadow-xl border-none active:scale-95 transition-all"
            >
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-3" /> Messages
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-primary text-primary-foreground p-6 md:p-8 rounded-[2.5rem] border-none shadow-2xl flex flex-col justify-between min-h-[160px]">
              <Users className="h-6 w-6 opacity-40 mb-2" />
              <div className="space-y-1">
                <p className="text-5xl md:text-6xl font-headline tracking-tighter italic">{arrivals.length}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Orders</p>
              </div>
            </Card>
            
            <Card className="bg-white dark:bg-card p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl flex flex-col justify-between min-h-[160px]">
              <TrendingUp className="h-6 w-6 text-primary/20 mb-2" />
              <div className="space-y-1">
                <p className="text-5xl md:text-6xl font-headline tracking-tighter italic">142K</p>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">{getCurrency()} Rev</p>
              </div>
            </Card>
          </div>

          <button 
            onClick={() => {
              if (!myBusiness?.isDeliveryTeam) {
                setActiveSheet('survey');
              }
            }}
            className="w-full bg-primary text-white p-6 md:p-8 rounded-[2rem] flex items-center justify-between shadow-2xl cursor-default"
          >
            <div className="flex items-center gap-6 md:gap-8">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xl md:text-2xl font-headline tracking-tight italic">{myBusiness?.isDeliveryTeam ? 'Team Member' : 'Join Partner Team'}</h4>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{myBusiness?.isDeliveryTeam ? 'Elite status confirmed' : 'Earn by delivering items'}</p>
              </div>
            </div>
            {myBusiness?.isDeliveryTeam ? (
              <Badge className="bg-white/10 text-white border-white/20">Active</Badge>
            ) : (
              <div className="p-2 rounded-full bg-white/10"><ArrowRight className="h-5 w-5 text-white" /></div>
            )}
          </button>

          {/* Detailed Navigation Tabs */}
          <Tabs defaultValue="queue" className="space-y-12 pt-12">
            <TabsList className="bg-muted/30 dark:bg-white/5 rounded-full p-1.5 h-16 border-none w-full flex overflow-x-auto scrollbar-hide">
              <TabsTrigger 
                value="queue" 
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all h-full"
              >
                QUEUE
              </TabsTrigger>
              <TabsTrigger 
                value="items" 
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all h-full"
              >
                ITEMS
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all h-full"
              >
                SERVICES
              </TabsTrigger>
              <TabsTrigger 
                value="scan" 
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all h-full"
              >
                SCAN
              </TabsTrigger>
              {showFleetTab && (
                <TabsTrigger 
                  value="fleet" 
                  className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all h-full"
                >
                  FLEET
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="queue" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="space-y-6">
                 <div className="flex justify-between items-baseline px-2">
                   <h3 className="text-3xl font-headline italic text-primary">Live Sessions.</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{arrivals.length} ACTIVE</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {arrivals.length > 0 ? (
                     arrivals.map(arrival => (
                       <Card key={arrival.id} className="p-8 rounded-[2.5rem] border border-primary/5 bg-white/40 backdrop-blur-xl shadow-xl space-y-6 group hover:border-primary/20 transition-all cursor-pointer hover:-translate-y-2">
                         <div className="flex justify-between items-start">
                           <div className="space-y-1">
                             <h4 className="font-headline text-3xl italic">{arrival.userName || 'Guest'}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Ref: {arrival.referenceCode}</p>
                           </div>
                           <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">{arrival.deliveryStatus}</Badge>
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                           <div className="flex items-center gap-3 text-muted-foreground italic text-sm">
                             <Sparkles className="h-4 w-4 text-primary" /> {arrival.cartItems?.[0]?.name || 'Beauty Service'}
                           </div>
                           <ChevronRight className="h-5 w-5 text-primary/20 group-hover:translate-x-1 transition-all" />
                         </div>
                       </Card>
                     ))
                   ) : (
                     <div className="col-span-full py-24 text-center bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/10">
                       <p className="italic text-muted-foreground text-lg">Your editorial queue is currently empty.</p>
                     </div>
                   )}
                 </div>
               </div>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="space-y-8">
                 <div className="flex justify-between items-baseline px-2">
                   <h3 className="text-3xl font-headline italic text-primary">Artisan Inventory.</h3>
                   <Button variant="ghost" onClick={() => setActiveSheet('addItem')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"><PlusCircle className="h-4 w-4 mr-2" /> Add Collection</Button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <button 
                      onClick={() => setActiveSheet('addItem')}
                      className="aspect-[3/4] bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/10 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-all group shadow-inner"
                    >
                      <Plus className="h-8 w-8 text-primary/20 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Add Item</span>
                    </button>

                    {isLoadingItems ? (
                      [1, 2, 3].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-[2.5rem]" />)
                    ) : myItems?.map(item => (
                      <div key={item.id} className="aspect-[3/4] bg-white rounded-[2.5rem] border border-primary/5 shadow-md overflow-hidden relative group transition-all hover:-translate-y-2 hover:shadow-2xl">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6 text-white">
                           <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 mb-1">{item.brand}</p>
                           <h4 className="font-headline text-lg italic leading-none">{item.name}</h4>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="space-y-8">
                 <div className="flex justify-between items-baseline px-2">
                   <h3 className="text-3xl font-headline italic text-primary">Signature Series.</h3>
                   <Button variant="ghost" onClick={() => setActiveSheet('addService')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"><PlusCircle className="h-4 w-4 mr-2" /> Define Edit</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => setActiveSheet('addService')}
                      className="h-40 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/10 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-all group shadow-inner"
                    >
                      <Plus className="h-8 w-8 text-primary/20 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Define Transformation</span>
                    </button>

                    {isLoadingServices ? (
                      [1, 2].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)
                    ) : myServices?.map(service => (
                      <div key={service.id} className="h-40 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/5 p-8 flex items-center justify-between group hover:border-primary/20 transition-all hover:-translate-y-2 hover:shadow-2xl">
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-primary/5 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1">{service.category}</Badge>
                          <h4 className="font-headline text-2xl italic leading-none">{service.name}</h4>
                          <p className="text-sm font-bold text-primary tracking-tighter pt-1">{getCurrency()} {service.discountPrice.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                           <Scissors className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="scan" className="py-20 text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="max-w-sm mx-auto space-y-10">
                 <div className="h-32 w-32 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-3xl">
                   <QrCode className="h-16 w-16" strokeWidth={1} />
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-4xl font-headline italic text-primary">Pass Verifier.</h3>
                   <p className="text-muted-foreground italic leading-relaxed">Scan your guest's digital pass to verify arrival and sync their credentials with the registry.</p>
                 </div>
                 <Button className="w-full h-16 rounded-full bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl">Initialize Scanner</Button>
               </div>
            </TabsContent>

            {showFleetTab && (
              <TabsContent value="fleet" className="py-20 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="max-w-md mx-auto space-y-10">
                   <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                     <Truck className="h-10 w-10 text-primary" strokeWidth={1.5} />
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-4xl font-headline italic text-primary">Logistics Team.</h3>
                     <p className="text-muted-foreground italic leading-relaxed">Manage your artisan fulfillment team or self-enroll to handle local area deliveries.</p>
                   </div>
                 </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Dialog open={activeSheet === 'profile'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
          <ScrollArea className="max-h-[90vh] font-body">
            <div className="p-8 md:p-10 space-y-10">
              <div className="border-b border-primary/10 pb-6 md:pb-8 space-y-4 text-center md:text-left">
                <DialogTitle className="text-4xl md:text-5xl font-headline tracking-tighter italic leading-none text-primary">Edit Sanctuary.</DialogTitle>
                <p className="font-body italic text-muted-foreground">Update your identity in the registry.</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Business Name</Label>
                  <Input 
                    name="name" 
                    required 
                    defaultValue={myBusiness?.name}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-12 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Area Tag</Label>
                    <Input 
                      name="areaTag" 
                      required 
                      defaultValue={myBusiness?.areaTag}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-12 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Description</Label>
                    <Input 
                      name="description" 
                      required 
                      defaultValue={myBusiness?.description}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-12 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-primary/10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2"><Navigation className="h-3 w-3" /> Map Coordinates</Label>
                    <Input 
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Physical address..." 
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-12 text-base italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                  <div className="rounded-[2rem] border border-primary/10 overflow-hidden shadow-inner">
                    <Map center={mapLocation} onLocationSelect={(lat, lng) => setMapLocation([lat, lng])} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-primary transition-all">Save Profile</Button>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={activeSheet === 'addItem'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden max-w-md animate-in zoom-in-95 duration-300">
           <ScrollArea className="max-h-[85vh]">
              <div className="p-8 space-y-8">
                <div className="space-y-2 text-center md:text-left">
                  <DialogTitle className="text-4xl font-headline italic tracking-tighter text-primary">New Collection.</DialogTitle>
                  <p className="font-body italic text-muted-foreground text-sm">Register a professional artistry item.</p>
                </div>

                <form onSubmit={handleAddItem} className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Product Identity</Label>
                    <Input name="itemName" required placeholder="Item Name (e.g. Silk Foundation)" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                    <Input name="itemBrand" required placeholder="Brand / Curator" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-base italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Valuation ({getCurrency()})</Label>
                      <Input name="itemPrice" type="number" required placeholder="0.00" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Editorial Image</Label>
                      <Input name="itemImage" placeholder="URL (Optional)" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-xs italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all"
                  >
                    {isSubmitting ? "Processing..." : "Register Item"}
                  </Button>
                </form>
              </div>
           </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={activeSheet === 'addService'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden max-w-md animate-in zoom-in-95 duration-300">
           <ScrollArea className="max-h-[85vh]">
              <div className="p-8 space-y-8">
                <div className="space-y-2 text-center md:text-left">
                  <DialogTitle className="text-4xl font-headline italic tracking-tighter text-primary">Define Edit.</DialogTitle>
                  <p className="font-body italic text-muted-foreground text-sm">Create a signature transformation package.</p>
                </div>

                <form onSubmit={handleAddService} className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Transformation Identity</Label>
                    <Input name="serviceName" required placeholder="Service Name (e.g. Royal Glow)" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                    
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Category</Label>
                       <Select name="serviceCategory" defaultValue="Skin">
                         <SelectTrigger className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent px-0 font-body italic">
                           <SelectValue placeholder="Select Category" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Bridal">Bridal</SelectItem>
                            <SelectItem value="Hair">Hair</SelectItem>
                            <SelectItem value="Skin">Skin</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Base Price</Label>
                      <Input name="basePrice" type="number" required placeholder="0.00" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-base italic px-0 focus-visible:ring-0 focus-visible:border-primary" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Registry Price</Label>
                      <Input name="discountPrice" type="number" required placeholder="0.00" className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-10 text-lg italic px-0 font-bold focus-visible:ring-0 focus-visible:border-primary" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all"
                  >
                    {isSubmitting ? "Processing..." : "Publish Service"}
                  </Button>
                </form>
              </div>
           </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={activeSheet === 'survey'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-8 md:p-10 max-w-md animate-in zoom-in-95 duration-300">
           <div className="space-y-8 text-center py-4">
             <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
               <ShieldCheck className="h-8 w-8 text-primary" />
             </div>
             <div className="space-y-4">
               <h3 className="text-3xl md:text-4xl font-headline italic tracking-tight text-primary">Join the Team.</h3>
               <p className="text-muted-foreground italic leading-relaxed text-sm md:text-base">Artisans enrolled in the Partner Team handle local area fulfillment to ensure elite delivery quality.</p>
             </div>
             <div className="space-y-4 pt-2">
                <Button 
                  onClick={() => {
                    if (firestore && myBusiness) {
                      updateDoc(doc(firestore, 'parlours', myBusiness.id), { isDeliveryTeam: true });
                      setMyBusiness({ ...myBusiness, isDeliveryTeam: true });
                      toast({ title: "Setup Complete" });
                      setActiveSheet(null);
                    }
                  }}
                  className="w-full h-14 md:h-16 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-primary transition-all"
                >
                  Verify Application
                </Button>
                <Button variant="ghost" onClick={() => setActiveSheet(null)} className="font-bold text-[9px] uppercase tracking-widest text-primary/40">Cancel</Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
