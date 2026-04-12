'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Users, TrendingUp, Sparkles, Clock, ChevronRight, Plus, CalendarDays, CheckCircle2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const MOCK_ARRIVALS = [
  { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '10:30 AM', status: 'Pending' },
  { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:00 PM', status: 'Verified' },
  { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '02:30 PM', status: 'In-Progress' },
  { id: '4', name: 'Hiba Ali', service: 'Signature Manicure', time: '04:00 PM', status: 'Upcoming' },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  // Sheet States
  const [isParlourSheetOpen, setIsParlourSheetOpen] = useState(false);
  const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<any>(null);

  const handleCreateParlour = (e: React.FormEvent) => {
    e.preventDefault();
    setIsParlourSheetOpen(false);
    toast({
      title: "Success",
      description: "Parlour registration submitted for review.",
    });
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    setIsShopSheetOpen(false);
    toast({
      title: "Success",
      description: "Beauty Shop has been listed successfully.",
    });
  };

  const handleVerifyEntry = () => {
    toast({
      title: "Entry Verified",
      description: `${selectedArrival.name} has been checked in.`,
    });
    setSelectedArrival(null);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 md:py-12">
        {/* Header - Mobile Optimized */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Partner Portal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline text-primary tracking-tighter">Management</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Card className="bg-primary p-4 rounded-[1.5rem] border-none shadow-lg shadow-primary/20 text-white">
               <Users className="h-5 w-5 mb-2 opacity-60" />
               <p className="text-2xl font-bold font-headline">12</p>
               <p className="text-[9px] uppercase font-bold tracking-widest opacity-80">Today's Arrivals</p>
             </Card>
             <Card className="bg-white p-4 rounded-[1.5rem] border-none shadow-xl text-primary">
               <TrendingUp className="h-5 w-5 mb-2 opacity-60 text-secondary" />
               <p className="text-2xl font-bold font-headline">142.5K</p>
               <p className="text-[9px] uppercase font-bold tracking-widest opacity-80">Daily Revenue</p>
             </Card>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setIsParlourSheetOpen(true)}
              className="flex-1 rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Parlour
            </Button>
            <Button 
              onClick={() => setIsShopSheetOpen(true)}
              variant="outline" 
              className="flex-1 rounded-2xl h-14 border-primary/20 bg-white/40 backdrop-blur-md text-primary font-bold text-xs uppercase tracking-widest"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Shop
            </Button>
          </div>
        </header>

        <Tabs defaultValue="arrivals" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1 h-14 border border-white/60 rounded-2xl w-full flex">
            <TabsTrigger value="arrivals" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-widest">
              Queue
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-widest">
              Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals" className="space-y-4">
            <div className="md:hidden space-y-4">
              {MOCK_ARRIVALS.map((arrival) => (
                <Card 
                  key={arrival.id} 
                  onClick={() => setSelectedArrival(arrival)}
                  className="p-5 rounded-[2rem] border-none shadow-lg bg-white/60 backdrop-blur-md space-y-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                        <Clock className="h-3 w-3" /> {arrival.time}
                      </div>
                      <h4 className="font-headline text-xl leading-none">{arrival.name}</h4>
                      <p className="text-[10px] text-muted-foreground italic">{arrival.service}</p>
                    </div>
                    <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className={arrival.status === 'Verified' ? 'bg-primary text-white border-none' : 'border-primary/20 text-primary'}>
                      {arrival.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] border-t rounded-none pt-4">
                    Manage Entry <ChevronRight className="h-4 w-4" />
                  </div>
                </Card>
              ))}
            </div>

            <Card className="hidden md:block rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
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
                  {MOCK_ARRIVALS.map((arrival) => (
                    <TableRow key={arrival.id} className="group hover:bg-primary/5">
                      <TableCell className="px-8 font-bold text-sm">{arrival.time}</TableCell>
                      <TableCell className="font-headline text-lg">{arrival.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs italic">{arrival.service}</TableCell>
                      <TableCell>
                        <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className="rounded-full">
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
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="rounded-[2rem] border-none shadow-xl p-6 bg-white/60 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-6">
                   <CalendarDays className="h-5 w-5 text-primary" />
                   <h3 className="font-headline text-xl">Navigator</h3>
                 </div>
                 <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
               </Card>

               <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl p-8 bg-white">
                 <h3 className="font-headline text-2xl mb-8 tracking-tighter">Weekly Load</h3>
                 <div className="space-y-4">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                     <div key={day} className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/5 group hover:bg-primary/10 transition-all">
                       <span className="font-headline text-xl w-12">{day}</span>
                       <div className="flex gap-2">
                         <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black">80% Capacity</Badge>
                         <Badge variant="outline" className="border-primary/20 text-primary text-[9px] uppercase font-black">12 Slots</Badge>
                       </div>
                       <Button 
                        onClick={() => toast({ title: "Edit Schedule", description: `Updating capacity for ${day}...` })}
                        size="sm" 
                        variant="ghost" 
                        className="text-primary font-black uppercase text-[9px] tracking-widest"
                       >
                         Edit
                       </Button>
                     </div>
                   ))}
                 </div>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- FORMS & SHEETS --- */}

      {/* Add Parlour Sheet */}
      <Sheet open={isParlourSheetOpen} onOpenChange={setIsParlourSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] h-[90vh] md:h-auto overflow-y-auto">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-3xl font-headline italic">New Parlour Registration</SheetTitle>
            <SheetDescription>Provide details about your beauty establishment to join GlamLux.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateParlour} className="space-y-6 py-8">
            <div className="space-y-2">
              <Label htmlFor="parlour-name" className="text-xs uppercase font-bold tracking-widest">Parlour Name</Label>
              <Input id="parlour-name" placeholder="e.g. The Gilded Rose" className="rounded-xl h-12 border-primary/20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parlour-location" className="text-xs uppercase font-bold tracking-widest">Area / Location</Label>
              <Input id="parlour-location" placeholder="e.g. Gulberg III, Lahore" className="rounded-xl h-12 border-primary/20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parlour-description" className="text-xs uppercase font-bold tracking-widest">About the Studio</Label>
              <Textarea id="parlour-description" placeholder="Describe your luxury environment..." className="rounded-xl border-primary/20 min-h-[100px]" required />
            </div>
            <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20">
              Submit Registration
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Shop Sheet */}
      <Sheet open={isShopSheetOpen} onOpenChange={setIsShopSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] h-[90vh] md:h-auto overflow-y-auto">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-3xl font-headline italic">Merchant Onboarding</SheetTitle>
            <SheetDescription>List your premium makeup brand on our marketplace.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateShop} className="space-y-6 py-8">
            <div className="space-y-2">
              <Label htmlFor="shop-brand" className="text-xs uppercase font-bold tracking-widest">Brand Name</Label>
              <Input id="shop-brand" placeholder="e.g. GlamLux Couture" className="rounded-xl h-12 border-primary/20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-category" className="text-xs uppercase font-bold tracking-widest">Product Categories</Label>
              <Input id="shop-category" placeholder="e.g. Foundations, Lipsticks" className="rounded-xl h-12 border-primary/20" required />
            </div>
            <Button type="submit" className="w-full h-14 bg-secondary text-secondary-foreground font-bold rounded-2xl shadow-lg shadow-secondary/10">
              Open Merchant Account
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Manage Entry Sheet */}
      <Sheet open={!!selectedArrival} onOpenChange={() => setSelectedArrival(null)}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem]">
          {selectedArrival && (
            <div className="space-y-8 py-4">
              <SheetHeader className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                  <CheckCircle2 className="h-4 w-4" /> Guest Check-In
                </div>
                <SheetTitle className="text-4xl font-headline">{selectedArrival.name}</SheetTitle>
                <SheetDescription className="italic">{selectedArrival.service}</SheetDescription>
              </SheetHeader>
              
              <div className="bg-primary/5 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Booking Ref:</span>
                  <span className="font-mono font-bold text-primary">GL-9938-X</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Scheduled Time:</span>
                  <span className="font-bold">{selectedArrival.time}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant="outline" className="border-primary/20 text-primary">{selectedArrival.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button onClick={handleVerifyEntry} className="h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20">
                  Verify & Grant Entry
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost" className="h-14 font-bold text-muted-foreground">
                    Close Details
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
