
'use client';

import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, Share2, CheckCircle2, QrCode, Truck, Package, MapPin, Clock, ArrowRight, Star, StarHalf } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useMemoFirebase, useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { useEffect, useState, use, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

function BookingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
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
      // 1. Create reviews for each item in the cart
      const cartItems = booking.cartItems || [];
      const reviewPromises = cartItems.map(async (item) => {
        const reviewRef = collection(firestore, 'reviews');
        const reviewData = {
          bookingId: booking.id,
          targetId: item.id,
          vendorId: booking.vendorId || 'v1',
          userId: user.uid,
          userName: booking.userName || user.displayName || 'Guest',
          rating: rating,
          comment: comment,
          isVerified: true,
          createdAt: new Date().toISOString()
        };

        addDocumentNonBlocking(reviewRef, reviewData);

        // 2. Impact specific Product/Deal Rating
        const targetColl = item.type === 'product' ? 'products' : 'deals';
        const targetRef = doc(firestore, targetColl, item.id);
        const targetSnap = await getDoc(targetRef);
        
        if (targetSnap.exists()) {
          const data = targetSnap.data();
          const currentRating = data.rating || 5.0;
          const currentCount = data.reviewCount || 10; // Base count for dummy data
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;

          updateDocumentNonBlocking(targetRef, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount
          });
        }
      });

      await Promise.all(reviewPromises);

      // 3. Impact Overall Parlour Rating
      if (booking.vendorId) {
        const parlourRef = doc(firestore, 'parlours', booking.vendorId);
        const parlourSnap = await getDoc(parlourRef);
        if (parlourSnap.exists()) {
          const data = parlourSnap.data();
          const currentRating = data.rating || 5.0;
          const currentCount = data.reviewCount || 20;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;

          updateDocumentNonBlocking(parlourRef, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount
          });
        }
      }

      // 4. Mark booking as reviewed
      updateDocumentNonBlocking(bookingRef!, { isReviewed: true });

      toast({
        title: "Rating Received",
        description: "Your verified feedback has been added to the artisan registry."
      });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Rating Failed", description: "Could not sync review data." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Simulating the QR verification (This would normally happen on the vendor's scanner app)
  const simulateQrVerification = () => {
    if (!bookingRef) return;
    updateDocumentNonBlocking(bookingRef, { deliveryStatus: 'Verified', qrVerified: true });
    toast({ title: "Status Updated", description: "Service marked as Verified via QR scan." });
  };

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
    { label: 'Verified', icon: Sparkles, date: 'QR scan', status: booking?.deliveryStatus === 'Verified' ? 'completed' : booking?.deliveryStatus === 'Committed' ? 'current' : 'upcoming' },
    { label: 'Delivered', icon: CheckCircle2, date: 'Finalized', status: booking?.deliveryStatus === 'Delivered' ? 'current' : 'upcoming' },
  ];

  const isVerified = booking?.deliveryStatus === 'Verified' || booking?.deliveryStatus === 'Delivered';

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
              <p className="text-muted-foreground italic text-lg font-body">Your beauty pass is ready for confirmation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Voucher Card */}
            <Card className="rounded-[3.5rem] border-none shadow-3xl overflow-hidden bg-white/40 backdrop-blur-xl ring-1 ring-black/5">
              <div className="bg-primary p-10 text-center space-y-2">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary-foreground/60">Registry Pass</span>
                <h2 className="font-headline text-4xl text-primary-foreground italic">Booking Voucher</h2>
              </div>
              <CardContent className="p-12 space-y-10 text-center">
                <div className="bg-white p-6 inline-block rounded-[3rem] shadow-inner ring-1 ring-black/5 scale-110 mb-4 cursor-pointer" onClick={simulateQrVerification}>
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
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10 font-body shadow-sm">
                    <Download className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full h-14 text-[10px] uppercase font-bold tracking-widest border-primary/10 font-body shadow-sm">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Tracker & Review */}
            <div className="space-y-12">
              <Card className="rounded-[3.5rem] border-none shadow-3xl bg-white/40 backdrop-blur-xl p-12 space-y-10 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-4xl italic text-primary">Tracking</h3>
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
              </Card>

              {/* Rating Section - Verified Only */}
              {isVerified && !booking?.isReviewed ? (
                <Card className="rounded-[3.5rem] border-none shadow-3xl bg-primary text-primary-foreground p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-1000">
                  <div className="space-y-2 text-center">
                    <h3 className="font-headline text-4xl italic">Rate Artisan</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Impact the sanctuary ranking</p>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all active:scale-125"
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
                    {isSubmittingReview ? "Submitting..." : "Submit verified rating"}
                  </Button>
                </Card>
              ) : booking?.isReviewed ? (
                <Card className="rounded-[3.5rem] border-none shadow-3xl bg-emerald-600 text-white p-12 text-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto" />
                  <h3 className="font-headline text-3xl italic">Feedback Verified</h3>
                  <p className="text-xs opacity-80 italic">Your rating has been synced with the artisan registry.</p>
                </Card>
              ) : (
                <Card className="rounded-[3.5rem] border-none shadow-3xl bg-muted/40 p-12 text-center space-y-4 border border-dashed border-primary/10">
                  <Sparkles className="h-10 w-10 mx-auto text-primary/20" />
                  <h3 className="font-headline text-2xl italic text-primary/40">Verified Ratings</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/20">Ratings unlock after QR confirmation</p>
                </Card>
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
