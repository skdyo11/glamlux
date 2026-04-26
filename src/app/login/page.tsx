'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!auth || !firestore) return;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'customer';

      document.cookie = `__session=${user.uid}; path=/; max-age=3600; SameSite=Lax`;

      toast({
        title: "Identity Authenticated",
        description: `Welcome back to the collection, ${user.displayName || email}.`,
      });

      router.push(role === 'vendor' ? '/portal' : '/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsVerifying(true);
    try {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      document.cookie = `__session=${user.uid}; path=/; max-age=3600; SameSite=Lax`;

      toast({
        title: "Verified via Google",
        description: `Access granted for ${user.displayName}.`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Denied",
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-3xl rounded-[3rem] bg-white/40 dark:bg-black/40 backdrop-blur-2xl p-4 md:p-8 ring-1 ring-black/5">
          <CardHeader className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-headline italic text-primary tracking-tighter leading-none">Artisan Registry</h1>
            <CardDescription className="font-body italic text-muted-foreground text-base">
              Secure authentication for verified members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isVerifying}
                variant="outline"
                className="w-full h-16 rounded-full border-primary/20 bg-white/60 dark:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] text-primary hover:bg-primary/5 group shadow-sm transition-all"
              >
                {isVerifying ? (
                  <Sparkles className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <ShieldCheck className="h-5 w-5 mr-3 text-green-600" />
                )}
                {isVerifying ? "Verifying Identity..." : "Continue with Google"}
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10"></span></div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-primary/30">
                  <span className="bg-white dark:bg-card px-4 py-1 rounded-full backdrop-blur-sm border border-primary/5">Credential Access</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-4">Registry Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="artisan@glamlux.com" 
                  className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 font-body shadow-inner focus-visible:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-4">Secure Key</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 pr-14 font-body shadow-inner focus-visible:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-primary/40 hover:text-primary hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/95 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all duration-300 mt-4 active:scale-95"
              >
                {isLoading ? "Authenticating..." : "Verified Access"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-2">
                  Not on the registry?
                </p>
                <Link href="/signup" className="text-primary font-bold italic font-headline text-2xl hover:text-accent-foreground transition-colors">
                  Join Artisan Collection
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
