
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
    { href: '/messages', label: 'Chats', icon: MessageSquare },
    { href: '/portal', label: 'Portal', icon: LayoutDashboard },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl transition-colors duration-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Sparkles className="h-6 w-6 text-accent-foreground group-hover:scale-110 transition-transform" />
            <span className="font-headline text-xl md:text-2xl tracking-tighter text-primary">GlamLux</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-colors flex items-center gap-1",
                  pathname === link.href ? "text-accent-foreground font-bold" : "text-muted-foreground"
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

            <Button variant="ghost" size="sm" onClick={toggleRegion} className="hidden sm:flex items-center gap-2 text-xs font-bold text-primary hover:bg-accent/30">
              <MapPin className="h-3 w-3 text-accent-foreground" />
              {region === 'PK' ? 'PKR' : 'INR'}
            </Button>

            {pathname !== '/' && (
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-accent/30 rounded-full">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            )}

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

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t md:hidden flex items-center justify-around h-20 px-2 pb-safe transition-colors duration-500">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 scale-110" : "text-muted-foreground"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isActive ? "text-accent-foreground" : "text-muted-foreground"
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
