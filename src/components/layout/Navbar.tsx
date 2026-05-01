'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Settings } from 'lucide-react';

// Precision-Crafted Single-Path SVGs - Chunky Black Label Aesthetic
const CustomIcon = ({ type, isActive, className }: { type: string, isActive: boolean, className?: string }) => {
  const commonProps = {
    viewBox: "0 0 24 24",
    className: className,
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: isActive ? "currentColor" : "none"
  };

  // Home: Geometric Pentagon
  if (type === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M3 10L12 2l9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
      </svg>
    );
  }
  // Products: Chunky Box
  if (type === 'products') {
    return (
      <svg {...commonProps}>
        <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z" />
        <path d="M12 12L3 8" fill="none" />
        <path d="M12 12l9-4" fill="none" />
        <path d="M12 12v9" fill="none" />
      </svg>
    );
  }
  // Parlours: Studio Facade
  if (type === 'vendors') {
    return (
      <svg {...commonProps}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
        <path d="M9 22V12h6v10" fill="none" />
      </svg>
    );
  }
  // Chat: Rounded Message
  if (type === 'chat') {
    return (
      <svg {...commonProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  // Favorites: Bold Heart
  if (type === 'favorites') {
    return (
      <svg {...commonProps}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  // Cart: Boutique Bag
  if (type === 'cart') {
    return (
      <svg {...commonProps}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
        <path d="M3 6h18" fill="none" />
        <path d="M16 10a4 4 0 0 1-8 0" fill="none" />
      </svg>
    );
  }
  return null;
};

export function Navbar() {
  const { cart } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bottomNavLinks = useMemo(() => [
    { href: '/shop', label: 'Products', type: 'products' },
    { href: '/vendors', label: 'Parlours', type: 'vendors' },
    { href: '/messages', label: 'Chat', type: 'chat' },
  ], []);

  if (!mounted) return null;

  const UtilityGroup = () => (
    <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-full border border-primary/10 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-9 w-9 rounded-full text-primary"
      >
        {theme === 'dark' ? 
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> : 
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        }
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
          <CustomIcon type="favorites" isActive={pathname === '/favorites'} className="h-4 w-4" />
        </Button>
      </Link>

      <Link href={user ? "/portal" : "/login"}>
        <Avatar className="h-9 w-9 border border-primary/10 cursor-pointer hover:scale-105 transition-transform">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">{user?.displayName?.[0] || user?.email?.[0] || 'G'}</AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl hidden md:block">
        <div className="container mx-auto h-20 flex items-center justify-between px-6">
          <Link href="/" className="font-headline text-4xl tracking-tighter text-primary italic leading-none">GlamLux</Link>

          <div className="flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.4em]">
            {bottomNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-secondary transition-all duration-300 flex items-center gap-2",
                  pathname.startsWith(link.href) ? "text-primary" : "text-primary/40"
                )}
              >
                <CustomIcon type={link.type} isActive={pathname.startsWith(link.href)} className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative group">
              <CustomIcon type="cart" isActive={pathname === '/cart'} className="h-5 w-5 text-primary" />
              {cartCount > 0 && <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-secondary text-primary-foreground text-[8px] rounded-full">{cartCount}</Badge>}
            </Link>
            <UtilityGroup />
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-primary/10 bg-background/80 backdrop-blur-2xl md:hidden flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/portal">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary">
              <Menu className="h-6 w-6" strokeWidth={2.5} />
            </Button>
          </Link>
          <Link href="/" className="font-headline text-2xl tracking-tighter text-primary italic leading-none">GlamLux</Link>
        </div>
        <UtilityGroup />
      </nav>

      {/* Mobile Bottom Utility Capsule - Refined & Compact */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-lg">
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-3xl border border-primary/10 h-20 flex items-center justify-between shadow-3xl rounded-full px-8 ring-1 ring-black/5">
          {bottomNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all group flex-1">
                <div className={cn(
                  "w-11 h-11 flex items-center justify-center transition-all duration-300 rounded-full mb-0.5",
                  isActive ? "bg-primary/5" : ""
                )}>
                  <CustomIcon type={link.type} isActive={isActive} className="h-6 w-6 text-primary" />
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] transition-all text-primary",
                  isActive ? "opacity-100" : "opacity-30"
                )}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
