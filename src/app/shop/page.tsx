
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
import { Sparkles, ShoppingBag, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
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
      description: `${product.name} added to your collection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="max-w-3xl mb-12 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mx-auto md:mx-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Pure Artistry</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline text-primary tracking-tighter leading-none">The Makeup <br /><span className="italic">Collection</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body italic">
            Professional-grade formulas for a flawless finish.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 flex flex-col md:flex-row gap-4 items-center bg-white/40 p-4 md:p-6 rounded-[2rem] border border-white/60 backdrop-blur-xl shadow-xl shadow-primary/5">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
            <Input 
              placeholder="Search products..." 
              className="pl-12 h-14 bg-white/60 border-none focus-visible:ring-primary/20 rounded-2xl font-body text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-14 w-full md:w-[200px] bg-white/60 border-none rounded-2xl font-bold font-body">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl font-body border-none shadow-2xl">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="font-medium">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                <Card className="border-none bg-white/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] overflow-hidden active:scale-[0.98]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      data-ai-hint="makeup product"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <Button 
                      size="icon" 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-white text-primary hover:bg-primary hover:text-white shadow-2xl z-20 scale-100 md:scale-0 md:group-hover:scale-100 transition-all duration-500"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardHeader className="space-y-2 p-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-black">{product.brand}</p>
                    <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors leading-tight">{product.name}</CardTitle>
                    <div className="flex justify-center items-center gap-2 pt-2">
                       <p className="text-primary font-bold text-lg italic">{getCurrency()} {product.price.toLocaleString()}</p>
                       <ArrowRight className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-primary/20" />
            </div>
            <h3 className="text-4xl font-headline italic">The Search Continues</h3>
            <p className="text-muted-foreground font-body max-w-xs mx-auto">Try refining your filters or search keywords.</p>
          </div>
        )}
      </main>
    </div>
  );
}
