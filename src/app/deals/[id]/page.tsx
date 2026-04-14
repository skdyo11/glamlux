'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, VENDORS, PRODUCTS } from '@/app/lib/mock-data';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Star, Sparkles, ShoppingCart, ArrowRight, ArrowLeft, ShieldCheck, Users, Plus, Minus, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productRecommendationForDeal } from '@/ai/flows/product-recommendation-for-deal';
import Link from 'next/link';

export default function DealPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, getCurrency } = useStore();
  const [recommendedProductNames, setRecommendedProductNames] = useState<string[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [personCount, setPersonCount] = useState(1);

  const deal = DEALS.find(d => d.id === id);
  const vendor = VENDORS.find(v => v.id === deal?.vendor_id);

  useEffect(() => {
    async function getRecommendations() {
      if (!deal) return;
      try {
        const result = await productRecommendationForDeal({
          dealName: deal.name,
          dealCategory: deal.category,
          upsellProductId: deal.upsell_product_id
        });
        setRecommendedProductNames(result.recommendedProducts);
      } catch (error) {
        console.error('AI rec failed', error);
      } finally {
        setIsLoadingRecs(false);
      }
    }
    getRecommendations();
  }, [deal]);

  if (!deal || !vendor) return null;

  const depositAmount = (deal.discount_price * deal.deposit_percent) / 100;

  const handleAddToCart = () => {
    addToCart({
      id: deal.id,
      type: 'deal',
      name: deal.name,
      price: depositAmount,
      full_price: deal.discount_price,
      quantity: personCount,
      image: vendor.images[0],
      vendor_id: vendor.id
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <Button asChild variant="ghost" className="mb-12 -ml-4 text-muted-foreground hover:text-primary rounded-full">
          <Link href="/deals"><ArrowLeft className="h-4 w-4 mr-2" /> All Beauty Deals</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Visuals */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-muted rounded-[3rem] overflow-hidden transition-all duration-300">
              <Image src={vendor.images[0]} alt={deal.name} fill className="object-cover soft-focus" priority />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative aspect-square bg-muted rounded-2xl overflow-hidden transition-opacity cursor-pointer">
                   <Image src={`https://picsum.photos/seed/parlour-${i}/400/400`} alt="Detail" fill className="object-cover soft-focus" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge className="bg-accent text-accent-foreground rounded-full px-4 py-1 uppercase tracking-widest text-[8px] font-black border-none">
                  {deal.category}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                  <Star className="h-3 w-3 fill-primary" /> {vendor.rating} • Verified Parlour
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline tracking-tighter leading-tight italic text-primary">{deal.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                <MapPin className="h-4 w-4 text-rose-500" /> {vendor.name} — {vendor.area_tag}
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-headline italic tracking-tighter text-primary">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                  <span className="text-xl text-muted-foreground line-through opacity-30">{getCurrency()} {deal.base_price.toLocaleString()}</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-600 flex items-center gap-2 tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Pay only {getCurrency()} {depositAmount.toLocaleString()} to book
                </p>
              </div>

              {/* Group Size */}
              <div className="p-8 border rounded-[2rem] flex items-center justify-between bg-white/40 backdrop-blur-xl border-white/40 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                    <Users className="h-4 w-4" /> How many people?
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Book for you and your friends</p>
                </div>
                <div className="flex items-center gap-6 bg-white/60 backdrop-blur-md border border-white/60 px-6 py-2 rounded-full">
                  <Button variant="ghost" size="icon" onClick={() => setPersonCount(Math.max(1, personCount - 1))} className="h-10 w-10 hover:bg-transparent"><Minus className="h-3 w-3" /></Button>
                  <span className="font-headline text-4xl text-primary">{personCount}</span>
                  <Button variant="ghost" size="icon" onClick={() => setPersonCount(personCount + 1)} className="h-10 w-10 hover:bg-transparent"><Plus className="h-3 w-3" /></Button>
                </div>
              </div>

              <div className="p-10 rounded-[3rem] bg-secondary/30 backdrop-blur-md space-y-4 shadow-inner">
                <div className="flex justify-between items-baseline italic text-primary">
                  <span className="text-sm font-bold">Deposit to Pay Now</span>
                  <span className="text-3xl font-headline">{(depositAmount * personCount).toLocaleString()}</span>
                </div>
                <p className="text-[9px] uppercase font-black opacity-30 tracking-[0.2em] flex items-center gap-1 text-primary">
                  <Info className="h-3 w-3" /> Pay the rest at {vendor.name}
                </p>
              </div>
            </div>

            <Button size="lg" className="w-full h-20 bg-primary text-white rounded-full text-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl group" onClick={handleAddToCart}>
              Book Now
              <ArrowRight className="ml-4 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Upsell: Products Used */}
        <section className="mt-32 space-y-12">
          <div className="space-y-2">
            <h3 className="text-5xl font-headline italic tracking-tighter text-primary">Pro Makeup Used</h3>
            <p className="text-muted-foreground italic text-[12px]">Everything used to get this look.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingRecs ? (
              [1, 2, 3, 4].map(n => <div key={n} className="aspect-[4/5] bg-muted/20 animate-pulse rounded-[3rem]" />)
            ) : (
              PRODUCTS.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group">
                  <Card className="rounded-[3rem] border-none bg-transparent space-y-4 text-center">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-muted/10 shadow-xl transition-all">
                      <Image src={p.image} alt={p.name} fill className="object-cover soft-focus" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] uppercase font-black opacity-40 tracking-widest text-primary">{p.brand}</p>
                       <h4 className="font-headline text-2xl leading-none text-primary italic">{p.name}</h4>
                       <p className="font-bold text-lg text-accent-foreground">{getCurrency()} {p.price.toLocaleString()}</p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
