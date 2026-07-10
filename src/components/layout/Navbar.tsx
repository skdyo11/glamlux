'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';
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
  Map as MapIcon,
  ArrowLeft,
  X,
  Check,
  MessageSquare,
  Settings,
  RefreshCw,
  Scissors,
  ShoppingBag,
  Zap
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

export function Navbar() {
  const { cart } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState('Location');
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [locationView, setLocationView] = useState<'search' | 'map'>('search');
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.5204, 74.3587]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (!mounted) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 transition-all duration-500 px-6 z-50",
          isScrolled && !mobileMenuOpen 
            ? "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 py-3" 
            : "bg-transparent py-4",
          mobileMenuOpen ? "z-[110]" : "z-50"
        )}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <span className="font-headline font-bold text-2xl text-foreground tracking-tighter uppercase leading-none">
                GlamLux
              </span>
            </Link>
          </div>

          {/* Sub-navigation Pill: Visible from 'md' screens up */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="inline-flex bg-primary/5 dark:bg-white/10 p-1 rounded-full border border-primary/10 dark:border-white/10 shadow-inner backdrop-blur-sm">
              <Link 
                href="/vendors" 
                className={cn(
                  "px-5 h-9 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  pathname.startsWith('/vendors') 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "text-primary/60 dark:text-white/60 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5"
                )}
              >
                <Scissors className="h-3 w-3" /> Parlours
              </Link>
              <Link 
                href="/shop" 
                className={cn(
                  "px-5 h-9 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  pathname.startsWith('/shop') 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "text-primary/60 dark:text-white/60 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5"
                )}
              >
                <ShoppingBag className="h-3 w-3" /> Products
              </Link>
              <Link 
                href="/deals" 
                className={cn(
                  "px-5 h-9 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  pathname.startsWith('/deals') 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "text-primary/60 dark:text-white/60 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5"
                )}
              >
                <Zap className="h-3 w-3" /> Deals
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
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
              <div className="flex items-center gap-1 md:gap-2">
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
                                <div className="container mx-auto max-xl space-y-8 py-6">
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
                                  <div className="text-xs text-muted-foreground italic uppercase tracking-widest">{theme} mode</div>
                                </div>
                              </div>
                              <RefreshCw className="h-4 w-4 text-muted-foreground/30 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                          </div>
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
    </>
  );
}
