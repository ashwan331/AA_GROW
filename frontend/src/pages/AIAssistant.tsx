import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Bot, Send, Mic, Volume2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user'|'ai', content: string }[]>([
    { role: 'ai', content: `Hello ${user?.name || 'Farmer'}, I am your Aa-GROWW AI Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify({ message: userMsg, language })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.response || 'Error processing request.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection failed. Please check backend server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoicePlay = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'te') utterance.lang = 'te-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Get real-time answers in English, Hindi, or Telugu.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-md">
        <CardHeader className="border-b bg-muted/20 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select 
              className="bg-transparent border border-input rounded-md text-sm p-1 outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                  : 'bg-muted rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.role === 'ai' && (
                  <button onClick={() => handleVoicePlay(msg.content)} className="mt-2 text-primary hover:text-primary/80 opacity-70 transition-opacity">
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted max-w-[80%] rounded-2xl rounded-bl-none px-5 py-3 flex space-x-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 border-t bg-muted/10">
          <div className="flex w-full items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground" onClick={() => alert("Voice input simulation: SpeechRecognition API can be attached here.")}>
              <Mic className="h-5 w-5" />
            </Button>
            <Input 
              placeholder={`Type a message in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-full px-4"
            />
            <Button onClick={handleSend} className="rounded-full shrink-0 h-10 w-10 p-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
