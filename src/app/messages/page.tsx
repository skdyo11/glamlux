
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, ChevronLeft, Sparkles, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Conversation, ChatMessage } from '@/app/types';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participantId: 'p1',
    participantName: 'The Gilded Rose',
    participantImage: 'https://picsum.photos/seed/luxury-spa-interior/100/100',
    lastMessage: 'Your bridal trial is confirmed for tomorrow.',
    lastTimestamp: '10:45 AM',
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'p1', text: 'Hello! How can we help you today?', timestamp: '10:30 AM', isMe: false },
      { id: 'm2', senderId: 'user', text: 'I wanted to confirm my bridal trial.', timestamp: '10:35 AM', isMe: true },
      { id: 'm3', senderId: 'p1', text: 'Your bridal trial is confirmed for tomorrow.', timestamp: '10:45 AM', isMe: false },
    ]
  },
  {
    id: 'c2',
    participantId: 'p2',
    participantName: 'GlamLux Help',
    participantImage: 'https://picsum.photos/seed/glam-makeup-hero-final/100/100',
    lastMessage: 'Your order #GL938-X has been shipped.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'p2', text: 'Welcome to GlamLux Help.', timestamp: 'Yesterday', isMe: false },
      { id: 'm5', senderId: 'p2', text: 'Your order #GL938-X has been shipped.', timestamp: 'Yesterday', isMe: false },
    ]
  }
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const message: ChatMessage = {
      id: Math.random().toString(),
      senderId: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    activeConversation.messages.push(message);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className={cn(
        "container mx-auto px-0 md:px-4 md:py-8 h-[calc(100vh-64px)] flex",
        activeConversation ? "flex-col md:flex-row" : "flex-col"
      )}>
        {/* Conversation List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col bg-white/40 backdrop-blur-xl",
          activeConversation ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-headline italic">Customer Chat</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary/40">Talk to parlours and support</p>
            <div className="relative">
              <Input placeholder="Search messages..." className="rounded-2xl bg-white/60 border-none h-12" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 space-y-2 pb-20 md:pb-4">
              {MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={cn(
                    "w-full p-4 rounded-3xl flex items-center gap-4 transition-all active:scale-[0.98]",
                    activeConversation?.id === conv.id ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5"
                  )}
                >
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    <AvatarImage src={conv.participantImage} />
                    <AvatarFallback>{conv.participantName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow text-left min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-headline text-lg truncate">{conv.participantName}</h4>
                      <span className={cn("text-[10px] font-bold uppercase opacity-60", activeConversation?.id === conv.id ? "text-white" : "text-muted-foreground")}>
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate opacity-80", conv.unreadCount > 0 && "font-bold")}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && activeConversation?.id !== conv.id && (
                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        {activeConversation ? (
          <div className="flex-grow flex flex-col bg-background md:rounded-r-[3rem] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b flex items-center gap-4 bg-white/60 backdrop-blur-md">
              <Button variant="ghost" size="icon" onClick={() => setActiveConversation(null)} className="md:hidden">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConversation.participantImage} />
                <AvatarFallback>{activeConversation.participantName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-headline text-xl leading-none">{activeConversation.participantName}</h3>
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Active Now</p>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 md:p-8">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary/40 px-3 py-1 rounded-full">Secure Messaging</span>
                </div>
                {activeConversation.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[80%] space-y-1", msg.isMe ? "ml-auto items-end" : "items-start")}>
                    <div className={cn(
                      "p-4 rounded-[1.5rem] shadow-sm",
                      msg.isMe ? "bg-primary text-white rounded-tr-none" : "bg-white/60 text-foreground rounded-tl-none backdrop-blur-sm border border-white/40"
                    )}>
                      <p className="text-sm font-body">{msg.text}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white/40 backdrop-blur-md border-t">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..." 
                  className="rounded-full h-14 bg-white/80 border-none px-6 text-lg" 
                />
                <Button onClick={handleSendMessage} size="icon" className="h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-grow items-center justify-center flex-col space-y-6 text-center">
            <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center">
              <MessageSquare className="h-16 w-16 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-headline italic">Customer Support</h2>
              <p className="text-muted-foreground font-body max-w-xs mx-auto">Ask about your bookings or makeup orders here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
