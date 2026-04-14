
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, VENDORS } from '@/app/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, MapPin, Sparkles, Search } from 'lucide-react';
import { useStore } from '@/app/lib/store';

export default function DealsPage() {
  const { getCurrency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredDeals = DEALS.filter((deal) => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || deal.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Bridal', 'Hair', 'Skin'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-24 pb-32">
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Deals Section</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter italic leading-none">Beauty Deals</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            Pick the best beauty services from the most famous studios.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-20 flex flex-col md:flex-row gap-6 items-center bg-white/40 dark:bg-white/5 p-6 md:p-8 rounded-[3rem] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search for a service..." 
              className="pl-20 h-16 bg-white/60 dark:bg-black/20 border-none focus-visible:ring-secondary rounded-full font-body text-lg italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-16 w-full md:w-[240px] bg-white/60 dark:bg-black/20 border-none rounded-full font-black text-[10px] uppercase tracking-[0.2em] px-10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl font-body border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-bold text-[10px] uppercase tracking-widest">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {filteredDeals.map((deal) => {
              const vendor = VENDORS.find(v => v.id === deal.vendor_id);
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block interactive-element">
                  <Card className="overflow-hidden border-none bg-white/60 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[3rem] h-full flex flex-col">
                    <div className="relative h-80 md:h-96 overflow-hidden">
                      <Image 
                        src={vendor?.images[0] || 'https://picsum.photos/seed/vendor/800/600'} 
                        alt={deal.name}
                        fill
                        className="object-cover soft-focus group-hover:scale-110"
                      />
                      <div className="absolute top-8 left-8">
                        <Badge className="bg-white/95 backdrop-blur-md text-primary border-none text-[9px] uppercase font-black px-6 py-3 tracking-[0.2em] rounded-full shadow-lg">
                          {deal.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-10 pb-6 space-y-4 flex-grow">
                      <div className="flex items-center gap-3 text-[10px] text-accent-foreground font-black uppercase tracking-[0.3em]">
                        <MapPin className="h-4 w-4 text-accent-foreground" />
                        {vendor?.area_tag}
                      </div>
                      <CardTitle className="text-4xl md:text-5xl font-headline group-hover:text-accent-foreground transition-colors leading-none italic text-primary">
                        {deal.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-10 pb-4 flex items-baseline gap-6">
                      <span className="text-4xl md:text-5xl font-bold text-primary italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                    </CardContent>
                    <CardFooter className="mt-8 pt-8 border-t border-muted/10 flex justify-between items-center bg-muted/5 px-10 h-24">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-accent-foreground tracking-widest">
                        <Star className="h-4 w-4 fill-accent-foreground" />
                        {vendor?.rating} Rating
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] italic group-hover:translate-x-1 transition-transform">
                        <Clock className="h-4 w-4" />
                        Limited Slots
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8">
            <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
              <Search className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic">No deals found</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">Try searching for something else like "Bridal" or "Hair".</p>
          </div>
        )}
      </main>
    </div>
  );
}
