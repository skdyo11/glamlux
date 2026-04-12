'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PARLOURS } from '@/app/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, MapPin, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 py-16">
        <header className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Limited Invitations</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline text-primary">Parlour Transformations</h1>
          <p className="text-xl text-muted-foreground font-body italic">
            Exclusive experiences at the region's most prestigious salons, curated for your unique radiance.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 flex flex-col md:flex-row gap-4 items-center bg-white/50 p-6 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-sm">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for a transformation..." 
              className="pl-10 h-12 bg-white border-primary/10 focus-visible:ring-primary/20 rounded-xl font-body"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-primary hidden md:block" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12 w-full md:w-[180px] bg-white border-primary/10 rounded-xl font-bold font-body">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-body">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredDeals.map((deal) => {
              const parlour = PARLOURS.find(p => p.id === deal.parlour_id);
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="group overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl bg-white">
                    <div className="relative h-80 overflow-hidden">
                      <Image 
                        src={parlour?.images[0] || 'https://picsum.photos/seed/parlour/800/600'} 
                        alt={deal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-90"
                        data-ai-hint="luxury salon"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none text-[10px] uppercase font-black px-3 py-1 tracking-tighter shadow-sm">
                          {deal.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-primary text-white font-bold text-sm px-3 py-1 rounded-sm shadow-lg">
                          -{Math.round((1 - deal.discounted_price / deal.price) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {parlour?.area_tag}
                      </div>
                      <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors leading-tight">
                        {deal.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-primary italic">{getCurrency()} {deal.discounted_price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground line-through opacity-50">{getCurrency()} {deal.price.toLocaleString()}</span>
                    </CardContent>
                    <CardFooter className="pt-4 border-t flex justify-between items-center h-14 bg-secondary/10">
                      <div className="flex items-center gap-1 text-xs font-bold text-primary">
                        <Star className="h-3 w-3 fill-primary" />
                        {parlour?.rating} (Verified)
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60 uppercase tracking-tighter italic">
                        <Clock className="h-3 w-3" />
                        Strictly Limited Slots
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="text-2xl font-headline">No Transformations Found</h3>
            <p className="text-muted-foreground font-body">Try adjusting your search or category filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
