'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Search, ArrowRight, Heart, Sparkles, Percent } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { cn, slugify } from '@/lib/utils';
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
        <header className="max-w-5xl mb-32 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
               <Sparkles className="h-3 w-3 text-secondary fill-secondary" strokeWidth={1.5} />
               <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">The Directory</span>
             </div>
             <h1 className="text-7xl md:text-[9rem] font-headline text-primary tracking-tighter leading-[0.85] italic">Sanctuary <br />Registry.</h1>
          </div>
          <p className="text-xl text-muted-foreground font-body max-w-2xl leading-relaxed italic border-l-2 border-secondary pl-8">
            The most prestigious beauty sanctuaries and independent artists, audited and verified for professional excellence.
          </p>
        </header>

        {/* Featured Combinations */}
        <section className="mb-40 space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/10 pb-10">
             <div className="space-y-2">
               <div className="flex items-center gap-3">
                 <Percent className="h-5 w-5 text-secondary transition-all hover:scale-110" strokeWidth={2} />
                 <h2 className="text-4xl font-headline tracking-tighter text-primary">Artisan Selection</h2>
               </div>
               <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-secondary/60 ml-8">Limited Signature Packages</p>
             </div>
             <Link href="/deals" className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-secondary transition-all flex items-center gap-2 group">
               See All Transformations <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
             </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide -mx-6 px-6 snap-x group/scroll">
             {isLoadingDeals ? (
               [1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-96 shrink-0 rounded-none" />)
             ) : featuredDeals?.map((deal) => (
               <Link key={deal.id} href={`/deals/${deal.id}`} className="snap-start shrink-0 group relative overflow-hidden transition-all duration-700 hover:-translate-y-2">
                 <article className="w-96 space-y-6">
                   <div className="relative h-60 overflow-hidden border border-primary/5 shadow-lg group-hover:shadow-2xl transition-all duration-700">
                     <Image 
                       src={`https://picsum.photos/seed/vogue-deal-${deal.id}/800/600`} 
                       alt={deal.name} 
                       fill 
                       className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                     />
                     <div className="absolute top-0 right-0 bg-secondary text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-xl group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                       {Math.round((1 - deal.discountPrice / deal.basePrice) * 100)}% Discount
                     </div>
                   </div>
                   <div className="space-y-2 px-1">
                      <h3 className="font-headline text-3xl text-primary transition-all group-hover:translate-x-1">{deal.name}</h3>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl font-bold italic tracking-tighter text-primary">{getCurrency()} {deal.discountPrice?.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through decoration-primary/20 opacity-40">{getCurrency()} {deal.basePrice?.toLocaleString()}</span>
                      </div>
                   </div>
                 </article>
               </Link>
             ))}
          </div>
        </section>

        {/* Filter Registry */}
        <section className="mb-24 flex flex-col md:flex-row gap-0 border border-primary/10 shadow-2xl transition-all hover:shadow-3xl bg-white dark:bg-card">
          <div className="relative flex-grow border-r border-primary/10 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 group-focus-within:text-secondary group-focus-within:fill-secondary/10 transition-all" strokeWidth={1.5} />
            <Input 
              placeholder="Search registry by name or area..." 
              className="pl-20 h-20 bg-transparent border-none rounded-none font-body text-lg italic focus-visible:ring-0 text-primary placeholder:text-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto min-w-[300px] group">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="h-20 w-full border-none rounded-none font-bold text-[10px] uppercase tracking-[0.4em] px-10 bg-transparent transition-all group-hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-secondary group-hover:fill-secondary/20 transition-all" strokeWidth={1.5} />
                  <SelectValue placeholder="All Regions" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-none font-body border-primary/10 shadow-none animate-in zoom-in-95 duration-200">
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area} className="text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors">{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((n) => <Skeleton key={n} className="h-[600px] rounded-none" />)}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            {filteredVendors.map((vendor) => {
              const isFav = isFavoriteVendor(vendor.id);
              const vendorSlug = vendor.slug || slugify(vendor.name);
              return (
                <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group block relative hover:-translate-y-4 hover:shadow-3xl transition-all duration-500 z-10">
                  <article className="space-y-10">
                    <div className="relative h-[450px] overflow-hidden border border-primary/5 bg-muted shadow-xl transition-all duration-1000">
                      <Image 
                        src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/vogue-vendor/800/1000'} 
                        alt={vendor.name}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-110"
                      />
                      <button 
                        onClick={(e) => handleFavoriteToggle(e, vendor.id)}
                        className={cn(
                          "absolute top-6 right-6 h-12 w-12 flex items-center justify-center transition-all duration-500 backdrop-blur-md rounded-full shadow-2xl z-20 group-hover:scale-110 active:scale-95",
                          isFav ? "bg-accent text-accent-foreground border-none scale-110" : "bg-white/20 text-white border border-white/20 hover:bg-white/40"
                        )}
                      >
                        <Heart className={cn("h-6 w-6 transition-all", isFav && "fill-current")} strokeWidth={1.5} />
                      </button>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />
                    </div>
                    <div className="space-y-6 relative">
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-secondary group-hover:translate-x-2 transition-all duration-500">
                        <MapPin className="h-3.5 w-3.5 transition-all group-hover:fill-current" strokeWidth={1.5} />
                        {vendor.areaTag}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-headline tracking-tighter text-primary leading-none italic group-hover:underline underline-offset-8 decoration-primary/10 transition-all duration-500">
                        {vendor.name}
                      </h3>
                      <div className="pt-6 border-t border-primary/5 flex justify-between items-center group/footer">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary transition-colors duration-500">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary transition-all group-hover:scale-125" strokeWidth={1.5} />
                          {vendor.rating} Artisan Rating
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" strokeWidth={1.5} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center space-y-10 border border-dashed border-primary/10 bg-primary/5 group transition-all hover:bg-primary/[0.07]">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto transition-all group-hover:scale-110">
              <Search className="h-8 w-8 text-primary/20 transition-all group-hover:text-secondary group-hover:fill-secondary/10" strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-headline italic text-primary/30 leading-none">Registry Empty.</h3>
              <p className="text-muted-foreground font-body italic text-lg tracking-tight">No artisan locations matched your search criteria.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
