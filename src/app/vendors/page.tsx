
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { VENDORS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Sparkles, Search, ArrowRight, Navigation } from 'lucide-react';
import { useStore } from '@/app/lib/store';

export default function VendorsPage() {
  const { getCurrency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uniqueAreas = ['All', ...Array.from(new Set(VENDORS.map(v => v.area_tag.split(',').pop()?.trim() || v.area_tag)))];

  const filteredVendors = VENDORS.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.area_tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'All' || v.area_tag.includes(areaFilter);
    return matchesSearch && matchesArea;
  });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-24">
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Parlours Section</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic">Beauty <br /><span className="text-accent-foreground">Sanctuaries</span></h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            The most prestigious parlours and independent artists in your region, curated for professional results.
          </p>
        </header>

        {/* Search and Filter Section */}
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

        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {filteredVendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group block interactive-element">
                <Card className="overflow-hidden border-none bg-white/60 dark:bg-black/20 backdrop-blur-3xl shadow-xl hover:shadow-2xl transition-all duration-1000 rounded-[3rem] active:scale-[0.99] ring-1 ring-white/20 hover:ring-white/40 h-full flex flex-col">
                  <div className="relative h-80 md:h-96 overflow-hidden">
                    <Image 
                      src={vendor.images[0]} 
                      alt={vendor.name}
                      fill
                      className="object-cover soft-focus group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-white/95 dark:bg-black/80 text-primary border border-white/20 text-[9px] uppercase font-black px-6 py-3 tracking-[0.2em] rounded-full shadow-2xl backdrop-blur-md">
                        Elite Partner
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6 space-y-4 flex-grow">
                    <div className="flex items-center gap-3 text-[10px] text-accent-foreground font-black uppercase tracking-[0.3em]">
                      <MapPin className="h-4 w-4 text-destructive" />
                      {vendor.area_tag}
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
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-white/5 backdrop-blur-3xl border border-dashed border-white/20 rounded-[3rem]">
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
