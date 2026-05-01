'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Search, ArrowRight, Heart, Sparkles, Percent } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendorsPage() {
  const { getCurrency, isFavoriteVendor, toggleFavoriteVendor } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), orderBy('rating', 'desc'));
  }, [firestore]);

  const { data: vendors, isLoading } = useCollection(vendorsQuery);

  useEffect(() => {
    if (isMounted && vendors && firestore) {
      vendors.forEach(v => {
        if (!v.slug && v.name) {
          const newSlug = slugify(v.name);
          updateDoc(doc(firestore, 'parlours', v.id), { slug: newSlug }).catch(console.error);
        }
      });
    }
  }, [isMounted, vendors, firestore]);

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(10));
  }, [firestore]);

  const { data: featuredDeals, isLoading: isLoadingDeals } = useCollection(dealsQuery);

  const uniqueAreas = ['All', ...Array.from(new Set((vendors || []).map(v => v.areaTag?.split(',').pop()?.trim() || v.areaTag).filter(Boolean)))];

  const filteredVendors = (vendors || []).filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.areaTag?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'All' || v.areaTag?.includes(areaFilter);
    return matchesSearch && matchesArea;
  });

  const handleFavoriteToggle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteVendor(id);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-14 md:pt-24 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-20 md:py-32">
        <header className="max-w-5xl mb-32 space-y-8">
          <div className="space-y-4">
             <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">The Directory</span>
             <h1 className="text-7xl md:text-[9rem] font-headline text-primary tracking-tighter leading-[0.85] italic">Sanctuary <br />Registry.</h1>
          </div>
          <p className="text-xl text-muted-foreground font-body max-w-2xl leading-relaxed">
            The most prestigious beauty sanctuaries and independent artists, audited and verified for professional excellence.
          </p>
        </header>

        {/* Featured Combinations */}
        <section className="mb-40 space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/10 pb-10">
             <div className="space-y-2">
               <h2 className="text-4xl font-headline tracking-tighter text-primary">Artisan Selection</h2>
               <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-secondary">Limited Signature Packages</p>
             </div>
             <Link href="/deals" className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-secondary transition-colors">See All Transformations</Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide -mx-6 px-6 snap-x">
             {isLoadingDeals ? (
               [1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-96 shrink-0" />)
             ) : featuredDeals?.map((deal) => (
               <Link key={deal.id} href={`/deals/${deal.id}`} className="snap-start shrink-0 group">
                 <article className="w-96 space-y-6">
                   <div className="relative h-60 overflow-hidden border border-primary/5">
                     <Image 
                       src={`https://picsum.photos/seed/vogue-deal-${deal.id}/800/600`} 
                       alt={deal.name} 
                       fill 
                       className="object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                     <div className="absolute top-0 right-0 bg-secondary text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                       {Math.round((1 - deal.discountPrice / deal.basePrice) * 100)}% Discount
                     </div>
                   </div>
                   <div className="space-y-2">
                      <h3 className="font-headline text-3xl text-primary">{deal.name}</h3>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl font-bold italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice?.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through decoration-primary/20">{getCurrency()} {deal.basePrice?.toLocaleString()}</span>
                      </div>
                   </div>
                 </article>
               </Link>
             ))}
          </div>
        </section>

        {/* Filter Registry */}
        <section className="mb-24 flex flex-col md:flex-row gap-0 border border-primary/10">
          <div className="relative flex-grow border-r border-primary/10">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search registry by name or area..." 
              className="pl-20 h-20 bg-transparent border-none rounded-none font-body text-lg italic focus-visible:ring-0 text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto min-w-[300px]">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="h-20 w-full border-none rounded-none font-bold text-[10px] uppercase tracking-[0.4em] px-10 bg-white dark:bg-card">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-body border-primary/10 shadow-none">
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area} className="font-bold text-[10px] uppercase tracking-widest">{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((n) => <Skeleton key={n} className="h-[600px]" />)}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {filteredVendors.map((vendor) => {
              const isFav = isFavoriteVendor(vendor.id);
              const vendorSlug = vendor.slug || slugify(vendor.name);
              return (
                <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group block">
                  <article className="space-y-10">
                    <div className="relative h-[450px] overflow-hidden border border-primary/5 bg-muted">
                      <Image 
                        src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/vogue-vendor/800/1000'} 
                        alt={vendor.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <button 
                        onClick={(e) => handleFavoriteToggle(e, vendor.id)}
                        className={cn(
                          "absolute top-6 right-6 h-12 w-12 flex items-center justify-center transition-all",
                          isFav ? "text-secondary" : "text-white hover:text-secondary"
                        )}
                      >
                        <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-secondary">
                        <MapPin className="h-3 w-3" />
                        {vendor.areaTag}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-headline tracking-tighter text-primary leading-none italic group-hover:underline underline-offset-8 decoration-primary/10">
                        {vendor.name}
                      </h3>
                      <div className="pt-6 border-t border-primary/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
                          <Star className="h-3 w-3 fill-secondary text-secondary" />
                          {vendor.rating} Artisan Rating
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center space-y-10 border border-dashed border-primary/10">
            <h3 className="text-5xl font-headline italic text-primary/30">Registry Empty.</h3>
            <p className="text-muted-foreground font-body italic text-lg">No artisan locations matched your search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
