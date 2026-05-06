
'use client';

import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Share2, CheckCircle2, QrCode, Package, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { useEffect, useState, use, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

function BookingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookingRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'bookings', id);
  }, [firestore, id]);

  const { data: booking, isLoading } = useDoc(bookingRef);

  const handleReviewSubmit = async () => {
    if (!firestore || !booking || !user || rating === 0) return;
    setIsSubmittingReview(true);

    try {
      const cartItems = booking.cartItems || [];
      
      // 1. Create a master review entry
      const reviewRef = collection(firestore, 'reviews');
      addDocumentNonBlocking(reviewRef, {
        bookingId: booking.id,
        vendorId: booking.vendorId || 'v1',
        userId: user.uid,
        userName: booking.userName || user.displayName || 'Guest',
        rating: rating,
        comment: comment,
        isVerified: true,
        createdAt: new Date().toISOString()
      });

      // 2. Update Ratings for all items in the booking
      for (const item of cartItems) {
        const targetColl = item.type === 'product' ? 'products' : 'deals';
        const targetRef = doc(firestore, targetColl, item.id);
        const snap = await getDoc(targetRef);
        
        if (snap.exists()) {
          const data = snap.data();
          const oldRating = data.rating || 5.0;
          const oldCount = data.reviewCount || 10;
          const newCount = oldCount + 1;
          const newRating = ((oldRating * oldCount) + rating) / newCount;

          updateDocumentNonBlocking(targetRef, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount
          });
        }
      }

      // 3. Update Overall Parlour prestige
      if (booking.vendorId) {
        const parlourRef = doc(firestore, 'parlours', booking.vendorId);
        const parlourSnap = await getDoc(parlourRef);
        if (parlourSnap.exists()) {
          const pData = parlourSnap.data();
          const pOldRating = pData.rating || 5.0;
          const pOldCount = pData.reviewCount || 20;
          const pNewCount = pOldCount + 1;
          const pNewRating = ((pOldRating * pOldCount) + rating) / pNewCount;

          updateDocumentNonBlocking(parlourRef, {
            rating: Number(pNewRating.toFixed(1)),
            reviewCount: pNewCount
          });
        }
      }

      // 4. Mark as reviewed
      updateDocumentNonBlocking(bookingRef!, { isReviewed: true });

      toast({
        title: "Feedback Verified",
        description: "Your rating has been synced with the artisan registry."
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Rating Failed", description: "Could not finalize feedback." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const simulateQrVerification = () => {
    if (!bookingRef || booking?.deliveryStatus === 'Verified') return;
    updateDocumentNonBlocking(bookingRef, { deliveryStatus: 'Verified', qrVerified: true });
    toast({ title: "Artisan Scan Verified", description: "The session is complete. You can now leave a rating." });
  };

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-24 flex flex-col items-center space-y-12">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
             <Skeleton className="h-[400px] rounded-[3rem]" />
             <Skeleton className="h-[400px] rounded-[3rem]" />
          </div>
        </main>
      </div>
    );
  }

  const isVerified = booking?.deliveryStatus === 'Verified' || booking?.deliveryStatus === 'Delivered';

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 md:py-24 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-16">
          <div className="text-center space-y-6">
            <div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ring-1 ring-primary/10">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-headline text-primary italic tracking-tighter leading-none">Pass Ready.</h1>
              <p className="text-muted-foreground italic text-lg font-body">Your beauty credentials have been issued.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Voucher */}
            <Card className="rounded-[3.5rem] border-none shadow-3xl overflow-hidden bg-white/40 backdrop-blur-xl ring-1 ring-black/5">
              <div className="bg-primary p-10 text-center">
                <h2 className="font-headline text-4xl text-primary-foreground italic">Studio Voucher</h2>
              </div>
              <CardContent className="p-12 space-y-10 text-center">
                <div 
                  className={cn(
                    "bg-white p-6 inline-block rounded-[3rem] shadow-inner ring-1 ring-black/5 scale-110 mb-4 transition-transform active:scale-105 cursor-pointer",
                    !isVerified && "animate-pulse ring-primary/20"
                  )} 
                  onClick={simulateQrVerification}
                >
                  {booking?.referenceCode ? (
                    <QRCodeCanvas value={booking.referenceCode} size={180} level="H" includeMargin={true} />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center bg-muted rounded-2xl"><QrCode className="h-20 w-20 opacity-10" /></div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-primary">Booking Reference</p>
                  <p className="font-headline text-4xl text-primary italic">{booking?.referenceCode || id}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                    <Download className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section */}
            <div className="space-y-12">
              {isVerified && !booking?.isReviewed ? (
                <Card className="rounded-[3.5rem] border-none shadow-3xl bg-primary text-primary-foreground p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-2 text-center">
                    <div className="bg-white/10 w-fit mx-auto px-4 py-1 rounded-full mb-4">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-headline text-4xl italic leading-none">Rate Your Experience</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Help others find elite artistry</p>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all active:scale-125 hover:scale-110"
                      >
                        <Star 
                          className={cn(
                            "h-10 w-10 transition-colors",
                            (hoverRating || rating) >= star ? "fill-white text-white" : "text-white/20"
                          )} 
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>

                  <Textarea 
                    placeholder="Share your transformation experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rounded-3xl bg-white/10 border-none placeholder:text-white/40 text-white min-h-[120px] focus-visible:ring-white/20 p-6 italic"
                  />

                  <Button 
                    onClick={handleReviewSubmit}
                    disabled={rating === 0 || isSubmittingReview}
                    className="w-full h-16 bg-white text-primary hover:bg-white/90 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-2xl"
                  >
                    {isSubmittingReview ? "Processing..." : "Submit verified rating"}
                  </Button>
                </Card>
              ) : booking?.isReviewed ? (
                <Card className="rounded-[3.5rem] border-none shadow-3xl bg-emerald-600 text-white p-12 text-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto" />
                  <h3 className="font-headline text-3xl italic">Feedback Verified</h3>
                  <p className="text-xs opacity-80 italic">Your rating has been synced with the artisan registry.</p>
                </Card>
              ) : (
                <div className="space-y-12">
                   <Card className="rounded-[3.5rem] border-none shadow-3xl bg-white/40 backdrop-blur-xl p-12 space-y-8 ring-1 ring-black/5">
                      <div className="space-y-1">
                        <h3 className="font-headline text-4xl italic text-primary">Instructions</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Verification required</p>
                      </div>
                      <div className="space-y-6">
                        <div className="flex gap-6 items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 text-primary font-bold">1</div>
                          <p className="text-sm italic font-body text-muted-foreground pt-2">Present the QR code to the artisan upon arrival at the studio.</p>
                        </div>
                        <div className="flex gap-6 items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 text-primary font-bold">2</div>
                          <p className="text-sm italic font-body text-muted-foreground pt-2">Once scanned, your experience will be marked as verified in the registry.</p>
                        </div>
                        <div className="flex gap-6 items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 text-primary font-bold">3</div>
                          <p className="text-sm italic font-body text-muted-foreground pt-2">Provide your verified rating to impact the sanctuary's global ranking.</p>
                        </div>
                      </div>
                   </Card>

                   <Card className="rounded-[3.5rem] border-none shadow-3xl bg-muted/20 p-12 text-center space-y-4 border border-dashed border-primary/10">
                    <Sparkles className="h-10 w-10 mx-auto text-primary/20" />
                    <h3 className="font-headline text-2xl italic text-primary/40">Ratings Locked</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/20">Available after artisan confirmation</p>
                  </Card>
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-8">
            <Button asChild variant="link" className="text-primary hover:text-accent-foreground font-bold italic text-lg font-headline tracking-tight">
              <Link href="/">Return to Marketplace</Link>
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
