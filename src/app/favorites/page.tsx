'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { PRODUCTS, VENDORS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Search, Star, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
  const { favorites, getCurrency, toggleFavoriteProduct, toggleFavoriteVendor } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const favoriteProducts = PRODUCTS.filter(p => favorites.products.includes(p.id));
  const favoriteVendors = VENDORS.filter(v => favorites.vendors.includes(v.id));

  const isEmpty = favoriteProducts.length === 0 && favoriteVendors.length === 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-32">
        <header className="max-w-4xl mb-24 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-700">
            <Heart className="h-4 w-4 text-accent-foreground fill-accent-foreground" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Private Selection</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic drop-shadow-sm">My <br />Collection</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl mx-auto md:mx-0">
            Your personal curation of elite beauty sanctuaries and professional artistry essentials.
          </p>
        </header>

        {isEmpty ? (
          <div className="py-32 md:py-48 text-center space-y-10 bg-white/5 backdrop-blur-xl border border-dashed border-primary/10 rounded-[3.5rem] animate-in fade-in zoom-in-95 duration-1000 shadow-xl ring-1 ring-primary/5 px-6">
            <div className="bg-primary/5 w-36 h-36 rounded-full flex items-center justify-center mx-auto shadow-inner ring-1 ring-primary/10">
              <Heart className="h-16 w-16 text-primary/20" />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl md:text-6xl font-headline italic text-primary leading-tight">Your collection is empty</h3>
              <p className="text-lg text-muted-foreground font-body max-w-md mx-auto italic leading-relaxed">
                Explore the artisan registry and heart the looks that resonate with your unique vision.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/shop">
                 <Button className="bg-primary text-white px-10 h-16 rounded-full font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all">Shop Artistry</Button>
               </Link>
               <Link href="/vendors">
                 <Button variant="outline" className="border-primary/20 text-primary px-10 h-16 rounded-full font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-primary/5 transition-all">Find Sanctuaries</Button>
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
                  <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/10 text-primary font-black uppercase tracking-widest text-[9px] shadow-sm">{favoriteVendors.length} Registered</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                  {favoriteVendors.map((vendor) => (
                    <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group relative block overflow-hidden rounded-[3rem] bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl border border-primary/5 transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl ring-1 ring-primary/5">
                       <div className="relative h-80 overflow-hidden">
                         <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="p-10 space-y-6">
                          <div className="flex justify-between items-start">
                             <h3 className="text-4xl font-headline italic text-primary leading-none group-hover:text-accent-foreground transition-colors">{vendor.name}</h3>
                             <button onClick={(e) => { e.preventDefault(); toggleFavoriteVendor(vendor.id); }} className="text-accent-foreground transition-transform active:scale-125">
                               <Heart className="h-7 w-7 fill-current drop-shadow-md" />
                             </button>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-body">
                            <MapPin className="h-4 w-4 text-rose-500" /> {vendor.area_tag}
                          </div>
                       </div>
                    </Link>
                  ))}
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
                  <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/10 text-primary font-black uppercase tracking-widest text-[9px] shadow-sm">{favoriteProducts.length} Items</Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                  {favoriteProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-6">
                      <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-primary/5 group-hover:scale-105 transition-all duration-700 ring-1 ring-primary/5">
                        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <button onClick={(e) => { e.preventDefault(); toggleFavoriteProduct(product.id); }} className="absolute top-6 right-6 text-accent-foreground z-20 transition-transform active:scale-125">
                           <Heart className="h-7 w-7 fill-current drop-shadow-md" />
                        </button>
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-black opacity-40 tracking-[0.3em] text-primary">{product.brand}</p>
                        <h4 className="font-headline text-3xl italic text-primary leading-tight group-hover:text-accent-foreground transition-colors">{product.name}</h4>
                        <p className="font-bold text-xl text-accent-foreground font-body tracking-tighter">{getCurrency()} {product.price.toLocaleString()}</p>
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
