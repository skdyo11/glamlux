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
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="max-w-3xl mb-12 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-secondary/50 backdrop-blur-sm mx-auto md:mx-0">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-accent-foreground">Limited Invitations</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline text-primary tracking-tighter italic">Elite <br />Transformations</h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body italic">
            Exclusive experiences at the region's most prestigious artisans.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 flex flex-col md:flex-row gap-4 items-center bg-white/40 p-4 md:p-6 rounded-[2rem] border border-white/60 backdrop-blur-xl shadow-xl shadow-primary/5">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
            <Input 
              placeholder="Search transformation..." 
              className="pl-12 h-14 bg-white/60 border-none focus-visible:ring-secondary/20 rounded-2xl font-body text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-14 w-full md:w-[200px] bg-white/60 border-none rounded-2xl font-bold font-body">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl font-body border-none shadow-2xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredDeals.map((deal) => {
              const vendor = VENDORS.find(v => v.id === deal.vendor_id);
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block">
                  <Card className="overflow-hidden border-none bg-white/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] active:scale-[0.98]">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <Image 
                        src={vendor?.images[0] || 'https://picsum.photos/seed/vendor/800/600'} 
                        alt={deal.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none text-[10px] uppercase font-black px-4 py-1.5 tracking-tighter rounded-none">
                          {deal.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 right-6">
                        <Badge className="bg-destructive text-white font-bold text-sm px-3 py-1 rounded-none shadow-lg">
                          -{Math.round((1 - deal.discount_price / deal.base_price) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-4 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-accent-foreground font-black uppercase tracking-[0.2em]">
                        <MapPin className="h-3 w-3 text-destructive" />
                        {vendor?.area_tag}
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-headline group-hover:text-destructive transition-colors leading-none italic">
                        {deal.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-baseline gap-4">
                      <span className="text-2xl md:text-3xl font-bold text-primary italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                      <span className="text-xs md:text-sm text-muted-foreground line-through opacity-30">{getCurrency()} {deal.base_price.toLocaleString()}</span>
                    </CardContent>
                    <CardFooter className="pt-6 border-t border-white/40 flex justify-between items-center bg-secondary/20 px-8">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-accent-foreground tracking-widest">
                        <Star className="h-3 w-3 fill-accent-foreground" />
                        {vendor?.rating} Artisan
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-destructive uppercase tracking-widest italic">
                        <Clock className="h-3 w-3" />
                        Limited Slots
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-primary/20" />
            </div>
            <h3 className="text-4xl font-headline italic">The Search Continues</h3>
            <p className="text-muted-foreground font-body max-w-xs mx-auto">Try refining your filters or search keywords.</p>
          </div>
        )}
      </main>
    </div>
  );
}