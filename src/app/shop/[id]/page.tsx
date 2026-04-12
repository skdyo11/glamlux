
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { PRODUCTS } from '@/app/lib/mock-data';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, getCurrency } = useStore();
  const { toast } = useToast();

  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-4xl font-headline">Product Not Found</h1>
          <p className="text-muted-foreground">The beauty item you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="rounded-full px-8">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} is now in your collection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-primary">
          <Link href="/shop"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Collection</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/40">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
              data-ai-hint="makeup product"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Product Info */}
          <div className="space-y-8 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                  {product.brand}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <Star className="h-3 w-3 fill-primary" />
                  4.8 • Best Seller
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline leading-tight tracking-tighter text-primary">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold italic text-primary">
                  {getCurrency()} {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground uppercase font-bold tracking-widest">
                  In Stock ({product.stock})
                </span>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed font-body italic">
                A masterpiece of cosmetic formulation. This {product.name.toLowerCase()} by {product.brand} delivers a seamless, professional finish that lasts all day. Designed for the modern individual who demands perfection in every stroke.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-secondary/30 flex items-center gap-4">
                  <div className="p-3 bg-white/50 rounded-2xl"><Truck className="h-6 w-6 text-primary" /></div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Fast Delivery</p>
                    <p className="text-sm font-bold">2-4 Business Days</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-primary/5 flex items-center gap-4">
                  <div className="p-3 bg-white/50 rounded-2xl"><ShieldCheck className="h-6 w-6 text-primary" /></div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Authenticity</p>
                    <p className="text-sm font-bold">100% Genuine Product</p>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 bg-primary text-white rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 group" onClick={handleAddToCart}>
              Add to Glam Cart
              <ShoppingCart className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
