
'use client';

import Link from 'next/link';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { cart, region, toggleRegion } = useStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-secondary" />
          <span className="font-headline text-2xl tracking-tighter text-primary">GlamLux</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/deals" className="hover:text-secondary transition-colors">Deals</Link>
          <Link href="/shop" className="hover:text-secondary transition-colors">Makeup Shop</Link>
          <Link href="/dashboard" className="hover:text-secondary transition-colors flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            Partner Portal
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={toggleRegion} className="flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3 text-secondary" />
            {region === 'PK' ? 'Pakistan (PKR)' : 'India (INR)'}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
