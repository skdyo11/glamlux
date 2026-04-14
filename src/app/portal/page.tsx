
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  CalendarDays,
  Scissors,
  ArrowRight,
  Package,
  MessageSquare,
  Send,
  Calendar
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS, DEALS } from '@/app/lib/mock-data';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

const MOCK_BUSINESS_CHATS = [
  { id: 'b1', name: 'GlamLux Help', lastMsg: 'Your driver is on the way.', time: '9:00 AM' },
  { id: 'b2', name: 'Beauty Brands', lastMsg: 'Your new products are ready.', time: 'Yesterday' }
];

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
  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [isCourierSheetOpen, setIsCourierSheetOpen] = useState(false);
  const [isAddServiceSheetOpen, setIsAddServiceSheetOpen] = useState(false);
  const [isAddProductSheetOpen, setIsAddProductSheetOpen] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const myServices = DEALS.filter(d => d.vendor_id === 'v1');

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
      }, 500);
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
    toast({ title: "Checking Ticket...", description: `Code: ${decodedText}` });
    try {
      const q = query(collectionGroup(firestore, 'bookings'), where('referenceCode', '==', decodedText));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Wrong Ticket", description: "We can't find this booking." });
        return;
      }
      const docRef = snap.docs[0];
      await updateDoc(docRef.ref, { qr_verified: true, arrival_time: new Date().toISOString() });
      toast({ title: "Welcome!", description: "The customer is ready for their service." });
      setActiveTab('bookings');
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Error" });
    }
  }

  function onScanFailure() {}

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <header className="flex flex-col gap-12 mb-20">
          <div className="space-y-4 text-center md:text-left">
            <Badge className="bg-primary/20 backdrop-blur-md text-primary border-white/20 rounded-full px-4 py-1 uppercase tracking-widest text-[10px]">Owner Area</Badge>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter italic text-primary">My Shop</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="rounded-[3rem] border-none bg-white/5 backdrop-blur-3xl p-10 space-y-4 shadow-2xl ring-1 ring-white/10 group hover:bg-white/10 transition-all duration-300 liquid-glass">
               <TrendingUp className="h-6 w-6 opacity-40 group-hover:scale-110 transition-transform text-primary" />
               <p className="text-4xl font-headline italic tracking-tighter text-primary">82.4K</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40 text-primary">Today's Money ({getCurrency()})</p>
             </Card>
             <Card className="rounded-[3rem] border-none bg-white/5 backdrop-blur-3xl p-10 space-y-4 shadow-2xl ring-1 ring-white/10 group hover:bg-white/10 transition-all duration-300 liquid-glass">
               <Users className="h-6 w-6 opacity-40 group-hover:scale-110 transition-transform text-primary" />
               <p className="text-4xl font-headline italic tracking-tighter text-primary">14</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-40 text-primary">Staff Working</p>
             </Card>
             <Card 
                className="rounded-[3rem] border-none bg-white/5 backdrop-blur-3xl p-10 space-y-4 cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-2xl ring-1 ring-white/10 group liquid-glass"
                onClick={() => setIsCourierSheetOpen(true)}
             >
                <Navigation className="h-6 w-6 opacity-60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-primary" />
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">Join Delivery Team</p>
                <p className="text-xs italic opacity-80 text-primary/70">Help us deliver makeup to homes</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-transparent p-0 h-auto gap-12 border-b w-full justify-start rounded-none overflow-x-auto scrollbar-hide">
            {[
              { id: 'bookings', label: 'Queue' },
              { id: 'scanner', label: 'Scan Code' },
              { id: 'chat', label: 'Business Chat' },
              { id: 'items', label: 'Products' },
              { id: 'services', label: 'Services' }
            ].map((t) => (
              <TabsTrigger 
                key={t.id} value={t.id} 
                className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-[10px] uppercase tracking-[0.3em] transition-all text-primary"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bookings" className="space-y-16">
            {/* Weekly Schedule Section */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary/40" />
                <h3 className="text-3xl font-headline italic text-primary">My Weekly Plan</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {WEEKLY_PLAN.map((item) => (
                  <Card key={item.day} className="min-w-[140px] p-8 rounded-[2.5rem] border-none bg-white/40 backdrop-blur-xl flex flex-col items-center gap-2 shadow-xl liquid-glass group hover:bg-white/60 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{item.day}</span>
                    <span className="font-headline text-3xl italic text-primary">
                      {item.slots > 0 ? `${item.slots} Slots` : 'Closed'}
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 mt-2 rounded-full",
                      item.demand === 'High' ? "bg-rose-500/10 text-rose-500" : 
                      item.demand === 'Closed' ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {item.demand}
                    </Badge>
                  </Card>
                ))}
              </div>
            </section>

            {/* Current Arrivals Section */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary/40" />
                <h3 className="text-3xl font-headline italic text-primary">Who's Coming Next</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card 
                    key={i} 
                    className="rounded-[3rem] border-none bg-white/5 backdrop-blur-3xl p-8 space-y-6 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-xl ring-1 ring-white/5 group liquid-glass" 
                    onClick={() => setSelectedArrival({ id: i, name: i === 1 ? 'Sara Khan' : i === 2 ? 'Amna Ahmed' : 'Zoya Malik', service: i === 1 ? 'Royal Bridal' : i === 2 ? 'Silk Hair Spa' : 'Skin Facial', time: `${10 + i}:30 AM`, status: 'Waiting' })}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary opacity-40">Coming at {10 + i}:30 AM</p>
                        <h4 className="font-headline text-3xl group-hover:text-rose-500 transition-colors text-primary italic">
                          {i === 1 ? 'Sara Khan' : i === 2 ? 'Amna Ahmed' : 'Zoya Malik'}
                        </h4>
                        <p className="text-xs italic text-muted-foreground">
                          {i === 1 ? 'Royal Bridal Special' : i === 2 ? 'Silk Therapy Spa' : 'Crystal Clear Facial'}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full uppercase text-[8px] font-black tracking-widest px-3 border-white/20 bg-white/10 backdrop-blur-md text-primary">Waiting</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4 max-w-xl mx-auto text-center">
             <div className="space-y-8">
                <div id="reader" className="w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl" />
                <div className="flex items-center justify-center gap-3 animate-pulse italic text-primary/60">
                   <QrCode className="h-5 w-5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Customer Ticket</span>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <Card className="rounded-[3rem] border-none bg-white/40 backdrop-blur-xl p-8 space-y-6 shadow-xl liquid-glass">
                <h3 className="font-headline text-3xl italic text-primary">Business Chats</h3>
                <div className="space-y-4">
                  {MOCK_BUSINESS_CHATS.map(chat => (
                    <button key={chat.id} className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all text-left">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-bold text-sm truncate text-primary">{chat.name}</p>
                          <span className="text-[8px] uppercase opacity-40 font-black">{chat.time}</span>
                        </div>
                        <p className="text-xs truncate text-muted-foreground italic">{chat.lastMsg}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
              <Card className="lg:col-span-2 rounded-[3rem] border-none bg-white/40 backdrop-blur-xl h-[500px] flex flex-col shadow-xl liquid-glass overflow-hidden">
                 <div className="p-6 border-b flex items-center gap-4 bg-white/20">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                       <p className="font-headline text-xl italic text-primary">GlamLux Help</p>
                       <p className="text-[8px] uppercase font-black text-rose-500 tracking-widest">Support Channel</p>
                    </div>
                 </div>
                 <ScrollArea className="flex-1 p-8">
                    <div className="space-y-4">
                       <div className="bg-primary/5 p-4 rounded-3xl rounded-tl-none max-w-[80%]">
                          <p className="text-sm italic">Hello! Your delivery driver is now assigned to pick up your makeup orders.</p>
                          <span className="text-[8px] uppercase font-black opacity-30 mt-2 block">9:00 AM</span>
                       </div>
                    </div>
                 </ScrollArea>
                 <div className="p-6 border-t bg-white/20">
                    <div className="flex gap-2">
                       <Input placeholder="Message help team..." className="rounded-full bg-white/60 border-none h-12 px-6" />
                       <Button size="icon" className="h-12 w-12 rounded-full"><Send className="h-5 w-5" /></Button>
                    </div>
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">My Products</h3>
              <Button 
                onClick={() => setIsAddProductSheetOpen(true)}
                className="rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-3xl border border-white/20 hover:bg-primary/20 transition-all duration-300 text-primary"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[3rem] transition-all duration-300 hover:bg-white/10 shadow-xl ring-1 ring-white/5 liquid-glass">
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden">
                    <Image src={p.image} alt={p.name} fill className="object-cover soft-focus transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="pt-6 space-y-1">
                    <h4 className="font-headline text-2xl group-hover:text-rose-500 transition-colors text-primary italic">{p.name}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-primary">{p.brand}</p>
                    <p className="text-xs font-bold pt-2 text-primary">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">My Services</h3>
              <Button 
                onClick={() => setIsAddServiceSheetOpen(true)}
                className="rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-3xl border border-white/20 hover:bg-primary/20 transition-all duration-300 text-primary"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Service
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="rounded-[3rem] border-none bg-white/5 backdrop-blur-3xl p-8 flex gap-6 items-center hover:bg-white/10 transition-all duration-300 shadow-xl ring-1 ring-white/5 group liquid-glass"
                >
                  <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Scissors className="h-10 w-10" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary rounded-full">{service.category}</Badge>
                      <span className="text-[10px] font-bold text-primary opacity-40 uppercase tracking-widest">Active</span>
                    </div>
                    <h4 className="font-headline text-3xl text-primary italic leading-none">{service.name}</h4>
                    <p className="font-bold text-lg text-accent-foreground">{getCurrency()} {service.discount_price.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Courier Sheet */}
      <Sheet open={isCourierSheetOpen} onOpenChange={setIsCourierSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] md:h-auto border-t-0 p-12 md:p-20 bg-primary/20 backdrop-blur-3xl text-white">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <Navigation className="h-10 w-10 text-rose-300 animate-pulse" />
              </div>
              <SheetTitle className="text-5xl md:text-6xl font-headline italic text-white tracking-tighter">Delivery Team</SheetTitle>
              <SheetDescription className="text-rose-200 italic text-lg font-body">Help us deliver beauty products across the city.</SheetDescription>
            </div>
            <div className="space-y-8">
               <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-2">Full Name</Label>
                <Input placeholder="Enter your name" className="rounded-full h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all px-8" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-2">Phone Number</Label>
                  <Input placeholder="Mobile number" className="rounded-full h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all px-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-2">Vehicle Type</Label>
                  <Input placeholder="Bike, Rickshaw, or Car" className="rounded-full h-14 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/20 focus:bg-white/10 transition-all px-8" />
                </div>
              </div>
              <Button onClick={() => setIsCourierSheetOpen(false)} className="w-full h-16 bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] border border-white/30 shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                Join Now
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Service Sheet */}
      <Sheet open={isAddServiceSheetOpen} onOpenChange={setIsAddServiceSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] md:h-auto border-t-0 p-12 md:p-20 bg-background/90 backdrop-blur-3xl text-primary">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <SheetTitle className="text-5xl md:text-6xl font-headline italic text-primary tracking-tighter">New Beauty Deal</SheetTitle>
              <SheetDescription className="text-muted-foreground italic text-lg font-body">Create a new special offer for your customers.</SheetDescription>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Service Name</Label>
                <Input placeholder="e.g. Royal Wedding Glow" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Deal Price ({getCurrency()})</Label>
                  <Input placeholder="0.00" type="number" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Original Price ({getCurrency()})</Label>
                  <Input placeholder="0.00" type="number" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
                </div>
              </div>
              <Button 
                onClick={() => {
                  toast({ title: "Service Created", description: "Your new beauty deal is now live." });
                  setIsAddServiceSheetOpen(false);
                }} 
                className="w-full h-16 bg-primary text-white hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                Create Deal
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Product Sheet */}
      <Sheet open={isAddProductSheetOpen} onOpenChange={setIsAddProductSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] md:h-auto border-t-0 p-12 md:p-20 bg-background/90 backdrop-blur-3xl text-primary">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <SheetTitle className="text-5xl md:text-6xl font-headline italic text-primary tracking-tighter">New Product Entry</SheetTitle>
              <SheetDescription className="text-muted-foreground italic text-lg font-body">Add a makeup item to your shop.</SheetDescription>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Product Name</Label>
                <Input placeholder="e.g. Silk Foundation" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Brand Name</Label>
                  <Input placeholder="Brand name" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60 ml-2">Price ({getCurrency()})</Label>
                  <Input placeholder="0.00" type="number" className="rounded-full h-14 bg-white/40 backdrop-blur-md border-primary/20 text-primary px-8" />
                </div>
              </div>
              <Button 
                onClick={() => {
                  toast({ title: "Product Added", description: "Your item is now available in the shop." });
                  setIsAddProductSheetOpen(false);
                }} 
                className="w-full h-16 bg-primary text-white hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                Add Product
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Guest Check Sheet */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] border-t-0 p-12 md:p-20 bg-white/60 backdrop-blur-3xl">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-12">
              <div className="space-y-2 text-center">
                <Badge className="bg-primary/20 backdrop-blur-md text-primary rounded-full uppercase tracking-widest text-[8px] font-black border-white/20 px-4 py-1">Customer Arrival</Badge>
                <SheetTitle className="text-6xl md:text-7xl font-headline leading-none italic text-primary">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-2xl text-primary/60">{selectedArrival.service}</SheetDescription>
              </div>
              
              <div className="p-10 bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl space-y-6 ring-1 ring-white/5 rounded-[3rem]">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Arrival Time</span>
                  <span className="font-headline text-3xl text-primary italic">{selectedArrival.time}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Ticket Code</span>
                  <span className="font-mono font-bold tracking-tighter text-xl text-primary">GL-9382-AR</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setSelectedArrival(null)} className="flex-1 h-16 bg-primary text-white hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-300 hover:scale-[1.02]">
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
