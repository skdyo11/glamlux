'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  MapPin, 
  LayoutDashboard, 
  Sparkles, 
  Store, 
  Scissors, 
  Moon, 
  Sun, 
  MessageSquare, 
  Home, 
  Heart, 
  LogOut, 
  Menu,
  User,
  Settings,
  Globe
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
    { href: '/deals', label: 'Services', icon: Scissors },
    { href: '/shop', label: 'Shops', icon: Store },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
  ], []);

  if (!mounted) return null;

  const UtilityGroup = () => (
    <div className="flex items-center p-1 bg-background/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm">
      {!isHome && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Home className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </Button>
        </Link>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-10 w-10 rounded-full"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5 text-foreground" strokeWidth={1.5} /> : <Moon className="h-5 w-5 text-foreground" strokeWidth={1.5} />}
      </Button>

      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Heart className={cn("h-5 w-5 text-foreground", favCount > 0 && "fill-accent-foreground text-accent-foreground")} strokeWidth={1.5} />
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <ShoppingBag className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          {cartCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[8px] font-black border border-background z-20 rounded-full">
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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <Menu className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] rounded-r-2xl border-none bg-background/95 backdrop-blur-xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-8 text-left border-b border-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <SheetTitle className="font-headline text-2xl italic text-primary leading-none">
                  {user ? (user.displayName || 'Artisan') : 'Guest'}
                </SheetTitle>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">
                  {user ? user.email : 'Explore GlamLux'}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 px-4 py-8 space-y-2">
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest transition-all">
                <Home className="h-4 w-4" strokeWidth={1.5} /> Home
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link href="/portal" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest transition-all">
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} /> My Business
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link href="/messages" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest transition-all">
                <MessageSquare className="h-4 w-4" strokeWidth={1.5} /> Support Chat
              </Link>
            </SheetClose>

            <Button 
              variant="ghost" 
              onClick={toggleRegion}
              className="w-full justify-start gap-4 p-4 h-auto rounded-xl text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
            >
              <Globe className="h-4 w-4" strokeWidth={1.5} /> Region: {getCurrency()}
            </Button>

            <div className="pt-8 opacity-20">
              <div className="h-px bg-primary" />
            </div>
            
            <div className="pt-4">
              {user ? (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-4 p-4 h-auto rounded-xl text-destructive hover:bg-destructive/5 font-bold text-xs uppercase tracking-widest"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} /> Log Out
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link href="/login" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest transition-all">
                    <Settings className="h-4 w-4" strokeWidth={1.5} /> Member Login
                  </Link>
                </SheetClose>
              )}
            </div>
          </div>

          <div className="p-8 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-accent-foreground/30">GlamLux • MMXXIV</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-border/5 bg-background/80 backdrop-blur-sm transition-all duration-300 hidden md:block">
        <div className="w-full pl-2 pr-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SideMenu />
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
              <span className="font-headline text-4xl tracking-tighter text-foreground italic">GlamLux</span>
            </Link>
          </div>

          <div className="flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.3em]">
            {bottomNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "hover:text-accent-foreground transition-colors",
                  pathname === link.href ? "text-accent-foreground font-black" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <UtilityGroup />
          </div>
        </div>
      </nav>

      <nav className="fixed top-3 left-2 right-2 z-50 h-14 border border-border/20 bg-background/80 backdrop-blur-sm md:hidden flex items-center justify-between pl-1 pr-4 shadow-md rounded-2xl">
        <div className="flex items-center gap-0.5">
          <SideMenu />
          <Link href="/" className="flex items-center space-x-1">
            <span className="font-headline text-3xl tracking-tighter text-foreground italic leading-none">GlamLux</span>
          </Link>
        </div>

        <div className="flex items-center">
          <UtilityGroup />
        </div>
      </nav>

      <nav className="fixed bottom-4 left-6 right-6 z-50 bg-background/90 backdrop-blur-sm border border-border/20 rounded-full md:hidden flex items-center justify-around h-14 px-3 shadow-lg">
        {bottomNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center transition-all group">
              <div className={cn(
                "p-2.5 rounded-full transition-all duration-300",
                isActive ? "text-primary bg-primary/5 scale-110" : "text-muted-foreground/60 hover:text-primary/40"
              )}>
                <Icon className={cn("h-6 w-6")} strokeWidth={1.5} />
              </div>
              {isActive && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
