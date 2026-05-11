'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, MapPin, Search, Scissors, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { slugify } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { getCurrency } = useStore();
  const firestore = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const topVendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'parlours'), orderBy('rating', 'desc'), limit(4));
  }, [firestore]);

  const { data: topVendors, isLoading: isLoadingVendors } = useCollection(topVendorsQuery);

  const featuredDealsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), limit(6));
  }, [firestore]);

  const { data: deals, isLoading: isLoadingDeals } = useCollection(featuredDealsQuery);

  const handleFindParlours = () => {
    if (searchVal.trim()) {
      router.push(`/vendors?area=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/vendors');
    }
  };

  if (!isMounted) return null;

  const categories = [
    { name: 'Bridal', icon: <Sparkles className="h-6 w-6" />, href: '/deals?category=Bridal' },
    { name: 'Hair', icon: <Scissors className="h-6 w-6" />, href: '/deals?category=Hair' },
    { name: 'Skin', icon: <Heart className="h-6 w-6" />, href: '/deals?category=Skin' },
    { name: 'Products', icon: <ShoppingBag className="h-6 w-6" />, href: '/shop' },
    { name: 'Nails', icon: <Sparkles className="h-6 w-6" />, href: '/deals?category=Nails' },
    { name: 'Spa', icon: <MapPin className="h-6 w-6" />, href: '/deals?category=Spa' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 md:pt-44">
        {/* Marketplace Hero */}
        <section className="bg-secondary/40 dark:bg-muted/10 py-12 md:py-20 px-4 md:px-6">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
                Beauty services and products, <span className="text-primary italic">delivered to you.</span>
              </h1>
              <div className="max-w-xl relative flex items-center shadow-marketplace bg-white dark:bg-card rounded-2xl p-2">
                <MapPin className="ml-2 md:ml-4 h-5 w-5 text-primary" />
                <Input 
                  placeholder="Enter area..." 
                  className="flex-grow border-none focus-visible:ring-0 text-sm md:text-base py-6 px-2 md:px-4"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFindParlours()}
                />
                <Button onClick={handleFindParlours} size="lg" className="rounded-xl px-4 md:px-8 font-bold h-12 md:h-14">Find</Button>
              </div>
            </div>
            <div className="hidden md:block flex-1 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/beauty-marketplace/800/600" 
                alt="Beauty Marketplace" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Explore Categories</h2>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
              {categories.map((cat, i) => (
                <Link 
                  key={`cat-${i}`} 
                  href={cat.href}
                  className="group flex flex-col items-center gap-4 shrink-0 transition-transform active:scale-95"
                >
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-marketplace">
                    {cat.icon}
                  </div>
                  <span className="text-sm font-bold">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Your Daily Deals */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8">Best Offers for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingDeals ? (
                 [1, 2, 3].map(i => <Skeleton key={`deal-skeleton-${i}`} className="h-48 rounded-2xl" />)
              ) : (
                deals?.map((deal) => (
                  <Link 
                    key={deal.id} 
                    href={`/deals/${deal.id}`}
                    className="group relative h-48 rounded-2xl overflow-hidden shadow-marketplace bg-white dark:bg-card border hover:-translate-y-1 transition-all"
                  >
                    <Image src={`https://picsum.photos/seed/deal-${deal.id}/600/400`} alt={deal.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                      <p className="text-white font-bold text-xl leading-tight">{deal.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {deal.basePrice && (
                          <Badge className="bg-primary text-white border-none">{Math.round((1 - deal.discountPrice / deal.basePrice) * 100)}% Off</Badge>
                        )}
                        <span className="text-white text-sm font-medium">{getCurrency()} {deal.discountPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Parlours */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">Top Rated Parlours</h2>
                <p className="text-muted-foreground">The most loved beauty destinations on GlamLux.</p>
              </div>
              <Link href="/vendors" className="text-primary font-bold flex items-center gap-2 hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoadingVendors ? (
                [1, 2, 3, 4].map(n => <Skeleton key={`vendor-skeleton-${n}`} className="h-[350px] rounded-2xl" />)
              ) : (
                topVendors?.map((vendor) => {
                  const vendorSlug = vendor.slug || slugify(vendor.name);
                  return (
                    <Link 
                      key={vendor.id} 
                      href={`/vendors/${vendorSlug}`} 
                      className="group flex flex-col gap-4 transition-all"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-marketplace">
                        <Image 
                          src={vendor.imageUrls?.[0] || 'https://picsum.photos/seed/p-1/400/300'} 
                          alt={vendor.name} 
                          fill 
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold truncate pr-4">{vendor.name}</h3>
                          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                             <Star className="h-4 w-4 fill-current" />
                             <span>{vendor.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {vendor.areaTag}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-20 mt-20 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h4 className="font-bold text-3xl text-primary">GlamLux</h4>
              <p className="text-muted-foreground max-w-md">
                The leading beauty marketplace connecting you with top-tier parlours and professional products.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6">Quick Links</h5>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="/vendors" className="hover:text-primary transition-colors">Find Parlours</Link></li>
                <li><Link href="/shop" className="hover:text-primary transition-colors">Shop Products</Link></li>
                <li><Link href="/deals" className="hover:text-primary transition-colors">Browse Deals</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6">For Partners</h5>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="/portal" className="hover:text-primary transition-colors">List your Parlour</Link></li>
                <li><Link href="/portal" className="hover:text-primary transition-colors">Become a Rider</Link></li>
                <li><Link href="/signup?role=vendor" className="hover:text-primary transition-colors">Partner Signup</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t text-center text-xs text-muted-foreground">
            <p>© 2024 GlamLux Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
