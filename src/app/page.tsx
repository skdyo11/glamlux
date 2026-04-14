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

export default function Home() {
  const { getCurrency } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-[100vw] overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden py-24">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/glam-luxury-nature/1920/1080" 
              alt="Elite Beauty" 
              fill 
              className="object-cover brightness-[0.6] dark:brightness-[0.4]"
              priority
              data-ai-hint="luxury beauty"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Badge className="bg-accent-foreground/30 text-white backdrop-blur-xl px-4 py-1.5 uppercase tracking-widest text-[9px] font-black border border-white/10 rounded-full">
                <Sparkles className="h-3 w-3 mr-2 inline text-secondary" /> Best Beauty Deals
              </Badge>
              <h1 className="text-4xl md:text-5xl font-headline leading-tight text-white">
                Look <br />
                <span className="italic text-secondary">Great.</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 font-body max-w-xl italic leading-relaxed">
                The best place for makeup and parlour services in Pakistan & India.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-white rounded-full px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-2xl border-none">
                  <Link href="/deals">Book Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/5 backdrop-blur-md text-white rounded-full px-10 h-14 font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                  <Link href="/shop">Buy Makeup</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Parlours */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-1">
                <h2 className="text-4xl font-headline tracking-tighter text-foreground">Nearby Parlours</h2>
                <p className="text-muted-foreground text-sm italic">The best parlours in your area.</p>
              </div>
              <Link href="/vendors" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-foreground">
                See All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VENDORS.slice(0, 3).map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group interactive-element">
                  <Card className="border-none shadow-none overflow-hidden bg-transparent">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] transition-all duration-500 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                      <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover soft-focus" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 dark:bg-black/70 text-foreground border-none text-[8px] font-black px-3 py-1.5 shadow-lg uppercase tracking-widest backdrop-blur-md rounded-full">
                          {vendor.area_tag}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-6 px-2 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-headline italic leading-none group-hover:text-accent-foreground transition-colors text-foreground">{vendor.name}</h3>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-accent-foreground uppercase">
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
        <section className="py-24 bg-secondary/20 dark:bg-white/5 border-y border-border/10">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-headline tracking-tighter text-foreground italic leading-none">Best Beauty Deals</h2>
              <p className="text-accent-foreground italic text-base opacity-80 mt-2">Special offers picked for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {DEALS.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="group block interactive-element">
                  <Card className="liquid-glass rounded-[2.5rem] overflow-hidden group-hover:bg-white/30 dark:group-hover:bg-black/40 transition-all duration-300 shadow-2xl ring-1 ring-white/10 border-none">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/deal-${deal.id}/800/600`} 
                        alt={deal.name} 
                        fill 
                        className="object-cover soft-focus opacity-90 group-hover:opacity-100" 
                      />
                    </div>
                    <div className="p-8 space-y-6">
                      <p className="text-[9px] uppercase font-black tracking-[0.3em] text-accent-foreground/60">{deal.category}</p>
                      <h3 className="text-3xl font-headline leading-tight italic group-hover:text-accent-foreground transition-colors text-foreground">{deal.name}</h3>
                      <div className="flex justify-between items-end pt-4 border-t border-border/10">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Starts At</span>
                          <span className="text-2xl font-bold text-accent-foreground italic">{getCurrency()} {deal.discount_price.toLocaleString()}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
              <span className="font-headline text-3xl tracking-tighter text-foreground">GlamLux</span>
            </div>
            <p className="text-xs text-muted-foreground font-body italic leading-relaxed max-w-sm">
              The best place for makeup and beauty services. Simple, fast, and professional.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Help</h4>
            <ul className="space-y-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/portal" className="hover:text-accent-foreground">Parlour Owner Area</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground">Support</Link></li>
              <li><Link href="/messages" className="hover:text-accent-foreground">Chat with Us</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Explore</h4>
            <ul className="space-y-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/deals" className="hover:text-accent-foreground">Beauty Deals</Link></li>
              <li><Link href="/shop" className="hover:text-accent-foreground">Makeup Shop</Link></li>
              <li><Link href="/vendors" className="hover:text-accent-foreground">Parlour List</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-20 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-accent-foreground/30">GlamLux • Since 2024</p>
        </div>
      </footer>
    </div>
  );
}