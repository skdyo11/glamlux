
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Users, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Plus, 
  QrCode,
  Navigation,
  CalendarDays
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS } from '@/app/lib/mock-data';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { getCurrency } = useStore();
  
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [isCourierSheetOpen, setIsCourierSheetOpen] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === 'scanner') {
      timer = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        if (readerElement && !scannerRef.current) {
          try {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
          } catch (e) {
            console.error("Scanner init error", e);
          }
        }
      }, 1000);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  async function onScanSuccess(decodedText: string) {
    if (!firestore) return;
    toast({ title: "Validating Artistry Code", description: `Ref: ${decodedText}` });
    try {
      const q = query(collectionGroup(firestore, 'bookings'), where('referenceCode', '==', decodedText));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Invalid Voucher", description: "No booking found." });
        return;
      }
      const docRef = snap.docs[0];
      await updateDoc(docRef.ref, { qr_verified: true, arrival_time: new Date().toISOString() });
      toast({ title: "Entry Verified", description: "The transformation journey may begin." });
      setActiveTab('queue');
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Failure" });
    }
  }

  function onScanFailure() {}

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <header className="flex flex-col gap-12 mb-20">
          <div className="space-y-4">
            <Badge className="bg-primary text-white rounded-none px-4 py-1 uppercase tracking-widest text-[10px]">Merchant Workspace</Badge>
            <h1 className="text-7xl font-headline tracking-tighter italic text-primary">Studio Control</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="rounded-none border bg-card p-10 space-y-4">
               <TrendingUp className="h-6 w-6 opacity-20" />
               <p className="text-4xl font-headline italic tracking-tighter">82.4K</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Today's Studio Revenue ({getCurrency()})</p>
             </Card>
             <Card className="rounded-none border bg-card p-10 space-y-4">
               <Users className="h-6 w-6 opacity-20" />
               <p className="text-4xl font-headline italic tracking-tighter">14</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Confirmed Artisans</p>
             </Card>
             <Card className="rounded-none border bg-primary text-white p-10 space-y-4 cursor-pointer hover:bg-primary/90 transition-colors" onClick={() => setIsCourierSheetOpen(true)}>
                <Navigation className="h-6 w-6 opacity-40" />
                <p className="text-[10px] uppercase font-black tracking-widest">Join Glam Dispatch</p>
                <p className="text-xs italic opacity-60">Represent our luxury fleet</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-transparent p-0 h-auto gap-12 border-b w-full justify-start rounded-none overflow-x-auto scrollbar-hide">
            {['queue', 'scanner', 'planner', 'boutique', 'services'].map((t) => (
              <TabsTrigger 
                key={t} value={t} 
                className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] transition-all"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="scanner" className="space-y-4 max-w-xl mx-auto text-center">
             <div className="space-y-8">
                <div id="reader" className="w-full aspect-square grayscale border-4 border-primary/10 bg-muted/20" />
                <div className="flex items-center justify-center gap-3 animate-pulse italic text-primary/60">
                   <QrCode className="h-5 w-5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">Awaiting Artisan Voucher</span>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-none border-none bg-muted/20 p-8 space-y-6 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedArrival({ id: i, name: 'Artisan Guest', service: 'Bridal Transformation', time: '10:30 AM', status: 'Pending' })}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary opacity-40">Scheduled {10 + i}:30 AM</p>
                      <h4 className="font-headline text-3xl">Sara Khan</h4>
                      <p className="text-xs italic text-muted-foreground">Royal Bridal Glow Up</p>
                    </div>
                    <Badge variant="outline" className="rounded-none uppercase text-[8px] font-black tracking-widest px-3">Pending</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="planner" className="space-y-12">
            <div className="flex justify-between items-center">
               <h3 className="text-4xl font-headline tracking-tighter italic">Weekly Diary Grid</h3>
               <Badge className="bg-accent text-black rounded-none">High Demand Period</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="border p-6 space-y-4 bg-white/50 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{day}</p>
                   <p className="font-headline text-2xl">8/12</p>
                   <p className="text-[8px] uppercase font-bold opacity-60">Slots Used</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="boutique" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic">Stock Inventory</h3>
              <Button className="rounded-none h-10 px-8 font-bold text-[10px] uppercase tracking-widest"><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="group relative">
                  <div className="relative aspect-square grayscale group-hover:grayscale-0 transition-all">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="pt-4 space-y-1">
                    <h4 className="font-headline text-xl">{p.name}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{p.brand}</p>
                    <p className="text-xs font-bold">In Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={isCourierSheetOpen} onOpenChange={setIsCourierSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-none h-[85vh] md:h-auto border-t-0 p-20 bg-primary text-white">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <Navigation className="h-12 w-12 mx-auto text-accent" />
              <SheetTitle className="text-6xl font-headline italic text-white tracking-tighter">Glam Dispatch</SheetTitle>
              <SheetDescription className="text-accent italic text-lg font-body">Represent our luxury fleet. Deliver the finest beauty products across the city with elegance and precision.</SheetDescription>
            </div>
            <div className="space-y-8">
               <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Full Legal Name</Label>
                <Input placeholder="Reference name" className="rounded-none h-14 bg-white/10 border-white/20 text-white placeholder:text-white/20" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Contact Number</Label>
                  <Input placeholder="+92 / +91 number" className="rounded-none h-14 bg-white/10 border-white/20 text-white placeholder:text-white/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Fleet Vehicle</Label>
                  <Input placeholder="e.g. Scooter, Luxury Sedan" className="rounded-none h-14 bg-white/10 border-white/20 text-white placeholder:text-white/20" />
                </div>
              </div>
              <Button onClick={() => setIsCourierSheetOpen(false)} className="w-full h-16 bg-accent text-black hover:bg-white rounded-none font-bold uppercase tracking-[0.3em] text-[10px]">
                Submit Fleet Application
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-none border-t-0 p-20">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-12">
              <div className="space-y-2">
                <Badge className="bg-primary text-white rounded-none uppercase tracking-widest text-[8px] font-black">Guest Arrival Check</Badge>
                <SheetTitle className="text-7xl font-headline leading-none italic">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-2xl text-primary/60">{selectedArrival.service}</SheetDescription>
              </div>
              
              <div className="p-10 bg-muted/20 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Scheduled Time</span>
                  <span className="font-headline text-3xl">{selectedArrival.time}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Booking Reference</span>
                  <span className="font-mono font-bold tracking-tighter">GL-9382-AR</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setSelectedArrival(null)} className="flex-1 h-16 bg-primary text-white font-bold rounded-none uppercase tracking-[0.3em] text-[10px]">
                  Verify & Grant Entry
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
