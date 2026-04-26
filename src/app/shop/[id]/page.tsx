
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Star, Heart, Store, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, use, useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, getCurrency, toggleFavoriteProduct, isFavoriteProduct } = useStore();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'products', id);
  }, [firestore, id]);

  const { data: product, isLoading: isLoadingProduct } = useDoc(productRef);

  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !product?.vendorId) return null;
    return doc(firestore, 'parlours', product.vendorId);
  }, [firestore, product?.vendorId]);

  const { data: vendor } = useDoc(vendorRef);

  const isFav = product ? isFavoriteProduct(product.id) : false;

  const plugin = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  );

  if (!isMounted || isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-4xl font-headline italic">Product Not Found</h1>
          <Button asChild className="rounded-full px-8"><Link href="/shop">Back to Shop</Link></Button>
        </main>
      </div>
    );
  }

  const productImages = [
    product.imageUrl,
    `https://picsum.photos/seed/${product.id}-alt1/400/500`,
    `https://picsum.photos/seed/${product.id}-alt2/400/500`,
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} is now in your collection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Button asChild variant="ghost" className="-ml-2 text-muted-foreground hover:text-primary rounded-full">
            <Link href="/shop"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop</Link>
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Products</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/40">
            <Carousel plugins={[plugin.current]} className="w-full h-full" opts={{ loop: true }}>
              <CarouselContent className="h-full -ml-0">
                {productImages.map((img, index) => (
                  <CarouselItem key={index} className="pl-0 h-full relative">
                    <Image src={img || 'https://picsum.photos/seed/prod/400/500'} alt={`${product.name}`} fill className="object-cover" priority={index === 0} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleFavoriteProduct(product.id)}
              className={cn(
                "absolute top-6 right-6 rounded-full backdrop-blur-md transition-all h-12 w-12 z-20",
                isFav ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"
              )}
            >
              <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
            </Button>
          </div>

          <div className="space-y-8 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                  {product.brand}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <Star className="h-3 w-3 fill-primary" /> 4.8 Artisan Rating
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline leading-tight tracking-tighter text-primary">
                {product.name}
              </h1>
              
              <div className="flex flex-col gap-4">
                <span className="text-4xl font-bold italic text-primary">
                  {getCurrency()} {product.price?.toLocaleString()}
                </span>
                
                {vendor && (
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/vendors/${vendor.id}`} className="inline-flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all w-fit group">
                      <Store className="h-5 w-5 text-primary opacity-40 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <p className="text-[8px] uppercase font-black tracking-widest opacity-40 leading-none mb-1">Authentic Seller</p>
                        <p className="text-sm font-headline italic text-primary group-hover:translate-x-1 transition-transform">{vendor.name}</p>
                      </div>
                    </Link>
                    <Button asChild variant="outline" className="rounded-2xl h-auto p-4 border-primary/10 text-primary hover:bg-primary/5">
                      <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                        <MessageCircle className="h-5 w-5 mr-3" /> Chat with Seller
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed font-body italic">
                Professional-grade formulation by {product.brand}. Designed for artisan results and long-lasting elegance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-secondary/30 flex items-center gap-4">
                  <Truck className="h-6 w-6 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Fast Delivery</p>
                    <p className="text-sm font-bold">2-4 Business Days</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-primary/5 flex items-center gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Authentic</p>
                    <p className="text-sm font-bold">100% Genuine</p>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 bg-primary text-primary-foreground rounded-3xl text-xl font-bold shadow-2xl group" onClick={handleAddToCart}>
              Add to Glam Cart
              <ShoppingCart className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
