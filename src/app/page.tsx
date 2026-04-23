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

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(6));
  }, [firestore]);

  const { data: deals, isLoading: isLoadingDeals } = useCollection(dealsQuery);

  const nearbyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), limit(3));
  }, [firestore]);

  const { data: nearbyVendors, isLoading: isLoadingNearby } = useCollection(nearbyQuery);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-[100vw] overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-luxury-nature/1200/800" 
              alt="Elite Beauty" 
              fill 
              className="object-cover brightness-[0.7] dark:brightness-[0.4]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-2xl space-y-6">
              <Badge className="bg-secondary/60 text-primary backdrop-blur-md px-4 py-1.5 uppercase tracking-widest text-[9px] font-black border border-white/10 rounded-full">
                <Sparkles className="h-3 w-3 mr-2 inline text-accent-foreground" /> Best Beauty Deals
              </Badge>
              <h1 className="text-5xl md:text-7xl font-headline leading-none text-white tracking-tighter">
                Look <br />
                <span className="italic text-secondary">Great.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-body max-w-xl italic leading-relaxed">
                The best place for makeup and parlour services in Pakistan & India.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg">
                  <Link href="/deals">Book Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                  <Link href="/shop">Buy Makeup</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Registry Ranking Section */}
        <section className="py-16 md:py-24 bg-accent/20 dark:bg-white/5 border-b border-border/5">
          <div className="container mx-auto px-6">
            <header className="max-w-3xl mb-12 space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-4xl md:text-5xl font-headline tracking-tighter text-primary italic leading-none">The Elite Registry</h2>
              </div>
              <p className="text-base text-muted-foreground italic font-body">
                Our most prestigious sanctuaries, ranked exclusively by guests with a <span className="text-primary font-bold">confirmed service history</span>.
              </p>
            </header>

            <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x">
              {isLoadingElite ? (
                [1, 2, 3].map(n => <div key={n} className="w-[280px] md:w-[360px] h-[400px] rounded-[2.5rem] bg-muted animate-pulse shrink-0" />)
              ) : rankedVendors?.map((vendor, index) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group relative shrink-0 w-[280px] md:w-[360px] snap-start">
                  <div className="absolute -top-3 -left-3 z-10">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline text-xl italic shadow-lg ring-2 ring-background">
                      #{index + 1}
                    </div>
                  </div>
                  <Card className="rounded-[2.5rem] border-none bg-white dark:bg-black/40 p-6 space-y-4 shadow-md transition-all hover:scale-[1.01] ring-1 ring-primary/5 h-full">
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-2 bg-muted">
                      <Image 
                        src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/elite-placeholder/600/400'} 
                        alt={vendor.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-headline italic text-primary leading-none">{vendor.name}</h3>
                        <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/10 text-primary text-[7px] font-black uppercase tracking-widest">
                          {vendor.rating}
                        </Badge>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/5">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest">
                          <ShieldCheck className="h-3 w-3 text-rose-500" /> Verified Score
                        </div>
                        <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">
                          Based on confirmed high-end check-ins.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-2.5 w-2.5", s <= Math.floor(vendor.rating) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/30 italic">Details</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Parlours */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-headline tracking-tighter text-primary italic">Nearby Parlours</h2>
                <p className="text-muted-foreground text-xs italic">Top studios in your region.</p>
              </div>
              <Link href="/vendors" className="group flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                See All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {isLoadingNearby ? (
                [1, 2, 3].map(n => <div key={n} className="aspect-[16/10] rounded-[2rem] bg-muted animate-pulse" />)
              ) : nearbyVendors?.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group interactive-element">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] shadow-lg ring-1 ring-black/5 bg-muted">
                    <Image 
                      src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/nearby-placeholder/600/400'} 
                      alt={vendor.name} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 dark:bg-black/80 text-primary border-none text-[7px] font-black px-3 py-1.5 shadow-md uppercase tracking-widest backdrop-blur-sm rounded-full">
                        {vendor.areaTag}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4 px-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-headline italic leading-none text-primary">{vendor.name}</h3>
                      <div className="flex items-center gap-1 text-[9px] font-black text-accent-foreground uppercase">
                        <Star className="h-3 w-3 fill-accent-foreground" /> {vendor.rating}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best Deals */}
        <section className="py-16 md:py-24 bg-secondary/10 dark:bg-white/5 border-y border-border/5">
          <div className="container mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-4xl font-headline tracking-tighter text-primary italic leading-none">Best Beauty Deals</h2>
              <p className="text-accent-foreground italic text-xs mt-2">Curated special offers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {isLoadingDeals ? (
                 [1, 2, 3].map(n => <div key={n} className="h-80 rounded-[2.5rem] bg-muted animate-pulse" />)
              ) : deals?.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block interactive-element">
                  <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-md h-full flex flex-col bg-white dark:bg-black/40">
                    <div className="relative h-64 overflow-hidden bg-muted">
                      <Image 
                        src={`https://picsum.photos/seed/deal-${deal.id}/600/400`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-8 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-accent-foreground/60">{deal.category}</p>
                        <h3 className="text-3xl font-headline leading-tight italic text-primary">{deal.name}</h3>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-border/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-black text-muted-foreground">Starts At</span>
                          <span className="text-2xl font-bold text-accent-foreground italic">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                          <ArrowRight className="h-5 w-5" />
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

      <footer className="py-16 border-t bg-background">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
              <span className="font-headline text-2xl tracking-tighter text-primary italic">GlamLux</span>
            </div>
            <p className="text-xs text-muted-foreground font-body italic leading-relaxed max-w-sm">
              The premium marketplace for professional beauty and artistry. Excellence delivered daily.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Help</h4>
            <ul className="space-y-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/portal" className="hover:text-accent-foreground transition-colors">Owner Area</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Support</Link></li>
              <li><Link href="/messages" className="hover:text-accent-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Explore</h4>
            <ul className="space-y-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/deals" className="hover:text-accent-foreground transition-colors">Deals</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Shop</Link></li>
              <li><Link href="/vendors" className="hover:text-accent-foreground transition-colors">Parlours</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-accent-foreground/20">GlamLux • MMXXIV</p>
        </div>
      </footer>
    </div>
  );
}
