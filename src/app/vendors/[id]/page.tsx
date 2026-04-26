
'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, ShieldCheck, Sparkles, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, use, useEffect, useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getCurrency, toggleFavoriteVendor, isFavoriteVendor } = useStore();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'parlours', id);
  }, [firestore, id]);

  const { data: vendor, isLoading: isLoadingVendor } = useDoc(vendorRef);

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(collection(firestore, 'deals'), where('parlourId', '==', id));
  }, [firestore, id]);

  const { data: vendorDeals, isLoading: isLoadingDeals } = useCollection(dealsQuery);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(collection(firestore, 'products'), where('vendorId', '==', id));
  }, [firestore, id]);

  const { data: vendorProducts, isLoading: isLoadingProducts } = useCollection(productsQuery);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  if (!isMounted || isLoadingVendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!vendor) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-headline italic">Studio not found</h1>
      <Button asChild><Link href="/vendors">Back to Sanctuaries</Link></Button>
    </div>
  );

  const isFav = isFavoriteVendor(vendor.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-32 pt-16 md:pt-0">
        <section className="relative h-[70vh] flex items-end pb-24 overflow-hidden">
          <div className="absolute inset-0">
            <Carousel 
              plugins={[plugin.current]}
              className="w-full h-full"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent className="h-full -ml-0">
                {(vendor.imageUrls && vendor.imageUrls.length > 0 ? vendor.imageUrls : ['https://picsum.photos/seed/vendor-fallback/1200/800']).map((img, index) => (
                  <CarouselItem key={index} className="pl-0 h-[70vh] relative">
                    <Image 
                      src={img} 
                      alt={`${vendor.name} ${index + 1}`} 
                      fill 
                      className="object-cover soft-focus opacity-60" 
                      priority={index === 0}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
             <div className="max-w-4xl space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1 rounded-full shadow-2xl">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Parlours Section</span>
                    </div>
                    <Button 
                      onClick={() => toggleFavoriteVendor(vendor.id)}
                      className={cn(
                        "rounded-full h-10 w-10 p-0 backdrop-blur-md transition-all shadow-xl",
                        isFav ? "bg-primary text-primary-foreground" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                    </Button>
                    <Button asChild className="rounded-full bg-primary text-primary-foreground h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
                      <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                        <MessageCircle className="h-4 w-4 mr-2" /> Chat with Parlour
                      </Link>
                    </Button>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full shadow-2xl self-start">
                    <Sparkles className="h-3 w-3 text-accent-foreground" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Elite Artisan Registry</span>
                  </div>
                </div>
                <h1 className="text-7xl md:text-9xl font-headline tracking-tighter italic text-primary leading-none">
                  {vendor.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm italic text-muted-foreground pt-4">
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 text-primary">
                     <MapPin className="h-4 w-4 text-rose-500" /> {vendor.areaTag}
                   </div>
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 text-primary">
                     <Star className="h-4 w-4 fill-primary text-primary" /> {vendor.rating} Artisan Rating
                   </div>
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 text-primary">
                     <ShieldCheck className="h-4 w-4 text-rose-600" /> Verified Studio
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24 space-y-32">
          {/* Active Deals */}
          <div className="space-y-12">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-5xl font-headline tracking-tighter italic text-primary">Signature Transformations</h2>
              <p className="text-muted-foreground italic text-[12px]">Exclusive service packages available for online booking.</p>
            </div>
            {isLoadingDeals ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[1, 2].map(n => <div key={n} className="h-64 rounded-3xl bg-muted animate-pulse" />)}
              </div>
            ) : (vendorDeals || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {vendorDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="group">
                    <Card className="rounded-3xl border-none bg-white/20 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden hover:bg-white/30 transition-all duration-700 ring-1 ring-white/20 hover:ring-white/50 shadow-2xl">
                      <div className="relative w-full md:w-64 h-64 overflow-hidden">
                        <Image src={`https://picsum.photos/seed/deal-${deal.id}/600/600`} alt={deal.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-105" />
                      </div>
                      <CardHeader className="flex-grow p-10 space-y-6">
                         <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{deal.category}</p>
                           <CardTitle className="text-3xl font-headline italic leading-none text-primary">{deal.name}</CardTitle>
                         </div>
                         <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                            <span className="text-3xl font-bold italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-foreground opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                              Book Slot <ArrowRight className="h-4 w-4" />
                            </div>
                         </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="italic text-muted-foreground text-center py-12">No active deals at this time.</p>
            )}
          </div>

          {/* Artisan Boutique */}
          <div className="space-y-12">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-5xl font-headline tracking-tighter italic text-primary">Studio Boutique</h2>
              <p className="text-muted-foreground italic text-[12px]">Professional artistry products used and recommended by our experts.</p>
            </div>
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {[1, 2, 3, 4].map(n => <div key={n} className="aspect-square rounded-3xl bg-muted animate-pulse" />)}
              </div>
            ) : (vendorProducts || []).length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {vendorProducts.map((product) => (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-6">
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl ring-1 ring-white/20 shadow-xl">
                      <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/500`} alt={product.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{product.brand}</p>
                      <h4 className="font-headline text-2xl italic leading-none text-primary">{product.name}</h4>
                      <p className="font-bold text-lg tracking-tighter text-accent-foreground">{getCurrency()} {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="italic text-muted-foreground text-center py-12">No products listed in the boutique.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
