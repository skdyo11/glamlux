'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ChevronLeft, MoreVertical, Search, X, MessageSquare } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  addDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  doc, 
  getDocs,
  setDoc
} from 'firebase/firestore';
import { signInAnonymously, getAuth } from 'firebase/auth';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorId = searchParams.get('vendorId');
  const vendorName = searchParams.get('vendorName');
  const vendorImage = searchParams.get('vendorImage');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure user is signed in (anonymous if needed)
  useEffect(() => {
    if (isMounted && !isUserLoading && !user) {
      const auth = getAuth();
      signInAnonymously(auth);
    }
  }, [isMounted, isUserLoading, user]);

  // Fetch conversations for the current user
  const conversationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participants', 'array-contains', user.uid)
      // Removed orderBy to avoid index-related permission errors during development
    );
  }, [firestore, user?.uid]);

  const { data: conversations, isLoading: isLoadingConversations } = useCollection(conversationsQuery);

  // Handle auto-starting a chat if vendorId is provided in URL
  useEffect(() => {
    if (!isMounted || !user || !firestore || !vendorId) return;

    const setupChat = async () => {
      const q = query(
        collection(firestore, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(doc => doc.data().participants.includes(vendorId));

      if (existing) {
        setActiveConversationId(existing.id);
      } else {
        const newConvRef = doc(collection(firestore, 'conversations'));
        await setDoc(newConvRef, {
          id: newConvRef.id,
          participants: [user.uid, vendorId],
          lastMessage: '',
          updatedAt: serverTimestamp(),
          vendorName: vendorName || 'Artisan',
          vendorImage: vendorImage || ''
        });
        setActiveConversationId(newConvRef.id);
      }
      // Remove query params to avoid re-creation
      router.replace('/messages');
    };

    setupChat();
  }, [isMounted, user, firestore, vendorId, vendorName, vendorImage, router]);

  // Fetch messages for active conversation
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !activeConversationId) return null;
    return query(
      collection(firestore, 'conversations', activeConversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, activeConversationId]);

  const { data: messages } = useCollection(messagesQuery);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    // Sort manually on client to bypass Firestore index requirements for a smooth prototype
    const sorted = [...conversations].sort((a, b) => {
      const getVal = (v: any) => {
        if (!v) return 0;
        if (v.seconds) return v.seconds * 1000;
        return new Date(v).getTime();
      };
      return getVal(b.updatedAt) - getVal(a.updatedAt);
    });

    if (!searchTerm.trim()) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(conv => 
      conv.vendorName?.toLowerCase().includes(term) || 
      conv.lastMessage?.toLowerCase().includes(term)
    );
  }, [conversations, searchTerm]);

  const activeConversation = conversations?.find(c => c.id === activeConversationId) || null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId || !user || !firestore) return;
    
    const messagesRef = collection(firestore, 'conversations', activeConversationId, 'messages');
    const convRef = doc(firestore, 'conversations', activeConversationId);

    const messageData = {
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp()
    };

    addDocumentNonBlocking(messagesRef, messageData);
    updateDocumentNonBlocking(convRef, {
      lastMessage: newMessage,
      updatedAt: serverTimestamp()
    });

    setNewMessage('');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto max-w-screen-2xl flex flex-1 h-[calc(100dvh-120px)] md:h-[calc(100vh-100px)] pt-20 md:pt-24 pb-4 md:pb-8">
        {/* Sidebar List */}
        <div className={cn(
          "w-full md:w-80 border-r flex flex-col bg-white/40 dark:bg-white/5 backdrop-blur-xl md:rounded-l-3xl overflow-hidden shadow-sm",
          activeConversationId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 pb-2 space-y-1">
            <h1 className="text-3xl font-headline italic text-primary">Chat</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary/40">Real Messages</p>
          </div>

          <div className="px-6 pb-4 pt-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..." 
                className="pl-10 rounded-full h-10 bg-primary/5 border-none text-xs italic"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            {isLoadingConversations ? (
              <div className="p-8 text-center animate-pulse"><MessageSquare className="h-8 w-8 mx-auto text-primary/10" /></div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 mb-2 transition-all",
                    activeConversationId === conv.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/5"
                  )}
                >
                  <Avatar className="h-12 w-12"><AvatarImage src={conv.vendorImage} /></Avatar>
                  <div className="flex-grow text-left min-w-0">
                    <h4 className="font-headline text-lg truncate">{conv.vendorName}</h4>
                    <p className="text-xs truncate opacity-70">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 text-center px-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">No chats yet</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        {activeConversation ? (
          <div className="flex-grow flex flex-col bg-background md:rounded-r-3xl overflow-hidden shadow-2xl relative border-l dark:border-white/10">
            <div className="p-4 md:p-6 border-b flex items-center gap-4 bg-white/60 dark:bg-black/20 backdrop-blur-md z-10">
              <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)} className="md:hidden"><ChevronLeft className="h-6 w-6" /></Button>
              <Avatar className="h-10 w-10"><AvatarImage src={activeConversation.vendorImage} /></Avatar>
              <div className="flex-grow">
                <h3 className="font-headline text-xl italic text-primary">{activeConversation.vendorName}</h3>
                <p className="text-[10px] uppercase font-bold text-accent-foreground tracking-widest">Online</p>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><MoreVertical className="h-5 w-5" /></Button>
            </div>

            <ScrollArea className="flex-1 p-4 md:p-8">
              <div className="space-y-6 pb-20">
                {messages?.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[85%] space-y-1", msg.senderId === user?.uid ? "ml-auto items-end" : "items-start")}>
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm text-sm", 
                      msg.senderId === user?.uid ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/60 dark:bg-white/10 text-foreground rounded-tl-none border border-white/40 dark:border-white/10"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 md:p-6 bg-white/40 dark:bg-black/40 backdrop-blur-md border-t z-10">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                  placeholder="Type a message..." 
                  className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-none px-6" 
                />
                <Button onClick={handleSendMessage} size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl"><Send className="h-5 w-5" /></Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-grow items-center justify-center bg-muted/5 italic text-muted-foreground">
            Select a chat to start talking
          </div>
        )}
      </main>
    </div>
  );
}