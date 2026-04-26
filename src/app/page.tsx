'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { getCurrency } = useStore();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const eliteQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), orderBy('rating', 'desc'), limit(3));
  }, [firestore]);

  const { data: rankedVendors, isLoading: isLoadingElite } = useCollection(eliteQuery);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(6));
  }, [firestore]);

  const { data: services, isLoading: isLoadingServices } = useCollection(servicesQuery);

  const nearbyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), limit(3));
  }, [firestore]);

  const { data: nearbyVendors, isLoading: isLoadingNearby } = useCollection(nearbyQuery);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-luxury-nature/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover brightness-[0.7] dark:brightness-[0.4]"
              priority
              data-ai-hint="luxury beauty"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-10" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-20">
            <div className="max-w-2xl space-y-6">
              <Badge className="bg-secondary/20 text-white backdrop-blur-xl px-4 py-1.5 uppercase tracking-widest text-[8px] font-black border border-white/20 rounded-full shadow-2xl">
                <Sparkles className="h-3 w-3 mr-2 inline text-accent" /> THE ARTISAN COLLECTION
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline leading-[0.9] text-white tracking-tighter drop-shadow-2xl">
                True <br />
                <span className="italic text-secondary">Elegance.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-body max-w-xl italic leading-relaxed drop-shadow-md">
                The premier destination for professional artistry across Pakistan & India.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl transition-all hover:scale-105">
                  <Link href="/deals">Book Services</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/5 backdrop-blur-xl text-white rounded-full px-10 h-14 font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10">
                  <Link href="/shop">Boutique Store</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Registry Ranking Section */}
        <section className="py-24 md:py-32 bg-accent/5 border-b border-primary/5">
          <div className="container mx-auto px-4 md:px-6">
            <header className="max-w-4xl mb-20 space-y-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Trophy className="h-10 w-10 text-primary" />
                <h2 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary italic leading-none">The Elite Registry</h2>
              </div>
              <p className="text-lg text-muted-foreground italic font-body max-w-2xl leading-relaxed mx-auto md:mx-0">
                Our most prestigious sanctuaries, ranked exclusively by guests with a <span className="text-primary font-bold border-b border-primary/20">confirmed history of excellence</span>.
              </p>
            </header>

            <div className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
              {isLoadingElite ? (
                [1, 2, 3].map(n => <Skeleton key={n} className="w-[280px] md:w-[400px] h-[500px] rounded-[3rem] shrink-0" />)
              ) : rankedVendors?.map((vendor, index) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group relative shrink-0 w-[280px] md:w-[400px] snap-start">
                  <div className="absolute -top-4 -left-4 z-10">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline text-xl italic shadow-2xl ring-4 ring-background">
                      #{index + 1}
                    </div>
                  </div>
                  <Card className="rounded-[3rem] border-none bg-white dark:bg-black/40 p-6 space-y-6 shadow-2xl transition-all duration-700 hover:scale-[1.02] ring-1 ring-primary/5 h-full">
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-muted">
                      <Image 
                        src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/elite-placeholder/800/600'} 
                        alt={vendor.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        data-ai-hint="elite parlour"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-headline italic text-primary leading-tight">{vendor.name}</h3>
                        <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1">
                          {vendor.rating}
                        </Badge>
                      </div>
                      
                      <div className="p-4 rounded-[1.5rem] bg-primary/5 border border-primary/5">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest">
                          <ShieldCheck className="h-3.5 w-3.5 text-rose-500" /> Verified Artisan Score
                        </div>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed mt-1">
                          Authenticated by verified completions.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-3 w-3", s <= Math.floor(vendor.rating) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/30 italic group-hover:text-primary transition-colors">View Profile</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Parlours */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <Badge className="bg-primary/5 text-primary border-none text-[9px] uppercase font-black px-3 py-1 rounded-full mb-2">Regional Selection</Badge>
                <h2 className="text-4xl md:text-6xl font-headline tracking-tighter text-primary italic leading-none">Nearby Sanctuaries</h2>
              </div>
              <Link href="/vendors" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent-foreground mb-4 border-b border-accent/20 pb-1">
                SEE ALL <ArrowRight className="h-3 h-3 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {isLoadingNearby ? (
                [1, 2, 3].map(n => <Skeleton key={n} className="aspect-[4/3] rounded-[2.5rem]" />)
              ) : nearbyVendors?.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group interactive-element">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 bg-muted transition-all duration-700 hover:shadow-3xl">
                    <Image 
                      src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/nearby-placeholder/800/600'} 
                      alt={vendor.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      data-ai-hint="beauty sanctuary"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/95 dark:bg-black/80 text-primary border-none text-[9px] font-black px-4 py-1.5 shadow-2xl uppercase tracking-widest backdrop-blur-xl rounded-full">
                        {vendor.areaTag}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-6 px-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-headline italic leading-none text-primary">{vendor.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] font-black text-accent-foreground uppercase tracking-widest">
                        <Star className="h-3 w-3 fill-accent-foreground" /> {vendor.rating}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best Services */}
        <section className="py-20 md:py-32 bg-secondary/10 border-y border-primary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 text-center md:text-left">
              <Badge className="bg-accent/10 text-accent-foreground border-none text-[9px] uppercase font-black px-3 py-1 rounded-full mb-3">Limited Availability</Badge>
              <h2 className="text-4xl md:text-6xl font-headline tracking-tighter text-primary italic leading-none">Elite Transformations</h2>
              <p className="text-base text-muted-foreground italic mt-3 max-w-xl">Exclusively curated signature service offers from our top-tier artisan partners.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {isLoadingServices ? (
                 [1, 2, 3].map(n => <Skeleton key={n} className="h-[400px] rounded-[3rem]" />)
              ) : services?.map((service) => (
                <Link key={service.id} href={`/deals/${service.id}`} className="group block interactive-element">
                  <Card className="rounded-[3rem] overflow-hidden border-none shadow-2xl h-full flex flex-col bg-white dark:bg-black/40 transition-all duration-700 hover:shadow-3xl">
                    <div className="relative h-72 overflow-hidden bg-muted">
                      <Image 
                        src={`https://picsum.photos/seed/deal-${service.id}/800/600`} 
                        alt={service.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                        data-ai-hint="beauty transformation"
                      />
                    </div>
                    <div className="p-8 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-accent-foreground/60">{service.category}</p>
                        <h3 className="text-2xl font-headline leading-tight italic text-primary">{service.name}</h3>
                      </div>
                      <div className="flex justify-between items-end pt-6 border-t border-primary/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-black text-muted-foreground tracking-widest mb-1">Booking From</span>
                          <span className="text-2xl font-bold text-accent-foreground italic tracking-tighter">{getCurrency()} {service.discountPrice.toLocaleString()}</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-3xl group-hover:scale-110 transition-transform">
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t bg-background">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
              <span className="font-headline text-3xl tracking-tighter text-primary italic">GlamLux</span>
            </div>
            <p className="text-xs text-muted-foreground font-body italic leading-relaxed max-w-sm">
              The premier marketplace for top-tier beauty sanctuaries and professional artistry. Excellence delivered with every service.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">RESOURCES</h4>
            <ul className="space-y-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              <li><Link href="/portal" className="hover:text-accent-foreground transition-colors">Business Portal</Link></li>
              <li><Link href="/messages" className="hover:text-accent-foreground transition-colors">Artisan Support</Link></li>
              <li><Link href="/messages" className="hover:text-accent-foreground transition-colors">Client Relations</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">COLLECTIONS</h4>
            <ul className="space-y-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              <li><Link href="/deals" className="hover:text-accent-foreground transition-colors">Artisan Services</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Boutique Store</Link></li>
              <li><Link href="/vendors" className="hover:text-accent-foreground transition-colors">Elite Registry</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-16 text-center border-t border-primary/5 pt-10">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-accent-foreground/30">GLAMLUX • CURATORS OF ELEGANCE • MMXXIV</p>
        </div>
      </footer>
    </div>
  );
}
