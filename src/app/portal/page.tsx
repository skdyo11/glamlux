
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
  
  const [activeTab, setActiveTab] = useState('bookings');
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
    toast({ title: "Checking Code", description: `Reference: ${decodedText}` });
    try {
      const q = query(collectionGroup(firestore, 'bookings'), where('referenceCode', '==', decodedText));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Wrong Code", description: "No booking found with this code." });
        return;
      }
      const docRef = snap.docs[0];
      await updateDoc(docRef.ref, { qr_verified: true, arrival_time: new Date().toISOString() });
      toast({ title: "Welcome!", description: "The customer can now enjoy their service." });
      setActiveTab('bookings');
    } catch (error) {
      toast({ variant: "destructive", title: "Error Scanning" });
    }
  }

  function onScanFailure() {}

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <header className="flex flex-col gap-12 mb-20">
          <div className="space-y-4">
            <Badge className="bg-primary/20 backdrop-blur-md text-primary border-white/20 rounded-none px-4 py-1 uppercase tracking-widest text-[10px]">Owner Area</Badge>
            <h1 className="text-7xl font-headline tracking-tighter italic text-primary">Manage My Shop</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="rounded-none border-white/20 bg-white/5 backdrop-blur-3xl p-10 space-y-4 shadow-2xl ring-1 ring-white/10 group hover:bg-white/10 transition-all duration-500">
               <TrendingUp className="h-6 w-6 opacity-40 group-hover:scale-110 transition-transform" />
               <p className="text-4xl font-headline italic tracking-tighter">82.4K</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Today's Sales ({getCurrency()})</p>
             </Card>
             <Card className="rounded-none border-white/20 bg-white/5 backdrop-blur-3xl p-10 space-y-4 shadow-2xl ring-1 ring-white/10 group hover:bg-white/10 transition-all duration-500">
               <Users className="h-6 w-6 opacity-40 group-hover:scale-110 transition-transform" />
               <p className="text-4xl font-headline italic tracking-tighter">14</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Workers Today</p>
             </Card>
             <Card 
                className="rounded-none border-white/30 bg-primary/20 backdrop-blur-3xl text-white p-10 space-y-4 cursor-pointer hover:bg-primary/30 transition-all duration-500 shadow-2xl ring-1 ring-white/20 group"
                onClick={() => setIsCourierSheetOpen(true)}
             >
                <Navigation className="h-6 w-6 opacity-60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <p className="text-[10px] uppercase font-black tracking-widest">Join Delivery Team</p>
                <p className="text-xs italic opacity-60">Help us deliver makeup</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-transparent p-0 h-auto gap-12 border-b w-full justify-start rounded-none overflow-x-auto scrollbar-hide">
            {[
              { id: 'bookings', label: 'Bookings' },
              { id: 'scanner', label: 'Scan Code' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'items', label: 'My Items' },
              { id: 'services', label: 'Services' }
            ].map((t) => (
              <TabsTrigger 
                key={t.id} value={t.id} 
                className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] transition-all"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="scanner" className="space-y-4 max-w-xl mx-auto text-center">
             <div className="space-y-8">
                <div id="reader" className="w-full aspect-square grayscale border-4 border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl" />
                <div className="flex items-center justify-center gap-3 animate-pulse italic text-primary/60">
                   <QrCode className="h-5 w-5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Customer Ticket</span>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card 
                  key={i} 
                  className="rounded-none border-white/10 bg-white/5 backdrop-blur-3xl p-8 space-y-6 hover:bg-white/10 transition-all duration-500 cursor-pointer shadow-xl ring-1 ring-white/5 group" 
                  onClick={() => setSelectedArrival({ id: i, name: 'Customer', service: 'Bridal Service', time: '10:30 AM', status: 'Pending' })}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary opacity-40">Coming at {10 + i}:30 AM</p>
                      <h4 className="font-headline text-3xl group-hover:text-accent-foreground transition-colors">Sara Khan</h4>
                      <p className="text-xs italic text-muted-foreground">Royal Bridal Special</p>
                    </div>
                    <Badge variant="outline" className="rounded-none uppercase text-[8px] font-black tracking-widest px-3 border-white/20 bg-white/10 backdrop-blur-md">Waiting</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-12">
            <div className="flex justify-between items-center">
               <h3 className="text-4xl font-headline tracking-tighter italic">Weekly Schedule</h3>
               <Badge className="bg-accent/20 backdrop-blur-md text-accent-foreground border-accent/30 rounded-none px-4 py-1 uppercase tracking-widest text-[8px] font-black">Very Busy Soon</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 space-y-4 text-center shadow-lg hover:bg-white/10 transition-all duration-500 group ring-1 ring-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{day}</p>
                   <p className="font-headline text-2xl">8/12</p>
                   <p className="text-[8px] uppercase font-bold opacity-60">Slots Full</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic">My Stock</h3>
              <Button className="rounded-none h-12 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/20 backdrop-blur-3xl border border-white/20 hover:bg-primary/30 transition-all duration-500">
                <Plus className="h-4 w-4 mr-2" /> Add Makeup
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/5 p-6 transition-all duration-700 hover:bg-white/10 shadow-xl ring-1 ring-white/5">
                  <div className="relative aspect-square grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="pt-6 space-y-1">
                    <h4 className="font-headline text-2xl group-hover:text-accent-foreground transition-colors">{p.name}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{p.brand}</p>
                    <p className="text-xs font-bold pt-2">Left in Shop: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Courier Sheet */}
      <Sheet open={isCourierSheetOpen} onOpenChange={setIsCourierSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-none h-[85vh] md:h-auto border-t-0 p-20 bg-primary/20 backdrop-blur-3xl text-white">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <Navigation className="h-12 w-12 mx-auto text-accent animate-bounce" />
              <SheetTitle className="text-6xl font-headline italic text-white tracking-tighter">Delivery Team</SheetTitle>
              <SheetDescription className="text-accent italic text-lg font-body">Help us deliver beauty products across the city.</SheetDescription>
            </div>
            <div className="space-y-8">
               <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Full Name</Label>
                <Input placeholder="Enter your name" className="rounded-none h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Phone Number</Label>
                  <Input placeholder="Mobile number" className="rounded-none h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Vehicle Type</Label>
                  <Input placeholder="Bike, Rickshaw, or Car" className="rounded-none h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all" />
                </div>
              </div>
              <Button onClick={() => setIsCourierSheetOpen(false)} className="w-full h-16 bg-accent/20 backdrop-blur-xl text-accent-foreground hover:bg-accent/30 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] border border-accent/30 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                Join Now
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Guest Check Sheet */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-none border-t-0 p-20 bg-white/5 backdrop-blur-3xl">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-12">
              <div className="space-y-2">
                <Badge className="bg-primary/20 backdrop-blur-md text-primary-foreground rounded-none uppercase tracking-widest text-[8px] font-black border-white/20 px-4 py-1">Customer Check-in</Badge>
                <SheetTitle className="text-7xl font-headline leading-none italic text-primary">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-2xl text-primary/60">{selectedArrival.service}</SheetDescription>
              </div>
              
              <div className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6 ring-1 ring-white/5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Booking Time</span>
                  <span className="font-headline text-3xl">{selectedArrival.time}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ticket Code</span>
                  <span className="font-mono font-bold tracking-tighter text-xl">GL-9382-AR</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setSelectedArrival(null)} className="flex-1 h-16 bg-primary/20 backdrop-blur-xl text-primary-foreground hover:bg-primary/30 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] border border-white/20 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  Check Code & Start
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
