
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { VENDORS, DEALS, PRODUCTS } from '@/app/lib/mock-data';
import { useStore } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ArrowRight, Navigation, ShieldCheck } from 'lucide-react';
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
        {/* Vendor Hero */}
        <section className="relative h-[60vh] flex items-end pb-12 overflow-hidden">
          <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover grayscale opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="container mx-auto px-6 relative z-10">
             <div className="max-w-4xl space-y-4">
                <Badge className="bg-primary text-white rounded-none uppercase tracking-widest text-[10px]">Elite Artisan</Badge>
                <h1 className="text-7xl font-headline tracking-tighter italic text-primary">{vendor.name}</h1>
                <div className="flex items-center gap-6 text-sm italic text-muted-foreground">
                   <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {vendor.area_tag}</div>
                   <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-primary text-primary" /> {vendor.rating} Rating</div>
                </div>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24 space-y-32">
          {/* Active Deals */}
          <div className="space-y-12">
            <h2 className="text-4xl font-headline tracking-tighter italic">Signature Transformations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {vendorDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group">
                  <Card className="rounded-none border-none bg-muted/20 flex flex-col md:flex-row overflow-hidden hover:bg-muted/30 transition-colors">
                    <div className="relative w-full md:w-48 h-48 grayscale group-hover:grayscale-0 transition-all">
                      <Image src={`https://picsum.photos/seed/deal-${deal.id}/400/400`} alt={deal.name} fill className="object-cover" />
                    </div>
                    <CardHeader className="flex-grow p-8 space-y-4">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{deal.category}</p>
                         <CardTitle className="text-2xl font-headline italic">{deal.name}</CardTitle>
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-bold italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                          <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Artisan Boutique */}
          <div className="space-y-12">
            <h2 className="text-4xl font-headline tracking-tighter italic">Studio Boutique</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {vendorProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block text-center space-y-4">
                  <div className="relative aspect-square grayscale group-hover:grayscale-0 transition-all bg-muted/20">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{product.brand}</p>
                    <h4 className="font-headline text-xl">{product.name}</h4>
                    <p className="font-bold">{getCurrency()} {product.price.toLocaleString()}</p>
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
