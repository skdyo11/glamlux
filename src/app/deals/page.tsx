'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, MapPin, Sparkles, Search, ArrowRight } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
  const { getCurrency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(20));
  }, [firestore]);

  const { data: services, isLoading } = useCollection(servicesQuery);

  const filteredServices = (services || []).filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Bridal', 'Hair', 'Skin'];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 md:pt-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 pb-32 flex-grow max-w-screen-2xl">
        <header className="mb-32 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-3 bg-primary/5 px-4 py-2 border border-primary/10">
            <Sparkles className="h-4 w-4 text-secondary fill-secondary" strokeWidth={1} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Signature Registry</span>
          </div>
          <h1 className="text-7xl md:text-[10rem] font-headline text-primary tracking-tighter italic leading-[0.8] drop-shadow-sm">Artisan <br />Services.</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl border-l border-secondary pl-8 py-2">
            The world's most prestigious transformations, curated for the uncompromising guest.
          </p>
        </header>

        {/* Search & Filter - Magazine Layout */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-12 gap-0 border border-primary/10 shadow-3xl bg-white dark:bg-card/20">
          <div className="md:col-span-8 relative border-r border-primary/10 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-secondary transition-all" />
            <Input 
              placeholder="Search for a signature transformation..." 
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
              <SelectContent className="rounded-none font-body border-primary/10 shadow-none bg-background">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-bold text-[10px] uppercase tracking-widest">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-primary/10">
            {[1, 2, 3, 4, 5, 6].map(n => <Skeleton key={n} className="h-[600px] border border-primary/5" />)}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-primary/10">
            {filteredServices.map((service, idx) => (
              <Link 
                key={service.id} 
                href={`/deals/${service.id}`} 
                className={cn(
                  "group relative p-12 border-r border-b border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-700",
                  (idx + 1) % 3 === 0 && "lg:border-r-0"
                )}
              >
                <div className="space-y-10">
                  <div className="relative h-[400px] overflow-hidden bg-muted border border-primary/5 grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <Image 
                      src={`https://picsum.photos/seed/deal-${service.id}/800/600`} 
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-white/95 backdrop-blur-xl text-primary border-none text-[8px] uppercase font-black px-4 py-2 tracking-[0.3em] rounded-none shadow-2xl">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-4xl font-headline leading-[0.9] tracking-tighter italic">
                      {service.name}
                    </h3>
                    <div className="flex justify-between items-baseline pt-6 border-t border-current/10">
                      <span className="text-3xl font-bold tracking-tighter">{getCurrency()} {service.discountPrice?.toLocaleString()}</span>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                        Book Slot <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-60 text-center space-y-12 border border-dashed border-primary/10 bg-primary/2">
            <div className="bg-primary/5 w-40 h-40 rounded-full flex items-center justify-center mx-auto border border-primary/10 shadow-inner">
              <Search className="h-16 w-16 text-primary/10" strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h3 className="text-6xl font-headline italic opacity-20">Registry Entry Not Found</h3>
              <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">Search criteria did not yield any signature transformations.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
