
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { PRODUCTS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ShoppingBag, Search, ArrowRight } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function ShopPage() {
  const { addToCart, getCurrency } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'All' || product.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const brands = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.brand)))];

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
      description: `${product.name} has been added to your collection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 md:py-24">
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-none bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Elite Boutique</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline text-primary tracking-tighter leading-none italic">The Artistry <br /><span>Collection</span></h1>
          <p className="text-xl text-muted-foreground font-body italic max-w-2xl">
            Professional-grade formulas curated for precision and timeless elegance.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-20 flex flex-col md:flex-row gap-6 items-center bg-white/30 p-6 md:p-8 rounded-none border border-white/60 backdrop-blur-xl shadow-2xl">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input 
              placeholder="Search professional catalog..." 
              className="pl-16 h-16 bg-white/60 border-none focus-visible:ring-primary/20 rounded-none font-body text-lg italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-16 w-full md:w-[220px] bg-white/60 border-none rounded-none font-black text-[10px] uppercase tracking-[0.2em]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-body border-none shadow-2xl">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="font-bold text-[10px] uppercase tracking-widest">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                <Card className="border-none bg-white/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-1000 rounded-none overflow-hidden active:scale-[0.99]">
                  <div className="relative aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <Button 
                      variant="default"
                      size="icon" 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="absolute bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-20 scale-100 md:scale-0 md:group-hover:scale-100 transition-all duration-500"
                    >
                      <ShoppingBag className="h-6 w-6" />
                    </Button>
                  </div>
                  <CardHeader className="space-y-4 p-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-black">{product.brand}</p>
                    <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors leading-tight italic">{product.name}</CardTitle>
                    <div className="flex justify-center items-center gap-3 pt-2">
                       <p className="text-primary font-bold text-xl italic">{getCurrency()} {product.price.toLocaleString()}</p>
                       <ArrowRight className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8">
            <div className="bg-primary/5 w-32 h-32 rounded-none flex items-center justify-center mx-auto border-2 border-dashed border-primary/10">
              <Search className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-5xl font-headline italic">Catalog Exhausted</h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto italic text-lg leading-relaxed">No artisan products matched your current selection.</p>
          </div>
        )}
      </main>
    </div>
  );
}
