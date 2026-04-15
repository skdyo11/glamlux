'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Store, Scissors, Moon, Sun, MessageSquare, Home, Heart } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';

export function Navbar() {
  const { cart, favorites, toggleRegion, getCurrency } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const favCount = useMemo(() => (favorites?.products?.length || 0) + (favorites?.vendors?.length || 0), [favorites]);
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = useMemo(() => [
    { href: '/deals', label: 'Deals', icon: Scissors },
    { href: '/shop', label: 'Shop', icon: Store },
    { href: '/vendors', label: 'Parlours', icon: MapPin },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
    { href: '/portal', label: 'My Shop', icon: LayoutDashboard },
  ], []);

  if (!mounted) return null;

  const UtilityGroup = () => (
    <div className="flex items-center p-0.5 bg-background/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm">
      {!isHome && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <Home className="h-3 w-3 text-foreground" />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-7 w-7 rounded-full"
      >
        {theme === 'dark' ? <Sun className="h-3 w-3 text-foreground" /> : <Moon className="h-3 w-3 text-foreground" />}
      </Button>

      <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-7 px-2 rounded-full text-[6px] font-black uppercase tracking-widest text-foreground">
        {getCurrency()}
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-7 w-7 rounded-full">
          <Heart className={cn("h-3 w-3 text-foreground", favCount > 0 && "fill-accent-foreground text-accent-foreground")} />
          {favCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[6px] font-black border border-background z-20 rounded-full">
              {favCount}
            </Badge>
          )}
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-7 w-7 rounded-full">
          <ShoppingBag className="h-3 w-3 text-foreground" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center p-0 bg-destructive text-white text-[6px] font-black border border-background z-20 rounded-full">
              {cartCount}
            </Badge>
          )}
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/5 bg-background/80 backdrop-blur-sm transition-all duration-300 hidden md:block">
        <div className="w-full px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <span className="font-headline text-lg tracking-tighter text-foreground italic">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6 text-[8px] font-black uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-colors",
                  pathname === link.href ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <UtilityGroup />
          </div>
        </div>
      </nav>

      {/* Mobile Top Utility Bar */}
      <nav className="fixed top-2 left-3 right-3 z-50 h-10 border border-border/20 bg-background/80 backdrop-blur-sm md:hidden flex items-center justify-between px-3 shadow-sm rounded-xl">
        <Link href="/" className="flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
          <span className="font-headline text-sm tracking-tighter text-foreground italic">GlamLux</span>
        </Link>

        <div className="flex items-center">
          <UtilityGroup />
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-3 left-6 right-6 z-50 bg-background/90 backdrop-blur-sm border border-border/20 rounded-full md:hidden flex items-center justify-around h-10 px-2 shadow-md">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all">
              <div className={cn(
                "p-1.5 rounded-full",
                isActive ? "text-accent-foreground bg-primary/5" : "text-muted-foreground/60"
              )}>
                <Icon className={cn("h-3.5 w-3.5", isActive && "stroke-[2.5px]")} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
