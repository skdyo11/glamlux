'use client';

import Link from 'next/link';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

export function Navbar() {
  const { cart, region, toggleRegion } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: '/deals', label: 'Deals' },
    { href: '/shop', label: 'Makeup Shop' },
    { href: '/dashboard', label: 'Partner Portal', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left font-headline text-2xl text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  GlamLux
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-headline hover:text-secondary transition-colors flex items-center gap-3"
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-6 border-t">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => { toggleRegion(); setIsOpen(false); }}>
                    <MapPin className="h-4 w-4 text-secondary" />
                    {region === 'PK' ? 'Pakistan (PKR)' : 'India (INR)'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            <span className="font-headline text-xl md:text-2xl tracking-tighter text-primary">GlamLux</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-secondary transition-colors flex items-center gap-1">
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" onClick={toggleRegion} className="hidden md:flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3 text-secondary" />
            {region === 'PK' ? 'PKR' : 'INR'}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5 text-primary" />
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