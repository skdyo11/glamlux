'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, VENDORS } from '@/app/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { getCurrency } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-[100vw] overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-24">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-luxury-nature/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover grayscale brightness-[0.6] dark:brightness-[0.4]"
              priority
              data-ai-hint="luxury beauty"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-2xl space-y-8">
              <Badge className="bg-accent-foreground/20 text-white backdrop-blur-xl px-5 py-2 uppercase tracking-widest text-[10px] font-black border border-white/20 shadow-xl rounded-none">
                <Sparkles className="h-3 w-3 mr-2 inline" /> Best Beauty Deals
              </Badge>
              <h1 className="text-5xl md:text-7xl font-headline leading-[1.1] text-white drop-shadow-2xl">
                Look <br />
                <span className="italic text-accent-foreground">Great.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-body max-w-xl italic leading-relaxed">
                The best place for makeup and parlour services in Pakistan & India.
              </p>
              <div className="flex flex-wrap gap-4 pt-8">
                <Button asChild size="lg" className="bg-white text-black hover:bg-accent hover:text-black rounded-none px-12 h-16 font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl">
                  <Link href="/deals">Book Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-none px-12 h-16 font-black uppercase tracking-widest text-[10px]">
                  <Link href="/shop">Buy Makeup</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Parlours */}
        <section className="py-32 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
              <div className="space-y-2">
                <h2 className="text-5xl font-headline tracking-tighter text-foreground">Nearby Parlours</h2>
                <p className="text-muted-foreground italic">The best parlours in your area.</p>
              </div>
              <Link href="/vendors" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-foreground hover:scale-105 transition-transform">
                See All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {VENDORS.slice(0, 3).map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group">
                  <Card className="border-none shadow-none overflow-hidden bg-transparent">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-none grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl ring-1 ring-white/10">
                      <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 dark:bg-black/80 text-foreground border-none text-[8px] font-black px-4 py-2 shadow-xl uppercase tracking-widest backdrop-blur-md">
                          {vendor.area_tag}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-8 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-headline italic leading-none group-hover:text-accent-foreground transition-colors text-foreground">{vendor.name}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-accent-foreground uppercase">
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

        {/* Best Deals */}
        <section className="py-32 bg-primary/5 dark:bg-primary/10 rounded-none border-y border-border/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
              <div className="space-y-2">
                <h2 className="text-5xl md:text-6xl font-headline tracking-tighter text-foreground italic leading-none">Best Beauty Deals</h2>
                <p className="text-accent-foreground italic text-lg opacity-80">Special offers curated for you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {DEALS.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block">
                  <Card className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-none overflow-hidden backdrop-blur-xl group-hover:bg-white/20 dark:group-hover:bg-white/10 transition-all duration-700 shadow-2xl ring-1 ring-white/10">
                    <div className="relative h-80 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <Image 
                        src={`https://picsum.photos/seed/deal-${deal.id}/800/600`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover opacity-60 dark:opacity-40 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <div className="p-10 space-y-8">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-foreground/60">{deal.category}</p>
                      <h3 className="text-4xl font-headline leading-tight italic group-hover:text-accent-foreground transition-colors text-foreground">{deal.name}</h3>
                      <div className="flex justify-between items-end pt-6 border-t border-border/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Starts At</span>
                          <span className="text-3xl font-bold text-accent-foreground italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                        </div>
                        <Button variant="ghost" className="text-foreground hover:text-accent-foreground p-0 h-auto hover:bg-transparent">
                          <ArrowRight className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-32 border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 text-center md:text-left">
          <div className="space-y-6 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Sparkles className="h-8 w-8 text-accent-foreground" />
              <span className="font-headline text-4xl tracking-tighter text-foreground">GlamLux</span>
            </div>
            <p className="text-sm text-muted-foreground font-body italic leading-relaxed max-w-sm">
              The best place for makeup and beauty services. Professional results, simple experience.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Help</h4>
            <ul className="space-y-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/portal" className="hover:text-accent-foreground transition-colors">Parlour Owner Area</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Support</Link></li>
              <li><Link href="/messages" className="hover:text-accent-foreground transition-colors">Chat with Us</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Explore</h4>
            <ul className="space-y-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/deals" className="hover:text-accent-foreground transition-colors">Beauty Deals</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground transition-colors">Makeup Shop</Link></li>
              <li><Link href="/vendors" className="hover:text-accent-foreground transition-colors">Parlour List</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-32 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-foreground/30">GlamLux • Since 2024</p>
        </div>
      </footer>
    </div>
  );
}