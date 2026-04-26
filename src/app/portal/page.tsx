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
  Store
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { getCurrency } = useStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);

  const [arrivals, setArrivals] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myDeals, setMyDeals] = useState<any[]>([]);

  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [activeSheet, setActiveSheet] = useState<'delivery' | 'service' | 'product' | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, isMounted, router]);

  // Check if user has an existing parlour/shop profile
  useEffect(() => {
    if (!user || !firestore) return;

    const checkBusiness = async () => {
      const q = query(collection(firestore, 'parlours'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setHasBusiness(!snapshot.empty);
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

  const handleStartBusiness = async (type: 'parlour' | 'shop') => {
    if (!user || !firestore) return;
    
    try {
      await addDoc(collection(firestore, 'parlours'), {
        ownerId: user.uid,
        name: type === 'parlour' ? `${user.displayName || 'My'} Elite Parlour` : `${user.displayName || 'My'} Boutique Shop`,
        areaTag: 'Select Area',
        rating: 5.0,
        imageUrls: [],
        description: type === 'parlour' ? 'An elite beauty studio.' : 'A premium makeup boutique.',
        ownerDashboardStyle: 'grid',
        latitude: 0,
        longitude: 0,
        createdAt: serverTimestamp()
      });
      
      setHasBusiness(true);
      toast({
        title: "Success",
        description: `Your ${type} has been initialized. Welcome to the Elite Registry.`,
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
      } else if (activeSheet === 'service') {
        await addDoc(collection(firestore, 'deals'), {
          parlourOwnerId: user.uid,
          parlourId: user.uid, // Placeholder if simplified
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

      toast({ title: "Success", description: `${activeSheet} added successfully.` });
      setActiveSheet(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add item." });
    }
  };

  if (!isMounted || isUserLoading) return null;
  if (!user) return null;

  // Onboarding View
  if (hasBusiness === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-16">
          <div className="text-center space-y-4 max-w-2xl">
            <Badge className="bg-primary/5 text-primary rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-black border-none">
              <Sparkles className="h-3 w-3 mr-2 inline" /> Artisan Onboarding
            </Badge>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary leading-none">Choose Your <br />Legacy</h1>
            <p className="text-lg text-muted-foreground italic font-body">Select your business model to join the GlamLux Elite Registry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
            {/* Option 1: Parlour */}
            <Card 
              onClick={() => handleStartBusiness('parlour')}
              className="group cursor-pointer rounded-[3.5rem] border-none bg-white/40 backdrop-blur-xl p-12 space-y-8 shadow-2xl transition-all hover:scale-[1.02] hover:bg-primary/5 ring-1 ring-primary/5"
            >
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Scissors className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-headline italic text-primary">Elite Parlour</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Offer luxury transformations, bridal glows, and specialized hair/skin services. Perfect for high-end studios.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary pt-4">
                Start Sanctuary <ArrowRight className="h-4 w-4" />
              </div>
            </Card>

            {/* Option 2: Shop */}
            <Card 
              onClick={() => handleStartBusiness('shop')}
              className="group cursor-pointer rounded-[3.5rem] border-none bg-white/40 backdrop-blur-xl p-12 space-y-8 shadow-2xl transition-all hover:scale-[1.02] hover:bg-accent/10 ring-1 ring-accent/5"
            >
              <div className="h-20 w-20 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-headline italic text-primary">Designer Shop</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Curate professional makeup bundles and boutique products. Ideal for independent brands and artisans.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent-foreground pt-4">
                Launch Boutique <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard View (existing logic)
  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-4 md:py-12">
        <header className="flex flex-col gap-3 mb-8 pt-4 md:pt-20">
          <div className="space-y-0.5">
            <Badge className="bg-primary/10 text-primary rounded-full px-2 py-0.5 uppercase tracking-widest text-[7px] font-black">Owner Area</Badge>
            <h1 className="text-3xl md:text-7xl font-headline tracking-tighter italic text-primary leading-none">Management</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 text-primary">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
             <Card className="rounded-[1rem] border-none bg-primary p-2 md:p-3 space-y-0.5 shadow-sm text-primary-foreground">
               <TrendingUp className="h-2 w-2 opacity-60" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter leading-none">{arrivals.length * 15}K</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-60">Estimated Revenue ({getCurrency()})</p>
             </Card>
             <Card className="rounded-[1rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 shadow-sm">
               <Users className="h-2 w-2 opacity-40 text-primary" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter text-primary leading-none">{arrivals.filter(a => a.deliveryStatus !== 'Delivered').length}</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-40 text-primary">Active Flows</p>
             </Card>
             <Card 
                className="rounded-[1rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 cursor-pointer hover:bg-primary/10 transition-all shadow-sm group"
                onClick={() => setActiveSheet('delivery')}
             >
                <Navigation className="h-2 w-2 opacity-60 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <p className="text-[7px] uppercase font-black tracking-widest text-primary">Logistics</p>
                <p className="text-[8px] italic opacity-80 text-primary/70 leading-none">Join Delivery network</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-transparent h-auto gap-8 border-b w-full justify-start rounded-none overflow-x-auto scrollbar-hide">
            {['bookings', 'items', 'services'].map((id) => (
              <TabsTrigger 
                key={id} value={id} 
                className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] text-primary"
              >
                {id === 'bookings' ? 'Queue' : id === 'items' ? 'Products' : 'Deals'}
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
                  className="min-w-[280px] rounded-3xl border-none bg-white/40 backdrop-blur-md p-6 space-y-4 cursor-pointer hover:bg-primary/10 transition-all shadow-sm ring-1 ring-primary/5"
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
              <Button onClick={() => setActiveSheet('product')} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">Add Product</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {myProducts.map((p) => (
                <div key={p.id} className="space-y-3 text-center group">
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-muted shadow-lg ring-1 ring-primary/5">
                    <Image src={p.imageUrl || 'https://picsum.photos/seed/product-placeholder/400/500'} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-headline text-xl italic text-primary truncate px-2">{p.name}</h4>
                    <p className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">{getCurrency()} {p.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {myProducts.length === 0 && (
                <div className="col-span-full py-20 border-2 border-dashed rounded-[3rem] border-primary/5 flex flex-col items-center justify-center space-y-4">
                  <ShoppingBag className="h-10 w-10 text-primary/10" />
                  <p className="italic text-muted-foreground opacity-50">No products listed.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Service Catalog</h3>
              <Button onClick={() => setActiveSheet('service')} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">Add Deal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myDeals.map((d) => (
                <Card key={d.id} className="p-8 rounded-[2.5rem] border-none bg-white/40 backdrop-blur-md flex justify-between items-center shadow-xl ring-1 ring-primary/5">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase font-black tracking-widest text-primary/40">{d.category}</p>
                    <h4 className="font-headline text-3xl italic text-primary leading-none">{d.name}</h4>
                    <p className="text-xs font-bold text-accent-foreground">{getCurrency()} {d.discountPrice?.toLocaleString()}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/30">
                    <Scissors className="h-6 w-6" />
                  </div>
                </Card>
              ))}
              {myDeals.length === 0 && (
                <div className="col-span-full py-20 border-2 border-dashed rounded-[3rem] border-primary/5 flex flex-col items-center justify-center space-y-4">
                  <Scissors className="h-10 w-10 text-primary/10" />
                  <p className="italic text-muted-foreground opacity-50">No active deals found.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sheets & Dialogs (same as before) */}
      <Dialog open={activeSheet === 'product' || activeSheet === 'service'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-[3rem] border-none bg-white/90 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-4xl font-headline italic text-primary tracking-tighter">New Listing</DialogTitle>
            <DialogDescription className="italic">Add a prestigious item to your professional catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSheetSubmit} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-[0.2em] ml-4 text-primary/60">Official Name</Label>
              <Input name="name" required placeholder="Item reference name..." className="rounded-full h-14 bg-white/60 border-primary/10 px-8" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-[0.2em] ml-4 text-primary/60">Detail (Brand/Category)</Label>
                <Input name="detail" required placeholder="Elite Boutique" className="rounded-full h-14 bg-white/60 border-primary/10 px-8" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-[0.2em] ml-4 text-primary/60">Market Value</Label>
                <Input name="value" type="number" required placeholder="0.00" className="rounded-full h-14 bg-white/60 border-primary/10 px-8" />
              </div>
            </div>
            <Button type="submit" className="w-full h-16 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-primary/90 transition-all">
              Initialize Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] border-none p-12 bg-white/95 backdrop-blur-3xl shadow-2xl">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 py-1.5 rounded-full mb-2">Reference {selectedArrival.referenceCode}</Badge>
                <SheetTitle className="text-5xl font-headline italic text-primary tracking-tighter">{selectedArrival.userName || selectedArrival.userPhone}</SheetTitle>
                <SheetDescription className="text-lg italic text-muted-foreground">Managing artisan workflow and guest verification.</SheetDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-16 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg uppercase tracking-widest text-[10px]">Verify Flow</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-16 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg uppercase tracking-widest text-[10px]">In-Progress</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Delivered')} className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-lg uppercase tracking-widest text-[10px]">Complete</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
