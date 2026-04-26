'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, ArrowRight, ArrowLeft, Users, Plus, Minus, Info, MessageCircle, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef, use } from 'react';
import { productRecommendationForDeal } from '@/ai/flows/product-recommendation-for-deal';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, getCurrency } = useStore();
  const firestore = useFirestore();
  const [recommendedProductNames, setRecommendedProductNames] = useState<string[]>([]);
  const [personCount, setPersonCount] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dealRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'deals', id);
  }, [firestore, id]);

  const { data: deal, isLoading: isLoadingDeal } = useDoc(dealRef);

  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !deal?.parlourId) return null;
    return doc(firestore, 'parlours', deal.parlourId);
  }, [firestore, deal?.parlourId]);

  const { data: vendor, isLoading: isLoadingVendor } = useDoc(vendorRef);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  useEffect(() => {
    async function getRecommendations() {
      if (!deal) return;
      try {
        const result = await productRecommendationForDeal({
          dealName: deal.name,
          dealCategory: deal.category as any,
          upsellProductId: deal.upsellProductId
        });
        setRecommendedProductNames(result.recommendedProducts);
      } catch (error) {
        console.error('AI rec failed', error);
      }
    }
    getRecommendations();
  }, [deal]);

  if (!isMounted) return null;

  if (isLoadingDeal || isLoadingVendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-12 md:py-24 space-y-12">
          <div className="flex gap-4"><Skeleton className="h-10 w-32 rounded-full" /><Skeleton className="h-10 w-32 rounded-full" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-[3rem]" />
            <div className="space-y-8">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-20 w-full rounded-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!deal || !vendor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Navbar />
        <h1 className="text-4xl font-headline italic text-primary">Service Not Found</h1>
        <Button asChild className="rounded-full px-8"><Link href="/deals">Back to Registry</Link></Button>
      </div>
    );
  }

  const depositAmount = (deal.discountPrice * deal.depositPercent) / 100;
  const dealImages = [
    vendor.imageUrls?.[0] || 'https://picsum.photos/seed/deal/800/800',
    `https://picsum.photos/seed/deal-${deal.id}-1/800/800`,
    `https://picsum.photos/seed/deal-${deal.id}-2/800/800`,
  ];

  const handleAddToCart = () => {
    addToCart({
      id: deal.id,
      type: 'deal',
      name: deal.name,
      price: depositAmount,
      full_price: deal.discountPrice,
      quantity: personCount,
      image: vendor.imageUrls?.[0] || '',
      vendor_id: vendor.id
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-primary rounded-full font-body">
            <Link href="/deals"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Services</Link>
          </Button>
          <div className="inline-flex items-center gap-4">
             <Button asChild variant="outline" className="rounded-full border-primary/20 text-primary font-body">
               <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                 <MessageCircle className="h-4 w-4 mr-2" /> Chat with Studio
               </Link>
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
          <div className="space-y-6">
            <div className="relative aspect-square bg-muted rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
              <Carousel plugins={[plugin.current]} className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent className="h-full -ml-0">
                  {dealImages.map((img, index) => (
                    <CarouselItem key={index} className="pl-0 h-full relative">
                      <Image src={img} alt={deal.name} fill className="object-cover" priority={index === 0} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-accent text-accent-foreground rounded-full px-4 py-1 uppercase tracking-widest text-[8px] font-black border-none">
                  {deal.category}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <Star className="h-3 w-3 fill-primary" /> {vendor.rating} Artisan Rating
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline tracking-tighter leading-none italic text-primary">{deal.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm italic font-body">
                <MapPin className="h-4 w-4 text-rose-500" /> {vendor.name} — {vendor.areaTag}
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-8">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl md:text-6xl font-headline italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                <span className="text-xl text-muted-foreground line-through opacity-30 font-body">{getCurrency()} {deal.basePrice.toLocaleString()}</span>
              </div>
              
              <div className="p-6 md:p-8 border rounded-[2rem] md:rounded-[3rem] flex items-center justify-between bg-white/40 backdrop-blur-xl shadow-xl ring-1 ring-black/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                    <Users className="h-4 w-4" /> Guest Count
                  </div>
                  <p className="text-[10px] text-muted-foreground italic font-body">Book for you and friends</p>
                </div>
                <div className="flex items-center gap-4 md:gap-6 bg-white/60 px-4 md:px-6 py-2 rounded-full border">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPersonCount(Math.max(1, personCount - 1))}><Minus className="h-3 w-3" /></Button>
                  <span className="font-headline text-3xl md:text-4xl text-primary">{personCount}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPersonCount(personCount + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>

              <div className="p-8 md:p-10 rounded-[2.5rem] bg-secondary/30 backdrop-blur-md space-y-4">
                <div className="flex justify-between items-baseline italic text-primary">
                  <span className="text-sm font-bold font-body">Deposit Due Now</span>
                  <span className="text-3xl md:text-4xl font-headline">{(depositAmount * personCount).toLocaleString()}</span>
                </div>
                <p className="text-[9px] uppercase font-black opacity-30 tracking-widest flex items-center gap-1 text-primary">
                  <Info className="h-3 w-3" /> Pay remainder at {vendor.name}
                </p>
              </div>
            </div>

            <Button size="lg" className="w-full h-20 bg-primary text-primary-foreground rounded-[2.5rem] text-xl font-bold uppercase tracking-widest text-[10px] shadow-2xl group transition-all" onClick={handleAddToCart}>
              Book Now
              <ArrowRight className="ml-4 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {recommendedProductNames.length > 0 && (
              <div className="pt-6 border-t border-primary/5">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 mb-4 flex items-center gap-2"><Sparkles className="h-3 w-3" /> Artisan Pairing Recommendation</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedProductNames.map((name, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5 border-primary/10 text-primary font-body text-[10px] py-1 px-3 rounded-full">{name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
