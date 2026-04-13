
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShieldCheck, Truck, ShoppingBag, ArrowRight, CreditCard, Banknote, User, Phone, Plus, Minus, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, region, removeFromCart, updateQuantity, getCurrency, clearCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirestore();
  const { user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Shadow Profile State
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cart.some(i => i.type === 'product') ? (region === 'PK' ? 250 : 150) : 0;
  const totalDueNow = subtotal + shipping;

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    if (!userName.trim() || !phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide your name and phone number for the booking."
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      if (!currentUser) throw new Error("Authentication failed");

      // Save shadow profile
      const userRef = doc(firestore, 'localUsers', currentUser.uid);
      await setDoc(userRef, {
        id: currentUser.uid,
        name: userName,
        phoneNumber: phoneNumber,
        deviceIdentifier: navigator.userAgent,
        lastActiveAt: new Date().toISOString()
      }, { merge: true });

      // Create booking
      const referenceCode = Math.random().toString(36).substring(7).toUpperCase();
      const bookingData = {
        localUserId: currentUser.uid,
        referenceCode,
        totalPrice: totalDueNow,
        currency: getCurrency(),
        qrVerificationStatus: false,
        deliveryStatus: 'Pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'Paid',
        cartItems: cart,
        parlourOwnerIdsInBooking: cart.filter(i => i.type === 'deal').map(i => 'ADMIN_UID')
      };

      const bookingsCol = collection(firestore, 'localUsers', currentUser.uid, 'bookings');
      const docRef = await addDocumentNonBlocking(bookingsCol, bookingData);
      
      if (docRef) {
        clearCart();
        router.push(`/booking/${docRef.id}?uid=${currentUser.uid}`);
      }
    } catch (error) {
      console.error("Checkout failed", error);
      setIsCheckingOut(false);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Could not complete your purchase. Please try again."
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-background">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="bg-secondary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="text-3xl font-headline">Your Glam Cart is Empty</h1>
            <p className="text-muted-foreground">Indulge in our premium parlour deals or shop for the finest makeup collections today.</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/">Explore Marketplace</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 pb-32">
        <h1 className="text-4xl font-headline mb-12">Glam Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form and Cart Items */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Shadow Profile Form */}
            <Card className="border-none shadow-sm overflow-hidden bg-primary/5">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" /> 
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-primary">Your Name</Label>
                    <Input 
                      placeholder="e.g. Sara Ahmed" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-12 rounded-xl border-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-primary">Phone Number</Label>
                    <Input 
                      placeholder="+92 300 1234567" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 rounded-xl border-primary/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-headline italic">Your Selection</h2>
              {cart.map((item) => (
                <Card key={item.id} className="border-none shadow-sm overflow-hidden group">
                  <CardContent className="p-0 flex items-center">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image src={item.image || 'https://picsum.photos/seed/placeholder/400/400'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow px-6 py-4 flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                            {item.type === 'deal' ? 'Parlour Booking' : 'Product Purchase'}
                          </span>
                          {item.quantity > 1 && (
                            <Badge variant="outline" className="text-[8px] h-4 py-0 flex gap-1 items-center border-secondary/30 text-secondary">
                              <Users className="h-2.5 w-2.5" /> Group of {item.quantity}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-headline">{item.name}</h3>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">
                            {item.type === 'deal' ? 'Deposit: ' : ''}
                            {getCurrency()} {(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.type === 'deal' && item.full_price && (
                            <p className="text-[10px] text-muted-foreground italic font-medium">
                              Remaining {getCurrency()} {((item.full_price - item.price) * item.quantity).toLocaleString()} at salon
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-primary/5 rounded-full p-1 border border-primary/10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-7 w-7 rounded-full text-primary hover:bg-primary/20"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-sm min-w-4 text-center">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-7 w-7 rounded-full text-primary hover:bg-primary/20"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <span>Secure {region === 'PK' ? 'JazzCash' : 'UPI'} enabled for instant confirmation.</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <CreditCard className="h-5 w-5 text-secondary" />
                <span>You only pay the deposit for parlour bookings today.</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl bg-primary text-white p-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>Cart Items Total</span>
                  <span className="tabular-nums font-bold">{getCurrency()} {subtotal.toLocaleString()}</span>
                </div>
                {cart.some(i => i.type === 'product') && (
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Shipping (Products)</span>
                    <span className="tabular-nums font-bold">{getCurrency()} {shipping.toLocaleString()}</span>
                  </div>
                )}
                <Separator className="bg-white/10" />
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xl font-headline">
                    <span>Total Due Now</span>
                    <span className="text-secondary tabular-nums">{getCurrency()} {totalDueNow.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest text-right font-bold">Secure Online Payment</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h4 className="font-headline text-lg">Select Gateway</h4>
              <div className="grid grid-cols-2 gap-4">
                {region === 'PK' ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all active:scale-[0.98]"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">JazzCash</span>
                      <span className="text-[10px] text-muted-foreground opacity-60 italic">Mobile Wallet</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all active:scale-[0.98]"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">EasyPaisa</span>
                      <span className="text-[10px] text-muted-foreground opacity-60 italic">Scan & Pay</span>
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5 w-full col-span-2 transition-all active:scale-[0.98]"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">UPI (Unified Payments)</span>
                    <span className="text-[10px] text-muted-foreground opacity-60 italic">Paytm, GPay, PhonePe</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5 col-span-2 transition-all active:scale-[0.98]"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cash on Delivery</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground opacity-60 italic">Pay when you receive</span>
                </Button>
              </div>
            </div>

            <Button 
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-16 rounded-[2rem] font-bold text-xl group shadow-lg shadow-secondary/10" 
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Securing Transaction...' : 'Complete Payment'}
              {!isCheckingOut && <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
