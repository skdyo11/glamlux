'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { PRODUCTS } from '@/app/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ShoppingBag, Search, SlidersHorizontal } from 'lucide-react';
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
      description: `${product.name} has been added to your glam collection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <header className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Pure Artistry</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline text-primary">The Makeup Edit</h1>
          <p className="text-xl text-muted-foreground font-body italic">
            Professional-grade formulas curated for a flawless, high-definition finish. Shop the GlamLux Couture collection.
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 flex flex-col md:flex-row gap-4 items-center bg-white/50 p-6 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-sm">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products or brands..." 
              className="pl-10 h-12 bg-white border-primary/10 focus-visible:ring-primary/20 rounded-xl font-body"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-primary hidden md:block" />
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-12 w-full md:w-[180px] bg-white border-primary/10 rounded-xl font-bold font-body">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-body">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="font-medium">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    data-ai-hint="makeup product"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                  <Button 
                    size="icon" 
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-4 right-4 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary hover:bg-primary hover:text-white shadow-xl z-10"
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </Button>
                </div>
                <CardHeader className="space-y-1 p-6 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">{product.brand}</p>
                  <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
                  <p className="text-primary font-bold text-xl mt-2 italic">{getCurrency()} {product.price.toLocaleString()}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="text-2xl font-headline">No Products Found</h3>
            <p className="text-muted-foreground font-body">Try a different search term or brand selection.</p>
          </div>
        )}
      </main>
    </div>
  );
}
