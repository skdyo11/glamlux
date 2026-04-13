
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PRODUCTS, VENDORS } from '@/app/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Sparkles, ArrowRight, ShoppingBag, Heart, Navigation } from 'lucide-react';
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
      title: "Added to Bag!",
      description: `${product.name} is now yours.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-[100vw] overflow-x-hidden">
        {/* Hero Section - Super Simple */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden py-12">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-makeup-hero-final/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-2xl space-y-6">
              <Badge className="bg-accent text-accent-foreground px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold border-none shadow-sm">
                Magic Beauty Helpers
              </Badge>
              <h1 className="text-6xl md:text-9xl font-headline leading-[1] text-white drop-shadow-2xl py-2">
                Find Your <br />
                <span className="italic text-accent">Sparkle.</span>
              </h1>
              <p className="text-lg text-white/90 font-body max-w-sm italic leading-relaxed">
                The easiest way to book beauty treats and shop for cool makeup. High-fives and sparkles included!
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-black hover:bg-accent rounded-full px-10 h-16 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl">
                  <Link href="/deals">Book a Treat</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-10 h-16 font-black uppercase tracking-widest text-[10px]">
                  <Link href="/shop">Go Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Discovery Feed: Nearby Parlours */}
        <section className="py-20 bg-white/50">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-1">
                <h2 className="text-4xl font-headline tracking-tighter">Beauty Spots Near You</h2>
                <p className="text-muted-foreground italic">Friendly places for a quick glow-up.</p>
              </div>
              <Link href="/deals" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-foreground">
                See All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VENDORS.slice(0, 3).map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group">
                  <Card className="border-none shadow-none overflow-hidden bg-transparent">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-700 shadow-lg">
                      <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-accent-foreground border-none text-[8px] uppercase font-black px-3 py-1.5 shadow-sm rounded-full">
                          {vendor.area_tag}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-6 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-headline leading-none group-hover:text-accent-foreground transition-colors">{vendor.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-accent-foreground">
                          <Star className="h-3 w-3 fill-accent-foreground" /> {vendor.rating}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Treats */}
        <section className="py-24 charcoal-gradient text-white rounded-[4rem] mx-4 my-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
              <div className="space-y-1">
                <h2 className="text-5xl font-headline tracking-tighter text-white italic">Best Treats</h2>
                <p className="text-accent italic">Super cool makeovers picked just for you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {DEALS.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block">
                  <Card className="bg-white/5 border-none rounded-[3rem] overflow-hidden group-hover:bg-white/10 transition-all duration-500 shadow-2xl">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/deal-${deal.id}/800/600`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <div className="p-8 space-y-6">
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-accent/80">{deal.category}</p>
                      <h3 className="text-3xl font-headline leading-tight italic group-hover:text-accent transition-colors">{deal.name}</h3>
                      <div className="flex justify-between items-end pt-4 border-t border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-white/40">Price</span>
                          <span className="text-2xl font-bold text-accent italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                        </div>
                        <Button variant="ghost" className="text-white hover:text-accent p-0">
                          <ArrowRight className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* The Boutique */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-1">
                <h2 className="text-5xl font-headline tracking-tighter">The Makeup Box</h2>
                <p className="text-muted-foreground italic">Fun things to make you look awesome.</p>
              </div>
              <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-foreground">
                Shop Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                  <div className="space-y-4 text-center">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted/20 shadow-lg">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <Button 
                        size="icon" 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white text-destructive hover:bg-destructive hover:text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-accent-foreground tracking-widest">{product.brand}</p>
                      <h3 className="font-headline text-xl leading-none group-hover:text-destructive transition-colors">{product.name}</h3>
                      <p className="font-bold text-lg text-primary">{getCurrency()} {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t bg-muted/20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
              <span className="font-headline text-3xl tracking-tighter">GlamLux</span>
            </div>
            <p className="text-xs text-muted-foreground font-body italic leading-relaxed">
              Find cool places to look pretty. Best makeup shop ever. Pakistan & India.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Help</h4>
            <ul className="space-y-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <li><Link href="/portal" className="hover:text-accent-foreground transition-colors">Business Stuff</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Support</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Discover</h4>
            <ul className="space-y-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <li><Link href="/deals" className="hover:text-accent-foreground transition-colors">Parlours</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Makeup Box</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-foreground/40">Made with ❤️ for everyone</p>
        </div>
      </footer>
    </div>
  );
}
