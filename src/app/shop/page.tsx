'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingBag, Heart, Store, ArrowRight, Star } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn, slugify } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const { addToCart, getCurrency, isFavoriteProduct, toggleFavoriteProduct } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), limit(6));
  }, [firestore]);

  const { data: vendors } = useCollection(vendorsQuery);

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'All' || product.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const brands = ['All', ...Array.from(new Set((products || []).map((p) => p.brand).filter(Boolean)))];

  const handleFavoriteToggle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteProduct(id);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 md:pt-24 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 flex-grow">
        <header className="max-w-4xl mb-20 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Marketplace Collection</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic">Elite Boutique</h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body italic max-w-2xl mx-auto md:mx-0">
            Curated professional makeup and beauty essentials from our registry of elite shops.
          </p>
        </header>

        {/* Featured Shops Row */}
        <section className="mb-32 space-y-8">
           <div className="flex justify-between items-end px-2">
             <h2 className="text-3xl md:text-4xl font-headline italic text-primary">Artisan Registry</h2>
             <Link href="/vendors" className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors flex items-center gap-2">View All <ArrowRight className="h-3 w-3" /></Link>
           </div>
           <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
             {isLoading ? (
               [1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-64 shrink-0 rounded-[2.5rem]" />)
             ) : (
               vendors?.map((v) => {
                 const vendorSlug = v.slug || slugify(v.name);
                 return (
                   <Link key={v.id} href={`/vendors/${vendorSlug}`} className="snap-start shrink-0">
                     <Card className="w-64 rounded-[2.5rem] border-none bg-white/40 backdrop-blur-md p-6 space-y-4 shadow-xl hover:bg-primary/5 transition-all">
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden">
                           <Image src={v.imageUrls?.[0] || 'https://picsum.photos/seed/shop/400/400'} alt={v.name} fill className="object-cover" data-ai-hint="boutique shop" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-headline text-2xl italic text-primary truncate leading-tight">{v.name}</h3>
                          <div className="flex items-center justify-between">
                             <p className="text-[8px] uppercase font-black tracking-widest opacity-40">{v.areaTag}</p>
                             <div className="flex items-center gap-1 text-[8px] font-bold text-accent-foreground"><Star className="h-2 w-2 fill-current" /> {v.rating}</div>
                          </div>
                        </div>
                     </Card>
                   </Link>
                 );
               })
             )}
           </div>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-20 flex flex-col md:flex-row gap-6 items-center bg-white/40 dark:bg-white/5 p-6 md:p-8 rounded-[3rem] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search items by name or brand..." 
              className="pl-16 h-16 bg-white/60 dark:bg-black/20 border-none focus-visible:ring-secondary rounded-full font-body text-lg italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-16 w-full md:w-[200px] bg-white/60 dark:bg-black/20 border-none rounded-full font-black text-[10px] uppercase tracking-widest px-8">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl font-body">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand || 'All'} className="text-[10px] font-black uppercase tracking-widest">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Button size="icon" variant="ghost" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-all">
                <ShoppingBag className="h-6 w-6" />
              </Button>
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-background">
                0
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-[2.5rem]" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-6 interactive-element">
                <div className="relative aspect-[3/4] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-white dark:bg-black/20 ring-1 ring-primary/5 transition-all duration-700 hover:shadow-3xl hover:scale-[1.02]">
                  <Image 
                    src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/800`} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    data-ai-hint="beauty product"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={(e) => handleFavoriteToggle(e, product.id)}
                    className={cn(
                      "absolute top-6 right-6 h-12 w-12 rounded-full backdrop-blur-md z-20 transition-all flex items-center justify-center shadow-xl",
                      isFavoriteProduct(product.id) ? "bg-primary text-primary-foreground" : "bg-white/20 text-white hover:bg-white/40"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavoriteProduct(product.id) && "fill-current")} />
                  </button>
                </div>
                <div className="space-y-2 px-2">
                  <p className="text-[9px] uppercase font-black opacity-30 tracking-[0.4em] text-primary">{product.brand}</p>
                  <h4 className="font-headline text-3xl italic text-primary leading-tight group-hover:text-accent-foreground transition-colors">{product.name}</h4>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="font-bold text-xl text-accent-foreground font-body tracking-tighter">{getCurrency()} {product.price?.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-white/5 backdrop-blur-xl border border-dashed border-primary/10 rounded-[3.5rem]">
            <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-inner ring-1 ring-primary/5">
              <Store className="h-12 w-12 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl font-headline italic text-primary">No treasures found</h3>
              <p className="text-muted-foreground font-body italic text-lg">Try adjusting your search filters to find what you are looking for.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
