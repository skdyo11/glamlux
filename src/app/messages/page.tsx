'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ChevronLeft, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Conversation } from '@/app/types';

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
    ]
  }
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    activeConversation.messages.push({
      id: Math.random().toString(),
      senderId: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    });
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto max-w-screen-2xl flex flex-1 h-[calc(100dvh-120px)] md:h-[calc(100vh-100px)] pt-4 md:pt-8 transition-all duration-300">
        {/* List */}
        <div className={cn(
          "w-full md:w-72 border-r flex flex-col bg-white/40 backdrop-blur-xl md:rounded-l-[3rem] overflow-hidden shadow-sm",
          activeConversation ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 space-y-2">
            <h1 className="text-3xl font-headline italic text-primary">Chat</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary/40">Messages with beauty artisans</p>
          </div>
          <ScrollArea className="flex-1 px-2 space-y-2 pb-24">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={cn(
                  "w-full p-4 rounded-3xl flex items-center gap-4 transition-all active:scale-[0.98]",
                  activeConversation?.id === conv.id ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5"
                )}
              >
                <Avatar className="h-12 w-12 border-2 border-white/20"><AvatarImage src={conv.participantImage} /></Avatar>
                <div className="flex-grow text-left min-w-0">
                  <h4 className="font-headline text-lg truncate">{conv.participantName}</h4>
                  <p className="text-xs truncate opacity-70">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Window */}
        {activeConversation && (
          <div className="flex-grow flex flex-col bg-background md:rounded-r-[3rem] overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b flex items-center gap-4 bg-white/60 backdrop-blur-md z-10">
              <Button variant="ghost" size="icon" onClick={() => setActiveConversation(null)} className="md:hidden text-primary"><ChevronLeft className="h-6 w-6" /></Button>
              <Avatar className="h-10 w-10"><AvatarImage src={activeConversation.participantImage} /></Avatar>
              <div className="flex-grow">
                <h3 className="font-headline text-xl italic text-primary">{activeConversation.participantName}</h3>
                <p className="text-[10px] uppercase font-bold text-accent-foreground tracking-widest">Active</p>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><MoreVertical className="h-5 w-5" /></Button>
            </div>

            <ScrollArea className="flex-1 p-4 md:p-8">
              <div className="space-y-6 pb-32">
                {activeConversation.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[85%] space-y-1", msg.isMe ? "ml-auto items-end" : "items-start")}>
                    <div className={cn("p-4 rounded-[1.5rem] shadow-sm text-sm", msg.isMe ? "bg-primary text-white rounded-tr-none" : "bg-white/60 text-foreground rounded-tl-none border border-white/40")}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 md:p-6 bg-white/40 backdrop-blur-md border-t z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom)+3.5rem)] md:pb-6">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Write your message..." className="rounded-full h-14 bg-white/80 border-none px-6 text-sm" />
                <Button onClick={handleSendMessage} size="icon" className="h-14 w-14 rounded-full bg-primary text-white shadow-xl hover:scale-105 transition-all"><Send className="h-5 w-5" /></Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}