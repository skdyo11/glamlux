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
        name: type === 'parlour' ? `${user.displayName || 'My'} Parlour` : `${user.displayName || 'My'} Shop`,
        areaTag: 'Select Area',
        rating: 5.0,
        imageUrls: [],
        description: type === 'parlour' ? 'A nice beauty parlour.' : 'A premium makeup shop.',
        createdAt: serverTimestamp()
      });
      
      setHasBusiness(true);
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

      toast({ title: "Success", description: `${activeSheet} added.` });
      setActiveSheet(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add." });
    }
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
              className="group cursor-pointer rounded-2xl border-none bg-white/40 backdrop-blur-xl p-10 space-y-6 shadow-xl transition-all hover:scale-[1.02] hover:bg-primary/5 ring-1 ring-primary/5"
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
              className="group cursor-pointer rounded-2xl border-none bg-white/40 backdrop-blur-xl p-10 space-y-6 shadow-xl transition-all hover:scale-[1.02] hover:bg-accent/10 ring-1 ring-accent/5"
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
             <Card className="rounded-xl border-none bg-primary p-2 md:p-3 space-y-0.5 shadow-sm text-primary-foreground">
               <TrendingUp className="h-2 w-2 opacity-60" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter leading-none">{arrivals.length * 15}K</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-60">Estimated Revenue ({getCurrency()})</p>
             </Card>
             <Card className="rounded-xl border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 shadow-sm">
               <Users className="h-2 w-2 opacity-40 text-primary" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter text-primary leading-none">{arrivals.filter(a => a.deliveryStatus !== 'Delivered').length}</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-40 text-primary">Active Flows</p>
             </Card>
             <Card 
                className="rounded-xl border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 cursor-pointer hover:bg-primary/10 transition-all shadow-sm group"
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
                  className="min-w-[280px] rounded-2xl border-none bg-white/40 backdrop-blur-md p-6 space-y-4 cursor-pointer hover:bg-primary/10 transition-all shadow-sm ring-1 ring-primary/5"
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
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Inventory</h3>
              <Button onClick={() => setActiveSheet('product')} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">Add Product</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {myProducts.map((p) => (
                <div key={p.id} className="space-y-3 text-center group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg ring-1 ring-primary/5">
                    <Image src={p.imageUrl || 'https://picsum.photos/seed/product-placeholder/400/500'} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-headline text-xl italic text-primary truncate px-2">{p.name}</h4>
                    <p className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">{getCurrency()} {p.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Services</h3>
              <Button onClick={() => setActiveSheet('service')} size="sm" className="rounded-full bg-primary h-10 px-6 font-bold uppercase tracking-widest text-[9px]">Add Deal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myDeals.map((d) => (
                <Card key={d.id} className="p-8 rounded-2xl border-none bg-white/40 backdrop-blur-md flex justify-between items-center shadow-xl ring-1 ring-primary/5">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase font-black tracking-widest text-primary/40">{d.category}</p>
                    <h4 className="font-headline text-3xl italic text-primary leading-none">{d.name}</h4>
                    <p className="text-xs font-bold text-accent-foreground">{getCurrency()} {d.discountPrice?.toLocaleString()}</p>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary/30">
                    <Scissors className="h-6 w-6" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={activeSheet === 'product' || activeSheet === 'service'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-2xl border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline italic text-primary">New Listing</DialogTitle>
            <DialogDescription className="italic">Add a new item to your shop or parlour.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSheetSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Name</Label>
              <Input name="name" required placeholder="Name of the item..." className="rounded-full h-12 bg-primary/5 border-none px-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Detail</Label>
                <Input name="detail" required placeholder="Category/Brand" className="rounded-full h-12 bg-primary/5 border-none px-6" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Price</Label>
                <Input name="value" type="number" required placeholder="0.00" className="rounded-full h-12 bg-primary/5 border-none px-6" />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">
              Save Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-none p-10 bg-white/95 shadow-2xl">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 py-1.5 rounded-full">Ref: {selectedArrival.referenceCode}</Badge>
                <SheetTitle className="text-4xl font-headline italic text-primary">{selectedArrival.userName || selectedArrival.userPhone}</SheetTitle>
                <SheetDescription className="italic">Manage your guest booking status.</SheetDescription>
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
