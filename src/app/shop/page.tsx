
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingBag, Heart, Star, ArrowRight, Percent, Filter } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { cn, slugify } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const { getCurrency, isFavoriteProduct, toggleFavoriteProduct } = useStore();
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
    <div className="min-h-screen bg-background flex flex-col pt-44">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Shop Products</h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search products or brands..." 
                className="pl-12 h-12 rounded-xl border-border bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="h-12 w-full md:w-[200px] rounded-xl font-medium">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="All Brands" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand || 'All'}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {filteredProducts.map((product) => {
              const hasDiscount = product.basePrice && product.basePrice > product.price;
              const discountPercent = hasDiscount ? Math.round((1 - product.price / product.basePrice) * 100) : 0;
              
              return (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block bg-white dark:bg-card border rounded-2xl overflow-hidden hover:shadow-marketplace transition-all">
                  <div className="relative aspect-square">
                    <Image 
                      src={product.imageUrl || `https://picsum.photos/seed/p-${product.id}/600/600`} 
                      alt={product.name} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                    />
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-[10px] font-bold rounded-lg shadow-sm">
                        -{discountPercent}%
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleFavoriteToggle(e, product.id)}
                      className={cn(
                        "absolute top-2 right-2 h-8 w-8 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-sm",
                        isFavoriteProduct(product.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isFavoriteProduct(product.id) && "fill-current")} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-primary uppercase">{product.brand}</p>
                    <h4 className="font-bold text-sm truncate">{product.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">{getCurrency()} {product.price?.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">{getCurrency()} {product.basePrice?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold">No products found</h3>
            <p className="text-muted-foreground">We couldn't find any products matching your current filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
