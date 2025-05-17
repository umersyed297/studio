
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Bot, User, Send, BrainCircuit, MessagesSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { askBiodiversityQuestion, type BiodiversityQnAInput } from '@/ai/flows/biodiversity-qna-flow';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  error?: boolean;
}

export default function QAPage() {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea's Viewport
  const chatContentRef = useRef<HTMLDivElement>(null); // Ref for the direct content wrapper

  const scrollToBottom = () => {
    if (scrollViewportRef.current && chatContentRef.current) {
      scrollViewportRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Debounce or use requestAnimationFrame to ensure DOM is updated
    const animationFrameId = requestAnimationFrame(() => {
      scrollToBottom();
    });
    return () => cancelAnimationFrame(animationFrameId);
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const userMessage: ChatMessage = {
      id: Date.now().toString() + 'user',
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await askBiodiversityQuestion({ question: userMessageText });
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + 'ai',
        sender: 'ai',
        text: aiResponse.answer,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + 'ai_error',
        sender: 'ai',
        text: "Sorry, I couldn't get a response right now. Please try again later.",
        timestamp: new Date(),
        error: true,
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="my-6 md:my-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <MessagesSquare className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Ask About Biodiversity
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Chat with an AI about wildlife, plants, and ecosystems.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <Card className="w-full max-w-2xl shadow-xl flex flex-col">
        <CardContent className="p-0 flex flex-col">
          {/* 
            The ScrollArea component from Radix UI (used by shadcn/ui)
            has an internal structure: Root > Viewport > Content.
            The `ref` for controlling scroll position should ideally be on the Viewport.
            We can get a ref to the viewport by finding it within the ScrollArea's ref,
            or by passing a ref to the `Viewport` component if we were composing it manually.
            Since we are using the composed `ScrollArea`, we will assign the ref to the Root
            and then querySelector for the viewport for scrolling.
            The `type="always"` prop forces scrollbar tracks to be visible.
          */}
          <ScrollArea
            className="min-h-[200px] max-h-[60vh] lg:min-h-[300px] lg:max-h-[65vh]"
            type="always" // Forces scrollbar tracks to be visible
            ref={scrollViewportRef} // Technically this ref is on the ScrollArea Root.
                                 // We will use it to find the viewport for scrolling.
          >
            <div className="p-4 md:p-6 space-y-4" ref={chatContentRef}>
              {chatHistory.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground" style={{minHeight: '150px'}}>
                  <BrainCircuit className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-center">Ask a question to start the conversation!</p>
                  <p className="text-xs mt-1 text-center">e.g., "What birds are in Margalla Hills?"</p>
                </div>
              )}
              {chatHistory.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end space-x-2 my-3',
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.sender === 'ai' && (
                    <Avatar className="h-8 w-8 self-start">
                      <AvatarFallback className={cn(
                        "bg-primary text-primary-foreground",
                        msg.error && "bg-destructive text-destructive-foreground"
                      )}>
                        {msg.error ? <AlertTriangle size={20}/> : <Bot size={20} />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-3 py-2 shadow-md text-sm md:text-base break-words',
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : msg.error
                          ? 'bg-destructive/20 text-destructive-foreground border border-destructive rounded-bl-none'
                          : 'bg-card text-card-foreground rounded-bl-none border'
                    )}
                  >
                    <p>{msg.text}</p>
                     <p className={cn(
                        "text-xs mt-1",
                        msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                  </div>
                  {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8 self-start">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && chatHistory[chatHistory.length-1]?.sender === 'user' && (
                <div className="flex items-end space-x-2 justify-start my-3">
                  <Avatar className="h-8 w-8 self-start">
                     <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot size={20} />
                      </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%] rounded-lg px-3 py-2 shadow-md text-sm md:text-base bg-card text-card-foreground rounded-bl-none border">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-75"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-225"></span>
                    </div>
                  </div>
                </div>
              )}
            </div> {/* End of chatContentRef div */}
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask about biodiversity..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-grow"
                disabled={isLoading}
                aria-label="Ask a question"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
