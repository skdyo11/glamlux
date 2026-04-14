'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShieldCheck, ShoppingBag, Plus, Minus, Users, Camera, Sparkles, X, Info, Banknote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
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
          <div className="text-center space-y-6 max-w-sm px-4">
            <h1 className="text-4xl font-headline italic text-primary">Your collection is empty</h1>
            <p className="text-muted-foreground text-sm italic">Discover elite transformations and professional artistry products today.</p>
            <Button asChild className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest">
              <Link href="/">Back to Discovery</Link>
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
        <h1 className="text-5xl font-headline tracking-tighter mb-16 italic text-primary">Elite Checkout</h1>
        
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
                  className="border-2 border-dashed border-primary/20 rounded-[3rem] p-16 text-center cursor-pointer hover:bg-primary/5 transition-colors bg-white/40 backdrop-blur-md"
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
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 italic text-primary/60">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      <span>Curating suggested bundle based on look...</span>
                    </div>
                  ) : aiSuggestions && (
                    <Card className="rounded-[3rem] border-none bg-accent/20 p-8 space-y-6 shadow-lg">
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
                              <Button variant="outline" size="sm" className="w-full text-[8px] h-8 rounded-full uppercase font-bold" onClick={() => addToCart({ id: p.id, type: 'product', name: p.name, price: p.price, quantity: 1, image: p.image })}>
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
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center border-b border-primary/10 pb-6">
                    <div className="relative w-24 h-24 bg-muted rounded-[1.5rem] overflow-hidden shadow-sm">
                      <Image src={item.image || ''} alt={item.name} fill className="object-cover soft-focus" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[8px] uppercase font-black text-primary/40 tracking-[0.2em]">
                          {item.type === 'deal' ? 'Artisan Transformation' : 'Boutique Product'}
                        </p>
                        {item.type === 'deal' && item.quantity > 1 && (
                          <Badge variant="outline" className="text-[8px] h-4 py-0 flex gap-1 items-center border-rose-500/30 text-rose-500 rounded-full">
                             <Users className="h-2.5 w-2.5" /> Group of {item.quantity}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-headline text-2xl text-primary italic leading-none">{item.name}</h3>
                      <p className="font-bold text-accent-foreground">{getCurrency()} {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-primary/10 rounded-full p-1 bg-white/20">
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
            <Card className="border-none rounded-[3rem] bg-primary text-white p-10 space-y-8 shadow-2xl">
              <CardTitle className="font-headline text-3xl italic">Financials</CardTitle>
              <div className="space-y-4 text-xs font-bold uppercase tracking-widest text-white/60">
                <div className="flex justify-between items-center">
                  <span>Checkout Subtotal</span>
                  <span className="text-white">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group cursor-help relative">
                  <span className="flex items-center gap-1">Platform Commission <Info className="h-3 w-3" /></span>
                  <span className="text-white">{getCurrency()} {commission.toLocaleString()}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center text-xl text-white font-headline italic">
                  <span>Total Due Now</span>
                  <span className="text-accent">{getCurrency()} {totalDueNow.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full h-14 bg-accent text-primary hover:bg-white rounded-full font-bold uppercase tracking-[0.2em] text-[10px] border-none shadow-lg"
              >
                {isCheckingOut ? 'Securing Transaction...' : 'Complete Payment'}
              </Button>
            </Card>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Secure Gateways</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="rounded-[2rem] h-20 flex-col gap-2 font-bold text-[8px] uppercase tracking-widest opacity-60 hover:opacity-100 border-primary/20 bg-white/40" onClick={handleCheckout} disabled={isCheckingOut}>
                  {region === 'PK' ? 'JazzCash' : 'Paytm / UPI'}
                </Button>
                <Button variant="outline" className="rounded-[2rem] h-20 flex-col gap-2 font-bold text-[8px] uppercase tracking-widest opacity-60 hover:opacity-100 border-primary/20 bg-white/40" onClick={handleCheckout} disabled={isCheckingOut}>
                  <Banknote className="h-5 w-5 text-primary" /> Cash on Delivery
                </Button>
              </div>
            </div>

            <div className="p-8 bg-muted/20 space-y-3 rounded-[3rem] border border-primary/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                <ShieldCheck className="h-4 w-4" /> 24-Hour Artisan Guard Enabled
              </div>
              <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                Cancellations within 24 hours of scheduled slots are subject to artisan approval. Deposits are platform-secured.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
