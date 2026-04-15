
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Users, TrendingUp, Sparkles, Clock, ChevronRight, Plus, CalendarDays, CheckCircle2, MapPin, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();
  
  // Sheet States
  const [isParlourSheetOpen, setIsParlourSheetOpen] = useState(false);
  const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<any>(null);

  // Status State
  const [arrivals, setArrivals] = useState([
    { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '10:30 AM', status: 'Pending' },
    { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:00 PM', status: 'Verified' },
    { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '02:30 PM', status: 'In-Progress' },
    { id: '4', name: 'Hiba Ali', service: 'Signature Manicure', time: '04:00 PM', status: 'Upcoming' },
  ]);

  const updateArrivalStatus = (id: string, newStatus: string) => {
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast({
      title: "Success",
      description: `${selectedArrival?.name}'s status updated to ${newStatus}.`,
    });
    setSelectedArrival(null);
  };

  const handleCreateParlour = (e: React.FormEvent) => {
    e.preventDefault();
    setIsParlourSheetOpen(false);
    toast({
      title: "Registration Sent",
      description: "Our curators will review your parlour application.",
    });
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    setIsShopSheetOpen(false);
    toast({
      title: "Merchant Request Received",
      description: "Brand onboarding details sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 md:py-12">
        {/* Header - Mobile Optimized */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Management Portal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline text-primary tracking-tighter">Business</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Card className="bg-primary p-6 rounded-[2rem] border-none shadow-lg shadow-primary/20 text-primary-foreground">
               <Users className="h-6 w-6 mb-3 opacity-60" />
               <p className="text-3xl font-bold font-headline">12</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Guests Today</p>
             </Card>
             <Card className="bg-white dark:bg-card p-6 rounded-[2rem] border-none shadow-xl text-primary">
               <TrendingUp className="h-6 w-6 mb-3 opacity-60 text-secondary" />
               <p className="text-3xl font-bold font-headline">142.5K</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">PKR Revenue</p>
             </Card>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setIsParlourSheetOpen(true)}
              className="flex-1 rounded-2xl h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Parlour
            </Button>
            <Button 
              onClick={() => setIsShopSheetOpen(true)}
              variant="outline" 
              className="flex-1 rounded-2xl h-16 border-primary/20 bg-white/40 backdrop-blur-md text-primary font-bold text-xs uppercase tracking-widest"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Shop
            </Button>
          </div>
        </header>

        <Tabs defaultValue="arrivals" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1 h-16 border border-white/60 rounded-2xl w-full flex">
            <TabsTrigger value="arrivals" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-widest">
              Queue
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-widest">
              Capacity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals" className="space-y-4">
            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {arrivals.map((arrival) => (
                <Card 
                  key={arrival.id} 
                  onClick={() => setSelectedArrival(arrival)}
                  className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white/60 dark:bg-card/60 backdrop-blur-md space-y-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                        <Clock className="h-3 w-3" /> {arrival.time}
                      </div>
                      <h4 className="font-headline text-2xl leading-none">{arrival.name}</h4>
                      <p className="text-xs text-muted-foreground italic">{arrival.service}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-full text-[10px] font-bold",
                        arrival.status === 'Verified' ? "bg-green-100 text-green-700 border-green-200" : 
                        arrival.status === 'In-Progress' ? "bg-amber-100 text-amber-700 border-amber-200" : 
                        "border-primary/20 text-primary"
                      )}
                    >
                      {arrival.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] border-t rounded-none pt-4">
                    Manage Entry <ChevronRight className="h-4 w-4" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-primary/5">
                    <TableHead className="py-6 px-8 font-bold text-primary uppercase text-[10px] tracking-widest">Time</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Guest</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Service</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="text-right px-8 font-bold text-primary uppercase text-[10px] tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrivals.map((arrival) => (
                    <TableRow key={arrival.id} className="group hover:bg-primary/5">
                      <TableCell className="px-8 font-bold text-sm">{arrival.time}</TableCell>
                      <TableCell className="font-headline text-xl">{arrival.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs italic">{arrival.service}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-full",
                            arrival.status === 'Verified' ? "bg-green-100 text-green-700 border-green-200" : 
                            arrival.status === 'In-Progress' ? "bg-amber-100 text-amber-700 border-amber-200" : 
                            "border-primary/20 text-primary"
                          )}
                        >
                          {arrival.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button 
                          onClick={() => setSelectedArrival(arrival)}
                          variant="ghost" 
                          size="sm" 
                          className="font-bold text-primary hover:underline"
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
             <div className="grid grid-cols-1 gap-8">
               <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white/60 dark:bg-card/60 backdrop-blur-md">
                 <div className="flex items-center justify-between mb-8">
                   <div className="space-y-1">
                     <h3 className="font-headline text-3xl tracking-tighter">Weekly Availability</h3>
                     <p className="text-sm text-muted-foreground">Manage service slots for the upcoming 7 days.</p>
                   </div>
                   <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                     <CalendarDays className="h-6 w-6" />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                     <div key={day} className="flex items-center justify-between p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 group hover:bg-primary/5 transition-all shadow-sm">
                       <div className="space-y-1">
                         <span className="font-headline text-2xl">{day}</span>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                           {day === 'Saturday' || day === 'Sunday' ? 'High Demand' : 'Standard Availability'}
                         </p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <Badge className={cn(
                           "border-none text-[8px] uppercase font-black px-3 py-1",
                           day === 'Saturday' || day === 'Sunday' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                         )}>
                           {day === 'Saturday' || day === 'Sunday' ? '12 Slots' : '24 Slots'}
                         </Badge>
                         <Button 
                          onClick={() => toast({ title: "Update Capacity", description: `Setting availability for ${day}...` })}
                          size="sm" 
                          variant="outline" 
                          className="rounded-xl border-primary/20 text-primary font-bold text-[10px] h-8"
                         >
                           Adjust
                         </Button>
                       </div>
                     </div>
                   ))}
                 </div>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- INTERACTIVE SHEETS --- */}

      {/* Add Parlour Sheet */}
      <Sheet open={isParlourSheetOpen} onOpenChange={setIsParlourSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] md:h-auto overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <SheetHeader className="space-y-3">
              <SheetTitle className="text-4xl font-headline italic">New Parlour Registration</SheetTitle>
              <SheetDescription className="text-md">Provide details about your beauty establishment to join GlamLux.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateParlour} className="space-y-6 py-8">
              <div className="space-y-2">
                <Label htmlFor="parlour-name" className="text-xs uppercase font-black tracking-widest text-primary/60">Parlour Name</Label>
                <Input id="parlour-name" placeholder="e.g. The Gilded Rose" className="rounded-2xl h-14 border-primary/20 bg-primary/5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parlour-location" className="text-xs uppercase font-black tracking-widest text-primary/60">Area / Location</Label>
                <Input id="parlour-location" placeholder="e.g. Gulberg III, Lahore" className="rounded-2xl h-14 border-primary/20 bg-primary/5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parlour-description" className="text-xs uppercase font-black tracking-widest text-primary/60">About the Studio</Label>
                <Textarea id="parlour-description" placeholder="Describe your luxury environment..." className="rounded-2xl border-primary/20 bg-primary/5 min-h-[120px]" required />
              </div>
              <Button type="submit" className="w-full h-16 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 text-lg">
                Submit Registration
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Shop Sheet */}
      <Sheet open={isShopSheetOpen} onOpenChange={setIsShopSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] md:h-auto overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <SheetHeader className="space-y-3">
              <SheetTitle className="text-4xl font-headline italic">Merchant Onboarding</SheetTitle>
              <SheetDescription className="text-md">List your premium makeup brand on our marketplace.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateShop} className="space-y-6 py-8">
              <div className="space-y-2">
                <Label htmlFor="shop-brand" className="text-xs uppercase font-black tracking-widest text-primary/60">Brand Name</Label>
                <Input id="shop-brand" placeholder="e.g. GlamLux Couture" className="rounded-2xl h-14 border-primary/20 bg-secondary/10" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-category" className="text-xs uppercase font-black tracking-widest text-primary/60">Product Categories</Label>
                <Input id="shop-category" placeholder="e.g. Foundations, Lipsticks" className="rounded-2xl h-14 border-primary/20 bg-secondary/10" required />
              </div>
              <Button type="submit" className="w-full h-16 bg-secondary text-secondary-foreground font-bold rounded-2xl shadow-xl shadow-secondary/10 text-lg">
                Open Merchant Account
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Manage Entry Sheet */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem]">
          {selectedArrival && (
            <div className="max-w-xl mx-auto space-y-8 py-4">
              <SheetHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 bg-primary/10 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" /> Guest Check-In
                </div>
                <SheetTitle className="text-5xl font-headline leading-none">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic text-lg">{selectedArrival.service}</SheetDescription>
              </SheetHeader>
              
              <div className="bg-primary/5 p-8 rounded-[2rem] space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Booking Ref</span>
                  <span className="font-mono font-bold text-primary text-xl">GL-{selectedArrival.id}938-X</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Arrival Time</span>
                  <span className="font-bold text-xl">{selectedArrival.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Current Status</span>
                  <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px]">{selectedArrival.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Verified')} className="h-16 bg-green-600 text-white font-bold rounded-[1.5rem] shadow-2xl shadow-green-200 text-lg">
                  Verify Entry
                </Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'In-Progress')} className="h-16 bg-amber-600 text-white font-bold rounded-[1.5rem] shadow-2xl shadow-amber-200 text-lg">
                  Start Service
                </Button>
                <Button onClick={() => updateArrivalStatus(selectedArrival.id, 'Completed')} className="h-16 bg-primary text-primary-foreground font-bold rounded-[1.5rem] shadow-2xl shadow-primary/30 text-lg md:col-span-2">
                  Mark as Completed
                </Button>
                <SheetClose asChild className="md:col-span-2">
                  <Button variant="ghost" className="h-14 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                    Dismiss
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
