import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { DEALS, PARLOURS, PRODUCTS } from '@/app/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/makeup-hero/1920/1080" 
              alt="Premium Beauty" 
              fill 
              className="object-cover brightness-[0.7] scale-105 animate-pulse-slow"
              priority
              data-ai-hint="beauty makeup"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent z-10" />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">The Art of Radiance</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-headline leading-tight tracking-tight">
                Your Daily <br />
                <span className="italic text-primary">Glamour</span> Ritual
              </h1>
              <p className="text-xl text-foreground/70 font-body max-w-lg leading-relaxed">
                Discover the ultimate destination for luxury makeup and elite parlour transformations. Curated for the modern connoisseur of beauty.
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-14 text-base shadow-lg shadow-primary/20">
                  <Link href="/shop">Shop the Collection</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/20 hover:border-primary hover:bg-primary/5 rounded-full px-10 h-14 text-base">
                  <Link href="/deals">Book a Transformation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products (Makeup Focus) */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <h2 className="text-4xl font-headline tracking-tight">The Essentials Edit</h2>
                <p className="text-muted-foreground italic">Professional-grade formulas for a flawless finish.</p>
              </div>
              <Link href="/shop" className="group flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                Explore Shop <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.slice(0, 4).map((product) => (
                <Card key={product.id} className="group border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <Button size="icon" className="absolute bottom-4 right-4 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary hover:bg-primary hover:text-white">
                      <ShoppingBag className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardHeader className="space-y-1 p-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">{product.brand}</p>
                    <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
                    <p className="text-primary font-bold text-xl mt-2 italic">PKR {product.price.toLocaleString()}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Parlour Deals */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-16">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-4xl font-headline tracking-tight">Expert Transformations</h2>
                <p className="text-muted-foreground italic">Exclusive sessions at top-tier salons.</p>
              </div>
              <Link href="/deals" className="hidden md:flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase group">
                View All Deals <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {DEALS.slice(0, 3).map((deal) => {
                const parlour = PARLOURS.find(p => p.id === deal.parlour_id);
                return (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 rounded-2xl">
                      <div className="relative h-72 overflow-hidden">
                        <Image 
                          src={parlour?.images[0] || 'https://picsum.photos/seed/parlour/800/600'} 
                          alt={deal.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none text-[10px] uppercase font-black px-3 py-1 tracking-tighter">
                            {deal.category}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-primary text-white font-bold text-sm px-3 py-1 rounded-sm">
                            -{Math.round((1 - deal.discounted_price / deal.price) * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          {parlour?.area_tag}
                        </div>
                        <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors leading-tight">
                          {deal.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-primary italic">PKR {deal.discounted_price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground line-through opacity-50">PKR {deal.price.toLocaleString()}</span>
                      </CardContent>
                      <CardFooter className="pt-4 border-t flex justify-between items-center h-14 bg-secondary/10">
                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                          <Star className="h-3 w-3 fill-primary" />
                          {parlour?.rating} (Verified)
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60 uppercase tracking-tighter italic">
                          <Clock className="h-3 w-3" />
                          Limited Slots
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Brand Promise Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-1/3 h-2/3 opacity-10 pointer-events-none rotate-12">
            <Sparkles className="w-full h-full text-white" />
          </div>
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 relative z-10">
              <h2 className="text-5xl md:text-7xl font-headline leading-[1.1] tracking-tight">Elegance is <br /><span className="italic text-accent">Effortless</span></h2>
              <p className="text-primary-foreground/80 text-xl font-body leading-relaxed max-w-xl">
                At GlamLux, we believe beauty should be as seamless as it is spectacular. Experience a unified journey where professional artistry meets premium product curation.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: 'Verified Artists', desc: 'Top-tier senior stylists' },
                  { label: 'Unified Cart', desc: 'Shop and book at once' },
                  { label: 'Pure Formulas', desc: 'Curated makeup selection' },
                  { label: 'Fast Track', desc: 'Express beauty delivery' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <h4 className="font-bold text-sm tracking-widest uppercase">{item.label}</h4>
                    </div>
                    <p className="text-primary-foreground/60 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-primary rounded-full px-10 h-14 font-bold">
                <Link href="/about">Our Philosophy</Link>
              </Button>
            </div>
            <div className="relative group">
               <div className="absolute -inset-4 border border-accent/30 rounded-3xl translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700" />
               <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                 <Image 
                  src="https://picsum.photos/seed/beauty-ritual/800/1000" 
                  alt="Service" 
                  fill 
                  className="object-cover"
                  data-ai-hint="makeup model"
                 />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-20">
        <div className="container mx-auto px-4 text-center space-y-10">
          <div className="flex justify-center items-center space-x-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-headline text-4xl tracking-tighter text-primary">GlamLux</span>
          </div>
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Redefining luxury beauty through curated experiences and high-performance makeup essentials.
            </p>
          </div>
          <div className="flex justify-center space-x-12 text-[10px] font-bold uppercase tracking-widest text-primary/60">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Journal</Link>
            <Link href="#" className="hover:text-primary transition-colors">Partners</Link>
          </div>
          <p className="text-muted-foreground text-[10px] font-medium pt-10">© 2024 GLAMLUX MARKETPLACE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}