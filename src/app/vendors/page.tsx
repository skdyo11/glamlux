'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Search, ArrowRight, Navigation, Heart, Sparkles, Clock, Percent } from 'lucide-react';
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

  // Lazy Migration: Update slugs if missing when the list is loaded
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
    <div className="min-h-screen bg-background pt-20 md:pt-24 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-24">
        <header className="max-w-4xl mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Sanctuaries Registry</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic">Beauty <br /><span className="text-accent-foreground">Sanctuaries</span></h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            The most prestigious parlours and independent artists in your region, curated for professional results.
          </p>
        </header>

        {/* Featured Deals & Combo Section */}
        <section className="mb-24 space-y-8">
          <div className="flex items-center justify-between px-2">
             <div className="space-y-1">
               <h2 className="text-3xl md:text-4xl font-headline italic text-primary">Artisan Deals & Combos</h2>
               <p className="text-[10px] uppercase font-black tracking-widest text-primary/40">Limited Availability Discounts</p>
             </div>
             <Link href="/deals" className="text-[10px] font-black uppercase tracking-widest text-accent-foreground hover:underline">See All Deals</Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x">
             {isLoadingDeals ? (
               [1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-80 shrink-0 rounded-[2.5rem]" />)
             ) : featuredDeals?.map((deal) => (
               <Link key={deal.id} href={`/deals/${deal.id}`} className="snap-start shrink-0 group">
                 <Card className="w-80 h-full rounded-[2.5rem] border-none bg-white dark:bg-black/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all ring-1 ring-primary/5 flex flex-col">
                   <div className="relative h-40 overflow-hidden">
                     <Image 
                       src={`https://picsum.photos/seed/deal-${deal.id}/800/600`} 
                       alt={deal.name} 
                       fill 
                       className="object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                     <div className="absolute top-4 left-4">
                        <Badge className="bg-accent text-accent-foreground border-none text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                          <Percent className="h-2 w-2 mr-1 inline" /> {Math.round((1 - deal.discountPrice / deal.basePrice) * 100)}% OFF
                        </Badge>
                     </div>
                   </div>
                   <CardContent className="p-6 flex-grow space-y-3">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary/40">
                         <Clock className="h-2.5 w-2.5" /> Limited Combo
                      </div>
                      <h3 className="font-headline text-2xl italic text-primary truncate leading-tight">{deal.name}</h3>
                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-xl font-bold text-accent-foreground">{getCurrency()} {deal.discountPrice?.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground line-through opacity-40">{getCurrency()} {deal.basePrice?.toLocaleString()}</span>
                      </div>
                   </CardContent>
                 </Card>
               </Link>
             ))}
          </div>
        </section>

        {/* Filter Section */}
        <section className="mb-20 flex flex-col md:flex-row gap-6 items-center bg-white/20 dark:bg-white/5 p-6 md:p-8 rounded-[3rem] border border-white/30 dark:border-white/10 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/50">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search sanctuaries by name or area..." 
              className="pl-20 h-16 bg-white/40 dark:bg-white/5 border-none focus-visible:ring-primary/10 rounded-full font-body text-lg italic placeholder:text-muted-foreground/60 text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="h-16 w-full md:w-[240px] bg-white/40 dark:bg-white/5 border-none rounded-full font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-md text-primary px-10">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl font-body border border-border/10 shadow-2xl backdrop-blur-3xl bg-background/95">
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area} className="font-bold text-[10px] uppercase tracking-widest hover:bg-accent hover:text-accent-foreground">{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[500px] rounded-[3rem] bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {filteredVendors.map((vendor) => {
              const isFav = isFavoriteVendor(vendor.id);
              const vendorSlug = vendor.slug || slugify(vendor.name);
              return (
                <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group block interactive-element">
                  <Card className="overflow-hidden border-none bg-white/60 dark:bg-black/20 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-1000 rounded-[3rem] active:scale-[0.99] ring-1 ring-white/20 hover:ring-white/40 h-full flex flex-col">
                    <div className="relative h-80 md:h-96 overflow-hidden">
                      <Image 
                        src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/vendor/800/600'} 
                        alt={vendor.name}
                        fill
                        className="object-cover soft-focus group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute top-8 left-8 flex items-center gap-3">
                        <Badge className="bg-white/95 dark:bg-black/80 text-primary border border-white/20 text-[9px] uppercase font-black px-6 py-3 tracking-[0.2em] rounded-full shadow-2xl backdrop-blur-md">
                          Elite Partner
                        </Badge>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleFavoriteToggle(e, vendor.id)}
                        className={cn(
                          "absolute top-8 right-8 h-12 w-12 rounded-full backdrop-blur-md z-20 transition-all",
                          isFav ? "bg-primary text-primary-foreground" : "bg-white/20 text-white hover:bg-white/40"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                      </Button>
                    </div>
                    <CardHeader className="p-10 pb-6 space-y-4 flex-grow">
                      <div className="flex items-center gap-3 text-[10px] text-accent-foreground font-black uppercase tracking-[0.3em]">
                        <MapPin className="h-4 w-4 text-destructive" />
                        {vendor.areaTag}
                      </div>
                      <CardTitle className="text-4xl md:text-5xl font-headline group-hover:text-accent-foreground transition-colors leading-none italic text-primary">
                        {vendor.name}
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="mt-8 pt-8 border-t border-white/20 dark:border-white/5 flex justify-between items-center bg-white/10 dark:bg-white/5 px-10 h-24 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-accent-foreground tracking-widest">
                        <Star className="h-4 w-4 fill-accent-foreground" />
                        {vendor.rating} Registry
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] italic group-hover:translate-x-1 transition-transform">
                        Explore Profile <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-[3rem]">
            <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
              <Navigation className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic text-primary">Sanctuary Not Found</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">No artisan locations matched your search. Try a different region or studio name.</p>
          </div>
        )}
      </main>
    </div>
  );
}
