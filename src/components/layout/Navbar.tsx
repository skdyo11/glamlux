'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Store, Scissors, Moon, Sun, MessageSquare, Home } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { cart, region, toggleRegion, getCurrency } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
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

  return (
    <>
      {/* Desktop Navbar - High-Intensity Glass */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-3xl transition-all duration-700 hidden md:block">
        <div className="w-full px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="h-6 w-6 text-accent-foreground group-hover:scale-110 transition-transform duration-500" />
              <span className="font-headline text-2xl tracking-tighter text-foreground italic">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-12 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-all duration-500 flex flex-col items-center gap-1 uppercase tracking-[0.2em] text-[10px] font-black group relative",
                  pathname === link.href ? "text-accent-foreground scale-105" : "text-muted-foreground"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 h-px bg-accent-foreground transition-all duration-500 w-0 group-hover:w-full",
                  pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Utility Group */}
            <div className="flex items-center p-1 bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 dark:border-white/5 shadow-xl">
              {!isHome && mounted && (
                <Link href="/" className="animate-in slide-in-from-right-4 fade-in duration-500">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/20 transition-all duration-500">
                    <Home className="h-4 w-4 text-foreground" />
                  </Button>
                </Link>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 rounded-full hover:bg-white/20 transition-all duration-500"
              >
                {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />) : <Moon className="h-4 w-4 text-foreground" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-10 px-4 rounded-full text-[9px] font-black uppercase tracking-widest text-foreground hover:bg-white/20 transition-all duration-500">
                <MapPin className="h-3.5 w-3.5 mr-2 text-accent-foreground" />
                {mounted ? getCurrency() : 'PKR'}
              </Button>

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-white/20 transition-all duration-500">
                  <ShoppingBag className="h-4 w-4 text-foreground" />
                  {mounted && cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-white text-[8px] font-black border-2 border-background animate-in zoom-in-50 z-10 shadow-lg">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Utility Bar - Floating Pill Layout */}
      <nav className="fixed top-4 left-4 right-4 z-50 h-14 border border-white/40 dark:border-white/10 bg-white/10 dark:bg-black/40 backdrop-blur-3xl md:hidden flex items-center justify-between px-4 shadow-2xl rounded-2xl ring-1 ring-white/20 overflow-visible">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center space-x-1.5 group">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
            <span className="font-headline text-lg tracking-tighter text-foreground italic">GlamLux</span>
          </Link>
        </div>

        <div className="flex items-center space-x-1.5 p-1 bg-white/10 dark:bg-white/5 rounded-full ring-1 ring-white/10">
          {!isHome && mounted && (
            <Link href="/" className="animate-in slide-in-from-right-4 fade-in duration-500">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/10 border border-white/20 rounded-full active:scale-90 transition-all shadow-sm">
                <Home className="h-3.5 w-3.5 text-foreground" />
              </Button>
            </Link>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full active:scale-90 transition-all"
          >
            {mounted ? (theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-foreground" /> : <Moon className="h-3.5 w-3.5 text-foreground" />) : <Moon className="h-3.5 w-3.5 text-foreground" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-9 px-3 text-[8px] font-black uppercase tracking-widest text-foreground bg-white/10 backdrop-blur-md border border-white/20 rounded-full active:scale-95 transition-all">
            {mounted ? getCurrency() : 'PKR'}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full active:scale-90 transition-all overflow-visible">
              <ShoppingBag className="h-3.5 w-3.5 text-foreground" />
              {mounted && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center p-0 bg-destructive text-white text-[7px] font-black border border-background z-10 shadow-lg">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Bar - Slim Floating Navigation */}
      <nav className="fixed bottom-6 left-8 right-8 z-50 bg-white/10 dark:bg-black/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-full md:hidden flex items-center justify-around h-12 px-2 shadow-2xl ring-1 ring-white/20">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center h-full gap-0.5 transition-all group">
              <div className={cn(
                "p-2.5 transition-all duration-500 rounded-full",
                isActive 
                  ? "text-accent-foreground scale-110 bg-white/30 dark:bg-white/10 shadow-xl border border-white/50 ring-1 ring-accent-foreground/20" 
                  : "text-muted-foreground/70 hover:text-foreground active:scale-95"
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