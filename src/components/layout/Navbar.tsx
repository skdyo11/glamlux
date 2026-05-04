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
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Menu as MenuIcon,
  Share,
  PlusSquare,
  Smartphone
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  if (type === 'home') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M3 10L12 2l9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" stroke="none" />
        ) : (
          <path d="M3 10L12 2l9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" fill="none" />
        )}
      </svg>
    );
  }
  if (type === 'products') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke="none" />
        ) : (
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" fill="none" />
        )}
      </svg>
    );
  }
  if (type === 'vendors') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="none" />
        ) : (
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" fill="none" />
        )}
      </svg>
    );
  }
  if (type === 'chat') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="none" />
        ) : (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" />
        )}
      </svg>
    );
  }
  if (type === 'favorites') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="none" />
        ) : (
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" />
        )}
      </svg>
    );
  }
  if (type === 'cart') {
    return (
      <svg {...commonProps}>
        {isActive ? (
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="none" />
        ) : (
          <g fill="none">
             <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
             <path d="M3 6h18" />
             <path d="M16 10a4 4 0 0 1-8 0" />
          </g>
        )}
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('Registry Service Worker registered');
        }).catch(err => {
          console.error('Registry Service Worker failed:', err);
        });
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    setShowInstallGuide(true);
  };

  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }, []);

  const bottomNavLinks = useMemo(() => [
    { href: '/shop', label: 'Products', type: 'products' },
    { href: '/vendors', label: 'Parlours', type: 'vendors' },
    { href: '/messages', label: 'Chat', type: 'chat' },
  ], []);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push('/');
    }
  };

  if (!mounted) return null;

  const UtilityGroup = () => (
    <div className="flex items-center gap-1 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-full border border-primary/10 p-1 shadow-sm">
      {pathname !== '/' && (
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary hover:bg-primary/5">
            <CustomIcon type="home" isActive={false} className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-9 w-9 rounded-full text-primary hover:bg-primary/5"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
      </Button>
      <Link href="/favorites">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary hover:bg-primary/5">
          <CustomIcon type="favorites" isActive={pathname === '/favorites'} className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/cart" className="relative">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary hover:bg-primary/5">
          <CustomIcon type="cart" isActive={pathname === '/cart'} className="h-4 w-4" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-primary-foreground text-[8px] rounded-full ring-2 ring-background border-none">
              {cartCount}
            </Badge>
          )}
        </Button>
      </Link>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background font-body">
      <div className="p-8 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-lg">
               <AvatarImage src={user?.photoURL || undefined} />
               <AvatarFallback className="bg-primary text-primary-foreground text-xl font-black">
                 {user?.displayName?.[0] || user?.email?.[0] || 'G'}
               </AvatarFallback>
             </Avatar>
             <div className="space-y-1">
               <h4 className="font-headline text-2xl italic leading-none">{user?.displayName || 'Artisan Guest'}</h4>
               <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground truncate max-w-[180px]">
                 {user?.email || 'Anonymous Access'}
               </p>
             </div>
          </div>
          {!user && (
            <Button asChild className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] rounded-none">
              <Link href="/login">Verify Identity</Link>
            </Button>
          )}
        </div>

        <div className="h-px bg-primary/10" />

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Registry Access</p>
          <div className="grid gap-2">
            <Link href="/portal" className="group flex items-center justify-between p-4 bg-primary/5 border border-primary/5 hover:bg-primary hover:text-primary-foreground transition-all">
              <div className="flex items-center gap-4">
                <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
                <span className="font-bold text-xs uppercase tracking-widest">Partner Portal</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
            </Link>
            <Link href="/favorites" className="group flex items-center justify-between p-4 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-4">
                <CustomIcon type="favorites" isActive={false} className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-widest">My Selection</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-10" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Management</p>
          <div className="grid gap-2">
            <button 
              onClick={() => toast({ title: "Registry Synchronized", description: "Your aesthetic preferences have been saved to the MMXXIV protocol." })}
              className="flex items-center gap-4 p-4 hover:text-secondary transition-all text-left w-full"
            >
              <Settings className="h-5 w-5" strokeWidth={1.5} />
              <span className="font-bold text-xs uppercase tracking-widest">Registry Settings</span>
            </button>
            
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-all text-left w-full text-primary"
            >
              <Smartphone className="h-5 w-5" strokeWidth={1.5} />
              <span className="font-bold text-xs uppercase tracking-widest">Download Registry App</span>
            </button>

            {user && (
              <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-destructive hover:bg-destructive/5 transition-all text-left w-full">
                <LogOut className="h-5 w-5" strokeWidth={1.5} />
                <span className="font-bold text-xs uppercase tracking-widest">Formal Departure</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto p-8 border-t border-primary/5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
          <Sparkles className="h-3 w-3 text-secondary" strokeWidth={1.5} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">MMXXIV Protocol</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary hover:bg-primary/5">
                    <MenuIcon className="h-6 w-6" strokeWidth={2.5} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 border-r border-primary/10">
                   <SheetHeader className="sr-only">
                     <SheetTitle>Artisan Sidebar</SheetTitle>
                   </SheetHeader>
                   <SidebarContent />
                </SheetContent>
              </Sheet>
             <div className="h-6 w-px bg-primary/10 mx-2" />
             <UtilityGroup />
          </div>
        </div>
      </nav>

      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-primary/10 bg-background/80 backdrop-blur-2xl md:hidden flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary hover:bg-primary/5 active:scale-90 transition-all">
                <MenuIcon className="h-6 w-6" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-primary/10">
               <SheetHeader className="sr-only">
                 <SheetTitle>Artisan Sidebar</SheetTitle>
               </SheetHeader>
               <SidebarContent />
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-headline text-2xl tracking-tighter text-primary italic leading-none">GlamLux</Link>
        </div>
        <UtilityGroup />
      </nav>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-xl">
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-primary/10 h-20 flex items-center justify-between shadow-sm rounded-full px-8 ring-1 ring-black/5">
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

      <Dialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
        <DialogContent className="rounded-none border-none bg-background p-10 max-w-sm shadow-3xl font-body">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-headline italic tracking-tighter text-primary">Download Hub.</DialogTitle>
            <DialogDescription className="font-body italic text-muted-foreground text-base leading-relaxed">
              {isIOS ? (
                <>Tap the <Share className="inline h-4 w-4 mx-1" /> icon and select <strong>"Add to Home Screen"</strong> to install.</>
              ) : (
                <>Experience the registry as a native application with real-time updates and offline access.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10">
               <PlusSquare className="h-6 w-6 text-secondary" strokeWidth={1.5} />
               <p className="text-[10px] font-bold uppercase tracking-widest">{isIOS ? 'Pin to Home Screen' : 'Standalone Protocol'}</p>
            </div>
            <Button 
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                }
                setShowInstallGuide(false);
              }} 
              className="rounded-none h-14 vogue-button bg-primary text-primary-foreground border-none"
            >
              {isIOS ? 'Got it' : 'Download'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
