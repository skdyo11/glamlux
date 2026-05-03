'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!auth || !firestore) return;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const batch = writeBatch(firestore);

      batch.set(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        phoneNumber: phone || null,
        role,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (role === 'vendor') {
        const parlourId = user.uid;
        batch.set(doc(firestore, 'parlours', parlourId), {
          id: parlourId,
          ownerId: user.uid,
          name: `${name}'s Sanctuary`,
          areaTag: 'Select Region',
          rating: 5.0,
          imageUrls: [],
          description: `The elite beauty portfolio of ${name}.`,
          ownerDashboardStyle: 'grid',
          createdAt: serverTimestamp(),
        });

        // Add one dummy product for the new vendor
        const productRef = doc(collection(firestore, 'products'));
        batch.set(productRef, {
          id: productRef.id,
          vendorId: parlourId,
          name: 'Signature Radiance Elixir',
          brand: 'Artisan Essence',
          price: 120,
          currency: 'PKR',
          imageUrl: `https://picsum.photos/seed/p-${productRef.id}/600/800`,
          isDummy: true,
          createdAt: serverTimestamp()
        });

        // Add one dummy service for the new vendor
        const dealRef = doc(collection(firestore, 'deals'));
        batch.set(dealRef, {
          id: dealRef.id,
          parlourId: parlourId,
          parlourOwnerId: user.uid,
          name: 'Royal Transformation Edit',
          category: 'Bridal',
          discountPrice: 21,
          basePrice: 45,
          currency: 'PKR',
          depositPercent: 10,
          isDummy: true,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();

      document.cookie = `__session=${user.uid}; path=/; max-age=3600; SameSite=Lax`;

      toast({
        title: "Account Registered",
        description: `Identity verified. Welcome to the artisan gallery, ${name}!`,
      });

      router.push(role === 'vendor' ? '/portal' : '/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Denied",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsVerifying(true);
    try {
      if (!auth || !firestore) return;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'Artisan Guest',
          email: user.email,
          role: 'customer',
          isVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      document.cookie = `__session=${user.uid}; path=/; max-age=3600; SameSite=Lax`;

      toast({
        title: "Google Registry Active",
        description: `Identity confirmed for ${user.displayName}.`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Timed Out",
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
        <Card className="w-full max-w-lg border-none shadow-3xl rounded-[3.5rem] bg-white/40 dark:bg-black/40 backdrop-blur-2xl p-6 md:p-10 ring-1 ring-black/5">
          <CardHeader className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline italic text-primary tracking-tighter leading-none">Artisan Collection</h1>
            <CardDescription className="font-body italic text-muted-foreground text-base">
              Begin your journey in professional beauty artistry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignup}
                disabled={isVerifying}
                variant="outline"
                className="w-full h-16 rounded-full border-primary/20 bg-white/60 dark:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] text-primary hover:bg-primary/5 group shadow-sm transition-all"
              >
                {isVerifying ? (
                  <Sparkles className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <ShieldCheck className="h-5 w-5 mr-3 text-green-600" />
                )}
                {isVerifying ? "Confirming Registry..." : "Join with Google"}
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10"></span></div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-primary/30">
                  <span className="bg-white dark:bg-card px-4 py-1 rounded-full backdrop-blur-sm border border-primary/5">Manual Entry</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-4">Full Identity</Label>
                  <Input 
                    id="name" 
                    required 
                    placeholder="Sara Khan" 
                    className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 font-body shadow-inner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-4">Phone (Optional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="+92 / +91 number" 
                    className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 font-body shadow-inner"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-4">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="artisan@example.com" 
                  className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 font-body shadow-inner"
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
                    className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 pr-14 font-body shadow-inner"
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
              
              <div className="space-y-4 pt-4">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 text-center block">Role Selection</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(v: any) => setRole(v)}
                  className="flex justify-center gap-12"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="customer" id="customer" className="border-primary text-primary h-5 w-5" />
                    <Label htmlFor="customer" className="font-bold text-xs uppercase tracking-widest cursor-pointer font-body">Guest</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="vendor" id="vendor" className="border-primary text-primary h-5 w-5" />
                    <Label htmlFor="vendor" className="font-bold text-xs uppercase tracking-widest cursor-pointer font-body">Artisan</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-20 bg-primary text-primary-foreground hover:bg-primary/95 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] shadow-3xl transition-all duration-300 mt-6 active:scale-95"
              >
                {isLoading ? "Synchronizing..." : "Create Artisan Account"}
              </Button>

              <div className="text-center pt-6">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-2">
                  Already Registered?
                </p>
                <Link href="/login" className="text-primary font-bold italic font-headline text-2xl hover:text-accent-foreground transition-colors">
                  Log In to Collection
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
