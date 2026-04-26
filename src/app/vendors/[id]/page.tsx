
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 pt-20">
      <h1 className="text-4xl font-headline italic">Studio not found</h1>
      <Button asChild><Link href="/vendors">Back to Sanctuaries</Link></Button>
    </div>
  );

  const isFav = isFavoriteVendor(vendor.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-32">
        {/* Full-Bleed Immersive Hero */}
        <section className="relative h-[85vh] md:h-[90vh] flex items-end pb-12 md:pb-24 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Carousel 
              plugins={[plugin.current]}
              className="w-full h-full"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent className="h-full -ml-0">
                {(vendor.imageUrls && vendor.imageUrls.length > 0 ? vendor.imageUrls : ['https://picsum.photos/seed/vendor-fallback/1200/800']).map((img, index) => (
                  <CarouselItem key={index} className="pl-0 h-full relative">
                    <Image 
                      src={img} 
                      alt={`${vendor.name} ${index + 1}`} 
                      fill 
                      className="object-cover soft-focus brightness-[0.8] md:brightness-[0.85]" 
                      priority={index === 0}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none z-10 h-32" />
          
          <div className="container mx-auto px-6 relative z-20">
             <div className="max-w-4xl space-y-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full shadow-2xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Elite Artisan Registry</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-7xl md:text-[10rem] font-headline tracking-tighter italic text-white leading-none drop-shadow-2xl">
                      {vendor.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl">
                        <MapPin className="h-5 w-5 text-rose-400" /> <span className="text-xs font-bold uppercase tracking-widest">{vendor.areaTag}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl">
                        <Star className="h-5 w-5 fill-accent text-accent" /> <span className="text-xs font-bold uppercase tracking-widest">{vendor.rating} Artisan Score</span>
                      </div>
                      <Button asChild className="rounded-full bg-white text-primary hover:bg-white/90 h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl">
                        <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                          <MessageCircle className="h-5 w-5 mr-3" /> Chat with Studio
                        </Link>
                      </Button>
                      <Button 
                        onClick={() => toggleFavoriteVendor(vendor.id)}
                        className={cn(
                          "rounded-full h-14 w-14 p-0 backdrop-blur-md transition-all shadow-xl",
                          isFav ? "bg-accent text-accent-foreground border-none" : "bg-white/10 text-white border border-white/20 hover:bg-white/30"
                        )}
                      >
                        <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
                      </Button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-6 py-20 md:py-32 space-y-24 md:space-y-40">
          {/* Active Deals */}
          <div className="space-y-16">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase font-black px-4 py-1.5 rounded-full mb-2">Signature Series</Badge>
              <h2 className="text-5xl md:text-7xl font-headline tracking-tighter italic text-primary">Signature Transformations</h2>
              <p className="text-muted-foreground italic text-lg leading-relaxed">Exclusive service packages available for curated online booking experiences.</p>
            </div>
            
            {isLoadingDeals ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 {[1, 2].map(n => <div key={n} className="h-80 rounded-[3rem] bg-muted animate-pulse" />)}
              </div>
            ) : (vendorDeals || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {vendorDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="group">
                    <Card className="rounded-[3.5rem] border-none bg-white dark:bg-black/20 flex flex-col md:flex-row overflow-hidden hover:shadow-3xl transition-all duration-700 ring-1 ring-primary/5 shadow-2xl">
                      <div className="relative w-full md:w-80 h-80 overflow-hidden">
                        <Image src={`https://picsum.photos/seed/deal-${deal.id}/800/800`} alt={deal.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-105" />
                      </div>
                      <CardHeader className="flex-grow p-12 space-y-8">
                         <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{deal.category}</p>
                           <CardTitle className="text-4xl font-headline italic leading-none text-primary">{deal.name}</CardTitle>
                         </div>
                         <div className="flex justify-between items-baseline pt-6 border-t border-primary/5">
                            <span className="text-4xl font-bold italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-foreground group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                              Book Slot <ArrowRight className="h-4 w-4" />
                            </div>
                         </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/10">
                <p className="italic text-muted-foreground text-xl">No active signature transformations at this time.</p>
              </div>
            )}
          </div>

          {/* Artisan Boutique */}
          <div className="space-y-16">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase font-black px-4 py-1.5 rounded-full mb-2">The Boutique</Badge>
              <h2 className="text-5xl md:text-7xl font-headline tracking-tighter italic text-primary">Studio Boutique</h2>
              <p className="text-muted-foreground italic text-lg leading-relaxed">Professional artistry products used and recommended by our elite experts.</p>
            </div>
            
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] rounded-[3rem] bg-muted animate-pulse" />)}
              </div>
            ) : (vendorProducts || []).length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {vendorProducts.map((product) => (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-8">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] bg-white dark:bg-black/20 ring-1 ring-primary/5 shadow-2xl transition-all duration-700 hover:shadow-3xl">
                      <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/800`} alt={product.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">{product.brand}</p>
                      <h4 className="font-headline text-3xl italic leading-none text-primary">{product.name}</h4>
                      <p className="font-bold text-xl tracking-tighter text-accent-foreground">{getCurrency()} {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/10">
                <p className="italic text-muted-foreground text-xl">The boutique is currently being curated.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
