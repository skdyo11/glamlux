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
  Smartphone
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

// Custom House Icon - Rounded/Blobby aesthetic
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
        title: "Download App",
        description: "On iOS: Tap Share > Add to Home Screen. On PC/Android: Check your browser's install icon.",
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
    if (newLoc) {
      setLocation(newLoc);
      setIsLocationSheetOpen(false);
      toast({ title: "Location Updated", description: `Delivering to ${newLoc}` });
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
        showBanner ? "h-[100px]" : "h-16"
      )}>
        {/* PWA Download Banner */}
        {showBanner && (
          <div className="h-9 bg-primary text-white flex items-center justify-between px-4 md:px-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center gap-3">
              <Smartphone className="h-3.5 w-3.5 animate-bounce" />
              <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest truncate">
                Get the full experience on your phone
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleInstallClick}
                className="bg-white text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
              >
                Download
              </button>
              <button 
                onClick={() => setIsBannerDismissed(true)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6 text-foreground">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl text-primary tracking-tight">GlamLux</Link>
            
            <Sheet open={isLocationSheetOpen} onOpenChange={(open) => { setIsLocationSheetOpen(open); if (!open) setLocationView('search'); }}>
              <SheetTrigger asChild>
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">Deliver to: <span className="text-muted-foreground">{location}</span></span>
                </div>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto pb-12 rounded-b-[2rem] border-none shadow-3xl">
                <div className="container mx-auto max-w-xl space-y-8 py-6">
                  <SheetHeader>
                    <div className="flex justify-between items-center">
                      <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                        {locationView === 'map' && (
                          <Button variant="ghost" size="icon" onClick={() => setLocationView('search')} className="mr-2 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        )}
                        <MapIcon className="h-6 w-6 text-primary" /> 
                        {locationView === 'search' ? 'Delivery Area' : 'Pin Location'}
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  {locationView === 'search' ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                      <form onSubmit={handleSetLocation} className="space-y-4">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            name="area"
                            placeholder="Enter your area (e.g. Gulberg, Lahore)" 
                            className="pl-12 h-14 rounded-xl border-border bg-muted/30 focus-visible:ring-primary text-lg"
                            autoFocus
                          />
                        </div>
                        <Button type="button" onClick={() => setLocationView('map')} className="w-full h-14 rounded-xl font-bold text-lg bg-primary text-primary-foreground hover:opacity-90">
                          <MapPin className="h-5 w-5 mr-2" /> Select on Map
                        </Button>
                      </form>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        {['Gulberg III', 'DHA Phase 5', 'South Delhi', 'Bandra West'].map(area => (
                          <Button 
                            key={area} 
                            variant="outline" 
                            className="h-12 rounded-xl justify-start px-4 text-xs font-bold uppercase tracking-widest border-muted-foreground/10 hover:border-primary/50"
                            onClick={() => { setLocation(area); setIsLocationSheetOpen(false); }}
                          >
                            <MapPin className="h-3 w-3 mr-2 text-primary" /> {area}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="rounded-[2rem] overflow-hidden border border-primary/10 shadow-inner h-[350px]">
                        <Map center={mapCenter} onLocationSelect={(lat, lng) => setMapCenter([lat, lng])} />
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Coordinates</p>
                        <p className="font-mono text-sm text-primary font-bold">{mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}</p>
                      </div>
                      <Button onClick={handleConfirmMapLocation} className="w-full h-16 rounded-xl font-bold text-lg shadow-2xl">
                        Confirm Location
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
                <Link href="/">
                  <CustomHomeIcon className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full mr-1"
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
                <Link href="/favorites" title="My Collection">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Heart className={cn("h-5 w-5", pathname === '/favorites' && "fill-primary text-primary")} />
                  </Button>
                </Link>
                <Link href="/cart" className="relative" title="Cart">
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
                        <Button asChild className="w-full rounded-full font-bold" variant="outline">
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

                        <button 
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="flex items-center justify-between w-full px-6 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
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

      <div className={cn(
        "fixed inset-x-0 z-40 h-16 bg-white dark:bg-black border-b overflow-x-auto scrollbar-hide px-4 md:px-6 flex items-center gap-12 text-sm font-bold shadow-sm transition-all duration-300",
        showBanner ? "top-[100px]" : "top-16"
      )}>
        <Link href="/vendors" className={cn("whitespace-nowrap transition-colors", pathname === '/vendors' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Parlours</Link>
        <Link href="/shop" className={cn("whitespace-nowrap transition-colors", pathname === '/shop' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Products</Link>
        <Link href="/deals" className={cn("whitespace-nowrap transition-colors", pathname === '/deals' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Deals</Link>
      </div>
    </>
  );
}
