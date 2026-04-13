
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
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-none bg-accent/20 border border-accent/40 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-accent-foreground">Artisan Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline text-primary tracking-tighter italic leading-none">Elite Transformations</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            A curated selection of premium beauty services from the region's most celebrated studios.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-20 flex flex-col md:flex-row gap-6 items-center bg-white/30 p-6 md:p-8 rounded-none border border-white/60 backdrop-blur-xl shadow-2xl">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Find your next transformation..." 
              className="pl-16 h-16 bg-white/60 border-none focus-visible:ring-accent/20 rounded-none font-body text-lg italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-16 w-full md:w-[220px] bg-white/60 border-none rounded-none font-black text-[10px] uppercase tracking-[0.2em]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-body border-none shadow-2xl">
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
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block">
                  <Card className="overflow-hidden border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-1000 rounded-none active:scale-[0.99]">
                    <div className="relative h-72 md:h-96 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <Image 
                        src={vendor?.images[0] || 'https://picsum.photos/seed/vendor/800/600'} 
                        alt={deal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-all duration-1000"
                      />
                      <div className="absolute top-8 left-8">
                        <Badge className="bg-white/95 backdrop-blur-sm text-primary border-none text-[9px] uppercase font-black px-5 py-2.5 tracking-[0.2em] rounded-none">
                          {deal.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-10 pb-6 space-y-4">
                      <div className="flex items-center gap-3 text-[10px] text-accent-foreground font-black uppercase tracking-[0.3em]">
                        <MapPin className="h-4 w-4 text-destructive" />
                        {vendor?.area_tag}
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-headline group-hover:text-destructive transition-colors leading-none italic">
                        {deal.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-10 flex items-baseline gap-6">
                      <span className="text-3xl md:text-4xl font-bold text-primary italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                    </CardContent>
                    <CardFooter className="mt-8 pt-8 border-t border-muted/20 flex justify-between items-center bg-muted/5 px-10 h-20">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-accent-foreground tracking-widest">
                        <Star className="h-4 w-4 fill-accent-foreground" />
                        {vendor?.rating} Registry
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-destructive uppercase tracking-[0.2em] italic">
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
            <div className="bg-primary/5 w-32 h-32 rounded-none flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
              <Search className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic">The Search Continues</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">No matching transformations were found. Try adjusting your specialization or search keywords.</p>
          </div>
        )}
      </main>
    </div>
  );
}
