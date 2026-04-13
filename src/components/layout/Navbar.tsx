
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MapPin, LayoutDashboard, Sparkles, Home, Store, Scissors, Moon, Sun, MessageSquare, Heart } from 'lucide-react';
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

  // Simplified navigation for everyone
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/deals', label: 'Parlours', icon: Scissors },
    { href: '/shop', label: 'Shop', icon: Store },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
    { href: '/portal', label: 'Business', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl transition-colors duration-500 hidden md:block">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Sparkles className="h-6 w-6 text-accent-foreground group-hover:scale-110 transition-transform" />
            <span className="font-headline text-xl md:text-2xl tracking-tighter text-primary">GlamLux</span>
          </Link>

          <div className="flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-colors flex items-center gap-1 uppercase tracking-widest text-[10px] font-black",
                  pathname === link.href ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-primary hover:bg-accent/30 rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={toggleRegion} className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-accent/30">
              <MapPin className="h-3 w-3 text-accent-foreground" />
              {region === 'PK' ? 'PKR' : 'INR'}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-primary hover:bg-accent/30 rounded-full">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-[10px] rounded-full border-2 border-background">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar - Redesigned for kids and adults alike */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 bg-background/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:hidden flex items-center justify-around h-20 px-2 rounded-[2rem] transition-all duration-500">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500",
                isActive ? "bg-primary text-white scale-110 shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-primary"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.1em]",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
        
        {/* Mobile Cart floating bubble */}
        {cartCount > 0 && (
          <Link href="/cart" className="absolute -top-4 right-4">
             <div className="bg-destructive text-white h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-bounce">
               {cartCount}
             </div>
          </Link>
        )}
      </nav>
    </>
  );
}
