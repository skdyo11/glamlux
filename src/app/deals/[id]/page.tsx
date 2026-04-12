
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
import { Clock, MapPin, Star, Sparkles, ShoppingCart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productRecommendationForDeal } from '@/ai/flows/product-recommendation-for-deal';

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

  if (!deal || !parlour) return null;

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
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={parlour.images[0]} 
                alt={deal.name} 
                fill 
                className="object-cover"
                data-ai-hint="spa treatment"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image 
                    src={`https://picsum.photos/seed/parlour-detail-${n}/400/400`} 
                    alt="Detail" 
                    fill 
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-secondary text-secondary-foreground font-bold tracking-widest px-4">
                  {deal.category.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Star className="h-4 w-4 fill-primary" />
                  {parlour.rating} • Verified Experience
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline text-primary">{deal.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{parlour.name} — {parlour.area_tag}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary tabular-nums">
                  {getCurrency()} {deal.discounted_price.toLocaleString()}
                </span>
                <span className="text-xl text-muted-foreground line-through opacity-50 tabular-nums">
                  {getCurrency()} {deal.price.toLocaleString()}
                </span>
                <Badge variant="outline" className="border-secondary text-secondary text-sm px-2">
                  SAVE {Math.round((1 - deal.discounted_price / deal.price) * 100)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-destructive font-medium italic">
                <Clock className="h-4 w-4" />
                Expires in {Math.floor(Math.random() * 48) + 2} hours (Flash Deal)
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Experience the pinnacle of {deal.category.toLowerCase()} artistry at {parlour.name}. 
                This exclusive package includes deep cleansing, premium mask application, and a revitalizing treatment 
                designed by our senior stylists. Limited availability during peak hours.
              </p>
              <ul className="grid grid-cols-2 gap-y-3">
                {['Premium Products', 'Certified Experts', 'Luxury Ambience', 'Verified Safe'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full bg-primary h-14 text-lg font-bold group" onClick={handleAddToCart}>
              Book Now & Add to Glam Cart
              <ShoppingCart className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Upsell Section - AI Recommended Products */}
        <section className="mt-24 space-y-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-headline italic">Complete Your Experience</h3>
            <p className="text-muted-foreground italic">Recommended makeup products to complement your {deal.category.toLowerCase()} session.</p>
            <div className="h-1 w-20 bg-secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingRecs ? (
              [1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-muted animate-pulse rounded-lg" />)
            ) : (
              PRODUCTS.slice(0, 4).map((product, idx) => (
                <Card key={product.id} className="group border-none shadow-md hover:shadow-xl transition-all">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{product.brand}</p>
                    <h4 className="font-headline text-lg leading-tight truncate">{recommendedProductNames[idx] || product.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{getCurrency()} {product.price.toLocaleString()}</span>
                      <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary-foreground hover:bg-secondary p-0 h-auto font-bold flex items-center gap-1">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
