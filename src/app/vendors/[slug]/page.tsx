
'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, ShieldCheck, Sparkles, Heart, MessageCircle, Trash2, PlusCircle, RefreshCw, Navigation, Percent } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, use, useEffect, useState, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, getDocs, deleteDoc, writeBatch, limit, serverTimestamp, updateDoc } from 'firebase/firestore';
import { slugify } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { getCurrency, toggleFavoriteVendor, isFavoriteVendor } = useStore();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const vendorBySlugQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'parlours'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);

  const { data: vendorBySlugDocs, isLoading: isLoadingBySlug } = useCollection(vendorBySlugQuery);
  
  const vendorRefById = useMemoFirebase(() => {
    if (!firestore || !slug || (vendorBySlugDocs && vendorBySlugDocs.length > 0)) return null;
    return doc(firestore, 'parlours', slug);
  }, [firestore, slug, vendorBySlugDocs?.length]);

  const { data: vendorById, isLoading: isLoadingById } = useDoc(vendorRefById);

  const allVendorsQuery = useMemoFirebase(() => {
    if (!firestore || (vendorBySlugDocs && vendorBySlugDocs.length > 0) || vendorById) return null;
    return query(collection(firestore, 'parlours'), limit(20));
  }, [firestore, vendorBySlugDocs?.length, !!vendorById]);

  const { data: allVendors, isLoading: isLoadingAll } = useCollection(allVendorsQuery);

  const vendorBySearch = useMemo(() => {
    if (!allVendors || !slug) return null;
    return allVendors.find(v => slugify(v.name || '') === slug);
  }, [allVendors, slug]);

  const vendor = vendorBySlugDocs?.[0] || vendorById || vendorBySearch;
  const isLoadingVendor = isLoadingBySlug || (vendorBySlugDocs?.length === 0 && isLoadingById) || (vendorBySlugDocs?.length === 0 && !vendorById && isLoadingAll);
  
  useEffect(() => {
    if (vendor && !vendor.slug && firestore) {
      updateDoc(doc(firestore, 'parlours', vendor.id), { slug: slugify(vendor.name) }).catch(console.error);
    }
  }, [vendor, firestore]);

  const id = vendor?.id;

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

  const handleSyncSlug = async () => {
    if (!firestore || !id || !vendor) return;
    try {
      const newSlug = slugify(vendor.name);
      await updateDoc(doc(firestore, 'parlours', id), { slug: newSlug });
      window.location.href = `/vendors/${newSlug}`;
    } catch (e) {
      console.error("Error syncing slug:", e);
    }
  };

  const handleClearDummyData = async () => {
    if (!firestore || !id || !vendor) return;
    setIsCleaning(true);
    try {
      const batch = writeBatch(firestore);
      const pQuery = query(collection(firestore, 'products'), where('vendorId', '==', id), where('isDummy', '==', true));
      const pSnap = await getDocs(pQuery);
      pSnap.forEach(doc => batch.delete(doc.ref));
      const dQuery = query(collection(firestore, 'deals'), where('parlourId', '==', id), where('isDummy', '==', true));
      const dSnap = await getDocs(dQuery);
      dSnap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error("Error clearing dummy data:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  const handlePopulateDummyData = async () => {
    if (!firestore || !id || !vendor) return;
    setIsPopulating(true);
    try {
      const batch = writeBatch(firestore);
      const dummyProducts = [
        { name: 'Radiance Elixir', brand: 'Artisan Essentials', price: 120, basePrice: 150, category: 'Skincare', description: 'Glow from within.' },
        { name: 'Silk Infusion Serum', brand: 'Artisan Essentials', price: 85, basePrice: 110, category: 'Haircare', description: 'Smooth as silk.' },
        { name: 'Velvet Matte Lip', brand: 'Couture Color', price: 45, basePrice: 65, category: 'Makeup', description: 'Long lasting elegance.' },
        { name: 'Ocean Mist Toner', brand: 'Pure Botanicals', price: 60, basePrice: 75, category: 'Skincare', description: 'Refreshing as the sea.' },
      ];
      dummyProducts.forEach(p => {
        const ref = doc(collection(firestore, 'products'));
        batch.set(ref, {
          ...p,
          id: ref.id,
          vendorId: id,
          vendorName: vendor.name,
          imageUrl: `https://picsum.photos/seed/${ref.id}/600/800`,
          isDummy: true,
          createdAt: serverTimestamp()
        });
      });
      const dummyDeals = [
        { name: 'Signature Rejuvenation', category: 'Package', basePrice: 450, discountPrice: 299, description: 'Full body transformation.' },
        { name: 'Artisan Glow Up', category: 'Combo', basePrice: 200, discountPrice: 149, description: 'Facial and style combo.' },
      ];
      dummyDeals.forEach(d => {
        const ref = doc(collection(firestore, 'deals'));
        batch.set(ref, {
          ...d,
          id: ref.id,
          parlourId: id,
          parlourName: vendor.name,
          isDummy: true,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error populating dummy data:", error);
    } finally {
      setIsPopulating(false);
    }
  };

  if (!isMounted || isLoadingVendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!vendor) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 pt-20 px-6 text-center">
      <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
        <Navigation className="h-12 w-12 text-primary/20" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-headline italic text-primary">Sanctuary Not Found</h1>
        <p className="text-muted-foreground italic text-lg max-w-md mx-auto">This artisan may have moved or is waiting for a registry URL optimization.</p>
      </div>
      <div className="max-w-xs w-full space-y-4">
        <div className="p-1 rounded-full bg-primary/5 flex items-center gap-2">
           <Input id="manual-id" placeholder="Enter Artisan ID..." className="border-none bg-transparent rounded-full font-body italic" />
           <Button className="rounded-full h-10 px-6 font-black uppercase tracking-widest text-[9px]" onClick={() => {
             const val = (document.getElementById('manual-id') as HTMLInputElement).value;
             if (val) window.location.href = `/vendors/${val}`;
           }}>Go</Button>
        </div>
        <Button asChild variant="ghost" className="w-full rounded-full text-xs font-bold uppercase tracking-widest"><Link href="/vendors">Back to Sanctuaries</Link></Button>
      </div>
    </div>
  );

  const isFav = isFavoriteVendor(vendor.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-32">
        <section className="relative h-[85vh] md:h-[90vh] flex items-center justify-start pb-12 md:pb-24 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Carousel plugins={[plugin.current]} className="w-full h-full" opts={{ loop: true }}>
              <CarouselContent className="h-full -ml-0">
                {(vendor.imageUrls && vendor.imageUrls.length > 0 ? vendor.imageUrls : ['https://picsum.photos/seed/vendor-fallback/1200/800']).map((img: string, index: number) => (
                  <CarouselItem key={index} className="pl-0 h-full relative">
                    <Image src={img} alt={`${vendor.name} ${index + 1}`} fill className="object-cover soft-focus brightness-[0.7] md:brightness-[0.75]" priority={index === 0} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none z-10 h-48" />
          <div className="container mx-auto px-6 relative z-20 mt-20">
             <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full shadow-2xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Elite Artisan Registry</span>
                    </div>
                    <Badge className="bg-primary/20 backdrop-blur-xl text-white border-white/20 text-[9px] uppercase font-black px-4 py-2 tracking-widest rounded-full shadow-lg">Verified Studio</Badge>
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-[8rem] font-headline tracking-tighter italic text-white leading-tight drop-shadow-2xl">
                      {vendor.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl">
                        <MapPin className="h-5 w-5 text-rose-400" /> <span className="text-xs font-bold uppercase tracking-widest">{vendor.areaTag}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl">
                        <Star className="h-5 w-5 fill-accent text-accent" /> <span className="text-xs font-bold uppercase tracking-widest">{vendor.rating} Artisan Rating</span>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <Button asChild className="rounded-full bg-white text-primary hover:bg-white/90 h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl">
                          <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                            <MessageCircle className="h-5 w-5 mr-3" /> Chat with Parlour
                          </Link>
                        </Button>
                        <Button onClick={() => toggleFavoriteVendor(vendor.id)} className={cn("rounded-full h-14 w-14 p-0 backdrop-blur-md transition-all shadow-xl", isFav ? "bg-accent text-accent-foreground border-none" : "bg-white/10 text-white border border-white/20 hover:bg-white/30")}>
                          <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 md:py-32 space-y-24 md:space-y-40">
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
                {(vendorDeals || []).map((deal) => {
                  const hasDiscount = deal.basePrice && deal.basePrice > deal.discountPrice;
                  const discountPercent = hasDiscount ? Math.round((1 - deal.discountPrice / deal.basePrice) * 100) : 0;
                  return (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="group">
                      <Card className="rounded-[3.5rem] border-none bg-white dark:bg-black/20 flex flex-col md:flex-row overflow-hidden hover:shadow-3xl transition-all duration-700 ring-1 ring-primary/5 shadow-2xl relative">
                        {hasDiscount && (
                          <div className="absolute top-8 left-8 bg-secondary text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-xl z-20">
                            {discountPercent}% Off
                          </div>
                        )}
                        <div className="relative w-full md:w-80 h-80 overflow-hidden">
                          <Image src={`https://picsum.photos/seed/deal-${deal.id}/800/800`} alt={deal.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-105" />
                        </div>
                        <CardHeader className="flex-grow p-12 space-y-8">
                           <div className="space-y-3">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{deal.category}</p>
                             <CardTitle className="text-4xl font-headline italic leading-none text-primary">{deal.name}</CardTitle>
                           </div>
                           <div className="flex justify-between items-baseline pt-6 border-t border-primary/5">
                              <div className="flex flex-col">
                                <span className="text-4xl font-bold italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                                {hasDiscount && (
                                  <span className="text-xs text-muted-foreground line-through opacity-40">{getCurrency()} {deal.basePrice.toLocaleString()}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-foreground group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                Book Slot <ArrowRight className="h-4 w-4" />
                              </div>
                           </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/10">
                <p className="italic text-muted-foreground text-xl">No active signature transformations at this time.</p>
                <Button variant="ghost" className="mt-4 rounded-full" onClick={handlePopulateDummyData} disabled={isPopulating}>
                   <PlusCircle className="h-4 w-4 mr-2" /> {isPopulating ? 'Populating...' : 'Generate Artisan Data'}
                </Button>
              </div>
            )}
          </div>

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
                {(vendorProducts || []).map((product) => {
                  const hasDiscount = product.basePrice && product.basePrice > product.price;
                  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.basePrice) * 100) : 0;
                  return (
                    <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-8 relative">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] bg-white dark:bg-black/20 ring-1 ring-primary/5 shadow-2xl transition-all duration-700 hover:shadow-3xl">
                        <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/800`} alt={product.name} fill className="object-cover soft-focus transition-transform duration-1000 group-hover:scale-110" />
                        {hasDiscount && (
                          <div className="absolute top-6 left-6 bg-secondary text-primary px-3 py-1 text-[8px] font-bold uppercase tracking-widest shadow-xl z-20">
                            {discountPercent}% Off
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">{product.brand}</p>
                        <h4 className="font-headline text-3xl italic leading-none text-primary">{product.name}</h4>
                        <div className="flex flex-col items-center">
                          <p className="font-bold text-xl tracking-tighter text-accent-foreground">{getCurrency()} {product.price.toLocaleString()}</p>
                          {hasDiscount && (
                            <p className="text-[10px] text-muted-foreground line-through opacity-40">{getCurrency()} {product.basePrice.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/10">
                <p className="italic text-muted-foreground text-xl">The boutique is currently being curated.</p>
                <Button variant="ghost" className="mt-4 rounded-full" onClick={handlePopulateDummyData} disabled={isPopulating}>
                   <PlusCircle className="h-4 w-4 mr-2" /> {isPopulating ? 'Populating...' : 'Generate Boutique Data'}
                </Button>
              </div>
            )}
          </div>

          <div className="pt-20 border-t border-primary/5 flex flex-col items-center space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-headline italic text-primary/40">Studio Management</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-primary/20">Artisan Administrative Controls</p>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button variant="outline" className="rounded-full border-primary/10 text-primary/60 hover:bg-destructive hover:text-white transition-all h-12 px-8 text-[10px] font-black uppercase tracking-widest" onClick={handleClearDummyData} disabled={isCleaning}>
                <Trash2 className="h-4 w-4 mr-2" /> {isCleaning ? 'Removing...' : 'Remove Dummy Data'}
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 text-primary/60 hover:bg-primary hover:text-white transition-all h-12 px-8 text-[10px] font-black uppercase tracking-widest" onClick={handlePopulateDummyData} disabled={isPopulating}>
                <PlusCircle className="h-4 w-4 mr-2" /> {isPopulating ? 'Populating...' : 'Seed Dummy Data'}
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 text-primary/60 hover:bg-accent hover:text-white transition-all h-12 px-8 text-[10px] font-black uppercase tracking-widest" onClick={handleSyncSlug}>
                <RefreshCw className="h-4 w-4 mr-2" /> Optimize Registry URL
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
