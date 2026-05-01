'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, ShieldCheck, Trophy, MapPin } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { cn, slugify } from '@/lib/utils';
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
        <section className="relative h-[80vh] md:h-[100vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/editorial-beauty/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover brightness-[0.6]"
              priority
              data-ai-hint="high fashion"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-3xl space-y-10">
              <div className="space-y-4">
                <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px] block">The Editorial Registry</span>
                <h1 className="text-6xl md:text-[8rem] font-headline leading-[0.85] text-white tracking-tighter">
                  PURE <br />
                  <span className="text-secondary italic">ESTHETIC.</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/80 font-body max-w-xl leading-relaxed">
                A structured collection of the most prestigious artisan sanctuaries across the subcontinent.
              </p>
              <div className="flex flex-wrap gap-6 pt-6">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-secondary hover:text-white rounded-none border-none px-12 h-16 font-bold uppercase tracking-[0.3em] text-xs">
                  <Link href="/deals">The Services</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/40 text-white rounded-none px-12 h-16 font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-black">
                  <Link href="/shop">The Boutique</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* The Elite Registry */}
        <section className="py-32 bg-white dark:bg-black/20 border-y border-primary/5">
          <div className="container mx-auto px-6">
            <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="space-y-4">
                <Trophy className="h-8 w-8 text-secondary" />
                <h2 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary">The Ranking</h2>
                <p className="text-lg text-muted-foreground max-w-xl font-body">
                  Authenticated sanctuaries, selected by confirmed guests for their uncompromising commitment to precision.
                </p>
              </div>
              <Link href="/vendors" className="text-[11px] font-bold uppercase tracking-[0.4em] border-b-2 border-secondary pb-2 mb-2">View Registry</Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-primary/10">
              {isLoadingElite ? (
                [1, 2, 3].map(n => <Skeleton key={n} className="h-[600px] border-r border-primary/10" />)
              ) : (
                rankedVendors?.map((vendor, index) => {
                  const vendorSlug = vendor.slug || slugify(vendor.name);
                  return (
                    <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group relative border-r last:border-r-0 border-primary/10">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image 
                          src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/elite-1/800/1000'} 
                          alt={vendor.name} 
                          fill 
                          className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute top-0 left-0 bg-primary text-white px-6 py-4 font-headline text-3xl italic">
                          0{index + 1}
                        </div>
                      </div>
                      <div className="p-10 space-y-4 bg-white dark:bg-card">
                        <h3 className="text-3xl font-headline tracking-tight text-primary">{vendor.name}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-2"><MapPin className="h-3 w-3 text-secondary" /> {vendor.areaTag}</span>
                          <span className="flex items-center gap-2"><Star className="h-3 w-3 fill-secondary text-secondary" /> {vendor.rating}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Featured Transformations */}
        <section className="py-32 bg-background">
          <div className="container mx-auto px-6">
            <header className="mb-24 space-y-4">
              <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px]">Season 2024</span>
              <h2 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary italic">Signature Edits</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {isLoadingServices ? (
                 [1, 2, 3].map(n => <Skeleton key={n} className="h-[500px]" />)
              ) : (
                services?.map((service) => (
                  <Link key={service.id} href={`/deals/${service.id}`} className="group">
                    <article className="space-y-6">
                      <div className="relative aspect-square overflow-hidden bg-muted border border-primary/5">
                        <Image 
                          src={`https://picsum.photos/seed/service-${service.id}/800/800`} 
                          alt={service.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute bottom-0 right-0 bg-white dark:bg-black px-6 py-4 text-2xl font-bold italic tracking-tighter text-primary">
                          {getCurrency()} {service.discountPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">{service.category}</span>
                        <h3 className="text-3xl font-headline leading-none text-primary group-hover:underline underline-offset-8 decoration-secondary/30">{service.name}</h3>
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-32 bg-primary text-white border-t border-white/5">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <h4 className="font-headline text-5xl italic tracking-tighter">GlamLux.</h4>
            <p className="text-sm text-white/60 font-body leading-relaxed max-w-sm">
              The premier marketplace for elite beauty sanctuaries and professional artistry essentials. Designed for the precise.
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary">Registry</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-white/40">
              <li><Link href="/vendors" className="hover:text-secondary transition-colors">Sanctuaries</Link></li>
              <li><Link href="/deals" className="hover:text-secondary transition-colors">Service Edits</Link></li>
              <li><Link href="/shop" className="hover:text-secondary transition-colors">The Boutique</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary">Inquiries</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-white/40">
              <li><Link href="/portal" className="hover:text-secondary transition-colors">Partnership</Link></li>
              <li><Link href="/messages" className="hover:text-secondary transition-colors">Support</Link></li>
              <li><Link href="/messages" className="hover:text-secondary transition-colors">Relations</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/20">© MMXXIV GLAMLUX ARTISAN REGISTRY</p>
          <div className="flex gap-10 text-[9px] font-bold uppercase tracking-[0.5em] text-white/20">
            <span>London</span>
            <span>Lahore</span>
            <span>Delhi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
