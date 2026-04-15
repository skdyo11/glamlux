
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock, 
  ChevronRight, 
  Plus, 
  QrCode,
  Navigation,
  CalendarDays,
  Scissors,
  ArrowRight,
  Package,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS, DEALS } from '@/app/lib/mock-data';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

const WEEKLY_PLAN = [
  { day: 'Mon', slots: 12, demand: 'Medium' },
  { day: 'Tue', slots: 12, demand: 'Medium' },
  { day: 'Wed', slots: 12, demand: 'Medium' },
  { day: 'Thu', slots: 24, demand: 'High' },
  { day: 'Fri', slots: 24, demand: 'High' },
  { day: 'Sat', slots: 12, demand: 'High' },
  { day: 'Sun', slots: 0, demand: 'Closed' },
];

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { getCurrency } = useStore();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Arrivals State
  const [arrivals, setArrivals] = useState([
    { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '11:30 AM', status: 'Waiting' },
    { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:30 PM', status: 'Waiting' },
    { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '01:30 PM', status: 'Waiting' },
  ]);

  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [activeSheet, setActiveSheet] = useState<'delivery' | 'service' | 'product' | null>(null);

  const myServices = DEALS.filter(d => d.vendor_id === 'v1');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateArrivalStatus = (id: string, newStatus: string) => {
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast({
      title: "Status Updated",
      description: `Guest status changed to ${newStatus}.`
    });
    setSelectedArrival(null);
  };

  useEffect(() => {
    if (!isMounted) return;
    
    let timer: NodeJS.Timeout;
    if (activeTab === 'scanner') {
      timer = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        if (readerElement && !scannerRef.current) {
          try {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, () => {});
            scannerRef.current = scanner;
          } catch (e) {
            console.error("Scanner init error", e);
          }
        }
      }, 500);
    } else if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [activeTab, isMounted]);

  async function onScanSuccess(decodedText: string) {
    if (!firestore) return;
    toast({ title: "Checking Ticket...", description: `Code: ${decodedText}` });
    try {
      const q = query(collectionGroup(firestore, 'bookings'), where('referenceCode', '==', decodedText));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Wrong Ticket", description: "Not found." });
        return;
      }
      await updateDoc(snap.docs[0].ref, { qr_verified: true, arrival_time: new Date().toISOString() });
      toast({ title: "Welcome!", description: "Check-in successful." });
      setActiveTab('bookings');
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Error" });
    }
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <header className="flex flex-col gap-12 mb-20">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary rounded-full px-4 py-1 uppercase tracking-widest text-[10px]">Owner Area</Badge>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary">My Shop</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-10 space-y-4 shadow-xl">
               <TrendingUp className="h-6 w-6 opacity-40 text-primary" />
               <p className="text-4xl font-headline italic tracking-tighter text-primary">82.4K</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40 text-primary">Today's Money ({getCurrency()})</p>
             </Card>
             <Card className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-10 space-y-4 shadow-xl">
               <Users className="h-6 w-6 opacity-40 text-primary" />
               <p className="text-4xl font-headline italic tracking-tighter text-primary">14</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40 text-primary">Staff Working</p>
             </Card>
             <Card 
                className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-10 space-y-4 cursor-pointer hover:bg-primary/10 transition-all shadow-xl group"
                onClick={() => setActiveSheet('delivery')}
             >
                <Navigation className="h-6 w-6 opacity-60 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">Join Delivery Team</p>
                <p className="text-xs italic opacity-80 text-primary/70">Deliver makeup to homes</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-transparent h-auto gap-8 border-b w-full justify-start rounded-none overflow-x-auto scrollbar-hide">
            {['bookings', 'scanner', 'chat', 'items', 'services'].map((id) => (
              <TabsTrigger 
                key={id} value={id} 
                className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] text-primary"
              >
                {id === 'bookings' ? 'Queue' : id === 'items' ? 'Products' : id.charAt(0).toUpperCase() + id.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bookings" className="space-y-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary/40" />
                <h3 className="text-3xl font-headline italic text-primary">My Weekly Plan</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {WEEKLY_PLAN.map((item) => (
                  <Card key={item.day} className="min-w-[140px] p-8 rounded-[2.5rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl flex flex-col items-center gap-2 shadow-xl hover:bg-primary/10 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{item.day}</span>
                    <span className="font-headline text-3xl italic text-primary">{item.slots > 0 ? `${item.slots} Slots` : 'Closed'}</span>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 mt-2 rounded-full",
                      item.demand === 'High' ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                    )}>{item.demand}</Badge>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary/40" />
                <h3 className="text-3xl font-headline italic text-primary">Who's Coming Next</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {arrivals.map((a) => (
                  <Card 
                    key={a.id} 
                    className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-8 space-y-6 hover:bg-primary/10 transition-all cursor-pointer shadow-xl ring-1 ring-white/5" 
                    onClick={() => setSelectedArrival(a)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary opacity-40">Coming at {a.time}</p>
                        <h4 className="font-headline text-3xl text-primary italic leading-none">{a.name}</h4>
                        <p className="text-xs italic text-muted-foreground">{a.service}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "rounded-full text-[8px] font-black tracking-widest px-3 border-white/20",
                        a.status === 'Waiting' ? "text-primary" : a.status === 'Verified' ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"
                      )}>
                        {a.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="scanner" className="max-w-xl mx-auto space-y-8 text-center animate-in zoom-in-95 duration-300">
            <div id="reader" className="w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl" />
            <div className="flex items-center justify-center gap-3 italic text-primary/60">
              <QrCode className="h-5 w-5" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Customer Ticket</span>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-300">
            <Card className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-8 space-y-6 shadow-xl">
              <h3 className="font-headline text-3xl italic text-primary">Business Chats</h3>
              <div className="space-y-2">
                {[{id: 'b1', name: 'GlamLux Help', msg: 'Driver is on the way.'}, {id: 'b2', name: 'Beauty Brands', msg: 'Products ready.'}].map(chat => (
                  <button key={chat.id} className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all text-left">
                    <Avatar className="h-12 w-12 border-2 border-primary/10"><AvatarFallback>{chat.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate text-primary">{chat.name}</p>
                      <p className="text-xs truncate text-muted-foreground italic">{chat.msg}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
            <Card className="lg:col-span-2 rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl h-[500px] flex flex-col shadow-xl overflow-hidden">
               <div className="p-6 border-b flex items-center gap-4 bg-white/20 dark:bg-white/5">
                  <Avatar className="h-10 w-10"><AvatarFallback>G</AvatarFallback></Avatar>
                  <div>
                     <p className="font-headline text-xl italic text-primary">GlamLux Help</p>
                     <p className="text-[8px] uppercase font-black text-rose-500 tracking-widest">Support Channel</p>
                  </div>
               </div>
               <ScrollArea className="flex-1 p-8">
                  <div className="bg-primary/5 dark:bg-white/5 p-4 rounded-3xl rounded-tl-none max-w-[80%] text-sm italic">Hello! Your delivery driver is now assigned.</div>
               </ScrollArea>
               <div className="p-6 border-t bg-white/20 dark:bg-white/5 flex gap-2">
                  <Input placeholder="Message help team..." className="rounded-full bg-white/60 dark:bg-white/10 border-none h-12 px-6" />
                  <Button size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground"><Send className="h-5 w-5" /></Button>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">My Products</h3>
              <Button onClick={() => setActiveSheet('product')} className="rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-xl border border-white/20 hover:bg-primary/20 text-primary transition-all">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="group relative bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[3rem] transition-all hover:bg-primary/10 shadow-xl">
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden">
                    <Image src={p.image} alt={p.name} fill className="object-cover soft-focus group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="pt-6 space-y-1 text-center">
                    <h4 className="font-headline text-2xl text-primary italic leading-none">{p.name}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-primary">{p.brand}</p>
                    <p className="text-xs font-bold pt-2 text-primary">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">My Services</h3>
              <Button onClick={() => setActiveSheet('service')} className="rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-xl border border-white/20 hover:bg-primary/20 text-primary transition-all">
                <Plus className="h-4 w-4 mr-2" /> Add Service
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myServices.map((service) => (
                <Card key={service.id} className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-xl p-8 flex gap-6 items-center hover:bg-primary/10 transition-all shadow-xl group">
                  <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform"><Scissors className="h-10 w-10" /></div>
                  <div className="flex-grow space-y-2">
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary rounded-full">{service.category}</Badge>
                    <h4 className="font-headline text-3xl text-primary italic leading-none">{service.name}</h4>
                    <p className="font-bold text-lg text-accent-foreground">{getCurrency()} {service.discount_price.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full"><ArrowRight className="h-5 w-5" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Unified Form Sheet */}
      <Sheet open={!!activeSheet} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] bg-background/95 backdrop-blur-xl border-none">
          <ScrollArea className="h-full">
            <div className="max-w-xl mx-auto space-y-12 py-10 px-6">
              <SheetHeader className="text-center">
                <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeSheet === 'delivery' ? <Navigation className="h-10 w-10 text-primary" /> : activeSheet === 'product' ? <Package className="h-10 w-10 text-primary" /> : <Scissors className="h-10 w-10 text-primary" />}
                </div>
                <SheetTitle className="text-5xl font-headline italic text-primary tracking-tighter leading-none">
                  {activeSheet === 'delivery' ? 'Join Team' : activeSheet === 'product' ? 'New Item' : 'New Deal'}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground italic text-lg font-body">Complete the details below to proceed.</SheetDescription>
              </SheetHeader>
              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Name / Title</Label>
                  <Input placeholder="Enter name..." className="rounded-full h-14 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-8" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Detail</Label>
                    <Input placeholder="Enter info..." className="rounded-full h-14 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-8" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Value</Label>
                    <Input placeholder="Enter value..." className="rounded-full h-14 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-8" />
                  </div>
                </div>
                <Button onClick={() => {toast({title: "Processing", description: "Submission successful."}); setActiveSheet(null);}} className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all">
                  Submit Details
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Arrival Management Sheet */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-none">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-12 py-10 px-6">
              <div className="space-y-2 text-center">
                <Badge className="bg-primary/10 text-primary rounded-full uppercase tracking-widest text-[8px] font-black px-4 py-1">Customer Arrival</Badge>
                <SheetTitle className="text-6xl font-headline italic text-primary leading-none">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-2xl text-primary/60">{selectedArrival.service}</SheetDescription>
              </div>
              <div className="p-10 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-[3rem] space-y-4 text-center md:text-left">
                <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Time</span><span className="font-headline text-3xl text-primary italic">{selectedArrival.time}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Code</span><span className="font-mono font-bold text-xl text-primary">GL-9382-AR</span></div>
                <div className="flex justify-between items-baseline pt-4 border-t"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Current Status</span><Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px]">{selectedArrival.status}</Badge></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-14 bg-green-600 text-white hover:bg-green-700 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Verify Entry</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-14 bg-amber-600 text-white hover:bg-amber-700 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Start Service</Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Completed')} className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Complete</Button>
              </div>

              <SheetClose asChild>
                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest opacity-40">Dismiss</Button>
              </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
