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
import { Skeleton } from '@/components/ui/skeleton';

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

  const { data: vendor, isLoading: isLoadingVendor } = useDoc(vendorRef);

  const isFav = product ? isFavoriteProduct(product.id) : false;

  const plugin = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  );

  if (!isMounted) return null;

  if (isLoadingProduct || isLoadingVendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-12 md:py-24 space-y-12">
          <div className="flex gap-4"><Skeleton className="h-10 w-32 rounded-full" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-[4/5] rounded-[3rem]" />
            <div className="space-y-8">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-40 w-full rounded-3xl" />
              <div className="grid grid-cols-2 gap-4"><Skeleton className="h-24 rounded-3xl" /><Skeleton className="h-24 rounded-3xl" /></div>
              <Skeleton className="h-20 w-full rounded-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Navbar />
        <h1 className="text-4xl font-headline italic text-primary">Item Not Found</h1>
        <Button asChild className="rounded-full px-8 font-body"><Link href="/shop">Back to Shop</Link></Button>
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
      title: "Added to Collection",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-20 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Button asChild variant="ghost" className="-ml-2 text-muted-foreground hover:text-primary rounded-full font-body">
            <Link href="/shop"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Boutique</Link>
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Artistry Essentials</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
          <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/40 group">
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
                "absolute top-6 right-6 rounded-full backdrop-blur-md transition-all h-12 w-12 z-20 shadow-xl",
                isFav ? "bg-primary text-primary-foreground scale-110" : "bg-white/20 text-white hover:bg-white/40"
              )}
            >
              <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
            </Button>
          </div>

          <div className="space-y-8 md:py-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                  {product.brand}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-widest">
                  <Star className="h-3.5 w-3.5 fill-primary" /> 4.8 Artisan Rating
                </div>
              </div>
              <h1 className="text-5xl md:text-8xl font-headline leading-[0.9] tracking-tighter text-primary italic drop-shadow-sm">
                {product.name}
              </h1>
              
              <div className="flex flex-col gap-6">
                <span className="text-4xl md:text-5xl font-bold italic text-primary tracking-tighter">
                  {getCurrency()} {product.price?.toLocaleString()}
                </span>
                
                {vendor && (
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/vendors/${vendor.id}`} className="inline-flex items-center gap-3 p-5 rounded-[2rem] bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all w-fit group shadow-sm">
                      <Store className="h-5 w-5 text-primary opacity-40 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <p className="text-[8px] uppercase font-black tracking-widest opacity-40 leading-none mb-1">Elite Merchant</p>
                        <p className="text-base font-headline italic text-primary group-hover:translate-x-1 transition-transform">{vendor.name}</p>
                      </div>
                    </Link>
                    <Button asChild variant="outline" className="rounded-[2rem] h-auto p-5 border-primary/10 text-primary hover:bg-primary/5 font-body shadow-sm">
                      <Link href={`/messages?vendorId=${vendor.ownerId}&vendorName=${encodeURIComponent(vendor.name)}&vendorImage=${encodeURIComponent(vendor.imageUrls?.[0] || '')}`}>
                        <MessageCircle className="h-5 w-5 mr-3" /> Contact Shop
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed font-body italic max-w-xl">
                Exquisite formulation curated by {product.brand}. Engineered for professional artistry and unparalleled elegance in every application.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-8 rounded-[2.5rem] bg-secondary/30 flex items-center gap-5 ring-1 ring-black/5 shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-white/50 flex items-center justify-center text-primary">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Elite Logistics</p>
                    <p className="text-sm font-bold font-body">2-4 Artisan Days</p>
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-primary/5 flex items-center gap-5 ring-1 ring-primary/10 shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Verified Origin</p>
                    <p className="text-sm font-bold font-body">100% Authentic</p>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full h-20 bg-primary text-primary-foreground rounded-[2.5rem] text-xl font-bold uppercase tracking-widest text-[10px] shadow-3xl group active:scale-[0.98] transition-all" onClick={handleAddToCart}>
              Add to Artisan Cart
              <ShoppingCart className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
