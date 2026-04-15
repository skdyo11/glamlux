'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Store, Scissors, Moon, Sun, MessageSquare, Home, Heart } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { cart, favorites, toggleRegion, getCurrency } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const favCount = (favorites?.products?.length || 0) + (favorites?.vendors?.length || 0);
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/deals', label: 'Deals', icon: Scissors },
    { href: '/shop', label: 'Shop', icon: Store },
    { href: '/vendors', label: 'Parlours', icon: MapPin },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
    { href: '/portal', label: 'My Shop', icon: LayoutDashboard },
  ];

  if (!mounted) return null;

  const UtilityGroup = () => (
    <div className="flex items-center p-0.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20 dark:border-white/5 shadow-md">
      {!isHome && (
        <Link href="/" className="animate-in slide-in-from-right-2 fade-in duration-300">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 transition-all">
            <Home className="h-3.5 w-3.5 text-foreground" />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-8 w-8 rounded-full hover:bg-white/10 transition-all"
      >
        {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-foreground" /> : <Moon className="h-3.5 w-3.5 text-foreground" />}
      </Button>

      <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-8 px-2 rounded-full text-[7px] font-black uppercase tracking-widest text-foreground hover:bg-white/10 transition-all">
        {getCurrency()}
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full hover:bg-white/10 transition-all">
          <Heart className={cn("h-3.5 w-3.5 text-foreground", favCount > 0 && "fill-accent-foreground text-accent-foreground")} />
          {favCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[6px] font-black border border-background z-20 rounded-full">
              {favCount}
            </Badge>
          )}
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full hover:bg-white/10 transition-all">
          <ShoppingBag className="h-3.5 w-3.5 text-foreground" />
          {cartCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center p-0 bg-destructive text-white text-[6px] font-black border border-background z-20 rounded-full">
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
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 dark:border-white/5 bg-white/5 dark:bg-black/40 backdrop-blur-md transition-all duration-300 hidden md:block">
        <div className="w-full px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="h-5 w-5 text-accent-foreground group-hover:scale-110 transition-transform duration-300" />
              <span className="font-headline text-xl tracking-tighter text-foreground italic">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-all duration-300 flex flex-col items-center gap-1 uppercase tracking-[0.2em] text-[9px] font-black group relative",
                  pathname === link.href ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 h-px bg-accent-foreground transition-all duration-300 w-0 group-hover:w-full",
                  pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <UtilityGroup />
          </div>
        </div>
      </nav>

      {/* Mobile Top Utility Bar */}
      <nav className="fixed top-3 left-3 right-3 z-50 h-12 border border-white/40 dark:border-white/10 bg-white/10 dark:bg-black/40 backdrop-blur-md md:hidden flex items-center justify-between px-3 shadow-lg rounded-2xl">
        <Link href="/" className="flex items-center space-x-1.5 group">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
          <span className="font-headline text-base tracking-tighter text-foreground italic">GlamLux</span>
        </Link>

        <div className="flex items-center">
          <UtilityGroup />
        </div>
      </nav>

      {/* Mobile Bottom Bar - Removed overflow-hidden to prevent badge clipping */}
      <nav className="fixed bottom-4 left-6 right-6 z-50 bg-white/10 dark:bg-black/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-full md:hidden flex items-center justify-around h-11 px-2 shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center h-full transition-all">
              <div className={cn(
                "p-2 transition-all duration-200 rounded-full",
                isActive 
                  ? "text-accent-foreground scale-105 bg-white/20 dark:bg-white/10 border border-white/40" 
                  : "text-muted-foreground/60 active:scale-95"
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