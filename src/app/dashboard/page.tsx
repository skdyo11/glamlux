
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Users, TrendingUp, Sparkles, Clock, CheckCircle } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline text-primary">Partner Portal</h1>
            <p className="text-muted-foreground italic">The Gilded Rose Salon • Managing Your Luxury Workflow</p>
          </div>
          <div className="flex gap-4">
            <Card className="border-none bg-primary text-white p-4 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Arrivals Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </Card>
            <Card className="border-none bg-secondary text-primary p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary/60 font-bold uppercase tracking-widest">Weekly Revenue</p>
                <p className="text-2xl font-bold tabular-nums">142,500</p>
              </div>
            </Card>
          </div>
        </header>

        <Tabs defaultValue="arrivals" className="space-y-8">
          <TabsList className="bg-primary/5 p-1 h-12 border border-primary/10">
            <TabsTrigger value="arrivals" className="h-10 data-[state=active]:bg-primary data-[state=active]:text-white px-8 font-bold">
              Daily Arrivals
            </TabsTrigger>
            <TabsTrigger value="planner" className="h-10 data-[state=active]:bg-primary data-[state=active]:text-white px-8 font-bold">
              Weekly Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals">
            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b py-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <CardTitle className="font-headline text-2xl">Today's Appointment Queue</CardTitle>
                </div>
                <CardDescription>Verify guests via QR code on arrival to unlock review capabilities.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/30">
                      <TableHead className="font-bold py-6 px-8">Arrival Time</TableHead>
                      <TableHead className="font-bold">Guest Name</TableHead>
                      <TableHead className="font-bold">Service Booked</TableHead>
                      <TableHead className="font-bold">Verification Status</TableHead>
                      <TableHead className="text-right font-bold px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ARRIVALS.map((arrival) => (
                      <TableRow key={arrival.id} className="group hover:bg-primary/5 transition-colors">
                        <TableCell className="px-8 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-secondary" />
                            {arrival.time}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">{arrival.name}</TableCell>
                        <TableCell className="text-muted-foreground">{arrival.service}</TableCell>
                        <TableCell>
                          <Badge variant={arrival.status === 'Verified' ? 'default' : 'outline'} className={arrival.status === 'Verified' ? 'bg-secondary text-secondary-foreground border-none' : 'border-primary/20 text-muted-foreground'}>
                            {arrival.status === 'Verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {arrival.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button variant="ghost" size="sm" className="font-bold text-secondary group-hover:underline">Manage Entry</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Schedule Navigator</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border-none"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Weekly Resource Allocation</CardTitle>
                  <CardDescription>Staff and Deal planning for the upcoming 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex items-center gap-6 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/5">
                        <div className="w-24 font-bold text-primary">{day}</div>
                        <div className="flex-grow">
                          <div className="flex gap-2">
                            <Badge className="bg-secondary/20 text-secondary border-none px-3">3 Flash Deals Active</Badge>
                            <Badge variant="outline" className="border-primary/10 text-muted-foreground">8/10 Sessions Booked</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary font-bold">Adjust</Button>
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
