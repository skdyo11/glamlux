'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

// Precision-Crafted Single-Path SVGs - Matching Flaticon Aesthetic
const CustomIcon = ({ type, isActive, className }: { type: string, isActive: boolean, className?: string }) => {
  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.11L12 2l9 8.11V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {isActive && <path d="M3 10.11L12 2l9 8.11V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'products') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z" />
        <path d="M3 8l9 4 9-4" />
        <path d="M12 20V12" />
        {isActive && <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'vendors') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
        {isActive && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'chat') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {isActive && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'favorites') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        {isActive && <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'cart') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
        {isActive && <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" fill="currentColor" />}
      </svg>
    );
  }
  if (type === 'menu') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }
  if (type === 'theme-moon') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (type === 'theme-sun') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return null;
};

export function Navbar() {
  const { cart, toggleRegion, getCurrency } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "__session=; path=/; max-age=0";
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };
  
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  const bottomNavLinks = useMemo(() => [
    { href: '/shop', label: 'Products', type: 'products' },
    { href: '/vendors', label: 'Parlours', type: 'vendors' },
    { href: '/messages', label: 'Chat', type: 'chat' },
  ], []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  const UtilityGroup = () => (
    <div className="flex items-center gap-1.5 p-1.5 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-full border border-primary/10 shadow-sm">
      {!isHome && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full group text-primary">
            <CustomIcon type="home" isActive={pathname === '/'} className="h-5 w-5" />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="h-10 w-10 rounded-full group text-primary"
      >
        <CustomIcon type={isDark ? 'theme-sun' : 'theme-moon'} isActive={false} className="h-5 w-5" />
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group text-primary">
          <CustomIcon type="favorites" isActive={pathname === '/favorites'} className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group text-primary">
          <CustomIcon type="cart" isActive={pathname === '/cart'} className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-[8px] font-black border border-background z-20 rounded-full shadow-lg">
              {cartCount}
            </Badge>
          )}
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl transition-all duration-500 hidden md:block">
        <div className="container mx-auto h-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="font-headline text-4xl tracking-tighter text-primary italic leading-none">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.4em]">
            {bottomNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-secondary transition-all duration-500 relative group py-2 flex items-center gap-2",
                  pathname.startsWith(link.href) ? "text-primary font-bold" : "text-primary/60"
                )}
              >
                <CustomIcon type={link.type} isActive={pathname.startsWith(link.href)} className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <UtilityGroup />
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-primary/10 bg-background/80 backdrop-blur-2xl md:hidden flex items-center justify-between px-4 shadow-sm">
        <Link href="/" className="flex items-center group">
          <span className="font-headline text-2xl tracking-tighter text-primary italic leading-none group-hover:text-secondary transition-colors">GlamLux</span>
        </Link>
        <UtilityGroup />
      </nav>

      {/* Mobile Bottom Utility Capsule - Floating & Balanced */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-xl">
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-3xl border border-primary/10 h-20 flex items-center justify-between shadow-3xl rounded-full px-8 ring-1 ring-black/5">
          {bottomNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all group flex-1">
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center transition-all duration-300 rounded-full border border-transparent mb-0.5",
                  isActive ? "scale-110" : ""
                )}>
                  <CustomIcon type={link.type} isActive={isActive} className={cn("h-6 w-6 transition-all duration-300", isActive ? "text-primary" : "text-primary/60")} />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-primary",
                  isActive ? "opacity-100" : "opacity-40"
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
