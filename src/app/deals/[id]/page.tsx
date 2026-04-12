
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PARLOURS, PRODUCTS } from '@/app/lib/mock-data';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Star, Sparkles, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productRecommendationForDeal } from '@/ai/flows/product-recommendation-for-deal';
import Link from 'next/link';

export default function DealPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, getCurrency } = useStore();
  const [recommendedProductNames, setRecommendedProductNames] = useState<string[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  const deal = DEALS.find(d => d.id === id);
  const parlour = PARLOURS.find(p => p.id === deal?.parlour_id);

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
        console.error('Failed to get AI recommendations', error);
      } finally {
        setIsLoadingRecs(false);
      }
    }
    getRecommendations();
  }, [deal]);

  if (!deal || !parlour) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-4xl font-headline">Transformation Not Found</h1>
          <p className="text-muted-foreground">This exclusive deal may have expired or is currently unavailable.</p>
          <Button asChild className="rounded-full px-8">
            <Link href="/deals">Explore Other Deals</Link>
          </Button>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: deal.id,
      type: 'deal',
      name: deal.name,
      price: deal.discounted_price,
      quantity: 1,
      image: parlour.images[0]
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-primary">
          <Link href="/deals"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Deals</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40">
              <Image 
                src={parlour.images[0]} 
                alt={deal.name} 
                fill 
                className="object-cover"
                priority
                data-ai-hint="luxury salon"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 bg-white/20 backdrop-blur-sm">
                  <Image 
                    src={`https://picsum.photos/seed/parlour-detail-${n}/400/400`} 
                    alt="Detail" 
                    fill 
                    className="object-cover opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-secondary text-secondary-foreground font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-none shadow-sm">
                  {deal.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Star className="h-4 w-4 fill-primary" />
                  {parlour.rating} • Verified Excellence
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary leading-tight">
                {deal.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground italic font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{parlour.name} — {parlour.area_tag}</span>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold italic text-primary tabular-nums">
                  {getCurrency()} {deal.discounted_price.toLocaleString()}
                </span>
                <span className="text-xl text-muted-foreground line-through opacity-30 tabular-nums">
                  {getCurrency()} {deal.price.toLocaleString()}
                </span>
                <Badge variant="outline" className="border-secondary text-secondary text-[10px] font-black uppercase px-3 rounded-sm">
                  SAVE {Math.round((1 - deal.discounted_price / deal.price) * 100)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-destructive font-black uppercase tracking-widest italic animate-pulse">
                <Clock className="h-3 w-3" />
                Expires in {Math.floor(Math.random() * 48) + 2} hours
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed italic font-body">
                Step into a world of curated elegance at {parlour.name}. 
                This bespoke {deal.category.toLowerCase()} transformation is a signature experience, 
                blending classical artistry with modern luxury. Each session is tailored to your unique radiance.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {['Premium Formulas', 'Elite Stylists', 'Bespoke Environment', 'Safety Verified'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-primary/80">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full h-16 bg-primary text-white rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 group" onClick={handleAddToCart}>
              Secure Booking
              <ShoppingCart className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Upsell Section - AI Recommended Products */}
        <section className="mt-24 space-y-12">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-4xl md:text-5xl font-headline italic tracking-tighter">Glamour Extensions</h3>
            <p className="text-muted-foreground italic font-body text-lg">Curated essentials to maintain your new {deal.category.toLowerCase()} glow.</p>
            <div className="h-1 w-24 bg-secondary mx-auto md:mx-0" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoadingRecs ? (
              [1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-white/40 animate-pulse rounded-[2rem]" />)
            ) : (
              PRODUCTS.slice(0, 4).map((product, idx) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="block group">
                  <Card className="border-none shadow-lg bg-white/40 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <CardContent className="p-6 space-y-3 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-black">{product.brand}</p>
                      <h4 className="font-headline text-xl leading-tight truncate">{recommendedProductNames[idx] || product.name}</h4>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-primary italic text-lg">{getCurrency()} {product.price.toLocaleString()}</span>
                        <div className="text-secondary group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
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
