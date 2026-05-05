'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { cn, slugify } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
  const { favorites, getCurrency, toggleFavoriteProduct, toggleFavoriteVendor, isFavoriteProduct, isFavoriteVendor } = useStore();
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live registry data to match favorites
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'));
  }, [firestore]);

  const { data: allProducts, isLoading: isLoadingProducts } = useCollection(productsQuery);
  const { data: allVendors, isLoading: isLoadingVendors } = useCollection(vendorsQuery);

  const favoriteProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => favorites.products.includes(p.id));
  }, [allProducts, favorites.products]);

  const favoriteVendors = useMemo(() => {
    if (!allVendors) return [];
    return allVendors.filter(v => favorites.vendors.includes(v.id));
  }, [allVendors, favorites.vendors]);

  const favCount = favoriteProducts.length + favoriteVendors.length;
  const isEmpty = favCount === 0 && !isLoadingProducts && !isLoadingVendors;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-32 font-body">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-32">
        <header className="max-w-4xl mb-24 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-700">
            <Heart className={cn("h-4 w-4 text-secondary", favCount > 0 && "fill-secondary")} strokeWidth={1.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Private Selection</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic drop-shadow-sm">My <br />Collection</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl mx-auto md:mx-0">
            Your personal curation of elite beauty sanctuaries and professional artistry essentials.
          </p>
        </header>

        {(isLoadingProducts || isLoadingVendors) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-none" />)}
          </div>
        ) : isEmpty ? (
          <div className="py-32 md:py-48 text-center space-y-10 bg-white/5 backdrop-blur-xl border border-dashed border-primary/10 rounded-none animate-in fade-in zoom-in-95 duration-1000 shadow-xl ring-1 ring-primary/5 px-6">
            <div className="bg-primary/5 w-36 h-36 rounded-full flex items-center justify-center mx-auto shadow-inner ring-1 ring-primary/10">
              <Heart className="h-16 w-16 text-primary/10" strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl md:text-6xl font-headline italic text-primary leading-tight">Your collection is empty</h3>
              <p className="text-lg text-muted-foreground font-body max-w-md mx-auto italic leading-relaxed">
                Explore the artisan registry and heart the looks that resonate with your unique vision.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/shop">
                 <Button className="bg-primary text-primary-foreground px-10 h-16 rounded-none vogue-button shadow-2xl hover:scale-105 transition-all">Shop Artistry</Button>
               </Link>
               <Link href="/vendors">
                 <Button variant="outline" className="border-primary/20 text-primary px-10 h-16 rounded-none vogue-button shadow-xl hover:bg-primary/5 transition-all">Find Sanctuaries</Button>
               </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-40">
            {favoriteVendors.length > 0 && (
              <section className="space-y-16">
                <div className="flex justify-between items-end border-b border-primary/5 pb-8 flex-wrap gap-4">
                  <div className="space-y-2">
                    <h2 className="text-5xl md:text-7xl font-headline tracking-tighter italic text-primary">Artisan Sanctuaries</h2>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/40 flex items-center gap-2"><Sparkles className="h-3 w-3" /> SAVED LOCATIONS</p>
                  </div>
                  <Badge variant="outline" className="rounded-none px-4 py-2 border-primary/10 text-primary font-black uppercase tracking-widest text-[9px] shadow-sm">{favoriteVendors.length} Registered</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                  {favoriteVendors.map((vendor) => {
                    const vendorSlug = vendor.slug || slugify(vendor.name || '');
                    return (
                      <Link key={vendor.id} href={`/vendors/${vendorSlug}`} className="group relative block overflow-hidden bg-white dark:bg-card/20 shadow-2xl border border-primary/5 transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] ring-1 ring-primary/5">
                       <div className="relative h-80 overflow-hidden">
                         <Image 
                           src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/fav-v/800/600'} 
                           alt={vendor.name || 'Vendor'} 
                           fill 
                           className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="p-10 space-y-6">
                          <div className="flex justify-between items-start">
                             <h3 className="text-4xl font-headline italic text-primary leading-none group-hover:text-secondary transition-colors">{vendor.name}</h3>
                             <button onClick={(e) => { e.preventDefault(); toggleFavoriteVendor(vendor.id); }} className="text-secondary transition-transform active:scale-125">
                               <Heart className={cn("h-7 w-7", isFavoriteVendor(vendor.id) && "fill-current")} />
                             </button>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-body">
                            <MapPin className="h-4 w-4 text-secondary" /> {vendor.areaTag}
                          </div>
                       </div>
                    </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {favoriteProducts.length > 0 && (
              <section className="space-y-16">
                <div className="flex justify-between items-end border-b border-primary/5 pb-8 flex-wrap gap-4">
                  <div className="space-y-2">
                    <h2 className="text-5xl md:text-7xl font-headline tracking-tighter italic text-primary">Artistry Items</h2>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/40 flex items-center gap-2"><Sparkles className="h-3 w-3" /> ELITE ESSENTIALS</p>
                  </div>
                  <Badge variant="outline" className="rounded-none px-4 py-2 border-primary/10 text-primary font-black uppercase tracking-widest text-[9px] shadow-sm">{favoriteProducts.length} Items</Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                  {favoriteProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-6 hover:-translate-y-2 transition-all duration-500">
                      <div className="relative aspect-[4/5] rounded-none overflow-hidden shadow-2xl bg-white dark:bg-card/20 border border-primary/5 group-hover:scale-105 transition-all duration-700 ring-1 ring-primary/5">
                        <Image 
                          src={product.imageUrl || 'https://picsum.photos/seed/fav-p/600/800'} 
                          alt={product.name || 'Product'} 
                          fill 
                          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        <button onClick={(e) => { e.preventDefault(); toggleFavoriteProduct(product.id); }} className="absolute top-6 right-6 text-secondary z-20 transition-transform active:scale-125">
                           <Heart className={cn("h-7 w-7", isFavoriteProduct(product.id) && "fill-current")} />
                        </button>
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-black opacity-40 tracking-[0.3em] text-primary">{product.brand}</p>
                        <h4 className="font-headline text-3xl italic text-primary leading-tight group-hover:text-secondary transition-colors">{product.name}</h4>
                        <p className="font-bold text-xl text-secondary font-body tracking-tighter">{getCurrency()} {product.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
