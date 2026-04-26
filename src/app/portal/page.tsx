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
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
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
  QrCode,
  Navigation,
  Scissors,
  Package,
  Trash2,
  Edit
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, updateDoc, addDoc, serverTimestamp, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Conversation } from '@/app/types';

const MOCK_BUSINESS_CHATS: Conversation[] = [
  {
    id: 'bc1',
    participantId: 'support',
    participantName: 'GlamLux Help',
    participantImage: 'https://picsum.photos/seed/glam-makeup-hero-final/100/100',
    lastMessage: 'Your payout for last week is processed.',
    lastTimestamp: '10:15 AM',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'support', text: 'Hello! Your delivery driver is now assigned.', timestamp: '09:00 AM', isMe: false },
      { id: 'm2', senderId: 'me', text: 'Thank you, can I track the live location?', timestamp: '09:05 AM', isMe: true },
      { id: 'm3', senderId: 'support', text: 'Your payout for last week is processed.', timestamp: '10:15 AM', isMe: false },
    ]
  }
];

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { getCurrency } = useStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);

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

    const dealsQuery = query(collection(firestore, 'deals'), where('vendor_id', '==', user.uid));
    const unsubDeals = onSnapshot(dealsQuery, (snapshot) => {
      setMyDeals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const productsQuery = query(collection(firestore, 'products'), where('vendor_id', '==', user.uid));
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
  }, [user, firestore]);

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
          vendor_id: user.uid,
          name,
          brand: detail,
          price: parseFloat(value),
          stock: 0,
          image: 'https://picsum.photos/seed/luxury-makeup-primer/400/500',
          currency: 'PKR',
          createdAt: serverTimestamp(),
        });
      } else if (activeSheet === 'service') {
        await addDoc(collection(firestore, 'deals'), {
          vendor_id: user.uid,
          name,
          category: detail,
          discount_price: parseFloat(value),
          base_price: parseFloat(value) * 1.2,
          deposit_percent: 10,
          is_offpeak_active: false,
          expiry_date: "2025-12-31T23:59:59Z",
          currency: 'PKR',
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-4 md:py-12">
        <header className="flex flex-col gap-3 mb-8 pt-4 md:pt-20">
          <div className="space-y-0.5">
            <Badge className="bg-primary/10 text-primary rounded-full px-2 py-0.5 uppercase tracking-widest text-[7px] font-black">Owner Area</Badge>
            <h1 className="text-3xl md:text-7xl font-headline tracking-tighter italic text-primary leading-none">My Shop</h1>
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
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter text-primary leading-none">{arrivals.filter(a => a.deliveryStatus !== 'Completed').length}</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-40 text-primary">Pending Guests</p>
             </Card>
             <Card 
                className="rounded-[1rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 cursor-pointer hover:bg-primary/10 transition-all shadow-sm group"
                onClick={() => setActiveSheet('delivery')}
             >
                <Navigation className="h-2 w-2 opacity-60 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <p className="text-[7px] uppercase font-black tracking-widest text-primary">Logistics</p>
                <p className="text-[8px] italic opacity-80 text-primary/70 leading-none">Join Delivery team</p>
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
                  className="min-w-[280px] rounded-3xl border-none bg-primary/5 p-6 space-y-4 cursor-pointer hover:bg-primary/10 transition-all"
                  onClick={() => setSelectedArrival(a)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary opacity-40">Guest</p>
                      <h4 className="font-headline text-2xl text-primary italic">{a.userPhone}</h4>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[8px] uppercase">{a.deliveryStatus}</Badge>
                  </div>
                </Card>
              ))}
              {arrivals.length === 0 && <p className="italic text-muted-foreground opacity-50">No pending bookings.</p>}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Inventory</h3>
              <Button onClick={() => setActiveSheet('product')} size="sm" className="rounded-full">Add Product</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {myProducts.map((p) => (
                <div key={p.id} className="space-y-2 text-center">
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-headline text-lg italic text-primary">{p.name}</h4>
                  <p className="text-[10px] font-bold text-primary">{getCurrency()} {p.price}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Service Deals</h3>
              <Button onClick={() => setActiveSheet('service')} size="sm" className="rounded-full">Add Deal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myDeals.map((d) => (
                <Card key={d.id} className="p-6 rounded-3xl border-none bg-primary/5 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-headline text-2xl italic text-primary">{d.name}</h4>
                    <p className="text-xs font-bold text-accent-foreground">{getCurrency()} {d.discount_price}</p>
                  </div>
                  <Scissors className="h-6 w-6 text-primary/30" />
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={activeSheet === 'product' || activeSheet === 'service'} onOpenChange={() => setActiveSheet(null)}>
        <DialogContent className="rounded-[2.5rem] border-none">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline italic">New Listing</DialogTitle>
            <DialogDescription>Add to your professional catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSheetSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black tracking-widest ml-2">Name</Label>
              <Input name="name" required placeholder="Name..." className="rounded-full h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-2">Detail</Label>
                <Input name="detail" required placeholder="e.g. Brand" className="rounded-full h-12" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-2">Price</Label>
                <Input name="value" type="number" required placeholder="Price" className="rounded-full h-12" />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-bold uppercase tracking-widest text-[10px]">Confirm</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] border-none p-10 space-y-6">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <SheetTitle className="text-4xl font-headline italic">{selectedArrival.userPhone}</SheetTitle>
                <SheetDescription>Reference: {selectedArrival.referenceCode}</SheetDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-14 bg-green-600 rounded-2xl">Verify</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-14 bg-amber-600 rounded-2xl">In-Progress</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Delivered')} className="h-14 bg-primary rounded-2xl">Complete</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
