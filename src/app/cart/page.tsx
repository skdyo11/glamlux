'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Camera, Sparkles, X, Plus, Minus, MapPin, Package, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { getMatchingProducts } from '@/ai/flows/matching-products-from-image';
import { PRODUCTS } from '@/app/lib/mock-data';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCurrency, clearCart, addToCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const { user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{description: string, productIds: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
    
    if (!userName.trim()) {
      toast({ variant: "destructive", title: "Identity Required", description: "A name is required for registry tracking." });
      return;
    }

    const hasProducts = cart.some(item => item.type === 'product');
    if (hasProducts && !shippingAddress.trim()) {
      toast({ variant: "destructive", title: "Destination Required", description: "A shipping address is mandatory for boutique items." });
      return;
    }

    setIsCheckingOut(true);

    try {
      let currentUser = user;
      if (!currentUser && auth) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      if (!currentUser || !firestore) throw new Error("Registry services unavailable");

      const refCode = Math.random().toString(36).substring(7).toUpperCase();
      const newBookingRef = doc(collection(firestore, 'bookings'));
      
      const bookingData = {
        id: newBookingRef.id,
        localUserId: currentUser.uid,
        userName: userName,
        userPhone: phoneNumber || 'N/A',
        shippingAddress: shippingAddress || 'Service Only',
        referenceCode: refCode,
        totalPrice: subtotal,
        currency: getCurrency(),
        qrVerified: false,
        deliveryStatus: 'Pending',
        paymentStatus: 'COD (Awaiting)',
        createdAt: new Date().toISOString(),
        cartItems: cart,
        inspirationImageUrl: inspirationImage,
        vendorId: cart[0]?.vendor_id || 'v1'
      };

      await setDocumentNonBlocking(newBookingRef, bookingData, { merge: false });
      
      toast({ title: "Order Recorded", description: `Reference ${refCode} has been added to the registry.` });
      clearCart();
      router.push(`/booking/${newBookingRef.id}?uid=${currentUser.uid}`);
    } catch (error) {
      setIsCheckingOut(false);
      toast({ variant: "destructive", title: "Registry Error", description: "Could not finalize your order." });
    }
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background pt-20">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-12 max-w-lg px-6">
            <h1 className="text-7xl font-headline text-primary tracking-tighter italic">Registry Empty.</h1>
            <p className="text-muted-foreground text-lg leading-relaxed font-body">Your artisan collection awaits its first entry. Discover transformations and professional boutique essentials today.</p>
            <Button asChild size="lg" className="rounded-none px-12 h-16 vogue-button bg-primary text-white">
              <Link href="/">Discover The Registry</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-24 md:py-32">
        <header className="mb-32 space-y-4">
          <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">The Final Stage</span>
          <h1 className="text-7xl md:text-9xl font-headline tracking-tighter italic text-primary">Checkout.</h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          <div className="lg:col-span-2 space-y-32">
            {/* Identity & Address */}
            <section className="space-y-16">
              <div className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-secondary">01 Identity Registry</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Full Artisan Name</Label>
                    <Input 
                      placeholder="Enter name for registry..." 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-secondary h-14 text-xl italic px-1"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Registry Contact</Label>
                    <Input 
                      placeholder="+92 / +91 number" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-secondary h-14 text-xl italic px-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-10">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-secondary">02 Delivery Destination</h2>
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-secondary" /> Physical Shipping Address
                  </Label>
                  <Textarea 
                    placeholder="Provide full destination details for boutique shipments..." 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-secondary min-h-[120px] text-lg italic px-1"
                  />
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">Mandatory for boutique product logistics. For sanctuary bookings, this helps our artisans prepare for your arrival.</p>
                </div>
              </div>
            </section>

            {/* Inspiration */}
            <section className="space-y-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-secondary">03 Vision Reference</h2>
              {!inspirationImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/10 p-24 text-center cursor-pointer hover:bg-primary/5 transition-all bg-white dark:bg-card"
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <Camera className="h-10 w-10 mx-auto mb-6 text-secondary opacity-40" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">Upload Look Inspiration</span>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="relative aspect-video bg-muted group overflow-hidden border border-primary/5">
                    <Image src={inspirationImage} alt="Reference" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    <Button 
                      variant="destructive" size="icon" 
                      className="absolute top-8 right-8 rounded-none h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setInspirationImage(null); setAiSuggestions(null); }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-4 text-secondary italic animate-pulse">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Auditing Boutique Match...</span>
                    </div>
                  )}
                  {aiSuggestions && (
                    <div className="border border-primary/10 p-12 space-y-10 bg-white dark:bg-card">
                      <div className="space-y-2">
                        <h4 className="text-3xl font-headline text-primary italic">Artisan Pairing Recommendation</h4>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">{aiSuggestions.description}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        {aiSuggestions.productIds.map(pid => {
                          const p = PRODUCTS.find(prod => prod.id === pid);
                          if (!p) return null;
                          return (
                            <div key={pid} className="space-y-4">
                              <div className="relative aspect-square overflow-hidden border border-primary/5 grayscale hover:grayscale-0 transition-all">
                                <Image src={p.image} alt={p.name} fill className="object-cover" />
                              </div>
                              <Button variant="outline" size="sm" className="w-full rounded-none vogue-button text-[9px] h-10" onClick={() => addToCart({ id: p.id, type: 'product', name: p.name, price: p.price, quantity: 1, image: p.image })}>
                                Add Entry
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Selection */}
            <section className="space-y-12">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-secondary">04 Selected Collection</h2>
              <div className="space-y-16">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-10 border-b border-primary/10 pb-16 last:border-b-0">
                    <div className="relative w-40 h-40 bg-muted overflow-hidden border border-primary/5 grayscale hover:grayscale-0 transition-all shrink-0">
                      <Image src={item.image || ''} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary">
                          {item.type === 'deal' ? 'Transformation Service' : 'Boutique Item'}
                        </span>
                        <h3 className="font-headline text-4xl text-primary">{item.name}</h3>
                      </div>
                      <p className="font-bold text-2xl tracking-tighter text-primary">{getCurrency()} {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-10 pt-4">
                        <div className="flex items-center border border-primary/20 bg-white dark:bg-card px-4 h-12">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-primary hover:text-secondary"><Minus className="h-4 w-4" /></button>
                          <span className="w-12 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-primary hover:text-secondary"><Plus className="h-4 w-4" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-destructive flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Remove Entry
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Ledger */}
          <div className="space-y-12">
            <div className="p-12 bg-primary text-white space-y-10 border border-white/5">
              <h4 className="font-headline text-4xl italic tracking-tighter">The Ledger.</h4>
              <div className="space-y-6 text-[11px] font-bold uppercase tracking-[0.3em]">
                <div className="flex justify-between items-center text-white/60">
                  <span>Catalogue Subtotal</span>
                  <span className="text-white">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span className="flex items-center gap-2">Elite Delivery</span>
                  <span>COMPLIMENTARY</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center text-3xl font-headline italic tracking-tighter pt-4">
                  <span>Grand Total</span>
                  <span className="text-secondary">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full h-16 bg-secondary text-primary hover:bg-white rounded-none vogue-button text-[11px] border-none"
              >
                {isCheckingOut ? 'Recording Transaction...' : 'Finalize Collection'}
              </Button>
            </div>

            <div className="p-10 border border-primary/10 space-y-6 bg-white dark:bg-card">
              <div className="flex items-center gap-3 text-[11px] font-bold text-primary uppercase tracking-[0.3em]">
                <Package className="h-4 w-4 text-secondary" /> Registry Security
              </div>
              <p className="text-xs italic leading-relaxed text-muted-foreground">
                Your order is audited and secured. Cash on Delivery ensures transaction integrity upon handover of your selection.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
