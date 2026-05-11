'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { glamAssistant } from '@/ai/flows/glam-assistant';

export function GlamAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Welcome to GlamLux. I am your AI editorial consultant. How can I refine your beauty journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user' as const, text: input };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await glamAssistant({
        history: messages.slice(-4), // Send recent context
        message: currentInput
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: result.response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I apologize, but I'm currently unable to access the editorial network. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-body">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {!isOpen && (
          <SheetTrigger asChild>
            <Button 
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-3xl hover:scale-110 active:scale-95 transition-all p-0 border-none group"
            >
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </SheetTrigger>
        )}
        <SheetContent side="right" className="w-[90vw] sm:w-[450px] p-0 border-none shadow-3xl bg-background/95 backdrop-blur-xl flex flex-col">
          <SheetHeader className="p-8 border-b border-primary/10">
            <div className="flex justify-between items-center text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/5 border border-primary/10">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Artistry AI</span>
                </div>
                <SheetTitle className="text-3xl font-headline italic tracking-tighter text-primary">Glam Assistant.</SheetTitle>
                <SheetDescription className="text-xs italic font-body">Your private beauty concierge.</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-8">
            <div className="space-y-8 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary/40",
                    msg.role === 'user' && "flex-row-reverse"
                  )}>
                    {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    {msg.role === 'user' ? 'Client' : 'Assistant'}
                  </div>
                  <div className={cn(
                    "p-5 text-sm italic leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-[2rem] rounded-tr-none shadow-xl" 
                      : "bg-white/60 dark:bg-white/5 border border-primary/5 rounded-[2rem] rounded-tl-none shadow-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col gap-2 max-w-[85%] items-start animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary/40">
                    <Bot className="h-3 w-3" /> Assistant
                  </div>
                  <div className="bg-white/60 dark:bg-white/5 border border-primary/5 rounded-[2rem] rounded-tl-none shadow-sm p-5">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-primary/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
            <div className="relative flex items-center">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consult the assistant..."
                className="rounded-full h-14 bg-white/80 dark:bg-white/5 border-primary/10 px-8 italic font-body focus-visible:ring-primary/20 pr-14"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon" 
                className="absolute right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
