'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { PRODUCTS, VENDORS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Star, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FavoritesPage() {
  const { favorites, getCurrency, isFavoriteProduct, isFavoriteVendor, toggleFavoriteProduct, toggleFavoriteVendor } = useStore();
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
      
      <main className="container mx-auto px-6 py-16 md:py-24">
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <Heart className="h-3 w-3 text-accent-foreground fill-accent-foreground" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Favorites Gallery</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline text-primary tracking-tighter leading-none italic">My Collection</h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            Your personal selection of elite beauty sanctuaries and professional artistry items.
          </p>
        </header>

        {isEmpty ? (
          <div className="py-40 text-center space-y-8 bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-[3rem]">
            <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic text-primary">Your collection is empty</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">
              Explore the marketplace and heart the looks and studios that inspire you.
            </p>
            <div className="flex justify-center gap-4">
               <Link href="/shop">
                 <Badge className="bg-primary text-white px-8 py-3 rounded-full cursor-pointer hover:bg-primary/80 transition-all font-black uppercase text-[10px] tracking-widest">Shop Makeup</Badge>
               </Link>
               <Link href="/vendors">
                 <Badge className="bg-accent text-accent-foreground px-8 py-3 rounded-full cursor-pointer hover:bg-accent/80 transition-all font-black uppercase text-[10px] tracking-widest">Find Parlours</Badge>
               </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-32">
            {favoriteVendors.length > 0 && (
              <section className="space-y-12">
                <div className="flex justify-between items-end">
                  <h2 className="text-5xl font-headline tracking-tighter italic text-primary">Saved Sanctuaries</h2>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{favoriteVendors.length} Locations</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {favoriteVendors.map((vendor) => (
                    <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group relative block overflow-hidden rounded-[3rem] bg-white/20 backdrop-blur-xl shadow-xl border border-white/10 transition-all hover:scale-[1.02]">
                       <div className="relative h-64 overflow-hidden">
                         <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                       </div>
                       <div className="p-10 space-y-4">
                          <div className="flex justify-between items-start">
                             <h3 className="text-4xl font-headline italic text-primary">{vendor.name}</h3>
                             <button onClick={(e) => { e.preventDefault(); toggleFavoriteVendor(vendor.id); }} className="text-accent-foreground">
                               <Heart className="h-6 w-6 fill-current" />
                             </button>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <MapPin className="h-4 w-4" /> {vendor.area_tag}
                          </div>
                       </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {favoriteProducts.length > 0 && (
              <section className="space-y-12">
                <div className="flex justify-between items-end">
                  <h2 className="text-5xl font-headline tracking-tighter italic text-primary">Elite Items</h2>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{favoriteProducts.length} Products</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {favoriteProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-4">
                      <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:scale-105 transition-all">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                        <button onClick={(e) => { e.preventDefault(); toggleFavoriteProduct(product.id); }} className="absolute top-6 right-6 text-accent-foreground z-10">
                           <Heart className="h-6 w-6 fill-current" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-black opacity-40 tracking-widest text-primary">{product.brand}</p>
                        <h4 className="font-headline text-2xl italic text-primary leading-none">{product.name}</h4>
                        <p className="font-bold text-lg text-accent-foreground">{getCurrency()} {product.price.toLocaleString()}</p>
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
