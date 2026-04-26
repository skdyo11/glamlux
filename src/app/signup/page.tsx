'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [isLoading, setIsLoading] = useState(false);
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

      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // If vendor, create initial vendor profile
      if (role === 'vendor') {
        await setDoc(doc(firestore, 'vendors', user.uid), {
          id: user.uid,
          owner_uid: user.uid,
          name: `${name}'s Parlour`,
          area_tag: 'Not set',
          rating: 5.0,
          images: [],
          description: '',
          owner_currency: 'PKR',
          commission_rate: 0.15,
        });
      }

      // Set a simple cookie for middleware to detect auth state
      document.cookie = `__session=${user.uid}; path=/; max-age=3600; SameSite=Lax`;

      toast({
        title: "Account created",
        description: `Welcome to GlamLux, ${name}!`,
      });

      router.push(role === 'vendor' ? '/portal' : '/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-xl rounded-[2.5rem] bg-white/40 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <h1 className="text-4xl font-headline italic text-primary tracking-tighter">Join GlamLux</h1>
            <CardDescription className="font-body italic text-muted-foreground">
              Experience the pinnacle of professional artistry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2">Full Name</Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="E.g. Sara Khan" 
                  className="rounded-full h-12 bg-white/60 border-primary/10 px-6"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              
              <div className="space-y-3 pt-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-2 text-center block">I am a...</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(v: any) => setRole(v)}
                  className="flex justify-center gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" className="border-primary text-primary" />
                    <Label htmlFor="customer" className="font-bold text-xs uppercase tracking-widest cursor-pointer">Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vendor" id="vendor" className="border-primary text-primary" />
                    <Label htmlFor="vendor" className="font-bold text-xs uppercase tracking-widest cursor-pointer">Parlour Owner</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-sm transition-all"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>

              <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-4">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log In</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
