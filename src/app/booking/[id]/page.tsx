
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Share2, CheckCircle2, QrCode, Truck, Package, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function BookingSuccessPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookingRef = useMemoFirebase(() => {
    if (!firestore || !uid || !id) return null;
    return doc(firestore, 'localUsers', uid, 'bookings', id as string);
  }, [firestore, uid, id]);

  const { data: booking, isLoading } = useDoc(bookingRef);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  const hasProducts = booking?.cartItems?.some((item: any) => item.type === 'product');
  const steps = [
    { label: 'Order Placed', icon: Package, date: 'Today', status: 'completed' },
    { label: 'Processing', icon: Clock, date: 'Pending', status: booking?.deliveryStatus === 'Pending' ? 'current' : 'completed' },
    { label: 'Shipped', icon: Truck, date: 'Soon', status: booking?.deliveryStatus === 'Picked Up' ? 'current' : booking?.deliveryStatus === 'Delivered' ? 'completed' : 'upcoming' },
    { label: 'Delivered', icon: CheckCircle2, date: 'Expected 2-4 days', status: booking?.deliveryStatus === 'Delivered' ? 'current' : 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="max-w-2xl w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-xl ring-1 ring-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-headline text-primary italic tracking-tighter">Order Confirmed</h1>
            <p className="text-muted-foreground italic text-sm">Your luxury collection is being prepared.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Voucher Card */}
            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white/40 backdrop-blur-xl">
              <div className="bg-primary p-8 text-center space-y-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-foreground/60">Digital Ticket</span>
                <h2 className="font-headline text-3xl text-primary-foreground italic">Elite Access Pass</h2>
              </div>
              <CardContent className="p-10 space-y-8 text-center">
                <div className="bg-white p-4 inline-block rounded-[2rem] shadow-inner ring-1 ring-black/5">
                  {booking?.referenceCode ? (
                    <QRCodeCanvas value={booking.referenceCode} size={160} level="H" includeMargin={true} />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center bg-muted rounded-2xl"><QrCode className="h-20 w-20 opacity-10" /></div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reference Code</p>
                  <p className="font-mono font-bold text-xl text-primary">{booking?.referenceCode || id}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 rounded-full h-12 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                    <Download className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full h-12 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Tracker (Daraz Style) */}
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white/40 backdrop-blur-xl p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-3xl italic text-primary">Delivery Updates</h3>
                <Badge variant="outline" className="rounded-full bg-primary/5 border-none text-[8px] font-black uppercase px-3 py-1 text-primary">
                  {booking?.deliveryStatus || 'Pending'}
                </Badge>
              </div>

              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative">
                    {idx !== steps.length - 1 && (
                      <div className={cn(
                        "absolute left-[1.125rem] top-8 w-0.5 h-12",
                        step.status === 'completed' ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10",
                      step.status === 'completed' ? "bg-primary text-primary-foreground" : 
                      step.status === 'current' ? "bg-accent text-primary animate-pulse shadow-lg ring-2 ring-primary/20" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className={cn(
                        "text-sm font-bold",
                        step.status === 'upcoming' ? "text-muted-foreground" : "text-primary"
                      )}>{step.label}</p>
                      <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-primary/5 space-y-4">
                 <div className="flex items-center gap-3 text-primary/60 italic text-xs">
                   <MapPin className="h-4 w-4" /> Delivered to: {booking?.user_phone}
                 </div>
                 <Button asChild variant="ghost" className="w-full h-12 rounded-full font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                   <Link href="/messages">Chat with Support</Link>
                 </Button>
              </div>
            </Card>
          </div>

          <div className="text-center pt-8">
            <Button asChild variant="link" className="text-primary hover:text-accent-foreground font-bold italic">
              <Link href="/">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
