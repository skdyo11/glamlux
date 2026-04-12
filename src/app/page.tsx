
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

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
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
              <h1 className="text-6xl md:text-9xl font-headline leading-[0.8] tracking-tighter text-foreground drop-shadow-sm">
                Pure <br />
                <span className="italic text-primary">Artistry</span>
              </h1>
              <p className="text-sm md:text-lg text-foreground/70 font-body max-w-sm mx-auto md:mx-0 italic">
                Elite makeup and premium parlour transformations, designed for your most radiant self.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Discovery Tabs/Cards for Mobile */}
        <section className="px-6 -mt-12 relative z-30 grid grid-cols-2 gap-4">
           <Link href="/shop" className="group">
             <Card className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 flex flex-col items-center justify-center gap-3 rounded-[2.5rem] shadow-2xl shadow-primary/5 group-active:scale-95 transition-all h-36 md:h-48">
               <div className="p-4 bg-primary/10 rounded-[1.25rem] text-primary group-hover:scale-110 transition-transform"><ShoppingBag className="h-8 w-8" /></div>
               <span className="font-headline text-xl italic">Shop Shop</span>
             </Card>
           </Link>
           <Link href="/deals" className="group">
             <Card className="bg-primary text-white p-6 flex flex-col items-center justify-center gap-3 rounded-[2.5rem] shadow-2xl shadow-primary/20 group-active:scale-95 transition-all h-36 md:h-48">
               <div className="p-4 bg-white/20 rounded-[1.25rem] text-white group-hover:scale-110 transition-transform"><Sparkles className="h-8 w-8" /></div>
               <span className="font-headline text-xl italic">Book Glam</span>
             </Card>
           </Link>
        </section>

        {/* Featured Products - Horizontal Scroll on Mobile */}
        <section className="py-16 md:py-32">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <h2 className="text-4xl md:text-5xl font-headline italic tracking-tighter">The Essentials</h2>
                <div className="h-1 w-12 bg-secondary" />
              </div>
              <Link href="/shop" className="text-primary font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-1 transition-all">
                Collection <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-10 overflow-x-auto pb-10 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {PRODUCTS.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="min-w-[280px] md:min-w-0 group block">
                  <Card className="relative overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white/40 backdrop-blur-md hover:shadow-2xl transition-all duration-700">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-6 right-6 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
                        onClick={(e) => { e.preventDefault(); }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-8 text-center space-y-3">
                      <p className="text-[10px] uppercase font-black text-primary/60 tracking-[0.2em]">{product.brand}</p>
                      <h3 className="font-headline text-2xl leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex justify-between items-center pt-4">
                        <span className="font-bold text-primary italic text-xl">{getCurrency()} {product.price.toLocaleString()}</span>
                        <Button 
                          size="sm" 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="rounded-full bg-primary text-white hover:bg-primary/90 h-12 w-12 p-0 flex items-center justify-center shadow-lg shadow-primary/20"
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Deals - Card List */}
        <section className="py-16 md:py-32 bg-secondary/10 backdrop-blur-xl">
          <div className="container mx-auto px-6">
             <div className="space-y-1 mb-12 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-headline italic tracking-tighter">Elite Transformations</h2>
                <div className="h-1 w-24 bg-primary mx-auto md:mx-0" />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {DEALS.slice(0, 3).map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block">
                  <Card className="relative overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white hover:shadow-primary/5 active:scale-[0.98] transition-all duration-700">
                    <div className="relative h-72 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/luxury-beauty-deal-${deal.id}/800/600`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                      />
                      <div className="absolute top-8 left-8">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-black uppercase text-[10px] px-4 py-1.5 rounded-full border-none shadow-sm">
                          {deal.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <MapPin className="h-3 w-3 text-primary" />
                        Exclusive Parlour Access
                      </div>
                      <h3 className="text-3xl font-headline leading-none group-hover:text-primary transition-colors">{deal.name}</h3>
                      <div className="flex justify-between items-center border-t border-dashed pt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary italic">{getCurrency()} {deal.discounted_price.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through opacity-30">{getCurrency()} {deal.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-black text-primary/60">
                          <Star className="h-4 w-4 fill-primary" />
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
        <section className="py-32 text-center container mx-auto px-10">
           <div className="max-w-md mx-auto space-y-8">
             <Sparkles className="h-10 w-10 text-primary mx-auto opacity-20" />
             <h2 className="text-5xl font-headline tracking-tighter italic leading-none">Elegance is <br />Effortless</h2>
             <p className="text-muted-foreground font-body leading-relaxed text-lg italic">
               Experience beauty unified. We curate the finest products and most prestigious transformations for a seamless journey to radiance.
             </p>
             <Button variant="outline" className="rounded-full border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[10px] h-14 px-12 hover:bg-primary/5 transition-colors">
               Our Journal
             </Button>
           </div>
        </section>
      </main>

      <footer className="pt-24 pb-32 md:pb-20 border-t bg-white/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="flex justify-center items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl tracking-tighter text-primary">GlamLux</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">© 2024 GLAMLUX MARKETPLACE</p>
        </div>
      </footer>
    </div>
  );
}
