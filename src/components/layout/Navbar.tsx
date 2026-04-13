'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Store, Scissors, Moon, Sun, MessageSquare } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { cart, region, toggleRegion } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/deals', label: 'Deals', icon: Scissors },
    { href: '/shop', label: 'Shop', icon: Store },
    { href: '/vendors', label: 'Parlours', icon: MapPin },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/portal', label: 'Portal', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/10 backdrop-blur-2xl transition-all duration-700 hidden md:block">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="h-6 w-6 text-accent-foreground group-hover:scale-110 transition-transform duration-500" />
              <span className="font-headline text-2xl tracking-tighter text-primary italic">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-10 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-all duration-500 flex items-center gap-1 uppercase tracking-[0.2em] text-[10px] font-black",
                  pathname === link.href ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 border border-white/20 bg-white/5"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={toggleRegion} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary border border-white/20 bg-white/5 h-10 px-3">
              <MapPin className="h-4 w-4 text-accent-foreground" />
              {region === 'PK' ? 'PKR' : 'INR'}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 border border-white/20 bg-white/5">
                <ShoppingBag className="h-6 w-6" />
                {mounted && cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[9px] font-black border-2 border-background">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Top Utility Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/20 bg-white/10 backdrop-blur-2xl md:hidden flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-1.5 group">
          <Sparkles className="h-5 w-5 text-accent-foreground" />
          <span className="font-headline text-xl tracking-tighter text-primary italic">GlamLux</span>
        </Link>

        <div className="flex items-center space-x-1">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 bg-white/5 border border-white/20"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-9 px-2 text-[9px] font-black uppercase tracking-widest text-primary bg-white/5 border border-white/20">
            {region === 'PK' ? 'PKR' : 'INR'}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 bg-white/5 border border-white/20">
              <ShoppingBag className="h-4 w-4" />
              {mounted && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-white text-[8px] font-black border border-background">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Bar - Smaller & Glassy */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white/10 backdrop-blur-3xl border border-white/30 rounded-full md:hidden flex items-center justify-around h-14 px-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center h-full gap-0.5 transition-all">
              <div className={cn(
                "p-2 transition-all duration-500 rounded-full",
                isActive ? "text-accent-foreground scale-110 bg-white/20 shadow-lg border border-white/40" : "text-muted-foreground/60 hover:text-primary"
              )}>
                <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase tracking-[0.1em]",
                isActive ? "text-accent-foreground" : "text-muted-foreground/40"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
