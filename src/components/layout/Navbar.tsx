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
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronRight,
  LayoutDashboard,
  Menu as MenuIcon,
  MapPin,
  Search,
  ShoppingCart,
  Heart,
  Store,
  UserCircle,
  Download,
  Map as MapIcon,
  ArrowLeft,
  X,
  Smartphone,
  Check
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
  loading: () => <div className="h-[350px] w-full bg-muted animate-pulse rounded-2xl border border-primary/10" />
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

  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const [location, setLocation] = useState('Select your location');
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      toast({
        title: "Install Ready",
        description: "Add GlamLux to your home screen using your browser settings.",
      });
    }
  };

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
      toast({ title: "Location Updated", description: `Delivering to ${newLoc.trim()}` });
    }
  };

  const handleConfirmMapLocation = () => {
    const locString = `Pinned: ${mapCenter[0].toFixed(2)}, ${mapCenter[1].toFixed(2)}`;
    setLocation(locString);
    setIsLocationSheetOpen(false);
    setLocationView('search');
    toast({ title: "Location Saved", description: "Coordinates confirmed for delivery." });
  };

  const showBanner = mounted && deferredPrompt && !isBannerDismissed;

  if (!mounted) return null;

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md transition-all duration-300",
        showBanner ? "h-[112px]" : "h-16"
      )}>
        {/* PWA Install Popup Bar */}
        {showBanner && (
          <div className="h-12 bg-primary text-white flex items-center justify-between px-4 md:px-6 relative overflow-hidden group border-b border-white/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms]" />
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 animate-bounce" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Elite Mobile Experience</p>
                <p className="text-[8px] opacity-70 uppercase tracking-widest leading-none">Install GlamLux Sanctuary App</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleInstallClick}
                className="bg-white text-primary text-[9px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full hover:scale-105 transition-all shadow-2xl active:scale-95"
              >
                Download
              </button>
              <button 
                onClick={() => setIsBannerDismissed(true)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6 text-foreground">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl text-primary tracking-tight">GlamLux</Link>
            
            <Sheet open={isLocationSheetOpen} onOpenChange={(open) => { setIsLocationSheetOpen(open); if (!open) setLocationView('search'); }}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 bg-muted rounded-full text-xs md:sm hover:bg-muted/80 transition-colors group">
                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium truncate max-w-[120px] md:max-w-[200px]">Deliver to: <span className="text-muted-foreground">{location}</span></span>
                </button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto pb-12 rounded-b-[2.5rem] border-none shadow-3xl bg-background/95 backdrop-blur-xl">
                <div className="container mx-auto max-w-xl space-y-8 py-6">
                  <SheetHeader>
                    <div className="flex items-center gap-4">
                      {locationView === 'map' && (
                        <Button variant="ghost" size="icon" onClick={() => setLocationView('search')} className="rounded-full">
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                      )}
                      <div className="space-y-1">
                        <SheetTitle className="text-2xl font-headline italic text-primary">Delivery Area.</SheetTitle>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Set your sanctuary location</p>
                      </div>
                    </div>
                  </SheetHeader>

                  {locationView === 'search' ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      <form onSubmit={handleSetLocation} className="space-y-4">
                        <div className="relative group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                          <Input 
                            name="area"
                            placeholder="Enter your area (e.g. Gulberg, Lahore)" 
                            className="pl-14 h-16 rounded-2xl border-primary/10 bg-primary/5 focus-visible:ring-primary/20 text-lg italic"
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Button type="button" onClick={() => setLocationView('map')} variant="outline" className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-primary/10 hover:bg-primary/5">
                            <MapIcon className="h-4 w-4 mr-2" /> Pin on Map
                          </Button>
                          <Button type="submit" className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl">
                            <Check className="h-4 w-4 mr-2" /> Confirm Area
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="rounded-[2rem] overflow-hidden border border-primary/10 shadow-inner h-[350px]">
                        <Map center={mapCenter} onLocationSelect={(lat, lng) => setMapCenter([lat, lng])} />
                      </div>
                      <Button onClick={handleConfirmMapLocation} className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl">
                        Save Pinned Location
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            {pathname !== '/' && (
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Link href="/"><CustomHomeIcon className="h-5 w-5" /></Link>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {!user ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden md:flex font-bold">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="font-bold rounded-full px-6">
                  <Link href="/signup">Join</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Heart className={cn("h-5 w-5", pathname === '/favorites' && "fill-primary text-primary")} />
                  </Button>
                </Link>
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <ShoppingCart className={cn("h-5 w-5", pathname === '/cart' && "text-primary")} />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-white text-[8px] rounded-full border-2 border-background">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full overflow-hidden border">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                          {user?.displayName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] p-0 border-none shadow-3xl">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-full bg-background">
                      <div className="p-6 border-b">
                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="bg-primary text-white text-lg font-bold">
                              {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{user?.displayName || 'Guest'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <Button asChild className="w-full rounded-full font-bold uppercase tracking-widest text-[10px]" variant="outline">
                          <Link href="/portal">Partner Portal</Link>
                        </Button>
                      </div>

                      <div className="flex-1 py-4">
                        <Link href="/favorites" className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">My Collection</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <Link href="/messages" className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Chats</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        
                        <button 
                          onClick={handleInstallClick}
                          className="flex items-center justify-between w-full px-6 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Download App</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="p-6 border-t">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-destructive hover:opacity-80 transition-all font-bold text-sm"
                        >
                          <LogOut className="h-5 w-5" />
                          Logout
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

      {/* Unified slim sub-header strip */}
      <div className={cn(
        "fixed inset-x-0 z-40 h-12 bg-white dark:bg-black border-b overflow-x-auto scrollbar-hide px-4 md:px-6 flex items-center gap-12 text-sm font-bold shadow-sm transition-all duration-300",
        showBanner ? "top-[112px]" : "top-16"
      )}>
        <Link href="/vendors" className={cn("whitespace-nowrap transition-colors h-full flex items-center border-b-2", pathname.startsWith('/vendors') ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary")}>Parlours</Link>
        <Link href="/shop" className={cn("whitespace-nowrap transition-colors h-full flex items-center border-b-2", pathname.startsWith('/shop') ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary")}>Products</Link>
        <Link href="/deals" className={cn("whitespace-nowrap transition-colors h-full flex items-center border-b-2", pathname.startsWith('/deals') ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary")}>Deals</Link>
      </div>
    </>
  );
}