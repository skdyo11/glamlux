
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PRODUCTS } from '@/app/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Sparkles, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { addToCart, getCurrency } = useStore();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
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
      description: `${product.name} has been added.`,
    });
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="max-w-[100vw] overflow-x-hidden">
        {/* Mobile-First Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] flex items-end md:items-center overflow-hidden pb-12 md:pb-0">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-makeup-hero-final/1920/1080" 
              alt="Premium Beauty" 
              fill 
              className="object-cover"
              priority
              data-ai-hint="beauty makeup"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-xl space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-md border border-white/40 mx-auto md:mx-0">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Luxury Collection</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-headline leading-[0.9] tracking-tighter text-foreground drop-shadow-sm">
                Pure <br />
                <span className="italic text-primary">Artistry</span>
              </h1>
              <p className="text-sm md:text-lg text-foreground/70 font-body max-w-sm mx-auto md:mx-0">
                Elite makeup and premium parlour transformations, designed for your most radiant self.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Discovery Tabs/Cards for Mobile */}
        <section className="px-6 -mt-8 relative z-30 grid grid-cols-2 gap-4">
           <Link href="/shop" className="group">
             <Card className="bg-white/40 backdrop-blur-xl border-white/60 p-6 flex flex-col items-center justify-center gap-3 rounded-[2rem] shadow-xl shadow-primary/5 group-active:scale-95 transition-transform h-32 md:h-40">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShoppingBag className="h-6 w-6" /></div>
               <span className="font-headline text-lg italic">Shop Shop</span>
             </Card>
           </Link>
           <Link href="/deals" className="group">
             <Card className="bg-primary text-white p-6 flex flex-col items-center justify-center gap-3 rounded-[2rem] shadow-xl shadow-primary/20 group-active:scale-95 transition-transform h-32 md:h-40">
               <div className="p-3 bg-white/20 rounded-2xl text-white"><Sparkles className="h-6 w-6" /></div>
               <span className="font-headline text-lg italic">Book Glam</span>
             </Card>
           </Link>
        </section>

        {/* Featured Products - Horizontal Scroll on Mobile */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-headline italic">The Essentials</h2>
              <Link href="/shop" className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {PRODUCTS.slice(0, 4).map((product) => (
                <div key={product.id} className="min-w-[240px] md:min-w-0">
                  <Card className="group relative overflow-hidden rounded-[2rem] border-none shadow-lg bg-white/40 backdrop-blur-md">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-5 text-center space-y-2">
                      <p className="text-[10px] uppercase font-bold text-primary/60 tracking-widest">{product.brand}</p>
                      <h3 className="font-headline text-lg leading-tight">{product.name}</h3>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-primary italic">{getCurrency()} {product.price.toLocaleString()}</span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className="rounded-full bg-primary text-white hover:bg-primary/90 h-10 w-10 p-0 flex items-center justify-center"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Deals - Card List */}
        <section className="py-12 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-headline italic mb-8">Elite Transformations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {DEALS.slice(0, 3).map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white active:scale-95 transition-all">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/luxury-beauty-deal-${deal.id}/800/600`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-black uppercase text-[10px] px-3">
                          {deal.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        <MapPin className="h-3 w-3 text-primary" />
                        Exclusive Parlour Access
                      </div>
                      <h3 className="text-2xl font-headline leading-none">{deal.name}</h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-primary italic">{getCurrency()} {deal.discounted_price.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through opacity-50">{getCurrency()} {deal.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-primary/60">
                          <Star className="h-3 w-3 fill-primary" />
                          4.9
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Mini-Section */}
        <section className="py-20 text-center container mx-auto px-10">
           <div className="max-w-md mx-auto space-y-6">
             <Sparkles className="h-8 w-8 text-primary mx-auto opacity-30" />
             <h2 className="text-4xl font-headline tracking-tighter italic">Elegance is Effortless</h2>
             <p className="text-muted-foreground font-body leading-relaxed text-sm">
               Experience beauty unified. We curate the finest products and most prestigious transformations for a seamless journey to radiance.
             </p>
             <Button variant="outline" className="rounded-full border-primary/20 text-primary font-bold uppercase tracking-widest text-[10px] h-12 px-8">
               Our Journal
             </Button>
           </div>
        </section>
      </main>

      <footer className="pt-20 pb-32 md:pb-20 border-t bg-white/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 text-center space-y-8">
          <div className="flex justify-center items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-headline text-2xl tracking-tighter text-primary">GlamLux</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">© 2024 GLAMLUX MARKETPLACE</p>
        </div>
      </footer>
    </div>
  );
}
