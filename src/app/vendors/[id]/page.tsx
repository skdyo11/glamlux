
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { VENDORS, DEALS, PRODUCTS } from '@/app/lib/mock-data';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function VendorProfilePage() {
  const { id } = useParams();
  const { getCurrency } = useStore();
  const vendor = VENDORS.find(v => v.id === id);
  const vendorDeals = DEALS.filter(d => d.vendor_id === id);
  const vendorProducts = PRODUCTS.filter(p => p.vendor_id === id);

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Vendor Hero - High Intensity Glass */}
        <section className="relative h-[70vh] flex items-end pb-24 overflow-hidden">
          <Image 
            src={vendor.images[0]} 
            alt={vendor.name} 
            fill 
            className="object-cover grayscale opacity-60" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="container mx-auto px-6 relative z-10">
             <div className="max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-3xl border border-white/20 px-4 py-1.5 rounded-none shadow-2xl">
                  <Sparkles className="h-3 w-3 text-accent-foreground" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Elite Artisan Registry</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-headline tracking-tighter italic text-primary leading-none">
                  {vendor.name}
                </h1>
                <div className="flex flex-wrap items-center gap-8 text-sm italic text-muted-foreground pt-4">
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-none border border-white/30">
                     <MapPin className="h-4 w-4 text-destructive" /> {vendor.area_tag}
                   </div>
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-none border border-white/30">
                     <Star className="h-4 w-4 fill-primary text-primary" /> {vendor.rating} Artisan Rating
                   </div>
                   <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-none border border-white/30">
                     <ShieldCheck className="h-4 w-4 text-accent-foreground" /> Verified Studio
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24 space-y-32">
          {/* Active Deals - Glass Cards */}
          <div className="space-y-12">
            <div className="space-y-2">
              <h2 className="text-5xl font-headline tracking-tighter italic">Signature Transformations</h2>
              <p className="text-muted-foreground italic">Exclusive service packages available for online booking.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {vendorDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group">
                  <Card className="rounded-none border-none bg-white/20 backdrop-blur-3xl flex flex-col md:flex-row overflow-hidden hover:bg-white/30 transition-all duration-700 ring-1 ring-white/20 hover:ring-white/50 shadow-2xl">
                    <div className="relative w-full md:w-64 h-64 grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <Image src={`https://picsum.photos/seed/deal-${deal.id}/600/600`} alt={deal.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    <CardHeader className="flex-grow p-10 space-y-6">
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{deal.category}</p>
                         <CardTitle className="text-3xl font-headline italic leading-none">{deal.name}</CardTitle>
                       </div>
                       <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                          <span className="text-3xl font-bold italic tracking-tighter">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                            Book Slot <ArrowRight className="h-4 w-4" />
                          </div>
                       </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Artisan Boutique - Minimalist Glass */}
          <div className="space-y-12">
            <div className="space-y-2">
              <h2 className="text-5xl font-headline tracking-tighter italic">Studio Boutique</h2>
              <p className="text-muted-foreground italic">Professional artistry products used and recommended by our experts.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {vendorProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-6">
                  <div className="relative aspect-square grayscale group-hover:grayscale-0 transition-all duration-1000 bg-white/20 backdrop-blur-3xl ring-1 ring-white/20 overflow-hidden shadow-xl">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{product.brand}</p>
                    <h4 className="font-headline text-2xl italic leading-none">{product.name}</h4>
                    <p className="font-bold text-lg tracking-tighter">{getCurrency()} {product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
