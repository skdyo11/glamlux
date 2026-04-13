
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Share2, CheckCircle2, QrCode, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BookingSuccessPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const { firestore } = useFirestore();

  const bookingRef = useMemoFirebase(() => {
    if (!firestore || !uid || !id) return null;
    return doc(firestore, 'localUsers', uid, 'bookings', id as string);
  }, [firestore, uid, id]);

  const { data: booking, isLoading } = useDoc(bookingRef);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-4">
            <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-secondary/20">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-headline text-white">Purchase Confirmed</h1>
            <p className="text-white/60">Your luxury journey with GlamLux begins now.</p>
          </div>

          {booking?.qrVerificationStatus && (
            <Alert className="bg-green-500/20 border-green-500/40 text-white animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertTitle className="font-headline text-xl">Verified Entry!</AlertTitle>
              <AlertDescription className="font-body italic opacity-80">
                Thank you for visiting! You can now leave a verified review.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-none overflow-hidden relative shadow-2xl">
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary z-10" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary z-10" />
            
            <CardHeader className="bg-secondary text-primary-foreground py-8 text-center relative">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Digital Glam Voucher</span>
              </div>
              <CardTitle className="font-headline text-3xl">GlamLux Elite Pass</CardTitle>
            </CardHeader>
            
            <CardContent className="p-8 pt-12 text-center space-y-8">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Booking Reference</p>
                <p className="text-2xl font-bold tracking-tighter text-primary font-mono">{booking?.referenceCode || id}</p>
              </div>

              <div className="bg-white p-6 inline-block rounded-2xl border-2 border-primary/5 shadow-inner">
                 <div className="p-2 bg-white rounded-lg">
                   {booking?.referenceCode ? (
                     <QRCodeCanvas 
                        value={booking.referenceCode} 
                        size={192} 
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/favicon.ico",
                          x: undefined,
                          y: undefined,
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                     />
                   ) : (
                     <div className="w-48 h-48 bg-primary/5 rounded-lg flex items-center justify-center border-4 border-dashed border-primary/20">
                       <QrCode className="w-32 h-32 text-primary opacity-80" />
                     </div>
                   )}
                 </div>
                 <p className="mt-4 text-[10px] text-muted-foreground uppercase font-bold">Present at Parlour for Verification</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left border-t pt-8 border-dashed border-muted">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Client</p>
                  <p className="text-sm font-bold">Valued Guest</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                  <p className={cn(
                    "text-sm font-bold",
                    booking?.qrVerificationStatus ? "text-green-500" : "text-orange-500"
                  )}>
                    {booking?.qrVerificationStatus ? 'Verified' : 'Active'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                {booking?.qrVerificationStatus ? (
                  <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl">
                    Write Verified Review
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 border-primary/20 hover:border-primary">
                      <Download className="h-4 w-4 mr-2" /> Save PDF
                    </Button>
                    <Button variant="outline" className="flex-1 border-primary/20 hover:border-primary">
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4 pt-4">
            <Button asChild variant="link" className="text-white/60 hover:text-white">
              <Link href="/">Return to Marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
