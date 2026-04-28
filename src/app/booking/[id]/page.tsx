'use client';

import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Share2, CheckCircle2, QrCode, Truck, Package, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { useEffect, useState, use, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function BookingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookingRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'bookings', id);
  }, [firestore, id]);

  const { data: booking, isLoading } = useDoc(bookingRef);

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-24 flex flex-col items-center space-y-12">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-16 w-1/2 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
             <Skeleton className="h-[500px] rounded-[3rem]" />
             <Skeleton className="h-[500px] rounded-[3rem]" />
          </div>
        </main>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', icon: Package, date: 'Today', status: 'completed' },
    { label: 'Processing', icon: Clock, date: 'Pending', status: booking?.deliveryStatus === 'Pending' ? 'current' : 'completed' },
    { label: 'Shipped', icon: Truck, date: 'Soon', status: booking?.deliveryStatus === 'Picked Up' ? 'current' : booking?.deliveryStatus === 'Delivered' ? 'completed' : 'upcoming' },
    { label: 'Delivered', icon: CheckCircle2, date: 'Expected 2-4 days', status: booking?.deliveryStatus === 'Delivered' ? 'current' : 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 md:py-24 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ring-1 ring-primary/10 animate-in zoom-in duration-700">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-headline text-primary italic tracking-tighter leading-none">Order Confirmed</h1>
              <p className="text-muted-foreground italic text-lg font-body">Your artisan collection is being curated with precision.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Voucher Card */}
            <Card className="rounded-[3.5rem] border-none shadow-3xl overflow-hidden bg-white/40 backdrop-blur-xl ring-1 ring-black/5">
              <div className="bg-primary p-10 text-center space-y-2">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary-foreground/60">Registry Document</span>
                <h2 className="font-headline text-4xl text-primary-foreground italic">Elite Access Pass</h2>
              </div>
              <CardContent className="p-12 space-y-10 text-center">
                <div className="bg-white p-6 inline-block rounded-[3rem] shadow-inner ring-1 ring-black/5 scale-110 mb-4">
                  {booking?.referenceCode ? (
                    <QRCodeCanvas value={booking.referenceCode} size={180} level="H" includeMargin={true} />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center bg-muted rounded-2xl"><QrCode className="h-20 w-20 opacity-10" /></div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-primary">Identity Reference</p>
                  <p className="font-headline text-4xl text-primary italic">{booking?.referenceCode || id}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10 font-body shadow-sm">
                    <Download className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10 font-body shadow-sm">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Tracker */}
            <Card className="rounded-[3.5rem] border-none shadow-3xl bg-white/40 backdrop-blur-xl p-12 space-y-10 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-4xl italic text-primary">Logistics Registry</h3>
                <Badge variant="outline" className="rounded-full bg-primary/5 border-none text-[9px] font-black uppercase px-4 py-1.5 text-primary shadow-sm">
                  {booking?.deliveryStatus || 'Pending'}
                </Badge>
              </div>

              <div className="space-y-10">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-8 relative">
                    {idx !== steps.length - 1 && (
                      <div className={cn(
                        "absolute left-[1.375rem] top-10 w-0.5 h-16",
                        step.status === 'completed' ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                    <div className={cn(
                      "h-11 w-11 rounded-full flex items-center justify-center shrink-0 z-10 shadow-lg transition-all",
                      step.status === 'completed' ? "bg-primary text-primary-foreground" : 
                      step.status === 'current' ? "bg-accent text-primary animate-pulse ring-4 ring-primary/10" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className={cn(
                        "text-lg font-bold font-body tracking-tight",
                        step.status === 'upcoming' ? "text-muted-foreground/60" : "text-primary"
                      )}>{step.label}</p>
                      <p className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em]">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-primary/5 space-y-6">
                 <div className="flex flex-col gap-2 text-primary/60 italic text-sm font-body">
                   <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-rose-400" /> Recipient: <span className="font-bold text-primary not-italic">{booking?.userName}</span>
                   </div>
                   <div className="flex items-center gap-3 ml-8 text-[11px] font-mono tracking-widest">
                    {booking?.userPhone}
                   </div>
                 </div>
                 <Button asChild variant="ghost" className="w-full h-16 rounded-full font-bold text-[11px] uppercase tracking-widest text-primary hover:bg-primary/5 font-body">
                   <Link href="/messages" className="flex items-center justify-center gap-2">Artisan Support Chat <ArrowRight className="h-4 w-4" /></Link>
                 </Button>
              </div>
            </Card>
          </div>

          <div className="text-center pt-8">
            <Button asChild variant="link" className="text-primary hover:text-accent-foreground font-bold italic text-lg font-headline tracking-tight">
              <Link href="/">Return to Artisan Collection</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    }>
      <BookingContent params={params} />
    </Suspense>
  );
}
