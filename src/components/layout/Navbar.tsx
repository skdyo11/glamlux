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

// Custom Precision Icons - Simple & Chunky Flaticon Style
// Uses distinct path logic for Outline vs Solid to ensure perfect rendering
const CustomIcon = ({ type, isActive, className }: { type: string, isActive: boolean, className?: string }) => {
  const strokeWidth = 2.5;
  
  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {isActive ? (
          <path d="M12 3L4 9V21H20V9L12 3Z" />
        ) : (
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        )}
      </svg>
    );
  }
  if (type === 'products') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {isActive ? (
          <path d="M21 8L12 13L3 8V16L12 21L21 16V8Z" />
        ) : (
          <>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="M3.29 7L12 12L20.71 7" />
            <path d="M12 22V12" />
          </>
        )}
      </svg>
    );
  }
  if (type === 'vendors') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {isActive ? (
          <path d="M20 7L22 11V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V11L4 7H20ZM12 11C11.4 11 11 10.6 11 10V4C11 3.4 11.4 3 12 3C12.6 3 13 3.4 13 4V10C13 10.6 12.6 11 12 11Z" />
        ) : (
          <>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </>
        )}
      </svg>
    );
  }
  if (type === 'chat') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {isActive ? (
          <path d="M21 11.5C21 16.19 16.97 20 12 20C10.64 20 9.35 19.71 8.18 19.19L3 21L4.81 15.82C4.29 14.65 4 13.36 4 12C4 7.03 8.03 3 13 3C17.97 3 22 7.03 22 12V11.5H21Z" />
        ) : (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        )}
      </svg>
    );
  }
  if (type === 'favorites') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (type === 'cart') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {isActive ? (
          <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6ZM12 13C10.34 13 9 11.66 9 10H15C15 11.66 13.66 13 12 13Z" />
        ) : (
          <>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </>
        )}
      </svg>
    );
  }
  if (type === 'menu') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }
  if (type === 'theme-moon') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (type === 'theme-sun') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
  if (type === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? 0 : strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  }
  if (type === 'user') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (type === 'logout') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    );
  }
  if (type === 'settings') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  return null;
};

export function Navbar() {
  const { cart, favorites, toggleRegion, getCurrency } = useStore();
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
  const favCount = useMemo(() => (favorites?.products?.length || 0) + (favorites?.vendors?.length || 0), [favorites]);
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full group">
            <CustomIcon type="home" isActive={pathname === '/'} className="h-5 w-5" />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="h-10 w-10 rounded-full group"
      >
        <CustomIcon type={isDark ? 'theme-sun' : 'theme-moon'} isActive={false} className="h-5 w-5" />
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group">
          <CustomIcon type="favorites" isActive={pathname === '/favorites'} className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group">
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

  const SideMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full group">
          <CustomIcon type="menu" isActive={false} className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] border-none bg-background/98 backdrop-blur-3xl p-0 shadow-3xl">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-10 text-left border-b border-primary/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-none border border-primary/10 bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                <CustomIcon type="user" isActive={false} className="h-7 w-7" />
              </div>
              <div>
                <SheetTitle className="font-headline text-3xl italic text-primary leading-none">
                  {user ? (user.displayName || 'Artisan') : 'Guest'}
                </SheetTitle>
                <p className="text-[10px] uppercase font-black tracking-widest text-secondary mt-2">
                  {user ? user.email : 'Explore the Registry'}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 px-6 py-10 space-y-4">
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-6 p-4 border border-transparent hover:border-primary/5 hover:bg-primary/5 transition-all group">
                <CustomIcon type="home" isActive={pathname === '/'} className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Overview</span>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link href="/portal" className="flex items-center gap-6 p-4 border border-transparent hover:border-primary/5 hover:bg-primary/5 transition-all group">
                <CustomIcon type="dashboard" isActive={pathname === '/portal'} className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Management</span>
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link href="/messages" className="flex items-center gap-6 p-4 border border-transparent hover:border-primary/5 hover:bg-primary/5 transition-all group">
                <CustomIcon type="chat" isActive={pathname === '/messages'} className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Inquiries</span>
              </Link>
            </SheetClose>

            <Button 
              variant="ghost" 
              onClick={toggleRegion}
              className="w-full justify-start gap-6 p-4 h-auto rounded-none text-primary transition-all group hover:bg-primary/5"
            >
              <CustomIcon type="settings" isActive={false} className="h-5 w-5" />
              <span className="font-bold text-xs uppercase tracking-[0.3em]">Market: {getCurrency()}</span>
            </Button>

            <div className="pt-10 opacity-10">
              <div className="h-px bg-primary" />
            </div>
            
            <div className="pt-6">
              {user ? (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-6 p-4 h-auto rounded-none text-destructive hover:bg-destructive/5 group transition-all"
                >
                  <CustomIcon type="logout" isActive={false} className="h-5 w-5" />
                  <span className="font-bold text-xs uppercase tracking-[0.3em]">De-authenticate</span>
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link href="/login" className="flex items-center gap-6 p-4 border border-primary/10 bg-primary text-primary-foreground transition-all group">
                    <CustomIcon type="settings" isActive={false} className="h-5 w-5" />
                    <span className="font-bold text-xs uppercase tracking-[0.3em]">Access Key</span>
                  </Link>
                </SheetClose>
              )}
            </div>
          </div>

          <div className="p-10 text-center border-t border-primary/5 bg-primary/2">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/20">MMXXIV GLAMLUX REGISTRY</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl transition-all duration-500 hidden md:block">
        <div className="container mx-auto h-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <SideMenu />
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
                  pathname.startsWith(link.href) ? "text-primary" : "text-primary/40"
                )}
              >
                <CustomIcon type={link.type} isActive={pathname.startsWith(link.href)} className="h-4 w-4" />
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-500 group-hover:w-full",
                  pathname.startsWith(link.href) && "w-full"
                )} />
              </Link>
            ))}
          </div>

          <UtilityGroup />
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-primary/10 bg-background/80 backdrop-blur-2xl md:hidden flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-1">
          <SideMenu />
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-2xl tracking-tighter text-primary italic leading-none group-hover:text-secondary transition-colors">GlamLux</span>
          </Link>
        </div>
        <UtilityGroup />
      </nav>

      {/* Mobile Bottom Utility Capsule */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-xl">
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-3xl border border-primary/10 h-22 flex items-center justify-between shadow-3xl rounded-full px-6 ring-1 ring-black/5 py-3">
          {bottomNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all group flex-1">
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full border border-transparent mb-1",
                  isActive 
                    ? "bg-secondary/15 border-secondary/20 scale-110 shadow-lg shadow-secondary/5" 
                    : ""
                )}>
                  <CustomIcon type={link.type} isActive={isActive} className={cn("h-6 w-6 transition-all duration-500", isActive ? "text-primary" : "text-primary/40")} />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                  isActive ? "text-primary opacity-100" : "text-primary/20 opacity-0 group-hover:opacity-100"
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
