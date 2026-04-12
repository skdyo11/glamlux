
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PARLOURS } from '@/app/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/hero/1920/1080" 
              alt="Premium Beauty" 
              fill 
              className="object-cover brightness-[0.4]"
              priority
              data-ai-hint="luxury beauty"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl text-white space-y-6">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 backdrop-blur-sm px-4 py-1 text-xs uppercase tracking-widest font-bold">
                Elite Beauty Access
              </Badge>
              <h1 className="text-5xl md:text-7xl font-headline leading-tight">
                Refine Your Elegance with <span className="text-secondary">GlamLux</span>
              </h1>
              <p className="text-lg text-white/80 font-body max-w-lg">
                Exclusive parlour deals and curated makeup collections. High-end services, verified for perfection.
              </p>
              <div className="flex gap-4 pt-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link href="/deals">Browse Deals</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/shop">Shop Makeup</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Deals */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-headline text-primary italic">Featured Parlour Deals</h2>
                <div className="h-1 w-20 bg-secondary" />
              </div>
              <Link href="/deals" className="text-secondary hover:underline text-sm font-medium">View all deals</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DEALS.slice(0, 3).map((deal) => {
                const parlour = PARLOURS.find(p => p.id === deal.parlour_id);
                return (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <Card className="group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-64 overflow-hidden">
                        <Image 
                          src={parlour?.images[0] || 'https://picsum.photos/seed/parlour/800/600'} 
                          alt={deal.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-primary/80 backdrop-blur-sm text-white border-none text-[10px] uppercase font-bold px-3 py-1">
                            {deal.category}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold text-lg px-3 py-1">
                            -{Math.round((1 - deal.discounted_price / deal.price) * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          {parlour?.area_tag}
                        </div>
                        <CardTitle className="text-xl font-headline group-hover:text-secondary transition-colors">
                          {deal.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <p className="text-2xl font-bold text-primary tabular-nums">
                            {deal.discounted_price.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground line-through opacity-60 tabular-nums">
                            {deal.price.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 border-t mt-4 flex justify-between items-center h-12">
                        <div className="flex items-center gap-1 text-xs font-bold text-secondary">
                          <Star className="h-3 w-3 fill-secondary" />
                          {parlour?.rating}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                          <Clock className="h-3 w-3" />
                          Limited Time
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 bg-primary text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Sparkles className="w-full h-full text-secondary" />
          </div>
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-headline leading-tight">A Seamless Fusion of Service and Style</h2>
              <p className="text-white/70 text-lg font-body leading-relaxed">
                Whether you're preparing for your big day or just need a seasonal refresh, GlamLux connects you with the finest artists and premium products. Our unified cart allows you to book a session and purchase the products used in your treatment, all in one elegant flow.
              </p>
              <ul className="space-y-4">
                {[
                  'Verified Parlour Experiences',
                  'Exclusive Makeup Discounts',
                  'One-Click Unified Checkout',
                  'Distance-Based Express Shipping'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <Link href="/about">Learn Our Story</Link>
              </Button>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border-8 border-secondary/20">
               <Image 
                src="https://picsum.photos/seed/service/800/800" 
                alt="Service" 
                fill 
                className="object-cover"
                data-ai-hint="makeup artist"
               />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-secondary" />
            <span className="font-headline text-xl tracking-tighter text-primary">GlamLux</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 GlamLux Marketplace. Premium Standards for Premium Clients.</p>
          <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Partner With Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
