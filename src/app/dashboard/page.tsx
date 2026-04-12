
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Sparkles, Clock, CheckCircle, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const MOCK_ARRIVALS = [
  { id: '1', name: 'Sara Khan', service: 'Royal Bridal Glow Up', time: '10:30 AM', status: 'Pending' },
  { id: '2', name: 'Amna Ahmed', service: 'Silk Therapy Hair Spa', time: '12:00 PM', status: 'Verified' },
  { id: '3', name: 'Zoya Malik', service: 'Crystal Clear Skin Facial', time: '02:30 PM', status: 'In-Progress' },
  { id: '4', name: 'Hiba Ali', service: 'Signature Manicure', time: '04:00 PM', status: 'Upcoming' },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 md:mb-16 gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Management Suite</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline text-primary">Partner Portal</h1>
            <p className="text-sm md:text-base text-muted-foreground italic font-body">The Gilded Rose Salon • Luxury Workflow Control</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                <Plus className="h-4 w-4 mr-2" /> Add Parlour
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none border-primary/20 hover:border-primary hover:bg-primary/5 font-bold h-12 px-6 rounded-full transition-all hover:-translate-y-0.5 bg-white/50 backdrop-blur-sm">
                <Plus className="h-4 w-4 mr-2" /> Add Shop
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <Card className="border-none bg-primary text-white p-3 flex items-center gap-3 shadow-md">
                <div className="p-2 bg-white/10 rounded-full">
                  <Users className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-[8px] text-white/60 font-bold uppercase tracking-widest font-body">Arrivals</p>
                  <p className="text-lg font-bold font-headline leading-none">12</p>
                </div>
              </Card>
              <Card className="border-none bg-secondary text-primary p-3 flex items-center gap-3 shadow-md">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[8px] text-primary/60 font-bold uppercase tracking-widest font-body">Revenue</p>
                  <p className="text-lg font-bold tabular-nums font-headline leading-none">142.5K</p>
                </div>
              </Card>
            </div>
          </div>
        </header>

        <Tabs defaultValue="arrivals" className="space-y-6 md:space-y-8">
          <TabsList className="bg-primary/5 p-1 h-auto flex flex-wrap border border-primary/10 rounded-xl">
            <TabsTrigger value="arrivals" className="flex-1 min-w-[120px] h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg px-4 md:px-8 font-bold font-body rounded-lg transition-all">
              Daily Arrivals
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex-1 min-w-[120px] h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg px-4 md:px-8 font-bold font-body rounded-lg transition-all">
              Weekly Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals">
            <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
              <CardHeader className="bg-primary/5 border-b py-6 md:py-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <CardTitle className="font-headline text-xl md:text-2xl">Today's Appointment Queue</CardTitle>
                </div>
                <CardDescription className="font-body text-xs md:text-sm">Verify guests via unique QR code on arrival to maintain security.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="md:hidden space-y-4 p-4">
                  {MOCK_ARRIVALS.map((arrival) => (
                    <div key={arrival.id} className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-secondary font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {arrival.time}
                          </p>
                          <h4 className="font-bold text-primary font-body mt-1">{arrival.name}</h4>
                        </div>
                        <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className={arrival.status === 'Verified' ? 'bg-secondary text-secondary-foreground border-none font-body text-[10px]' : 'border-primary/20 text-muted-foreground font-body text-[10px]'}>
                          {arrival.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{arrival.service}</p>
                      <Button size="sm" variant="ghost" className="w-full justify-between text-secondary font-bold text-xs p-0 h-auto hover:bg-transparent">
                        Manage Entry <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="font-bold py-6 px-8 font-body text-primary">Arrival Time</TableHead>
                        <TableHead className="font-bold font-body text-primary">Guest Name</TableHead>
                        <TableHead className="font-bold font-body text-primary">Service Booked</TableHead>
                        <TableHead className="font-bold font-body text-primary">Status</TableHead>
                        <TableHead className="text-right font-bold px-8 font-body text-primary">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_ARRIVALS.map((arrival) => (
                        <TableRow key={arrival.id} className="group hover:bg-primary/5 transition-colors">
                          <TableCell className="px-8 font-medium font-body">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-secondary" />
                              {arrival.time}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-primary font-body">{arrival.name}</TableCell>
                          <TableCell className="text-muted-foreground font-body">{arrival.service}</TableCell>
                          <TableCell>
                            <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className={arrival.status === 'Verified' ? 'bg-secondary text-secondary-foreground border-none font-body' : 'border-primary/20 text-muted-foreground font-body'}>
                              {arrival.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <Button variant="ghost" size="sm" className="font-bold text-secondary group-hover:underline font-body transition-all">Manage Entry</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Schedule Navigator</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-2 sm:p-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border-none font-body scale-90 sm:scale-100"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-lg rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-primary">Weekly Resource Allocation</CardTitle>
                  <CardDescription className="font-body text-xs md:text-sm italic text-muted-foreground">Strategic staff and deal availability planning.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 md:space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/5 group">
                        <div className="sm:w-24 font-bold text-primary font-body tracking-tight group-hover:translate-x-1 transition-transform">{day}</div>
                        <div className="flex-grow">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-secondary text-secondary-foreground border-none px-3 font-body text-[10px]">3 Deals Active</Badge>
                            <Badge variant="outline" className="border-primary/10 text-muted-foreground font-body text-[10px] bg-white">8/10 Sessions Filled</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-secondary font-bold font-body w-full sm:w-auto mt-2 sm:mt-0 hover:bg-secondary/10">Adjust Load</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
