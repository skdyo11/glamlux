
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShieldCheck, Truck, Camera, Sparkles, X, Info, Banknote, Plus, Minus, Users, ArrowRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getMatchingProducts } from '@/ai/flows/matching-products-from-image';
import { PRODUCTS } from '@/app/lib/mock-data';

export default function CartPage() {
  const { cart, region, removeFromCart, updateQuantity, getCurrency, clearCart, addToCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const { user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{description: string, productIds: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch latest active order for persistent tracking
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'localUsers', user.uid, 'bookings'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [firestore, user?.uid]);

  const { data: latestBookings } = useCollection(bookingsQuery);
  const latestOrder = latestBookings?.[0];
  const showTracker = latestOrder && latestOrder.deliveryStatus !== 'Delivered';

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const commission = subtotal * 0.15; 
  const totalDueNow = subtotal;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setInspirationImage(base64String);
        analyzeInspiration(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeInspiration = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await getMatchingProducts({ photoDataUri: imageUri });
      setAiSuggestions({
        description: result.bundleDescription,
        productIds: result.recommendedProductIds
      });
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    if (!userName.trim() || !phoneNumber.trim()) {
      toast({ variant: "destructive", title: "Identity Required", description: "Name and phone are required for the artisan to identify you." });
      return;
    }

    setIsCheckingOut(true);

    try {
      let currentUser = user;
      if (!currentUser && auth) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      if (!currentUser || !firestore) throw new Error("Services not ready");

      const userRef = doc(firestore, 'localUsers', currentUser.uid);
      setDocumentNonBlocking(userRef, {
        id: currentUser.uid,
        name: userName,
        phoneNumber: phoneNumber,
        lastActiveAt: new Date().toISOString()
      }, { merge: true });

      const refCode = Math.random().toString(36).substring(7).toUpperCase();
      const bookingsCol = collection(firestore, 'localUsers', currentUser.uid, 'bookings');
      const newBookingRef = doc(bookingsCol);
      
      const bookingData = {
        id: newBookingRef.id,
        localUserId: currentUser.uid,
        user_phone: phoneNumber,
        referenceCode: refCode,
        total_price: totalDueNow,
        platform_commission: commission,
        currency: getCurrency(),
        qr_verified: false,
        deliveryStatus: 'Pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'Paid',
        cartItems: cart,
        inspirationImageUrl: inspirationImage,
        group_size: cart.find(i => i.type === 'deal')?.quantity || 1,
        vendor_id: cart[0]?.vendor_id || 'v1'
      };

      setDocumentNonBlocking(newBookingRef, bookingData, { merge: false });
      
      clearCart();
      router.push(`/booking/${newBookingRef.id}?uid=${currentUser.uid}`);
    } catch (error) {
      console.error("Checkout failed", error);
      setIsCheckingOut(false);
      toast({ variant: "destructive", title: "Transaction Error", description: "Could not process your secure booking." });
    }
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-12 max-w-md px-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-headline italic text-primary tracking-tighter">Your collection is empty</h1>
              <p className="text-muted-foreground text-sm italic">Discover elite transformations and professional artistry products today.</p>
            </div>
            
            {showTracker ? (
              <Card className="rounded-[3rem] border-none bg-primary text-primary-foreground p-10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest">
                  <Truck className="h-5 w-5" /> Current Order: {latestOrder.referenceCode}
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-1000"
                      style={{ width: latestOrder.deliveryStatus === 'Pending' ? '25%' : latestOrder.deliveryStatus === 'Picked Up' ? '75%' : '100%' }}
                    />
                  </div>
                  <p className="text-[8px] uppercase font-black tracking-widest opacity-60">Status: {latestOrder.deliveryStatus}</p>
                </div>
                <Button asChild className="w-full rounded-full h-12 font-bold text-[10px] uppercase tracking-widest bg-accent text-accent-foreground shadow-lg">
                  <Link href={`/booking/${latestOrder.id}?uid=${user?.uid}`}>View Full Tracker</Link>
                </Button>
              </Card>
            ) : (
              <div className="p-10 rounded-[3rem] bg-primary/5 dark:bg-white/5 border border-primary/10 space-y-6">
                <div className="flex items-center justify-center gap-3 text-primary font-black uppercase text-[10px] tracking-widest">
                  <Truck className="h-5 w-5" /> Track Active Orders
                </div>
                <p className="text-xs italic opacity-60">Already made a purchase? Check your delivery updates here.</p>
                <Button asChild className="w-full rounded-full h-12 font-bold text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg">
                  <Link href="/messages">View Order History</Link>
                </Button>
              </div>
            )}

            <Button asChild variant="ghost" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest text-primary">
              <Link href="/">Return to Discovery</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        {/* Persistent Tracker Banner */}
        {showTracker && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="rounded-[2.5rem] border-none bg-primary/5 dark:bg-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ring-1 ring-primary/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl italic text-primary">Recent Order: {latestOrder.referenceCode}</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Shipment Status: {latestOrder.deliveryStatus}</p>
                </div>
              </div>
              
              <div className="flex-grow max-w-md w-full px-4 hidden md:block">
                  <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                     <div 
                       className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                       style={{ width: latestOrder.deliveryStatus === 'Pending' ? '25%' : latestOrder.deliveryStatus === 'Picked Up' ? '75%' : '100%' }}
                     />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-30">
                    <span>Placed</span>
                    <span>Shipped</span>
                    <span>Arriving</span>
                  </div>
              </div>

              <Button asChild variant="outline" className="rounded-full border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest h-10 px-6">
                <Link href={`/booking/${latestOrder.id}?uid=${user?.uid}`}>Track Order</Link>
              </Button>
            </Card>
          </div>
        )}

        <header className="mb-16 space-y-2">
          <Badge className="bg-primary/5 text-primary rounded-full px-3 py-1 uppercase tracking-widest text-[8px] font-black border-none">Checkout Stage</Badge>
          <h1 className="text-6xl font-headline tracking-tighter italic text-primary">Elite Checkout</h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            <section className="space-y-6">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/40">1. Local Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase ml-2 text-primary">Full Name</Label>
                  <Input 
                    placeholder="Artisan reference name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="rounded-full border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors px-6 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase ml-2 text-primary">Phone Number</Label>
                  <Input 
                    placeholder="+92 / +91 number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-full border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors px-6 h-12"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/40">2. Inspiration Reference</h2>
              {!inspirationImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/10 rounded-[3rem] p-16 text-center cursor-pointer hover:bg-primary/5 transition-all bg-white/40 backdrop-blur-xl"
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <Camera className="h-8 w-8 mx-auto mb-4 text-primary opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Look Inspiration</span>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="relative aspect-video bg-muted group overflow-hidden rounded-[3rem] shadow-xl">
                    <Image src={inspirationImage} alt="Reference" fill className="object-cover" />
                    <Button 
                      variant="destructive" size="icon" 
                      className="absolute top-6 right-6 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setInspirationImage(null); setAiSuggestions(null); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-3 italic text-primary/60">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      <span>Curating suggested bundle...</span>
                    </div>
                  )}
                  {aiSuggestions && (
                    <Card className="rounded-[3rem] border-none bg-primary/5 p-8 space-y-6 shadow-xl">
                      <h4 className="font-headline text-2xl text-primary italic">Suggested Artisan Bundle</h4>
                      <p className="text-sm italic text-muted-foreground">{aiSuggestions.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {aiSuggestions.productIds.map(pid => {
                          const p = PRODUCTS.find(prod => prod.id === pid);
                          if (!p) return null;
                          return (
                            <div key={pid} className="space-y-2">
                              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-md">
                                <Image src={p.image} alt={p.name} fill className="object-cover soft-focus" />
                              </div>
                              <Button variant="outline" size="sm" className="w-full text-[8px] h-8 rounded-full uppercase font-bold border-primary/10" onClick={() => addToCart({ id: p.id, type: 'product', name: p.name, price: p.price, quantity: 1, image: p.image })}>
                                Add Item
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/40">3. Your Selection</h2>
              <div className="space-y-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 md:items-center border-b border-primary/5 pb-8">
                    <div className="relative w-24 h-24 bg-muted rounded-[2rem] overflow-hidden shadow-sm flex-shrink-0">
                      <Image src={item.image || ''} alt={item.name} fill className="object-cover soft-focus" />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[8px] uppercase font-black text-primary/30 tracking-[0.2em]">
                          {item.type === 'deal' ? 'Artisan Transformation' : 'Boutique Product'}
                        </p>
                        {item.type === 'product' && (
                          <Badge variant="outline" className="text-[7px] h-3.5 px-2 bg-accent/10 border-none text-primary rounded-full flex gap-1 items-center">
                            <Truck className="h-2 w-2" /> Standard Delivery (2-4 Days)
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-headline text-3xl text-primary italic leading-none">{item.name}</h3>
                      <p className="font-bold text-lg">{getCurrency()} {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-primary/10 rounded-full p-1 bg-white/40">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 hover:bg-transparent text-primary"><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center text-xs font-bold text-primary">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 hover:bg-transparent text-primary"><Plus className="h-3 w-3" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <Card className="border-none rounded-[3.5rem] bg-primary text-primary-foreground p-12 space-y-8 shadow-2xl">
              <CardTitle className="font-headline text-4xl italic">Financials</CardTitle>
              <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                <div className="flex justify-between items-center">
                  <span>Checkout Subtotal</span>
                  <span className="text-primary-foreground">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Fee</span>
                  <span className="text-primary-foreground">{getCurrency()} {commission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-accent">
                  <span className="flex items-center gap-2"><Package className="h-3 w-3" /> Delivery</span>
                  <span>FREE</span>
                </div>
                <Separator className="bg-primary-foreground/10" />
                <div className="flex justify-between items-center text-2xl text-primary-foreground font-headline italic pt-2">
                  <span>Total Due</span>
                  <span className="text-accent">{getCurrency()} {totalDueNow.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full h-16 bg-accent text-accent-foreground hover:bg-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] border-none shadow-xl transition-all"
              >
                {isCheckingOut ? 'Securing Transaction...' : 'Complete Payment'}
              </Button>
            </Card>

            <div className="p-8 bg-primary/5 dark:bg-white/5 space-y-4 rounded-[3rem] border border-primary/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> Artisan Security Active
              </div>
              <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                Your payment is held in escrow until verification. Service deposits and product costs are platform-secured.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
