
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShieldCheck, Truck, ShoppingBag, ArrowRight, CreditCard, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, region, removeFromCart, getCurrency, clearCart } = useStore();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cart.some(i => i.type === 'product') ? (region === 'PK' ? 250 : 150) : 0;
  const totalDueNow = subtotal + shipping;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate booking creation
    setTimeout(() => {
      const bookingId = Math.random().toString(36).substring(7).toUpperCase();
      clearCart();
      router.push(`/booking/${bookingId}`);
    }, 1500);
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
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline mb-12">Glam Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <Card key={item.id} className="border-none shadow-sm overflow-hidden group">
                <CardContent className="p-0 flex items-center">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image src={item.image || 'https://picsum.photos/seed/placeholder/400/400'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow px-6 py-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {item.type === 'deal' ? 'Parlour Booking' : 'Product Purchase'}
                      </span>
                      <h3 className="text-lg font-headline">{item.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-primary">
                          {item.type === 'deal' ? 'Upfront Deposit: ' : ''}
                          {getCurrency()} {item.price.toLocaleString()}
                        </p>
                        {item.type === 'deal' && item.full_price && (
                          <p className="text-[10px] text-muted-foreground italic font-medium">
                            Remaining {getCurrency()} {(item.full_price - item.price).toLocaleString()} payable at salon
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

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
                    <Button variant="outline" className="h-16 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5">
                      <span className="text-xs font-bold text-muted-foreground">JazzCash</span>
                      <span className="text-[10px] text-muted-foreground opacity-60 italic">Mobile Wallet</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5">
                      <span className="text-xs font-bold text-muted-foreground">EasyPaisa</span>
                      <span className="text-[10px] text-muted-foreground opacity-60 italic">Scan & Pay</span>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="h-16 flex flex-col gap-1 border-secondary/20 hover:border-secondary hover:bg-secondary/5 w-full col-span-2">
                    <span className="text-xs font-bold text-muted-foreground">UPI (Unified Payments)</span>
                    <span className="text-[10px] text-muted-foreground opacity-60 italic">Paytm, GPay, PhonePe</span>
                  </Button>
                )}
              </div>
            </div>

            <Button 
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 font-bold text-lg group" 
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Securing Transaction...' : 'Complete Payment'}
              {!isCheckingOut && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
