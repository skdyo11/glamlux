'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Search, ArrowRight, Heart, Sparkles, Percent, SlidersHorizontal } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col pt-28">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Find Beauty Parlours</h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by parlour name or location..." 
                className="pl-12 h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-12 w-full md:w-[200px] rounded-xl font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="All Regions" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {uniqueAreas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => <Skeleton key={n} className="h-[300px] rounded-2xl" />)}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor) => {
              const isFav = isFavoriteVendor(vendor.id);
              const vendorSlug = vendor.slug || slugify(vendor.name);
              return (
                <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group block relative border rounded-2xl overflow-hidden hover:shadow-marketplace transition-all hover:-translate-y-2">
                  <div className="relative aspect-video">
                    <Image 
                      src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/v-1/800/450'} 
                      alt={vendor.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <button 
                      onClick={(e) => handleFavoriteToggle(e, vendor.id)}
                      className={cn(
                        "absolute top-4 right-4 h-10 w-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full transition-all shadow-sm",
                        isFav ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold truncate pr-4">{vendor.name}</h3>
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {vendor.areaTag}
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center group-hover:text-primary transition-colors">
                      <span className="text-xs font-bold uppercase tracking-widest">Browse Services</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No parlours found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
}
