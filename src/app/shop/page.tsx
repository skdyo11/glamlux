'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col pt-14 md:pt-24 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-20 md:py-32">
        <header className="max-w-5xl mb-32 space-y-8">
          <div className="space-y-4">
             <span className="text-secondary font-bold uppercase tracking-[0.5em] text-[10px]">The Boutique</span>
             <h1 className="text-7xl md:text-[9rem] font-headline text-primary tracking-tighter leading-[0.85] italic text-right">Artistry <br />Essentials.</h1>
          </div>
          <p className="text-xl text-muted-foreground font-body max-w-2xl leading-relaxed ml-auto text-right">
            Curated professional makeup and beauty formulations, selected by the registry for unmatched performance.
          </p>
        </header>

        {/* Featured Houses */}
        <section className="mb-40 space-y-16">
           <div className="flex justify-between items-end border-b border-primary/10 pb-8">
             <h2 className="text-4xl font-headline tracking-tighter text-primary">Elite Houses</h2>
             <Link href="/vendors" className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary hover:text-secondary transition-colors">The Directory</Link>
           </div>
           <div className="flex gap-12 overflow-x-auto pb-10 scrollbar-hide -mx-6 px-6 snap-x">
             {isLoading ? (
               [1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-80 shrink-0" />)
             ) : (
               vendors?.map((v) => {
                 const vendorSlug = v.slug || slugify(v.name);
                 return (
                   <Link key={v.id} href={`/vendors/${vendorSlug}`} className="snap-start shrink-0 group">
                     <article className="w-80 space-y-6">
                        <div className="relative aspect-square overflow-hidden bg-muted border border-primary/5">
                           <Image src={v.imageUrls?.[0] || 'https://picsum.photos/seed/shop/400/400'} alt={v.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-headline text-3xl text-primary">{v.name}</h3>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                             <span>{v.areaTag}</span>
                             <span className="flex items-center gap-1 text-secondary"><Star className="h-3 w-3 fill-current" /> {v.rating}</span>
                          </div>
                        </div>
                     </article>
                   </Link>
                 );
               })
             )}
           </div>
        </section>

        {/* Catalog Filters */}
        <section className="mb-24 flex flex-col md:flex-row gap-0 border border-primary/10">
          <div className="relative flex-grow border-r border-primary/10">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search the collection..." 
              className="pl-20 h-20 bg-transparent border-none rounded-none font-body text-lg italic focus-visible:ring-0 text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto min-w-[240px] border-r border-primary/10">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-20 w-full border-none rounded-none font-bold text-[10px] uppercase tracking-[0.4em] px-10 bg-white dark:bg-card">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-body border-primary/10 shadow-none">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand || 'All'} className="text-[10px] font-bold uppercase tracking-widest">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/cart" className="h-20 w-20 flex items-center justify-center bg-primary text-white hover:bg-secondary transition-colors">
            <ShoppingBag className="h-6 w-6" />
          </Link>
        </section>

        {/* Collection Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                <article className="space-y-8">
                  <div className="relative aspect-[3/4] overflow-hidden border border-primary/5 bg-muted">
                    <Image 
                      src={product.imageUrl || `https://picsum.photos/seed/vogue-prod-${product.id}/600/800`} 
                      alt={product.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                    <button 
                      onClick={(e) => handleFavoriteToggle(e, product.id)}
                      className={cn(
                        "absolute top-6 right-6 h-10 w-10 flex items-center justify-center transition-all",
                        isFavoriteProduct(product.id) ? "text-secondary" : "text-white/40 hover:text-white"
                      )}
                    >
                      <Heart className={cn("h-5 w-5", isFavoriteProduct(product.id) && "fill-current")} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">{product.brand}</span>
                      <h4 className="font-headline text-3xl text-primary leading-none group-hover:underline underline-offset-4 decoration-primary/10">{product.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
                      <span className="font-bold text-xl tracking-tighter text-primary">{getCurrency()} {product.price?.toLocaleString()}</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-10 border border-dashed border-primary/10">
            <h3 className="text-5xl font-headline italic text-primary/30">Catalogue Entry Missing.</h3>
            <p className="text-muted-foreground font-body italic text-lg">No artisanal treasures matched your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
