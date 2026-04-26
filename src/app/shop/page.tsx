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
import { cn } from '@/lib/utils';
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

  const brands = ['All', ...Array.from(new Set((products || []).map(p => p.brand).filter(Boolean)))];

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} is now in your collection.`,
    });
  };

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
             {vendors?.map((v) => (
               <Link key={v.id} href={`/vendors/${v.id}`} className="snap-start shrink-0">
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
             ))}
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
              <SelectTrigger className="h-16 w-full md:w-[240px] bg-white/60 dark:bg-black/20 border-none rounded-full font-black text-[10px] uppercase tracking-[0.2em] px-8">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl font-body border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="font-bold text-[10px] uppercase tracking-widest">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <Skeleton key={n} className="h-[400px] rounded-[3rem]" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-12">
            {filteredProducts.map((product) => {
              const isFav = isFavoriteProduct(product.id);
              return (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block interactive-element h-full">
                  <Card className="border-none bg-white/60 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[3rem] overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name}
                        fill
                        className="object-cover soft-focus group-hover:scale-110"
                        data-ai-hint="makeup product"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleFavoriteToggle(e, product.id)}
                        className={cn(
                          "absolute top-6 right-6 h-10 w-10 rounded-full backdrop-blur-md z-20 transition-all",
                          isFav ? "bg-primary text-primary-foreground" : "bg-white/20 text-white hover:bg-white/40"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                      </Button>

                      <Button 
                        variant="secondary"
                        size="icon" 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-6 right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl z-20 scale-100 md:scale-0 md:group-hover:scale-100 transition-all duration-500"
                      >
                        <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                      </Button>
                    </div>
                    <CardHeader className="space-y-2 p-6 md:p-8 text-center flex-grow">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-black">{product.brand}</p>
                      <CardTitle className="text-lg md:text-xl font-headline group-hover:text-accent-foreground transition-colors leading-tight italic text-primary">
                        {product.name}
                      </CardTitle>
                      <div className="pt-4 border-t border-border/5 mt-4">
                         <p className="text-primary font-bold text-xl md:text-2xl italic">{getCurrency()} {product.price?.toLocaleString()}</p>
                      </div>
                    </CardHeader>
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
            <h3 className="text-5xl font-headline italic text-primary">No items found</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed px-6">Try searching for a different boutique brand or item name.</p>
          </div>
        )}
      </main>
    </div>
  );
}
