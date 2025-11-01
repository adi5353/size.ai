import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bot, Sparkles, Send, Key, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const AIAssistant = ({ devices, configuration, results }) => {
  const [aiProvider, setAiProvider] = useState('perplexity');
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const examplePrompts = [
    "What SIEM solution best fits this infrastructure?",
    "Optimize storage configuration for cost",
    "Compare Splunk vs Elastic for this sizing",
    "Recommend hardware specifications",
    "Suggest scaling strategies for future growth"
  ];

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setLoading(true);
    
    // Simulate AI response (mock implementation)
    setTimeout(() => {
      const mockResponse = `Based on your infrastructure sizing:\n\n**Infrastructure Overview:**\n- Total EPS: ${results.averageEPS.toLocaleString()} (avg), ${results.peakEPS.toLocaleString()} (peak)\n- Daily Volume: ${results.dailyGB.toFixed(2)} GB\n- Storage Required: ${results.totalStorageTB.toFixed(2)} TB raw\n\n**Recommendations:**\n\n1. **SIEM Platform Selection:**\n   For your scale (${results.averageEPS} EPS), I recommend considering:\n   - Splunk Enterprise for comprehensive features and ecosystem\n   - Elastic Stack for cost-effectiveness and scalability\n   - IBM QRadar for compliance-heavy environments\n\n2. **Architecture Design:**\n   - Deploy ${results.infrastructure.indexers} indexer nodes for data ingestion\n   - Use ${results.infrastructure.searchHeads} search heads for query distribution\n   - Implement hot-warm-cold architecture for storage optimization\n\n3. **Storage Optimization:**\n   - Hot tier (${configuration.hotStorage} days): Use NVMe/SSD for fast access\n   - Cold tier (${configuration.retentionPeriod - configuration.hotStorage} days): Use object storage (S3/Azure Blob)\n   - Expected compression: ${configuration.compressionRatio}:1 ratio\n\n4. **Cost Considerations:**\n   - Compressed storage: ${results.compressedStorageTB.toFixed(2)} TB\n   - Plan for ${configuration.growthFactor}% annual growth\n   - Consider cloud vs on-prem based on data sovereignty requirements\n\n5. **Performance Tuning:**\n   - Ensure ${results.infrastructure.cpuCores} CPU cores distributed across cluster\n   - Allocate ${results.infrastructure.ramGB} GB RAM for optimal performance\n   - Plan for ${configuration.peakFactor}x peak capacity\n\nWould you like me to elaborate on any specific aspect?`;
      
      setResponse(mockResponse);
      setLoading(false);
      toast.success('AI response generated');
    }, 2000);
  };

  return (
    <Card className="glass-card p-6 shadow-elegant">
      <Accordion type="single" collapsible defaultValue="ai-assistant">
        <AccordionItem value="ai-assistant" className="border-none">
          <AccordionTrigger className="hover:no-underline pb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full" />
                <div className="relative p-2 rounded-lg bg-gradient-accent">
                  <Bot className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-heading font-bold text-foreground">AI Assistant</h2>
                <p className="text-xs text-muted-foreground">Get intelligent recommendations and insights</p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="space-y-6 pt-4">
            {/* AI Provider Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">AI Model Provider</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perplexity">Perplexity API</SelectItem>
                  <SelectItem value="openai">ChatGPT (OpenAI)</SelectItem>
                  <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                  <SelectItem value="google">Gemini (Google)</SelectItem>
                  <SelectItem value="custom">Custom Endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Key */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Key className="w-4 h-4 text-accent" />
                <span>API Key</span>
              </Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Query Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Your Query</Label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about SIEM sizing, vendor comparison, optimization strategies..."
                className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Example Prompts:</Label>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(prompt)}
                    className="text-xs border-border/50 hover:bg-secondary/50 hover:border-accent"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-accent hover:opacity-90 text-accent-foreground shadow-accent"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get AI Insights
                </>
              )}
            </Button>

            {/* Response Display */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-lg bg-gradient-card border border-border/50"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Bot className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">AI Response</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-xs text-foreground font-sans leading-relaxed">
                      {response}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default AIAssistant;