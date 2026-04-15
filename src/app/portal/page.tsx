
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
  CheckCircle2,
  Search,
  X
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS, DEALS } from '@/app/lib/mock-data';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Conversation, ChatMessage } from '@/app/types';

const WEEKLY_PLAN = [
  { day: 'Mon', slots: 12, demand: 'Medium' },
  { day: 'Tue', slots: 12, demand: 'Medium' },
  { day: 'Wed', slots: 12, demand: 'Medium' },
  { day: 'Thu', slots: 24, demand: 'High' },
  { day: 'Fri', slots: 24, demand: 'High' },
  { day: 'Sat', slots: 12, demand: 'High' },
  { day: 'Sun', slots: 0, demand: 'Closed' },
];

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
  },
  {
    id: 'bc2',
    participantId: 'brands',
    participantName: 'Beauty Brands Supply',
    participantImage: 'https://picsum.photos/seed/luxury-foundation-bottle/100/100',
    lastMessage: 'New stock of foundations arriving Friday.',
    lastTimestamp: 'Yesterday',
    unreadCount: 2,
    messages: [
      { id: 'm4', senderId: 'brands', text: 'New stock of foundations arriving Friday.', timestamp: 'Yesterday', isMe: false },
    ]
  }
];

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { getCurrency } = useStore();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMounted, setIsMounted] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [arrivals, setArrivals] = useState([
    { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '11:30 AM', status: 'Waiting' },
    { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:30 PM', status: 'Waiting' },
    { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '01:30 PM', status: 'Waiting' },
    { id: '4', name: 'Hiba Ali', service: 'Signature Manicure', time: '04:00 PM', status: 'Waiting' },
  ]);

  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [activeSheet, setActiveSheet] = useState<'delivery' | 'service' | 'product' | null>(null);

  const [businessConversations, setBusinessConversations] = useState<Conversation[]>(MOCK_BUSINESS_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_BUSINESS_CHATS[0].id);
  const [chatSearch, setChatSearch] = useState('');
  const [newMsg, setNewMsg] = useState('');

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

  const filteredChats = useMemo(() => {
    if (!chatSearch.trim()) return businessConversations;
    return businessConversations.filter(c => 
      c.participantName.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(chatSearch.toLowerCase())
    );
  }, [businessConversations, chatSearch]);

  const activeChat = businessConversations.find(c => c.id === activeChatId) || null;

  const handleSendBusinessMsg = () => {
    if (!newMsg.trim() || !activeChatId) return;
    
    const msg: ChatMessage = {
      id: Math.random().toString(),
      senderId: 'me',
      text: newMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setBusinessConversations(prev => prev.map(c => 
      c.id === activeChatId 
        ? { ...c, messages: [...c.messages, msg], lastMessage: newMsg, lastTimestamp: 'Just now' } 
        : c
    ));
    setNewMsg('');
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

  const handleSheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Processing", description: "Submission successful." });
    setActiveSheet(null);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-4 md:py-12">
        <header className="flex flex-col gap-3 mb-8 pt-4 md:pt-20">
          <div className="space-y-0.5">
            <Badge className="bg-primary/10 text-primary rounded-full px-2 py-0.5 uppercase tracking-widest text-[7px] font-black">Owner Area</Badge>
            <h1 className="text-3xl md:text-7xl font-headline tracking-tighter italic text-primary leading-none">My Shop</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
             <Card className="rounded-[1rem] border-none bg-primary p-2 md:p-3 space-y-0.5 shadow-sm text-primary-foreground">
               <TrendingUp className="h-2 w-2 opacity-60" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter leading-none">82.4K</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-60">Revenue Today ({getCurrency()})</p>
             </Card>
             <Card className="rounded-[1rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 shadow-sm">
               <Users className="h-2 w-2 opacity-40 text-primary" />
               <p className="text-lg md:text-2xl font-headline italic tracking-tighter text-primary leading-none">14</p>
               <p className="text-[7px] uppercase font-black tracking-widest opacity-40 text-primary">Active Staff</p>
             </Card>
             <Card 
                className="rounded-[1rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-2 md:p-3 space-y-0.5 cursor-pointer hover:bg-primary/10 transition-all shadow-sm group"
                onClick={() => setActiveSheet('delivery')}
             >
                <Navigation className="h-2 w-2 opacity-60 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <p className="text-[7px] uppercase font-black tracking-widest text-primary">Delivery Services</p>
                <p className="text-[8px] italic opacity-80 text-primary/70 leading-none">Join logistics team</p>
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
                <h3 className="text-3xl font-headline italic text-primary">Weekly Availability</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 snap-x">
                {WEEKLY_PLAN.map((item) => (
                  <Card key={item.day} className="min-w-[140px] p-6 rounded-[2rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm flex flex-col items-center gap-1 shadow-sm hover:bg-primary/10 transition-all snap-start">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{item.day}</span>
                    <span className="font-headline text-2xl italic text-primary">{item.slots > 0 ? `${item.slots} Slots` : 'Closed'}</span>
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
                <h3 className="text-3xl font-headline italic text-primary">Arrival Queue</h3>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x">
                {arrivals.map((a) => (
                  <Card 
                    key={a.id} 
                    className="min-w-[280px] md:min-w-[350px] rounded-[2.5rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-6 space-y-4 hover:bg-primary/10 transition-all cursor-pointer shadow-sm ring-1 ring-white/5 snap-start" 
                    onClick={() => setSelectedArrival(a)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary opacity-40">{a.time}</p>
                        <h4 className="font-headline text-2xl text-primary italic leading-none">{a.name}</h4>
                        <p className="text-xs italic text-muted-foreground">{a.service}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "rounded-full text-[10px] font-black tracking-widest px-4 h-9 flex items-center border-white/20",
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
            <div id="reader" className="w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 bg-white/5 backdrop-blur-sm shadow-md" />
            <div className="flex items-center justify-center gap-3 italic text-primary/60">
              <QrCode className="h-5 w-5" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Customer Ticket</span>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-300">
            <Card className="rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-8 space-y-6 shadow-sm flex flex-col h-[600px]">
              <div className="space-y-4">
                <h3 className="font-headline text-3xl italic text-primary">Inquiries</h3>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                  <Input 
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search messages..." 
                    className="pl-10 h-10 rounded-full bg-white/40 dark:bg-white/5 border-none text-xs italic" 
                  />
                  {chatSearch && <X className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/30 cursor-pointer" onClick={() => setChatSearch('')} />}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredChats.map(chat => (
                    <button 
                      key={chat.id} 
                      onClick={() => setActiveChatId(chat.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left",
                        activeChatId === chat.id ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/5"
                      )}
                    >
                      <Avatar className="h-12 w-12 border-2 border-white/20">
                        <AvatarImage src={chat.participantImage} />
                        <AvatarFallback>{chat.participantName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className={cn("font-bold text-sm truncate", activeChatId === chat.id ? "text-primary-foreground" : "text-primary")}>{chat.participantName}</p>
                        <p className={cn("text-[10px] truncate italic", activeChatId === chat.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{chat.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="lg:col-span-2 rounded-[3rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm h-[600px] flex flex-col shadow-md overflow-hidden relative">
               {activeChat ? (
                 <>
                   <div className="p-6 border-b flex items-center gap-4 bg-white/20 dark:bg-white/5">
                      <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarImage src={activeChat.participantImage} />
                        <AvatarFallback>{activeChat.participantName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                         <p className="font-headline text-xl italic text-primary leading-none">{activeChat.participantName}</p>
                         <p className="text-[8px] uppercase font-black text-rose-500 tracking-widest mt-1">Direct Business Channel</p>
                      </div>
                   </div>
                   <ScrollArea className="flex-1 p-8">
                      <div className="space-y-6">
                        {activeChat.messages.map((msg) => (
                          <div key={msg.id} className={cn("flex flex-col max-w-[85%] space-y-1", msg.isMe ? "ml-auto items-end" : "items-start")}>
                            <div className={cn(
                              "p-4 rounded-3xl text-sm italic shadow-sm",
                              msg.isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/60 dark:bg-white/10 text-foreground rounded-tl-none"
                            )}>
                              {msg.text}
                            </div>
                            <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{msg.timestamp}</span>
                          </div>
                        ))}
                      </div>
                   </ScrollArea>
                   <div className="p-6 border-t bg-white/20 dark:bg-white/5 flex gap-2">
                      <Input 
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendBusinessMsg()}
                        placeholder="Message partner team..." 
                        className="rounded-full bg-white/60 dark:bg-white/10 border-none h-12 px-6" 
                      />
                      <Button onClick={handleSendBusinessMsg} size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-all">
                        <Send className="h-5 w-5" />
                      </Button>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center"><Search className="h-8 w-8 text-primary/20" /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">Select a conversation to start chatting</p>
                 </div>
               )}
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Inventory</h3>
              <Button onClick={() => setActiveSheet('product')} className="rounded-full h-11 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-sm border border-white/20 hover:bg-primary/20 text-primary transition-all">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="group relative bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-4 rounded-[2.5rem] transition-all hover:bg-primary/10 shadow-sm">
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden">
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="pt-4 space-y-1 text-center">
                    <h4 className="font-headline text-xl text-primary italic leading-none">{p.name}</h4>
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-primary">{p.brand}</p>
                    <p className="text-[10px] font-bold pt-1 text-primary">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-headline tracking-tighter italic text-primary">Offered Deals</h3>
              <Button onClick={() => setActiveSheet('service')} className="rounded-full h-11 px-8 font-bold text-[10px] uppercase tracking-widest bg-primary/10 backdrop-blur-sm border border-white/20 hover:bg-primary/20 text-primary transition-all">
                <Plus className="h-4 w-4 mr-2" /> New Deal
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myServices.map((service) => (
                <Card key={service.id} className="rounded-[2.5rem] border-none bg-primary/5 dark:bg-white/5 backdrop-blur-sm p-6 flex gap-6 items-center hover:bg-primary/10 transition-all shadow-sm group">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform"><Scissors className="h-8 w-8" /></div>
                  <div className="flex-grow space-y-1">
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary rounded-full">{service.category}</Badge>
                    <h4 className="font-headline text-2xl text-primary italic leading-none">{service.name}</h4>
                    <p className="font-bold text-lg text-accent-foreground">{getCurrency()} {service.discount_price.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full"><ArrowRight className="h-5 w-5" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={!!activeSheet} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] bg-background/95 backdrop-blur-sm border-none p-0">
          <ScrollArea className="h-full w-full">
            <div className="max-w-xl mx-auto space-y-6 py-6 px-6">
              <SheetHeader className="text-center">
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeSheet === 'delivery' ? <Navigation className="h-8 w-8 text-primary" /> : activeSheet === 'product' ? <Package className="h-8 w-8 text-primary" /> : <Scissors className="h-8 w-8 text-primary" />}
                </div>
                <SheetTitle className="text-4xl font-headline italic text-primary tracking-tighter leading-none">
                  {activeSheet === 'delivery' ? 'Join Team' : activeSheet === 'product' ? 'New Item' : 'New Deal'}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground italic text-sm font-body">Fill out all required details below.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSheetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold tracking-widest text-primary/60 ml-2">
                    {activeSheet === 'delivery' ? 'Name' : 'Name / Title'}
                  </Label>
                  <Input required placeholder={activeSheet === 'delivery' ? "Your full name" : "Enter name..."} className="rounded-full h-12 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-primary/60 ml-2">
                      {activeSheet === 'delivery' ? 'Phone Number' : 'Detail'}
                    </Label>
                    <Input required placeholder={activeSheet === 'delivery' ? "+92 / +91 number" : "Enter info..."} className="rounded-full h-12 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-6" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-primary/60 ml-2">
                      {activeSheet === 'delivery' ? 'Vehicle Type' : 'Value'}
                    </Label>
                    <Input required placeholder={activeSheet === 'delivery' ? "Car / Bike / Van" : "Enter value..."} className="rounded-full h-12 bg-white/40 dark:bg-white/5 border-primary/20 text-primary px-6" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-sm transition-all">
                  Submit Details
                </Button>
              </form>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] bg-white/80 dark:bg-black/80 backdrop-blur-sm border-none max-h-[90vh] overflow-hidden flex flex-col p-0">
          <ScrollArea className="h-full w-full">
            {selectedArrival && (
              <div className="max-w-xl mx-auto space-y-2 py-4 px-6">
                <div className="space-y-0.5 text-center">
                  <Badge className="bg-primary/10 text-primary rounded-full uppercase tracking-widest text-[8px] font-black px-4 py-1 w-fit mx-auto mb-1">Customer Arrival</Badge>
                  <SheetTitle className="text-3xl font-headline italic text-primary leading-none">{selectedArrival.name}</SheetTitle>
                  <SheetDescription className="italic text-sm text-primary/60 leading-tight">{selectedArrival.service}</SheetDescription>
                </div>
                <div className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm rounded-[2rem] space-y-1 text-center md:text-left">
                  <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Time</span><span className="font-headline text-xl text-primary italic">{selectedArrival.time}</span></div>
                  <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Code</span><span className="font-mono font-bold text-xs text-primary">GL-9382-AR</span></div>
                  <div className="flex justify-between items-baseline pt-1 border-t"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">Status</span><Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px] font-black tracking-widest px-3">{selectedArrival.status}</Badge></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-2">
                  <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-12 md:h-16 bg-green-600 text-white hover:bg-green-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm">Verify</Button>
                  <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-12 md:h-16 bg-amber-600 text-white hover:bg-amber-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm">In-Progress</Button>
                  <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Completed')} className="h-12 md:h-16 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm">Complete</Button>
                </div>

                <SheetClose asChild>
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest opacity-40 h-8">Dismiss</Button>
                </SheetClose>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
