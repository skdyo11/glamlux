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
  MessageSquare,
  Users,
  TrendingUp,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { slugify } from '@/lib/utils';
import { signInAnonymously } from 'firebase/auth';
import Link from 'next/link';

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
  const [activeSheet, setActiveSheet] = useState<'profile' | 'survey' | null>(null);
  const [mapLocation, setMapLocation] = useState<[number, number]>([31.5204, 74.3587]);
  const [addressInput, setAddressInput] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle guest access via anonymous sign-in
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
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      setHasBusiness(true);
      setMyBusiness({ id: user.uid, name: businessName, slug: businessSlug });
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
            <button onClick={() => handleStartBusiness('parlour')} className="group p-16 space-y-10 text-left border-r border-primary/10 hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
              <Scissors className="h-12 w-12 text-primary transition-all group-hover:scale-110" strokeWidth={1.5} />
              <div className="space-y-4">
                <h3 className="text-4xl font-headline italic text-primary">Beauty Parlour</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body italic">Offer elite transformations and manage bookings.</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary pt-4 group-hover:translate-x-2 transition-all">Start <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></div>
            </button>
            <button onClick={() => handleStartBusiness('shop')} className="group p-16 space-y-10 text-left hover:bg-white dark:hover:bg-card transition-all relative overflow-hidden">
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

  return (
    <div className="min-h-screen bg-background pb-32 font-body">
      <Navbar />
      
      <main className="container mx-auto px-0 md:px-6 pt-16 md:pt-24">
        {/* Banner Section */}
        <div className="relative w-full h-48 md:h-72 bg-muted overflow-hidden border-b md:rounded-b-[2rem]">
          <Image 
            src={myBusiness?.myCover || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80"} 
            alt="Business Cover" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 -mt-16 md:-mt-24 relative z-10 space-y-10">
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
              <h1 className="text-5xl md:text-8xl font-headline tracking-tighter text-primary">{myBusiness?.name || 'My Parlour'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-[0.4em]">
                <Navigation className="h-3 w-3" /> {myBusiness?.areaTag || 'Region'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSheet('profile')}
              className="h-16 md:h-20 rounded-[2.5rem] border-primary/10 text-primary font-black uppercase tracking-[0.3em] text-xs hover:bg-primary/5 shadow-sm"
            >
              Edit Profile
            </Button>
            <Button 
              asChild
              className="h-16 md:h-20 rounded-[2.5rem] bg-black text-white hover:bg-black/90 font-black uppercase tracking-[0.3em] text-xs shadow-xl"
            >
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-3" /> Messages
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black text-white p-10 md:p-12 rounded-[3.5rem] border-none shadow-2xl flex flex-col justify-between min-h-[220px]">
              <Users className="h-8 w-8 opacity-40 mb-4" />
              <div className="space-y-1">
                <p className="text-7xl font-headline tracking-tighter italic">{arrivals.length}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Orders</p>
              </div>
            </Card>
            
            <Card className="bg-white dark:bg-card p-10 md:p-12 rounded-[3.5rem] border border-primary/5 shadow-2xl flex flex-col justify-between min-h-[220px]">
              <TrendingUp className="h-8 w-8 text-primary/20 mb-4" />
              <div className="space-y-1">
                <p className="text-7xl font-headline tracking-tighter italic">142K</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">{getCurrency()} Rev</p>
              </div>
            </Card>
          </div>

          {/* Partner Team Banner */}
          <button 
            onClick={() => setActiveSheet('survey')}
            className="w-full bg-black text-white p-10 md:p-12 rounded-[3.5rem] flex items-center justify-between group hover:bg-primary transition-all duration-500 shadow-2xl"
          >
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 rounded-full border border-white/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="text-left space-y-1">
                <h4 className="text-2xl font-headline tracking-tight italic">Join Partner Team</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-all">Earn by delivering items</p>
              </div>
            </div>
            <ArrowRight className="h-8 w-8 opacity-40 group-hover:translate-x-2 transition-all" />
          </button>
        </div>
      </main>

      {/* Edit Profile Sheet */}
      <Dialog open={activeSheet === 'profile'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-0 overflow-hidden max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
          <ScrollArea className="max-h-[90vh] font-body">
            <div className="p-10 space-y-12">
              <div className="border-b border-primary/10 pb-8 space-y-4 text-center md:text-left">
                <DialogTitle className="text-5xl font-headline tracking-tighter italic leading-none text-primary">Edit Sanctuary.</DialogTitle>
                <DialogDescription className="font-body italic text-muted-foreground">Update your identity in the registry.</DialogDescription>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Business Name</Label>
                  <Input 
                    name="name" 
                    required 
                    defaultValue={myBusiness?.name}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-2xl italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Area Tag</Label>
                    <Input 
                      name="areaTag" 
                      required 
                      defaultValue={myBusiness?.areaTag}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Description</Label>
                    <Input 
                      name="description" 
                      required 
                      defaultValue={myBusiness?.description}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-xl italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-primary/10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-2"><Navigation className="h-3 w-3" /> Map Coordinates</Label>
                    <Input 
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Physical address..." 
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent h-14 text-lg italic px-0 focus-visible:ring-0 focus-visible:border-primary transition-all" 
                    />
                  </div>
                  <div className="rounded-[2.5rem] border border-primary/10 overflow-hidden shadow-inner">
                    <Map center={mapLocation} onLocationSelect={(lat, lng) => setMapLocation([lat, lng])} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-20 bg-black text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-primary transition-all">Save Profile</Button>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Logistics Dialog (Survey) */}
      <Dialog open={activeSheet === 'survey'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-none border border-primary/10 bg-background shadow-none p-10 max-w-md animate-in zoom-in-95 duration-300">
           <div className="space-y-10 text-center py-6">
             <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
               <ShieldCheck className="h-10 w-10 text-primary" />
             </div>
             <div className="space-y-4">
               <h3 className="text-4xl font-headline italic tracking-tight text-primary">Join the Team.</h3>
               <p className="text-muted-foreground italic leading-relaxed">Artisans enrolled in the Partner Team handle local area fulfillment to ensure elite delivery quality.</p>
             </div>
             <div className="space-y-4 pt-4">
                <Button 
                  onClick={() => {
                    if (firestore && myBusiness) {
                      updateDoc(doc(firestore, 'parlours', myBusiness.id), { isDeliveryTeam: true });
                      setMyBusiness({ ...myBusiness, isDeliveryTeam: true });
                      toast({ title: "Setup Complete" });
                      setActiveSheet(null);
                    }
                  }}
                  className="w-full h-16 bg-black text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-primary transition-all"
                >
                  Verify Application
                </Button>
                <Button variant="ghost" onClick={() => setActiveSheet(null)} className="font-bold text-[10px] uppercase tracking-widest text-primary/40">Cancel</Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
