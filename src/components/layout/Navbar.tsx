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
  LayoutDashboard,
  Menu as MenuIcon,
  MapPin,
  Search,
  ShoppingCart,
  Heart,
  Store,
  UserCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { cart } = useStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push('/');
    }
  };

  if (!mounted) return null;

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl text-primary tracking-tight">GlamLux</Link>
            
            {/* Desktop Location Placeholder */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">Deliver to: <span className="text-muted-foreground">Select your location</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full mr-1"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden md:flex font-bold">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="font-bold rounded-full px-6">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
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
                  <SheetContent side="right" className="w-[300px] p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-6 border-b">
                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="bg-primary text-white text-lg font-bold">
                              {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{user?.displayName || 'User'}</p>
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
                            <span className="text-sm font-medium">My Favorites</span>
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
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="flex items-center justify-between w-full px-6 py-3 hover:bg-muted transition-colors"
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

      {/* Sub-nav Category bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-12 bg-white dark:bg-black border-b overflow-x-auto scrollbar-hide px-4 md:px-6 flex items-center gap-6 text-sm font-bold">
        <Link href="/vendors" className={cn("whitespace-nowrap transition-colors", pathname === '/vendors' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Parlours</Link>
        <Link href="/shop" className={cn("whitespace-nowrap transition-colors", pathname === '/shop' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Products</Link>
        <Link href="/deals" className={cn("whitespace-nowrap transition-colors", pathname === '/deals' ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary")}>Deals</Link>
      </div>
    </>
  );
}
