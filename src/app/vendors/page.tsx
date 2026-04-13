
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { VENDORS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, MapPin, Sparkles, Search, ArrowRight, Navigation } from 'lucide-react';
import { useStore } from '@/app/lib/store';

export default function VendorsPage() {
  const { getCurrency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = VENDORS.filter((v) => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.area_tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-24">
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-none bg-primary/10 border border-primary/20 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Artisan Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline text-primary tracking-tighter leading-none italic">Beauty <br /><span className="text-accent-foreground">Sanctuaries</span></h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            The most prestigious parlours and independent artists in your region, curated for professional results.
          </p>
        </header>

        {/* Search Section */}
        <section className="mb-20 bg-white/10 p-6 md:p-8 rounded-none border border-white/30 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/50">
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search sanctuaries by name or area..." 
              className="pl-16 h-16 bg-white/20 border-none focus-visible:ring-primary/10 rounded-none font-body text-lg italic placeholder:text-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {filteredVendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group block">
                <Card className="overflow-hidden border-none bg-white/20 backdrop-blur-3xl shadow-xl hover:shadow-2xl transition-all duration-1000 rounded-none active:scale-[0.99] ring-1 ring-white/20 hover:ring-white/40">
                  <div className="relative h-72 md:h-80 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <Image 
                      src={vendor.images[0]} 
                      alt={vendor.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-white/95 backdrop-blur-md text-primary border-none text-[9px] uppercase font-black px-5 py-2.5 tracking-[0.2em] rounded-none shadow-lg">
                        Elite Partner
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] text-accent-foreground font-black uppercase tracking-[0.3em]">
                      <MapPin className="h-4 w-4 text-destructive" />
                      {vendor.area_tag}
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-headline group-hover:text-primary transition-colors leading-none italic">
                      {vendor.name}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="mt-8 pt-8 border-t border-white/20 flex justify-between items-center bg-white/10 px-10 h-20 backdrop-blur-md">
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
          <div className="py-40 text-center space-y-8 bg-white/10 backdrop-blur-3xl border border-dashed border-white/30 rounded-none">
            <div className="bg-primary/5 w-32 h-32 rounded-none flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
              <Navigation className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic">Sanctuary Not Found</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">No artisan locations matched your search. Try a different region or studio name.</p>
          </div>
        )}
      </main>
    </div>
  );
}
