
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Bot, User, Send, BrainCircuit, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const mockKnowledgeBase = [
  {
    id: 'birds_margalla',
    keywords: ['bird', 'birds', 'margalla', 'hills', 'avian', 'flycatcher', 'francolin', 'woodpecker'],
    answer: 'Margalla Hills National Park is rich in avian biodiversity! Common sightings include the Paradise Flycatcher, Black Francolin, various species of woodpeckers, and raptors. The specific birds can vary by season, with migratory birds appearing in winter.'
  },
  {
    id: 'plants_islamabad',
    keywords: ['plant', 'plants', 'trees', 'flowers', 'islamabad', 'flora', 'jacaranda', 'gulmohar'],
    answer: 'Islamabad and its surrounding areas feature a mix of native and cultivated plants. You can find beautiful flowering trees like Jacaranda and Gulmohar, as well as native shrubs and grasses adapted to the Potohar plateau ecosystem like Phulai (Acacia modesta) and Kao (Olea ferruginea).'
  },
  {
    id: 'rawal_lake_wildlife',
    keywords: ['rawal', 'lake', 'wildlife', 'animal', 'animals', 'fish', 'mammal'],
    answer: 'Rawal Lake and its surroundings support various forms of wildlife. It\'s a key spot for migratory waterfowl in winter. Besides birds, common fish include Rohu and Catla. You might also spot small mammals like foxes or mongoose in the peripheral areas.'
  },
  {
    id: 'conservation_efforts_pakistan',
    keywords: ['conservation', 'protect', 'efforts', 'save', 'biodiversity', 'pakistan', 'ngo'],
    answer: 'Several local and national organizations in Pakistan, like WWF-Pakistan and the Himalayan Wildlife Foundation, work on biodiversity conservation. Efforts include habitat restoration, anti-poaching initiatives, research, and community awareness programs focusing on endangered species and critical ecosystems.'
  },
  {
    id: 'biodiversity_importance',
    keywords: ['biodiversity', 'important', 'why', 'value', 'ecosystem', 'benefit'],
    answer: 'Biodiversity is crucial for healthy ecosystems and human well-being. It provides essential services like pollination for crops, clean air and water, soil fertility, and climate regulation. It also holds immense cultural, recreational, and aesthetic value.'
  }
];

const biodiversityKeywords = ['bird', 'plant', 'animal', 'species', 'nature', 'biodiversity', 'wildlife', 'insect', 'tree', 'flower', 'margalla', 'rawal', 'lake', 'ecosystem', 'habitat', 'conservation', 'flora', 'fauna', 'environment', 'national park', 'forest'];
const offTopicResponse = "I'm programmed to assist with biodiversity-related questions in Islamabad and surrounding areas. Could you please ask something on that topic?";
const genericBiodiversityResponse = "That's an interesting question about biodiversity! While I don't have specific information on that exact topic from my current knowledge, Islamabad and its surroundings have a diverse range of flora and fauna. You can often find more detailed information from local wildlife NGOs, park authorities, or research institutions.";


export default function QAPage() {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('div > div'); // Target the viewport div
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const isQuestionBiodiversityRelated = (question: string): boolean => {
    const lowerCaseQuestion = question.toLowerCase();
    return biodiversityKeywords.some(keyword => lowerCaseQuestion.includes(keyword));
  };

  const getAIResponse = (question: string): string => {
    const lowerCaseQuestion = question.toLowerCase();
    let bestMatch: { id: string; score: number; answer: string } | null = null;

    for (const entry of mockKnowledgeBase) {
      let currentScore = 0;
      for (const keyword of entry.keywords) {
        if (lowerCaseQuestion.includes(keyword.toLowerCase())) {
          currentScore++;
        }
      }
      if (currentScore > 0 && (!bestMatch || currentScore > bestMatch.score)) {
        bestMatch = { id: entry.id, score: currentScore, answer: entry.answer };
      }
    }

    if (bestMatch) {
      return bestMatch.answer;
    }
    return genericBiodiversityResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + 'user',
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 700));

    let aiTextResponse: string;
    if (!isQuestionBiodiversityRelated(userMessage.text)) {
      aiTextResponse = offTopicResponse;
    } else {
      aiTextResponse = getAIResponse(userMessage.text);
    }

    const aiMessage: ChatMessage = {
      id: Date.now().toString() + 'ai',
      sender: 'ai',
      text: aiTextResponse,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="my-6 md:my-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <MessagesSquare className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Ask About Biodiversity
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Get answers to your questions about wildlife and nature in Islamabad and nearby areas.
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

      <Card className="w-full max-w-2xl shadow-xl flex flex-col h-[70vh]">
        <CardContent className="p-0 flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-4 md:p-6 space-y-4" ref={scrollAreaRef}>
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
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
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-3 py-2 shadow-md text-sm md:text-base break-words',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
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
            {isLoading && (
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
                   <svg className="animate-spin h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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

    