
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowRight, Sparkles, Zap, Clock } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function DealsContent() {
  const { getCurrency } = useStore();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  
  const initialCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(40));
  }, [firestore]);

  const { data: services, isLoading } = useCollection(servicesQuery);

  const filteredServices = useMemo(() => {
    return (services || []).filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, categoryFilter]);

  // Flash deals are typically the first few or those with highest discount
  const flashDeals = useMemo(() => filteredServices.slice(0, 3), [filteredServices]);
  const regularDeals = useMemo(() => filteredServices.slice(3), [filteredServices]);

  const categories = ['All', 'Bridal', 'Hair', 'Skin', 'Nails', 'Spa'];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-44">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 pb-32 flex-grow max-w-screen-2xl">
        <header className="mb-24 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-3 bg-primary/5 px-4 py-2 border border-primary/10 rounded-full">
            <Sparkles className="h-4 w-4 text-primary fill-primary" strokeWidth={1} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Beauty Marketplace</span>
          </div>
          <h1 className="text-7xl md:text-[10rem] font-headline text-primary tracking-tighter italic leading-[0.8] drop-shadow-sm">Beauty <br />Services.</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl border-l-4 border-primary pl-8 py-2">
            Discover and book premium transformations from the best parlours in your area.
          </p>
        </header>

        {/* Search & Filter - Magazine Layout */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-0 border border-primary/10 shadow-3xl bg-white dark:bg-card/20 rounded-2xl overflow-hidden">
          <div className="md:col-span-8 relative border-r border-primary/10 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-primary transition-all" />
            <Input 
              placeholder="Search for a service..." 
              className="pl-20 h-20 bg-transparent border-none rounded-none font-body text-xl italic focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 group">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-20 w-full border-none rounded-none font-black text-[10px] uppercase tracking-[0.4em] px-10 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-body border-primary/10 shadow-xl bg-background">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-bold text-[10px] uppercase tracking-widest">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Flash Deals Section */}
        {!isLoading && flashDeals.length > 0 && (
          <section className="mb-32 space-y-10">
            <div className="flex items-center justify-between border-b-2 border-primary/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 rounded-2xl shadow-lg animate-pulse">
                  <Zap className="h-6 w-6 text-white fill-white" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-headline italic text-primary">Flash Deals</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Limited Time Offers
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {flashDeals.map((service) => (
                <Link 
                  key={service.id} 
                  href={`/deals/${service.id}`} 
                  className="group relative bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image 
                      src={`https://picsum.photos/seed/flash-${service.id}/800/600`} 
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <Badge className="bg-primary text-white border-none text-[10px] font-black px-4 py-2 uppercase shadow-xl rounded-full">
                        -{Math.round((1 - service.discountPrice / service.basePrice) * 100)}%
                      </Badge>
                      <Badge className="bg-white/90 backdrop-blur-md text-primary border-none text-[8px] font-black px-4 py-2 uppercase rounded-full shadow-lg">
                        Flash
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <h3 className="text-3xl font-headline italic leading-none text-primary truncate">{service.name}</h3>
                    <div className="flex justify-between items-end border-t border-primary/5 pt-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-through opacity-40">{getCurrency()} {service.basePrice?.toLocaleString()}</p>
                        <p className="text-3xl font-black text-primary tracking-tighter">{getCurrency()} {service.discountPrice?.toLocaleString()}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Regular Deals Section */}
        <section className="space-y-10">
          {!isLoading && (
            <div className="flex items-center gap-4 border-b-2 border-primary/10 pb-6 mb-10">
              <h2 className="text-4xl font-headline italic text-primary">All Services</h2>
              <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary font-bold">{filteredServices.length} Found</Badge>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map(n => <Skeleton key={n} className="h-[500px] rounded-[3rem]" />)}
            </div>
          ) : regularDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {regularDeals.map((service) => (
                <Link 
                  key={service.id} 
                  href={`/deals/${service.id}`} 
                  className="group relative bg-white dark:bg-card/40 rounded-[3rem] border border-primary/5 overflow-hidden hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 hover:scale-[1.01]"
                >
                  <div className="relative h-[350px] overflow-hidden">
                    <Image 
                      src={`https://picsum.photos/seed/deal-${service.id}/800/600`} 
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-white/95 backdrop-blur-xl text-primary border-none text-[8px] font-black px-4 py-2 tracking-[0.3em] rounded-full shadow-2xl">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-10 space-y-6">
                    <h3 className="text-4xl font-headline leading-[0.9] tracking-tighter italic text-primary">
                      {service.name}
                    </h3>
                    <div className="flex justify-between items-baseline pt-6 border-t border-primary/5">
                      <span className="text-3xl font-bold tracking-tighter text-primary">{getCurrency()} {service.discountPrice?.toLocaleString()}</span>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-primary group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all">
                        Book Now <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : filteredServices.length === 0 && (
            <div className="py-60 text-center space-y-12 border-2 border-dashed border-primary/10 rounded-[3rem] bg-primary/2">
              <div className="bg-primary/5 w-40 h-40 rounded-full flex items-center justify-center mx-auto border border-primary/10 shadow-inner">
                <Search className="h-16 w-16 text-primary/10" strokeWidth={1} />
              </div>
              <div className="space-y-4">
                <h3 className="text-6xl font-headline italic opacity-20 text-primary">Service Not Found</h3>
                <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">Search criteria did not yield any beauty transformations.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
    }>
      <DealsContent />
    </Suspense>
  );
}
