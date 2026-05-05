'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Trophy, MapPin, Sparkles } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { slugify } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function Home() {
  const { getCurrency } = useStore();
  const firestore = useFirestore();
  const { theme } = useTheme();
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

  if (!isMounted) return null;

  const isDark = theme === 'dark';

  const getIconProps = (filled = false) => ({
    strokeWidth: 1.8,
    fill: (isDark || filled) ? 'currentColor' : 'none'
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section - Compact Editorial */}
        <section className="relative min-h-[90vh] flex flex-col md:flex-row items-stretch overflow-hidden border-b border-primary/10">
          <div className="w-full md:w-[60%] relative min-h-[40vh] md:min-h-[90vh]">
            <Image 
              src="https://picsum.photos/seed/editorial-beauty-magazine/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover contrast-[1.1]"
              priority
              data-ai-hint="fashion portrait"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
          
          <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-16 bg-background relative border-l border-primary/10">
            <div className="max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3">
                  <span className="h-px w-8 bg-secondary" />
                  <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[9px]">Registry MMXXIV</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-headline leading-[0.85] tracking-tighter text-primary">
                  PURE <br />
                  <span className="italic text-secondary">ESTHETIC.</span>
                </h1>
                <p className="text-base text-muted-foreground font-body max-w-sm leading-relaxed italic pt-2">
                  A structured collection of the most prestigious artisan sanctuaries across the subcontinent.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-none border-none h-14 vogue-button shadow-none border-b-2 border-secondary/20">
                  <Link href="/deals" className="flex items-center justify-between w-full">The Services <ArrowRight {...getIconProps(true)} className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/10 text-primary rounded-none h-14 vogue-button hover:bg-primary hover:text-primary-foreground">
                  <Link href="/shop" className="flex items-center justify-between w-full">The Boutique <ArrowRight {...getIconProps()} className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
            
            <div className="absolute bottom-10 right-10 text-[8px] font-black uppercase tracking-[0.5em] text-primary/10 rotate-90 origin-right">
              Artisan Protocol • Verified
            </div>
          </div>
        </section>

        {/* The Elite Registry */}
        <section className="py-32 bg-white dark:bg-transparent">
          <div className="container mx-auto px-6">
            <header className="grid grid-cols-1 md:grid-cols-12 mb-24 items-end">
              <div className="md:col-span-8 space-y-6">
                <Trophy {...getIconProps()} className="h-8 w-8 text-secondary mb-4" />
                <h2 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary leading-none">The Index.</h2>
                <p className="text-lg text-muted-foreground max-w-md font-body italic border-l border-secondary/30 pl-8">
                  Confirmed guests for their uncompromising commitment to precision.
                </p>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Link href="/vendors" className="text-[10px] font-bold uppercase tracking-[0.4em] border-b-2 border-primary pb-2 hover:border-secondary hover:text-secondary transition-all flex items-center gap-4 group">
                  EXPLORE ALL SANCTUARIES <ArrowRight {...getIconProps()} className="h-3 w-3 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-0 border border-primary/5">
              {isLoadingElite ? (
                [1, 2, 3].map(n => <Skeleton key={n} className="md:col-span-4 h-[600px] border-r border-primary/5" />)
              ) : (
                rankedVendors?.map((vendor, index) => {
                  const vendorSlug = vendor.slug || slugify(vendor.name);
                  return (
                    <Link 
                      key={vendor.id} 
                      href={`/vendors/${vendorSlug}`} 
                      className={cn(
                        "group relative md:col-span-4 border-r last:border-r-0 border-primary/5 overflow-hidden bg-white dark:bg-card/30 p-10 transition-all duration-700 hover:bg-primary hover:text-primary-foreground hover:-translate-y-4 hover:shadow-3xl hover:z-20",
                        index === 1 && "md:mt-16 md:-mb-16 md:z-10 md:bg-background dark:md:bg-card border-x"
                      )}
                    >
                      <div className="space-y-10">
                        <div className="flex justify-between items-start">
                          <span className="font-headline text-4xl italic opacity-20 text-primary">0{index + 1}</span>
                          <div className="flex items-center gap-1 text-secondary">
                             <Star {...getIconProps(true)} className="h-3.5 w-3.5" />
                             <span className="text-[9px] font-bold uppercase tracking-widest">{vendor.rating}</span>
                          </div>
                        </div>
                        
                        <div className="relative aspect-[3/4] overflow-hidden transition-all duration-1000">
                          <Image 
                            src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/elite-1/800/1000'} 
                            alt={vendor.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-3xl font-headline tracking-tight">{vendor.name}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><MapPin {...getIconProps()} className="h-3 w-3 text-secondary" /> {vendor.areaTag}</span>
                            <span className="flex items-center gap-2"><Star {...getIconProps(true)} className="h-3 w-3 fill-secondary text-secondary" /> {vendor.rating}</span>
                          </div>
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
        <section className="py-32 bg-background border-t border-primary/10">
          <div className="container mx-auto px-6">
            <header className="mb-24 space-y-3 text-center">
              <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[9px]">Season MMXXIV</span>
              <h2 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary italic leading-none">Signature Edits.</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-primary/10">
              {isLoadingServices ? (
                 [1, 2, 3].map(n => <Skeleton key={n} className="h-[500px] border-r border-primary/10" />)
              ) : (
                services?.map((service, idx) => (
                  <Link 
                    key={service.id} 
                    href={`/deals/${service.id}`} 
                    className={cn(
                      "group relative p-10 border-r border-b border-primary/10 hover:bg-secondary/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl z-10",
                      (idx + 1) % 3 === 0 && "md:border-r-0"
                    )}
                  >
                    <article className="space-y-8">
                      <div className="relative aspect-square overflow-hidden bg-muted border border-primary/5 transition-all duration-700">
                        <Image 
                          src={`https://picsum.photos/seed/service-${service.id}/800/800`} 
                          alt={service.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-secondary">{service.category}</span>
                          <span className="text-lg font-bold tracking-tighter">{getCurrency()} {service.discountPrice.toLocaleString()}</span>
                        </div>
                        <h3 className="text-2xl font-headline leading-[0.9] text-primary group-hover:underline underline-offset-4 decoration-secondary/30 transition-all">{service.name}</h3>
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-6 space-y-8">
              <h4 className="font-headline text-6xl italic tracking-tighter leading-none">GlamLux.</h4>
              <p className="text-xs opacity-40 font-body leading-relaxed max-w-sm italic">
                The premier marketplace for elite beauty sanctuaries and professional artistry essentials. Designed for the precise.
              </p>
            </div>
            <div className="md:col-span-3 space-y-6">
              <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-secondary">Registry</h5>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-[0.2em] opacity-40">
                <li><Link href="/vendors" className="hover:text-secondary transition-all">Sanctuaries</Link></li>
                <li><Link href="/deals" className="hover:text-secondary transition-all">Service Edits</Link></li>
                <li><Link href="/shop" className="hover:text-secondary transition-all">The Boutique</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-6">
              <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-secondary">Inquiries</h5>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-[0.2em] opacity-40">
                <li><Link href="/portal" className="hover:text-secondary transition-all">Partnership</Link></li>
                <li><Link href="/messages" className="hover:text-secondary transition-all">Support</Link></li>
                <li><Link href="/messages" className="hover:text-secondary transition-all">Relations</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-20">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">© MMXXIV GLAMLUX ARTISAN REGISTRY</p>
            <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.5em]">
              <span>London</span>
              <span>Lahore</span>
              <span>Delhi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
