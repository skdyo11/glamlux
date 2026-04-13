
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Users, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Package, 
  Scissors, 
  MessageSquare,
  QrCode,
  Truck,
  Edit3,
  Camera
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS, DEALS } from '@/app/lib/mock-data';
import Image from 'next/image';
import { DeliveryStatus } from '@/app/types';
import { useFirestore } from '@/firebase';
import { collectionGroup, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

const MOCK_ARRIVALS = [
  { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '10:30 AM', status: 'Pending' },
  { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:00 PM', status: 'Verified' },
  { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '02:30 PM', status: 'In-Progress' },
];

const MOCK_ORDERS = [
  { id: 'ORD-101', client: 'Hina Pervez', product: 'Silk Radiance Foundation', price: 4800, status: 'Pending' as DeliveryStatus },
  { id: 'ORD-102', client: 'Mehak Ali', product: 'Velvet Matte Lip Ink', price: 2400, status: 'Picked Up' as DeliveryStatus },
  { id: 'ORD-103', client: 'Sana Javed', product: 'Gold Infused Face Oil', price: 5500, status: 'Delivered' as DeliveryStatus },
];

const MOCK_BUSINESS_MESSAGES = [
  { id: 'b1', client: 'Sara Khan', text: 'Can we add a hair trial as well?', time: 'Just now', unread: true },
  { id: 'b2', client: 'Amna Ahmed', text: 'Confirming my arrival for 12:00 PM.', time: '10 mins ago', unread: false },
  { id: 'b3', client: 'Hiba Ali', text: 'Do you have the Golden Serum in stock?', time: '1 hour ago', unread: false },
];

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  // View States
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isDealSheetOpen, setIsDealSheetOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('queue');

  // Scanner State
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (activeTab === 'scanner') {
      setIsScanning(true);
      // Wait for the DOM to be ready and the "reader" element to be mounted by TabsContent
      timer = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        if (readerElement && !scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          scanner.render(onScanSuccess, onScanFailure);
          scannerRef.current = scanner;
        }
      }, 500);
    } else {
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn("Cleanup clear failed", err));
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  async function onScanSuccess(decodedText: string) {
    if (!firestore) return;
    
    toast({ title: "Validating Code...", description: `Reference: ${decodedText}` });
    
    try {
      const bookingsQuery = query(
        collectionGroup(firestore, 'bookings'),
        where('referenceCode', '==', decodedText)
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      
      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Invalid Voucher", description: "No booking found for this code." });
        return;
      }

      const bookingDoc = querySnapshot.docs[0];
      const bookingData = bookingDoc.data();

      if (bookingData.qrVerificationStatus) {
        toast({ title: "Already Verified", description: "This voucher has already been used." });
        return;
      }

      await updateDoc(bookingDoc.ref, {
        qrVerificationStatus: true,
        verifiedAt: new Date().toISOString()
      });

      toast({ 
        title: "Access Granted", 
        description: `Verified for ${bookingData.referenceCode}. User notified.` 
      });
      setActiveTab('queue');
    } catch (error) {
      console.error("Verification error", error);
      toast({ variant: "destructive", title: "Scan Error", description: "Could not verify voucher. Check logs." });
    }
  }

  function onScanFailure(error: any) {
    // Silently handle scan failures
  }

  const handleAction = (title: string, desc: string) => {
    toast({ title, description: desc });
    setIsProductSheetOpen(false);
    setIsDealSheetOpen(false);
    setSelectedOrder(null);
    setEditingItem(null);
  };

  const updateOrderStatus = (newStatus: DeliveryStatus) => {
    if (selectedOrder) {
      handleAction('Status Updated', `Order ${selectedOrder.id} is now ${newStatus}.`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 md:pb-12">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 md:py-12">
        <header className="flex flex-col gap-6 mb-12">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Business Studio</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline text-primary tracking-tighter">Management</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Card className="bg-primary p-6 rounded-[2rem] border-none shadow-lg shadow-primary/20 text-white">
               <Users className="h-6 w-6 mb-3 opacity-60" />
               <p className="text-3xl font-bold font-headline">08</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Check-ins</p>
             </Card>
             <Card className="bg-card p-6 rounded-[2rem] border-none shadow-xl text-foreground">
               <TrendingUp className="h-6 w-6 mb-3 opacity-60 text-secondary" />
               <p className="text-3xl font-bold font-headline">82.4K</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Today's Revenue</p>
             </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-muted/40 backdrop-blur-md p-1 h-16 border border-border/60 rounded-2xl w-full flex overflow-x-auto">
            <TabsTrigger value="queue" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Queue
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest flex gap-2">
              <Camera className="h-3 w-3" /> Scan
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Chats
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Shop
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Deals
            </TabsTrigger>
          </TabsList>

          {/* SCANNER TAB */}
          <TabsContent value="scanner" className="space-y-4">
             <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-black/5">
                <CardHeader>
                  <CardTitle className="font-headline text-3xl">Owner Check-in Scanner</CardTitle>
                  <CardDescription>Position the client's QR code within the frame to verify entry.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                   <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border-4 border-primary/20 bg-white min-h-[250px]" />
                   <div className="mt-8 flex items-center gap-2 text-primary font-bold animate-pulse">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs uppercase tracking-widest">Searching for Voucher...</span>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          {/* QUEUE TAB */}
          <TabsContent value="queue" className="space-y-4">
            <div className="space-y-4">
              {MOCK_ARRIVALS.map((arrival) => (
                <Card 
                  key={arrival.id} 
                  onClick={() => setSelectedArrival(arrival)}
                  className="p-6 rounded-[2.5rem] border-none shadow-lg bg-card/60 backdrop-blur-md space-y-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                        <Clock className="h-3 w-3" /> {arrival.time}
                      </div>
                      <h4 className="font-headline text-2xl leading-none text-foreground">{arrival.name}</h4>
                      <p className="text-xs text-muted-foreground italic">{arrival.service}</p>
                    </div>
                    <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className={arrival.status === 'Verified' ? 'bg-primary text-white border-none' : 'border-primary/20 text-primary'}>
                      {arrival.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4">
            <div className="space-y-4">
              {MOCK_ORDERS.map((order) => (
                <Card 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="p-6 rounded-[2.5rem] border-none shadow-lg bg-card/60 backdrop-blur-md space-y-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                        <Package className="h-3 w-3" /> {order.id}
                      </div>
                      <h4 className="font-headline text-2xl leading-none text-foreground">{order.client}</h4>
                      <p className="text-xs text-muted-foreground italic">{order.product}</p>
                    </div>
                    <Badge className={cn(
                      "border-none px-3 py-1",
                      order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' : 
                      order.status === 'Picked Up' ? 'bg-blue-500/10 text-blue-600' : 
                      'bg-orange-500/10 text-orange-600'
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages" className="space-y-4">
            <div className="space-y-4">
              {MOCK_BUSINESS_MESSAGES.map((msg) => (
                <Card 
                  key={msg.id} 
                  className="p-6 rounded-[2.5rem] border-none shadow-lg bg-card/60 backdrop-blur-md flex items-center gap-4 group hover:shadow-xl transition-all cursor-pointer"
                >
                  <Avatar className="h-14 w-14 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-headline text-xl">{msg.client[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-headline text-2xl leading-none">{msg.client}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{msg.time}</span>
                    </div>
                    <p className={cn("text-xs truncate", msg.unread ? "font-bold text-primary" : "text-muted-foreground")}>
                      {msg.text}
                    </p>
                  </div>
                  <div className="text-primary group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-headline text-3xl italic">Shop Inventory</h3>
              <Button onClick={() => setIsProductSheetOpen(true)} size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {PRODUCTS.map((product) => (
                <Card key={product.id} className="p-4 rounded-[2rem] border-none shadow-md bg-card/40 backdrop-blur-sm flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-headline text-xl truncate leading-tight">{product.name}</h4>
                    <p className="text-[10px] font-bold text-primary uppercase">{product.brand}</p>
                    <p className="text-xs font-bold mt-1">Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => { setEditingItem(product); setIsProductSheetOpen(true); }}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SERVICES TAB */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-headline text-3xl italic">Live Deals</h3>
              <Button onClick={() => setIsDealSheetOpen(true)} size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1" /> New Transformation
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {DEALS.map((deal) => (
                <Card key={deal.id} className="p-6 rounded-[2.5rem] border-none shadow-md bg-card/40 backdrop-blur-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge className="bg-secondary/20 text-secondary-foreground border-none text-[8px] uppercase font-black">{deal.category}</Badge>
                      <h4 className="font-headline text-2xl leading-none pt-1">{deal.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-primary/20" onClick={() => { setEditingItem(deal); setIsDealSheetOpen(true); }}>
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- INTERACTIVE SHEETS --- */}

      {/* Order Status Management Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem]">
          {selectedOrder && (
            <div className="max-w-xl mx-auto space-y-8 py-4">
              <SheetHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 bg-primary/10 px-3 py-1 rounded-full">
                  <Truck className="h-4 w-4" /> Logistics Manager
                </div>
                <SheetTitle className="text-5xl font-headline leading-none">{selectedOrder.client}</SheetTitle>
                <SheetDescription className="italic text-lg">Managing delivery for {selectedOrder.product}</SheetDescription>
              </SheetHeader>
              
              <div className="bg-primary/5 p-8 rounded-[2rem] space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Order Ref</span>
                  <span className="font-mono font-bold text-primary text-xl">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Current Status</span>
                  <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px]">{selectedOrder.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pb-8">
                <Button onClick={() => updateOrderStatus('Pending')} variant="outline" className={cn("h-14 font-bold rounded-xl", selectedOrder.status === 'Pending' && "bg-primary/10 border-primary")}>
                  Mark as Pending
                </Button>
                <Button onClick={() => updateOrderStatus('Picked Up')} variant="outline" className={cn("h-14 font-bold rounded-xl", selectedOrder.status === 'Picked Up' && "bg-primary/10 border-primary")}>
                  Mark as Picked Up
                </Button>
                <Button onClick={() => updateOrderStatus('Delivered')} className="h-16 bg-primary text-white font-bold rounded-[1.5rem] shadow-2xl shadow-primary/30 text-lg">
                  Confirm Delivery
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Add/Edit Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={(open) => { if(!open) setEditingItem(null); setIsProductSheetOpen(open); }}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[90vh] md:h-auto overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <SheetHeader>
              <SheetTitle className="text-4xl font-headline italic">{editingItem ? 'Edit Product' : 'Add New Product'}</SheetTitle>
              <SheetDescription>List a luxury item in your boutique shop.</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Product Name</Label>
                  <Input defaultValue={editingItem?.name} placeholder="e.g. Silk Radiance Foundation" className="rounded-2xl h-14 bg-primary/5 border-primary/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Price (PKR)</Label>
                    <Input defaultValue={editingItem?.price} type="number" placeholder="4800" className="rounded-2xl h-14 bg-primary/5 border-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Initial Stock</Label>
                    <Input defaultValue={editingItem?.stock} type="number" placeholder="25" className="rounded-2xl h-14 bg-primary/5 border-primary/10" />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleAction('Inventory Updated', 'The product list has been refreshed.')} className="w-full h-16 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 text-lg">
                {editingItem ? 'Update Collection' : 'Add to Collection'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Deal Add/Edit Sheet */}
      <Sheet open={isDealSheetOpen} onOpenChange={(open) => { if(!open) setEditingItem(null); setIsDealSheetOpen(open); }}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[90vh] md:h-auto overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <SheetHeader>
              <SheetTitle className="text-4xl font-headline italic">{editingItem ? 'Edit Transformation' : 'New Parlour Deal'}</SheetTitle>
              <SheetDescription>Create an exclusive limited-time service offer.</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Deal Name</Label>
                <Input defaultValue={editingItem?.name} placeholder="e.g. Royal Bridal Glow Up" className="rounded-2xl h-14 bg-secondary/10 border-secondary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Standard Price</Label>
                  <Input defaultValue={editingItem?.price} type="number" placeholder="45000" className="rounded-2xl h-14 bg-secondary/10 border-secondary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Discounted Price</Label>
                  <Input defaultValue={editingItem?.discounted_price} type="number" placeholder="32000" className="rounded-2xl h-14 bg-secondary/10 border-secondary/20" />
                </div>
              </div>
              <Button onClick={() => handleAction('Service Published', 'Your transformation is now live on the marketplace.')} className="w-full h-16 bg-secondary text-secondary-foreground font-bold rounded-2xl shadow-xl shadow-secondary/10 text-lg">
                {editingItem ? 'Update Live Deal' : 'Publish to Marketplace'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Guest Entry Drawer */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem]">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-8 py-4">
              <SheetHeader>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 bg-primary/10 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" /> Guest Check-In
                </div>
                <SheetTitle className="text-5xl font-headline leading-none">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-lg">{selectedArrival.service}</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-1 gap-4 pb-8">
                <Button onClick={() => handleAction('Guest Verified', `${selectedArrival.name} has been checked in.`)} className="h-16 bg-primary text-white font-bold rounded-[1.5rem] shadow-2xl shadow-primary/30 text-lg">
                  Verify & Grant Entry
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost" className="h-14 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                    Dismiss
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
