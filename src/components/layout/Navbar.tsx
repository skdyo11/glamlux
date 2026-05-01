'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Sparkles, 
  Store, 
  Moon, 
  Sun, 
  MessageSquare, 
  Home, 
  Heart, 
  LogOut, 
  Menu,
  User,
  Settings,
  Globe,
  Package
} from 'lucide-react';
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
    { href: '/shop', label: 'Products', icon: Package },
    { href: '/vendors', label: 'Parlours', icon: Store },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
  ], []);

  if (!mounted) return null;

  // Global icon logic based on theme and active state
  const getIconProps = (isActive: boolean) => ({
    strokeWidth: 2.2,
    className: cn(
      "h-6 w-6 transition-all duration-500",
      isActive ? "text-primary scale-110" : "text-primary/60 group-hover:text-primary"
    ),
    fill: (theme === 'dark' || isActive) ? 'currentColor' : 'none'
  });

  const UtilityGroup = () => (
    <div className="flex items-center gap-1.5 p-1 bg-background/50 dark:bg-black/20 backdrop-blur-md rounded-full border border-primary/10">
      {!isHome && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full group">
            <Home {...getIconProps(pathname === '/')} />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-10 w-10 rounded-full group"
      >
        {theme === 'dark' ? (
          <Sun {...getIconProps(false)} />
        ) : (
          <Moon {...getIconProps(false)} />
        )}
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group">
          <Heart {...getIconProps(pathname === '/favorites' || favCount > 0)} />
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full group">
          <ShoppingBag {...getIconProps(pathname === '/cart')} />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-[8px] font-black border border-background z-20 rounded-full shadow-xl">
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
          <Menu {...getIconProps(false)} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] border-none bg-background/98 backdrop-blur-3xl p-0 shadow-3xl">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-10 text-left border-b border-primary/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-none border border-primary/10 bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                <User strokeWidth={1} className="h-7 w-7" />
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
                <Home {...getIconProps(pathname === '/')} className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Overview</span>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link href="/portal" className="flex items-center gap-6 p-4 border border-transparent hover:border-primary/5 hover:bg-primary/5 transition-all group">
                <LayoutDashboard {...getIconProps(pathname === '/portal')} className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Management</span>
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link href="/messages" className="flex items-center gap-6 p-4 border border-transparent hover:border-primary/5 hover:bg-primary/5 transition-all group">
                <MessageSquare {...getIconProps(pathname === '/messages')} className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Inquiries</span>
              </Link>
            </SheetClose>

            <Button 
              variant="ghost" 
              onClick={toggleRegion}
              className="w-full justify-start gap-6 p-4 h-auto rounded-none text-primary transition-all group hover:bg-primary/5"
            >
              <Globe {...getIconProps(false)} className="h-4 w-4" />
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
                  <LogOut strokeWidth={2.2} className="h-4 w-4 transition-all group-hover:-translate-x-1" />
                  <span className="font-bold text-xs uppercase tracking-[0.3em]">De-authenticate</span>
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link href="/login" className="flex items-center gap-6 p-4 border border-primary/10 bg-primary text-primary-foreground transition-all group">
                    <Settings strokeWidth={2.2} className="h-4 w-4 transition-all group-hover:rotate-45" />
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
              <Sparkles strokeWidth={2.2} className="h-6 w-6 text-secondary transition-all group-hover:scale-110" />
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
                <link.icon {...getIconProps(pathname.startsWith(link.href))} className="h-4 w-4" />
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

      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-primary/10 bg-background/80 backdrop-blur-2xl md:hidden flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-1">
          <SideMenu />
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-2xl tracking-tighter text-primary italic leading-none group-hover:text-secondary transition-colors">GlamLux</span>
          </Link>
        </div>

        <UtilityGroup />
      </nav>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-full px-6 max-w-xl">
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-3xl border border-primary/10 h-20 flex items-center justify-around shadow-3xl rounded-full px-4 ring-1 ring-black/5">
          {bottomNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all group flex-1 h-full">
                <div className={cn(
                  "w-12 h-12 aspect-square flex items-center justify-center transition-all duration-500 rounded-full border border-transparent",
                  isActive 
                    ? "bg-secondary/10 border-secondary/20 scale-110 shadow-lg shadow-secondary/5" 
                    : "hover:bg-primary/5"
                )}>
                  <Icon {...getIconProps(isActive)} />
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] mt-1 transition-all duration-500",
                  isActive ? "text-primary opacity-100" : "text-primary/40 opacity-0 group-hover:opacity-100"
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
