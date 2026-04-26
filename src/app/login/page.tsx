
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        title: "Verified Access",
        description: `Identity confirmed. Welcome, ${user.displayName || email}.`,
      });

      router.push(role === 'vendor' ? '/portal' : '/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
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
        title: "Google Verified",
        description: `Access granted for ${user.displayName}.`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-xl rounded-[2.5rem] bg-white/40 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <h1 className="text-4xl font-headline italic text-primary tracking-tighter">Verified Portal</h1>
            <CardDescription className="font-body italic text-muted-foreground">
              Artisan identity verification required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isVerifying}
                variant="outline"
                className="w-full h-14 rounded-full border-primary/20 bg-white/60 font-bold uppercase tracking-[0.2em] text-[10px] text-primary hover:bg-primary/5 group"
              >
                {isVerifying ? (
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                )}
                {isVerifying ? "Verifying Identity..." : "Sign in with Google"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10"></span></div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest text-primary/30">
                  <span className="bg-white/40 px-2 backdrop-blur-sm">Artisan Credentials</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="sara@example.com" 
                  className="rounded-full h-12 bg-white/60 border-primary/10 px-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    className="rounded-full h-12 bg-white/60 border-primary/10 px-6 pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-primary/40 hover:text-primary hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-sm transition-all"
              >
                {isLoading ? "Authenticating..." : "Verified Log In"}
              </Button>

              <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-4">
                Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign Up</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
