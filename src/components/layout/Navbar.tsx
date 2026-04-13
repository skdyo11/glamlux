
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Home, Store, Scissors, Moon, Sun, MessageSquare } from 'lucide-react';
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
      {/* Desktop Navbar - Professional Minimalist */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl transition-all duration-700 hidden md:block">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
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

          <div className="flex items-center space-x-4">
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-primary hover:bg-accent/20 rounded-none h-12 w-12"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={toggleRegion} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-accent/20 px-4 h-12 rounded-none">
              <MapPin className="h-4 w-4 text-accent-foreground" />
              {region === 'PK' ? 'PKR' : 'INR'}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-primary hover:bg-accent/20 rounded-none h-12 w-12">
                <ShoppingBag className="h-6 w-6" />
                {mounted && cartCount > 0 && (
                  <Badge className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[9px] font-black rounded-none border-2 border-background">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar - Sleek & Semi-Transparent */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-white/20 md:hidden flex items-center justify-around h-20 px-4 transition-all duration-700">
        {[...navLinks, { href: '/', label: 'Home', icon: Home }].map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full gap-2 transition-all">
              <div className={cn(
                "p-2.5 transition-all duration-500",
                isActive ? "text-accent-foreground scale-110" : "text-muted-foreground/60 hover:text-primary"
              )}>
                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.15em]",
                isActive ? "text-accent-foreground" : "text-muted-foreground/40"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
        
        {/* Mobile Cart floating bubble */}
        {mounted && cartCount > 0 && (
          <Link href="/cart" className="absolute -top-16 right-6">
             <div className="bg-destructive text-white h-12 w-12 rounded-none flex items-center justify-center text-xs font-black shadow-2xl">
               {cartCount}
             </div>
          </Link>
        )}
      </nav>
    </>
  );
}
