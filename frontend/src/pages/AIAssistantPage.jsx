import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Bot,
  Send,
  Home,
  Sparkles,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export const AIAssistantPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: "👋 Hi! I'm your AI Security Assistant. I can help you understand configurations, generate reports, and guide you through infrastructure planning. What would you like to know?",
        timestamp: new Date()
      }
    ]);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Update session ID if new
      if (!sessionId) {
        setSessionId(data.session_id);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold gradient-text">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Powered by GPT-4o</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-140px)]">
        <Card className="glass-card h-full flex flex-col border-border/30">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-secondary/50 text-foreground border border-border/30'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-secondary/50 border border-border/30">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/30 p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything about security infrastructure..."
                disabled={loading}
                className="flex-1 bg-secondary/50 border-border/50 focus:border-primary"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("What is EPS and how do I calculate it?")}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  What is EPS?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("How much storage do I need for 1000 devices?")}
                  className="text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Storage calculation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Explain compliance requirements for HIPAA")}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  HIPAA compliance
                </Button>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AIAssistantPage;
