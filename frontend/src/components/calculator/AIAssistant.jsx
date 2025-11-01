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

  const generateSmartResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    const totalDevices = Object.values(devices).reduce((sum, d) => sum + d.quantity, 0);
    
    // Generate a unique conversation starter based on the query
    const conversationStarters = [
      "Let me analyze your infrastructure and provide some insights.",
      "Based on your current setup, here's what I think:",
      "Great question! Let me break this down for you.",
      "I've looked at your sizing requirements, and here's my take:",
      "Interesting question. Let me walk you through this."
    ];
    const starter = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
    
    // Analyze query to determine response type
    if (q.includes('splunk') && q.includes('elastic')) {
      const insights = [
        `At your scale of ${results.averageEPS.toLocaleString()} EPS, both platforms are viable but with different trade-offs.`,
        `For your volume (${results.dailyGB.toFixed(2)} GB/day), the cost difference is significant.`,
        `With ${totalDevices} devices, consider your team's expertise level.`
      ];
      const insight = insights[Math.floor(Math.random() * insights.length)];
      
      return `${starter}\n\n${insight}\n\n**Splunk Enterprise** is the industry leader. You're looking at roughly $${(results.dailyGB * 150).toFixed(0)} per day in licensing costs, which adds up to about $${(results.dailyGB * 150 * 365 / 1000).toFixed(0)}K annually. The advantage? Unmatched search performance, 1000+ ready-made apps, and enterprise-grade support. If you have compliance requirements (PCI-DSS, HIPAA), Splunk makes audits much easier.\n\n**Elastic Stack** is the cost-effective alternative. Open-source at its core, you could run this for a fraction of the cost - maybe $${(results.dailyGB * 40 * 365 / 1000).toFixed(0)}K per year with managed services. The catch? You'll need skilled engineers who know ELK inside-out. Setup and tuning take time, but once it's running, it scales beautifully.\n\nMy recommendation? ${results.averageEPS > 10000 ? "At your EPS level, if budget allows and you want enterprise support, go Splunk. If you have a strong DevOps team and want flexibility, Elastic is solid." : "For your volume, I'd lean toward Elastic unless you need specific Splunk apps or have compliance requirements that make vendor support mandatory."}\n\nWant me to dive deeper into any specific aspect?`;
    }
    
    if (q.includes('cost') || q.includes('budget') || q.includes('price') || q.includes('reduce')) {
      const storageMonthly = (results.hotStorageTB * 1000 * 0.10) + (results.coldStorageTB * 1000 * 0.02);
      const computeMonthly = (results.infrastructure.indexers * 800) + (results.infrastructure.searchHeads * 400);
      
      return `${starter}\n\nLooking at your infrastructure, let's talk money. Your storage footprint is ${results.totalStorageTB.toFixed(2)} TB raw (${results.compressedStorageTB.toFixed(2)} TB compressed). That's going to cost you roughly $${storageMonthly.toFixed(0)} per month just for storage if you're in the cloud.\n\nAdd in compute - you need ${results.infrastructure.indexers} indexer nodes and ${results.infrastructure.searchHeads} search heads. Cloud estimate: around $${computeMonthly.toFixed(0)}/month. So we're looking at about $${(storageMonthly + computeMonthly).toFixed(0)}/month baseline, or roughly $${((storageMonthly + computeMonthly) * 12 / 1000).toFixed(1)}K per year.\n\n**Quick wins to cut costs:**\n\n1. **Bump up compression** - You're at ${configuration.compressionRatio}:1 now. If you can push that to 5:1 or 6:1, you'll save $${((results.totalStorageTB - results.totalStorageTB/5) * 1000 * 0.05).toFixed(0)}/month.\n\n2. **Reduce hot storage** - Do you really need ${configuration.hotStorage} days hot? Most teams only search the last 7-14 days regularly. Moving to 14 days hot could save you 30-40%.\n\n3. **Smart sampling** - Not all logs are equal. Sample your endpoint logs at 50% and you'll cut your volume significantly without losing visibility.\n\n4. **On-prem vs Cloud** - ${results.dailyGB > 100 ? "At your volume, on-prem might actually be cheaper after 2-3 years. Consider a hybrid approach." : "For your size, staying in the cloud makes sense unless you have security requirements."}\n\nThe big question: are you planning for ${configuration.growthFactor}% annual growth? If so, budget for ${(results.dailyGB * (1 + configuration.growthFactor/100)).toFixed(0)} GB/day next year.`;
    }
    
    if (q.includes('hardware') || q.includes('specification') || q.includes('server') || q.includes('spec')) {
      return `${starter}\n\nFor ${results.averageEPS.toLocaleString()} EPS (peaking at ${results.peakEPS.toLocaleString()}), here's what you'll need:\n\n**Indexer Nodes (${results.infrastructure.indexers} total):**\nThese are your workhorses. Go with 16-core CPUs (Intel Xeon Gold or AMD EPYC), 64GB RAM minimum but I'd recommend 128GB for headroom. Storage-wise, you're looking at NVMe SSDs - maybe 8x 2TB drives in RAID 10 per node. That gives you ${(results.hotStorageTB / results.infrastructure.indexers).toFixed(2)} TB per indexer, which should handle your hot data.\n\nDon't cheap out on network - dual 10GbE NICs, bonded. You're pushing ${results.dailyGB.toFixed(0)} GB per day, which is ${(results.dailyGB / 24 / 3600 * 1000).toFixed(2)} MB/s sustained. Factor in replication and you need the bandwidth.\n\n**Search Heads (${results.infrastructure.searchHeads} nodes):**\nThese are lighter - 8 cores, 32GB RAM is fine. Focus on CPU clock speed over core count. Users hate slow searches, so SSD boot drives and fast interconnects matter here.\n\n**Storage Cluster for Cold Tier:**\nYou've got ${results.coldStorageTB.toFixed(2)} TB of cold data. Build this with cost-effective SATA drives - 12x 8TB drives in RAID 6 gives you 80TB usable per node. Plan for ${Math.ceil(results.coldStorageTB / 80)} nodes.\n\n${results.averageEPS > 50000 ? "At your scale, I'd go bare metal for indexers. Virtualization overhead hurts when you're pushing this many events. Search heads can be VMs though." : "You can virtualize everything at your scale. Just make sure you're using dedicated resource pools and anti-affinity rules."}\n\n**Cloud equivalent?** AWS r6i.4xlarge for indexers, r6i.2xlarge for search heads. Azure E16s v5 / E8s v5 if you're in that ecosystem.`;
    }
    
    if (q.includes('scaling') || q.includes('growth') || q.includes('future') || q.includes('grow')) {
      const year1EPS = results.averageEPS * (1 + configuration.growthFactor/100);
      const year2EPS = results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 2);
      const year3EPS = results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 3);
      
      return `${starter}\n\nYou're planning for ${configuration.growthFactor}% annual growth, which is smart planning. Let me map out what that looks like:\n\n**Right now:** ${results.averageEPS.toLocaleString()} EPS, ${results.dailyGB.toFixed(2)} GB/day\n**Year 1:** ${year1EPS.toLocaleString()} EPS, ${(results.dailyGB * (1 + configuration.growthFactor/100)).toFixed(2)} GB/day\n**Year 2:** ${year2EPS.toLocaleString()} EPS, ${(results.dailyGB * Math.pow(1 + configuration.growthFactor/100, 2)).toFixed(2)} GB/day\n**Year 3:** ${year3EPS.toLocaleString()} EPS\n\nHere's the thing - don't wait until you're at capacity to scale. I follow the 75% rule: when any resource hits 75% sustained, it's time to expand.\n\n**Scaling triggers to watch:**\n- CPU usage staying above 75% for more than an hour\n- Index queue backing up past 500 events\n- Search latency doubling from baseline\n- Storage approaching 80% capacity\n\nAt your current ${results.infrastructure.indexers} indexers, each one handles about ${(results.averageEPS / results.infrastructure.indexers).toLocaleString()} EPS. Rule of thumb: one indexer per 50k EPS. ${year2EPS > 50000 * (results.infrastructure.indexers + 1) ? `By year 2, you'll need to add another indexer.` : `You've got runway for a couple years.`}\n\n${results.infrastructure.indexers <= 3 ? "You're small enough that vertical scaling (beefier servers) still makes sense. Upgrading RAM is usually your best bang for buck." : "You're past the point where vertical scaling helps. Focus on horizontal scaling - add more nodes rather than bigger nodes."}\n\nOne more thing: ${configuration.hotStorage} days of hot storage is ${configuration.hotStorage > 30 ? 'generous' : 'tight'}. As you grow, consider tiering your data more aggressively. Move stuff to warm/cold faster.`;
    }
    
    if (q.includes('optimize') || q.includes('improve') || q.includes('performance') || q.includes('faster') || q.includes('slow')) {
      return `${starter}\n\nPerformance optimization is where you separate the pros from the amateurs. Let me share what actually moves the needle:\n\n**Indexing Performance (Priority #1)**\nYou're ingesting ${results.dailyGB.toFixed(2)} GB/day. That's about ${(results.dailyGB / 24).toFixed(2)} GB/hour sustained. First thing: make sure you're parsing at ingest, not at search time. Every field extraction you do during search is wasted CPU cycles.\n\nSet up parallel ingestion pipelines. Route heavy sources (like your firewalls) to dedicated indexers if possible. You'll see 20-30% throughput improvement just from intelligent routing.\n\n**Storage is Your Bottleneck**\nWith ${results.totalStorageTB.toFixed(2)} TB total, you're probably seeing I/O contention. Here's the fix: implement proper tiering. Hot data (0-${configuration.hotStorage} days) on NVMe, warm (${configuration.hotStorage}-60 days) on SATA SSD, cold (60+) on object storage.\n\nYour compression is at ${configuration.compressionRatio}:1. That's okay, but you can do better. Enable columnar compression and you'll hit 4:1 or 5:1 easily. That's ${(results.totalStorageTB - results.totalStorageTB/4.5).toFixed(2)} TB you don't have to store.\n\n**Search Performance**\nCreate summary indexes for your dashboards. Nobody wants to wait 30 seconds for a dashboard to load. Pre-compute the heavy stuff and your users will love you.\n\nUse data models for common queries. Think of them as indexed views - they make repeated searches exponentially faster.\n\n**Peak Load Handling**\nYou're planning for ${configuration.peakFactor}x peaks (${results.peakEPS.toLocaleString()} EPS). ${results.peakEPS > 100000 ? "That's aggressive - consider adding buffer capacity. Better to have it and not need it." : "That should be manageable with proper queue sizing."}\n\nKey metrics to watch:\n- Index lag < 60 seconds\n- Search response < 5 seconds for 24h queries\n- CPU at 65-75% sustained (not spiking to 95%)\n\nWant me to dig deeper into any of these?`;
    }
    
    // Default comprehensive response with variation
    const greetings = [
      "Looking at your setup, here's what stands out:",
      "Let me give you the rundown on your infrastructure:",
      "I've analyzed your configuration - here's what you need to know:",
      "Based on your inputs, here are my thoughts:"
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const platformRec = results.averageEPS > 50000 
      ? "At your scale (${results.averageEPS.toLocaleString()} EPS), you're in enterprise territory. Splunk or IBM QRadar make sense if you have the budget. Both handle this volume easily and give you advanced correlation. Elastic Security is the cost-conscious choice - you'll need skilled engineers, but it scales beautifully."
      : results.averageEPS > 10000
      ? "You're in the mid-market sweet spot. Elastic Security or Splunk Cloud would work well. Elastic if you want flexibility and have good engineers, Splunk if you want a more turnkey experience."
      : "For your volume, I'd lean toward Elastic Stack or Wazuh. Both are cost-effective and will handle your needs without breaking the bank. Splunk works too if you prefer vendor support.";
    
    return `${greeting}\n\nYou're monitoring ${totalDevices.toLocaleString()} devices generating ${results.averageEPS.toLocaleString()} EPS (${results.peakEPS.toLocaleString()} at peak). That's ${results.dailyGB.toFixed(2)} GB per day, or about ${results.monthlyTB.toFixed(2)} TB monthly.\n\n**Storage situation:**\nYou need ${results.totalStorageTB.toFixed(2)} TB raw, which compresses down to ${results.compressedStorageTB.toFixed(2)} TB with your ${configuration.compressionRatio}:1 ratio. Split that between ${results.hotStorageTB.toFixed(2)} TB hot storage (fast SSDs) for your ${configuration.hotStorage}-day window, and ${results.coldStorageTB.toFixed(2)} TB cold storage for the rest of your ${configuration.retentionPeriod}-day retention.\n\n**Infrastructure you'll need:**\n${results.infrastructure.indexers} indexer nodes to handle ingestion (16 cores, 64GB RAM each), ${results.infrastructure.searchHeads} search heads for queries (8 cores, 32GB RAM), and ${results.infrastructure.forwarders} lightweight forwarders on your endpoints. Total compute: ${results.infrastructure.cpuCores} cores and ${results.infrastructure.ramGB} GB RAM. Make sure you've got ${results.infrastructure.networkGbps} Gbps network bandwidth.\n\n**Platform recommendation:**\n${platformRec}\n\n**Deployment approach:**\nStart with ${Math.ceil(results.infrastructure.indexers/2)} indexers and scale horizontally as you onboard log sources. Use a hot-warm-cold architecture from day one - you'll thank yourself later. Set replication factor to 2 for high availability.\n\n${configuration.growthFactor > 0 ? `Don't forget - you're planning ${configuration.growthFactor}% growth. That means ${(results.averageEPS * (1 + configuration.growthFactor/100)).toLocaleString()} EPS next year. Build for that, not today's numbers.` : ''}\n\nWhat specific aspect would you like me to dive deeper into?`;
  };

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
    
    // Simulate AI response with smart context-aware answers
    setTimeout(() => {
      const mockResponse = generateSmartResponse(query);
      setResponse(mockResponse);
      setLoading(false);
      toast.success('AI response generated');
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s for realism
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