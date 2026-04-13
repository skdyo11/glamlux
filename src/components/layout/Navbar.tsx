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
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/portal', label: 'Portal', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Navbar - High-Intensity Glass */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/5 backdrop-blur-3xl transition-all duration-700 hidden md:block">
        <div className="w-full px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
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
                  "hover:text-accent-foreground transition-all duration-500 flex items-center gap-1 uppercase tracking-[0.2em] text-[10px] font-black group",
                  pathname === link.href ? "text-accent-foreground scale-105" : "text-muted-foreground"
                )}
              >
                {link.label}
                <span className={cn(
                  "block h-px bg-accent-foreground transition-all duration-500 w-0 group-hover:w-full",
                  pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 border border-white/20 bg-white/10 backdrop-blur-3xl rounded-full hover:scale-110 transition-all duration-500 hover:shadow-lg"
            >
              {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleRegion} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary border border-white/20 bg-white/10 backdrop-blur-3xl h-10 px-4 rounded-full hover:scale-105 transition-all duration-500 hover:shadow-lg">
              <MapPin className="h-3.5 w-3.5 text-accent-foreground" />
              {mounted ? getCurrency() : 'PKR'}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 border border-white/20 bg-white/10 backdrop-blur-3xl rounded-full hover:scale-110 transition-all duration-500 hover:shadow-lg">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[9px] font-black border-2 border-background animate-in zoom-in-50">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Top Utility Bar - Floating Pill Layout */}
      <nav className="fixed top-4 left-4 right-4 z-50 h-14 border border-white/40 bg-white/10 backdrop-blur-3xl md:hidden flex items-center justify-between px-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl ring-1 ring-white/20 overflow-hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center space-x-1.5 group">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
            <span className="font-headline text-lg tracking-tighter text-primary italic">GlamLux</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {!isHome && mounted && (
            <Link href="/" className="animate-in slide-in-from-right-4 fade-in duration-500">
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/10 border border-white/30 rounded-full active:scale-90 transition-all shadow-sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-full active:scale-90 transition-all"
          >
            {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleRegion} className="h-10 px-3 text-[9px] font-black uppercase tracking-widest text-primary bg-white/10 backdrop-blur-md border border-white/30 rounded-full active:scale-95 transition-all">
            {mounted ? getCurrency() : 'PKR'}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-full active:scale-90 transition-all">
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

      {/* Mobile Bottom Bar - Slim Floating Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white/10 backdrop-blur-3xl border border-white/40 rounded-full md:hidden flex items-center justify-around h-12 px-2 shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center h-full gap-0.5 transition-all group">
              <div className={cn(
                "p-2 transition-all duration-500 rounded-full",
                isActive 
                  ? "text-accent-foreground scale-110 bg-white/30 shadow-lg border border-white/50 ring-1 ring-accent-foreground/10" 
                  : "text-muted-foreground/60 hover:text-primary active:scale-95"
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
