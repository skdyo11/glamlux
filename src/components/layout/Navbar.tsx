'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { 
  Sun, 
  Moon, 
  LogOut, 
  ChevronRight,
  MapPin,
  Search,
  ShoppingCart,
  Heart,
  Store,
  Download,
  Map as MapIcon,
  ArrowLeft,
  X,
  Smartphone,
  Check,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-2xl border border-primary/10" />
});

const CustomHomeIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12.707 2.293a1 1 0 00-1.414 0l-9 9A1 1 0 003 13h1v7a2 2 0 002 2h4v-5a2 2 0 014 0v5h4a2 2 0 002-2v-7h1a1 1 0 00.707-1.707l-9-9z" 
      fill="currentColor"
    />
  </svg>
);

export function Navbar() {
  const { cart } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [location, setLocation] = useState('Location');
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [locationView, setLocationView] = useState<'search' | 'map'>('search');
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.5204, 74.3587]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMounted(true);
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      toast({
        title: "PWA Handshake",
        description: "Install from your browser's menu for the best experience.",
      });
    }
  }, [deferredPrompt, toast]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push('/');
    }
  };

  const handleSetLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newLoc = formData.get('area') as string;
    if (newLoc && newLoc.trim()) {
      setLocation(newLoc.trim());
      setIsLocationSheetOpen(false);
      toast({ title: "Location Updated", description: `Registry filtered for ${newLoc.trim()}` });
    }
  };

  const handleConfirmMapLocation = () => {
    const locString = `${mapCenter[0].toFixed(2)}, ${mapCenter[1].toFixed(2)}`;
    setLocation(locString);
    setIsLocationSheetOpen(false);
    setLocationView('search');
    toast({ title: "Location Pinned", description: "Coordinates confirmed for registry filtering." });
  };

  const showBanner = mounted && deferredPrompt && !isBannerDismissed;

  if (!mounted) return null;

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md transition-all duration-300 border-b",
        showBanner ? "h-24" : "h-16"
      )}>
        {showBanner && (
          <div className="h-8 bg-primary text-white flex items-center justify-between px-4 relative overflow-hidden group border-b border-white/10 shadow-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="h-3 w-3 animate-bounce" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-none">Download GlamLux App</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleInstallClick}
                className="bg-white text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full hover:scale-105 transition-all active:scale-95 shadow-sm"
              >
                Install
              </button>
              <button onClick={() => setIsBannerDismissed(true)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
             {pathname !== '/' && (
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Link href="/"><CustomHomeIcon className="h-4 w-4" /></Link>
              </Button>
            )}
            <Link href="/" className="font-headline italic text-2xl text-primary tracking-tighter shrink-0 drop-shadow-sm">GlamLux</Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hidden md:flex"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!user ? (
              <Button asChild size="sm" className="font-bold rounded-full px-6 h-9 text-[10px] uppercase tracking-widest">
                <Link href="/signup">Join</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-1 md:gap-3">
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MessageSquare className={cn("h-4 w-4", pathname === '/messages' && "text-primary")} />
                  </Button>
                </Link>
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <ShoppingCart className={cn("h-4 w-4", pathname === '/cart' && "text-primary")} />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 p-0 flex items-center justify-center bg-primary text-white text-[8px] rounded-full border-2 border-background">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/10 bg-muted flex items-center justify-center transition-all hover:border-primary/30 active:scale-95">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                          {user?.displayName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] md:w-[400px] p-0 border-none shadow-3xl bg-background/95 backdrop-blur-xl">
                    <div className="flex flex-col h-full">
                      <div className="p-8 border-b border-primary/5 space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-xl">
                            <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary text-white text-xl font-headline italic">
                              {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-headline italic text-2xl truncate text-primary">{user?.displayName || 'Artisan Guest'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[8px] h-12 shadow-md" variant="default">
                            <Link href="/portal">Partner Portal</Link>
                          </Button>
                          <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[8px] h-12" variant="outline">
                            <Link href="/favorites"><Heart className="h-3 w-3 mr-2 fill-primary" /> Saved</Link>
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
                        {/* Settings Section */}
                        <section className="space-y-4">
                          <div className="px-4 flex items-center gap-2">
                             <Settings className="h-3 w-3 text-primary/30" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Settings & Regional</span>
                          </div>
                          <div className="space-y-1">
                            {/* Nested Location Sheet within User Sheet logic */}
                            <Sheet open={isLocationSheetOpen} onOpenChange={(open) => { setIsLocationSheetOpen(open); if (!open) setLocationView('search'); }}>
                              <SheetTrigger asChild>
                                <button className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-primary/5 transition-all text-left group">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-all group-hover:scale-110">
                                      <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-bold">Delivery Location</p>
                                      <p className="text-xs text-muted-foreground italic truncate max-w-[150px]">{location}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                                </button>
                              </SheetTrigger>
                              <SheetContent side="top" className="h-auto pb-12 rounded-b-[2.5rem] border-none shadow-3xl bg-background/95 backdrop-blur-xl z-[70]">
                                <div className="container mx-auto max-w-xl space-y-8 py-6">
                                  <SheetHeader>
                                    <div className="flex items-center gap-4">
                                      {locationView === 'map' && (
                                        <Button variant="ghost" size="icon" onClick={() => setLocationView('search')} className="rounded-full">
                                          <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                      )}
                                      <div className="space-y-1 text-left">
                                        <SheetTitle className="text-2xl font-headline italic text-primary">Registry Filter.</SheetTitle>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Select your sanctuary region</p>
                                      </div>
                                    </div>
                                  </SheetHeader>

                                  {locationView === 'search' ? (
                                    <form onSubmit={handleSetLocation} className="space-y-4">
                                      <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                        <Input 
                                          name="area"
                                          placeholder="Search region..." 
                                          className="pl-14 h-16 rounded-2xl border-primary/10 bg-primary/5 focus-visible:ring-primary/20 text-lg italic"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setLocationView('map')} className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-primary/10 flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
                                          <MapIcon className="h-4 w-4" /> Pin Map
                                        </button>
                                        <button type="submit" className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl bg-primary text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                                          <Check className="h-4 w-4" /> Confirm
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <div className="space-y-6">
                                      <div className="rounded-[2rem] overflow-hidden border border-primary/10 shadow-inner h-[300px]">
                                        <Map center={mapCenter} onLocationSelect={(lat, lng) => setMapCenter([lat, lng])} />
                                      </div>
                                      <Button onClick={handleConfirmMapLocation} className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl">
                                        Apply Coordinates
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </SheetContent>
                            </Sheet>

                            <button 
                              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-primary/5 transition-all text-left group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-all group-hover:scale-110">
                                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold">Appearance</p>
                                  <p className="text-xs text-muted-foreground italic uppercase tracking-widest">{theme} mode</p>
                                </div>
                              </div>
                              <RefreshCw className="h-4 w-4 text-muted-foreground/30 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <div className="px-4 flex items-center gap-2">
                             <Download className="h-3 w-3 text-primary/30" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Native Experience</span>
                          </div>
                          <button 
                            onClick={handleInstallClick}
                            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all text-left group shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all group-hover:rotate-12">
                                <Smartphone className="h-5 w-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-black uppercase tracking-widest">Download App</p>
                                <p className="text-[10px] text-primary/60 italic font-bold">One-tap registry access</p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-primary/30 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </section>
                      </div>

                      <div className="p-8 border-t border-primary/5 bg-primary/2">
                        <button onClick={handleLogout} className="flex items-center gap-4 w-full text-destructive hover:opacity-80 transition-all font-black uppercase tracking-widest text-[11px] group">
                          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all">
                            <LogOut className="h-4 w-4" />
                          </div>
                          <span>End Session</span>
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={cn(
        "fixed inset-x-0 z-40 h-10 bg-white dark:bg-black border-b overflow-x-auto scrollbar-hide px-4 md:px-6 flex items-center justify-between md:justify-center md:gap-12 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-sm transition-all duration-300",
        showBanner ? "top-24" : "top-16"
      )}>
        <Link href="/vendors" className={cn("whitespace-nowrap transition-all h-full flex items-center border-b-2 px-2", pathname.startsWith('/vendors') ? "text-primary border-primary" : "text-muted-foreground/60 border-transparent hover:text-primary")}>Parlours</Link>
        <Link href="/shop" className={cn("whitespace-nowrap transition-all h-full flex items-center border-b-2 px-2", pathname.startsWith('/shop') ? "text-primary border-primary" : "text-muted-foreground/60 border-transparent hover:text-primary")}>Products</Link>
        <Link href="/deals" className={cn("whitespace-nowrap transition-all h-full flex items-center border-b-2 px-2", pathname.startsWith('/deals') ? "text-primary border-primary" : "text-muted-foreground/60 border-transparent hover:text-primary")}>Deals</Link>
      </div>
    </>
  );
}
