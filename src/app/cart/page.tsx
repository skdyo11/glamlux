'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Minus, MapPin, Package, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCurrency, clearCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const { user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    if (!userName.trim()) {
      toast({ variant: "destructive", title: "Identity Required", description: "A name is required for order tracking." });
      return;
    }

    const hasProducts = cart.some(item => item.type === 'product');
    if (hasProducts && !shippingAddress.trim()) {
      toast({ variant: "destructive", title: "Address Required", description: "A shipping address is mandatory for product orders." });
      return;
    }

    setIsCheckingOut(true);

    try {
      let currentUser = user;
      if (!currentUser && auth) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      if (!currentUser || !firestore) throw new Error("Services unavailable");

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
        vendorId: cart[0]?.vendor_id || 'v1'
      };

      await setDocumentNonBlocking(newBookingRef, bookingData, { merge: false });
      
      toast({ title: "Order Confirmed", description: `Reference ${refCode} has been generated.` });
      clearCart();
      router.push(`/booking/${newBookingRef.id}?uid=${currentUser.uid}`);
    } catch (error) {
      setIsCheckingOut(false);
      toast({ variant: "destructive", title: "Checkout Error", description: "Could not finalize your order." });
    }
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background pt-20 font-body">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-12 max-w-lg px-6">
            <h1 className="text-7xl font-headline text-primary tracking-tighter italic">Cart Empty.</h1>
            <p className="text-muted-foreground text-lg leading-relaxed font-body">Your beauty collection awaits its first selection.</p>
            <Button asChild size="lg" className="rounded-full px-12 h-16 bg-primary text-primary-foreground border-none">
              <Link href="/">Discover Parlours</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 font-body">
      <Navbar />
      
      <main className="container mx-auto px-6 py-24 md:py-32">
        <header className="mb-24 space-y-4">
          <span className="text-primary font-bold uppercase tracking-[0.5em] text-[10px]">Step 03</span>
          <h1 className="text-7xl md:text-[9rem] font-headline tracking-tighter italic text-primary leading-none">Checkout.</h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          <div className="lg:col-span-2 space-y-32">
            <section className="space-y-16">
              <div className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary">01 User Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Full Name</Label>
                    <Input 
                      placeholder="Your name..." 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-primary h-14 text-xl italic px-1"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Contact Number</Label>
                    <Input 
                      placeholder="+92 / +91 number" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-primary h-14 text-xl italic px-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-10">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary">02 Delivery Details</h2>
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary" /> Shipping Address
                  </Label>
                  <Textarea 
                    placeholder="Provide full destination details for product shipments..." 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="rounded-none border-t-0 border-x-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-primary min-h-[120px] text-lg italic px-1"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-12">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary">03 Selected Collection</h2>
              <div className="space-y-16">
                {cart.map((item) => {
                  const imageSrc = (item.image && typeof item.image === 'string' && item.image.trim() !== '') ? item.image : null;
                  return (
                    <div key={item.id} className="flex flex-col md:flex-row gap-10 border-b border-primary/10 pb-16 last:border-b-0">
                      <div className="relative w-40 h-40 bg-muted overflow-hidden border border-primary/5 hover:scale-105 transition-all shrink-0 rounded-2xl">
                        {imageSrc ? (
                          <Image 
                            src={imageSrc} 
                            alt={item.name} 
                            fill 
                            className="object-cover"
                            data-ai-hint="beauty product"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Package className="h-10 w-10 text-primary/10" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                              {item.type === 'deal' ? 'Service' : 'Product'}
                            </span>
                            <h3 className="font-headline text-4xl text-primary leading-none">{item.name}</h3>
                          </div>
                          <Button asChild variant="ghost" className="rounded-full text-primary hover:text-secondary h-12 px-6 border border-primary/10">
                            <Link href={`/messages?vendorId=${item.vendor_id || 'v1'}`}>
                              <MessageCircle className="h-4 w-4 mr-2" /> Chat with Shop
                            </Link>
                          </Button>
                        </div>
                        <p className="font-bold text-2xl tracking-tighter text-primary">{getCurrency()} {item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-10 pt-4">
                          <div className="flex items-center border border-primary/20 bg-white dark:bg-card px-4 h-12 rounded-full">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-primary hover:text-secondary"><Minus className="h-4 w-4" /></button>
                            <span className="w-12 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-primary hover:text-secondary"><Plus className="h-4 w-4" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-destructive flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <div className="p-12 bg-primary text-primary-foreground space-y-10 border border-white/5 shadow-3xl rounded-[2.5rem]">
              <h4 className="font-headline text-4xl italic tracking-tighter">Summary.</h4>
              <div className="space-y-6 text-[11px] font-bold uppercase tracking-[0.3em]">
                <div className="flex justify-between items-center opacity-60">
                  <span>Subtotal</span>
                  <span className="text-current">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-white font-black">
                  <span className="flex items-center gap-2">Delivery</span>
                  <span>COMPLIMENTARY</span>
                </div>
                <Separator className="bg-current opacity-10" />
                <div className="flex justify-between items-center text-3xl font-headline italic tracking-tighter pt-4">
                  <span>Total</span>
                  <span className="text-white font-black">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full h-16 bg-white text-primary hover:bg-white/90 rounded-full font-bold text-[11px] uppercase tracking-widest border-none shadow-2xl"
              >
                {isCheckingOut ? 'Finalizing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
