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
    const totalDevices = results.totalDevices || Object.values(devices).reduce((sum, d) => sum + d.quantity, 0);
    
    // Safety check - if no results, return early message
    if (!results || !results.totalEPS || results.totalEPS === 0) {
      return "Please add some devices to your inventory first, and I'll be able to provide detailed recommendations based on your specific infrastructure sizing.";
    }
    
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
        `At your scale of ${results.totalEPS.toLocaleString()} EPS, both platforms are viable but with different trade-offs.`,
        `For your volume (${results.dailyGB.toFixed(2)} GB/day), the cost difference is significant.`,
        `With ${totalDevices} devices, consider your team's expertise level.`
      ];
      const insight = insights[Math.floor(Math.random() * insights.length)];
      
      return `${starter}\n\n${insight}\n\n**Splunk Enterprise** is the industry leader. You're looking at roughly $${(results.dailyGB * 150).toFixed(0)} per day in licensing costs, which adds up to about $${(results.dailyGB * 150 * 365 / 1000).toFixed(0)}K annually. The advantage? Unmatched search performance, 1000+ ready-made apps, and enterprise-grade support. If you have compliance requirements (PCI-DSS, HIPAA), Splunk makes audits much easier.\n\n**Elastic Stack** is the cost-effective alternative. Open-source at its core, you could run this for a fraction of the cost - maybe $${(results.dailyGB * 40 * 365 / 1000).toFixed(0)}K per year with managed services. The catch? You'll need skilled engineers who know ELK inside-out. Setup and tuning take time, but once it's running, it scales beautifully.\n\nMy recommendation? ${results.totalEPS > 10000 ? "At your EPS level, if budget allows and you want enterprise support, go Splunk. If you have a strong DevOps team and want flexibility, Elastic is solid." : "For your volume, I'd lean toward Elastic unless you need specific Splunk apps or have compliance requirements that make vendor support mandatory."}\n\nWant me to dive deeper into any specific aspect?`;
    }
    
    if (q.includes('cost') || q.includes('budget') || q.includes('price') || q.includes('reduce')) {
      const storageMonthly = (results.hotStorageGB * 1000 * 0.10) + (results.coldStorageGB * 1000 * 0.02) || (results.totalStorageGB * 0.10);
      const computeMonthly = (results.infrastructure.totalCPU * 0.05 * 730) || 0;
      
      return `${starter}\n\nLooking at your infrastructure, let's talk money. Your storage footprint is ${results.totalStorageTB.toFixed(2)} TB. That's going to cost you roughly $${storageMonthly.toFixed(0)} per month just for storage if you're in the cloud.\n\nAdd in compute - you need ${results.infrastructure.managementServer.instances}x management servers, ${results.infrastructure.dataIndexer.instances}x indexers, and ${results.infrastructure.webConsole.instances}x consoles. Cloud estimate: around $${computeMonthly.toFixed(0)}/month. So we're looking at about $${(storageMonthly + computeMonthly).toFixed(0)}/month baseline, or roughly $${((storageMonthly + computeMonthly) * 12 / 1000).toFixed(1)}K per year.\n\n**Quick wins to cut costs:**\n\n1. **Bump up compression** - You're at ${configuration.compressionLevel} now. If you can push that to high (60%), you'll save significantly.\n\n2. **Reduce hot storage** - ${configuration.hotColdSplit ? `You have ${configuration.hotStorageDays} days hot.` : 'Enable hot/cold split.'} Most teams only search the last 7-14 days regularly. Moving to 14 days hot could save you 30-40%.\n\n3. **Smart sampling** - Not all logs are equal. Sample your endpoint logs at 50% and you'll cut your volume significantly without losing visibility.\n\n4. **On-prem vs Cloud** - ${results.dailyGB > 100 ? "At your volume, on-prem might actually be cheaper after 2-3 years. Consider a hybrid approach." : "For your size, staying in the cloud makes sense unless you have security requirements."}\n\n${configuration.includeGrowth ? `The big question: you're planning for ${configuration.annualGrowth}% annual growth. Budget for ${(results.dailyGB * (1 + configuration.annualGrowth/100)).toFixed(0)} GB/day next year.` : ''}`;
    }
    
    if (q.includes('hardware') || q.includes('specification') || q.includes('server') || q.includes('spec')) {
      return `${starter}\n\nFor ${results.totalEPS.toLocaleString()} EPS (peaking at ${Math.round(results.peakEPS).toLocaleString()}), here's what you'll need:\n\n**Management Servers (${results.infrastructure.managementServer.instances}x):**\nCPU: ${results.infrastructure.managementServer.cpu} vCPUs\nRAM: ${results.infrastructure.managementServer.ram} GB\nStorage: ${results.infrastructure.managementServer.storage} GB\n${results.infrastructure.managementServer.notes}\n\n**Data Indexers (${results.infrastructure.dataIndexer.instances}x):**\nThese are your workhorses. ${results.infrastructure.dataIndexer.cpu} vCPUs, ${results.infrastructure.dataIndexer.ram}GB RAM each. For storage, you're looking at ${results.infrastructure.dataIndexer.storage}GB per indexer for system and cache.\n\nFor actual log storage, you need ${results.totalStorageTB.toFixed(2)} TB total. ${configuration.hotColdSplit ? `Split that: ${results.hotStorageGB.toFixed(2)} TB hot on NVMe/SSD, ${results.coldStorageGB.toFixed(2)} TB cold on cheaper storage.` : 'Use NVMe SSDs for best performance.'}\n\n**Web Consoles (${results.infrastructure.webConsole.instances}x):**\nThese are lighter - ${results.infrastructure.webConsole.cpu} vCPUs, ${results.infrastructure.webConsole.ram}GB RAM. Focus on network bandwidth and responsiveness.\n\n**Total Resources:**\n- ${results.infrastructure.totalCPU} vCPUs\n- ${results.infrastructure.totalRAM} GB RAM\n- ${results.infrastructure.totalStorage} GB system storage\n- ${results.totalStorageTB.toFixed(2)} TB log storage\n\n${totalDevices > 5000 ? "At your scale, I'd recommend dedicated hardware or reserved cloud instances. Virtualization overhead hurts when you're pushing this many events." : "You can virtualize everything at your scale. Just ensure proper resource allocation."}\n\n**Cloud equivalent?** AWS: t3/m6i series for management, r6i series for indexers. Azure: D/E series. GCP: n2 or c2 series.`;
    }
    
    if (q.includes('scaling') || q.includes('growth') || q.includes('future') || q.includes('grow')) {
      const year1EPS = results.totalEPS * (1 + (configuration.annualGrowth || 20)/100);
      const year2EPS = results.totalEPS * Math.pow(1 + (configuration.annualGrowth || 20)/100, 2);
      const year3EPS = results.totalEPS * Math.pow(1 + (configuration.annualGrowth || 20)/100, 3);
      
      return `${starter}\n\n${configuration.includeGrowth ? `You're planning for ${configuration.annualGrowth}% annual growth, which is smart planning.` : 'Planning for growth is crucial.'} Let me map out what that looks like:\n\n**Right now:** ${results.totalEPS.toLocaleString()} EPS, ${results.dailyGB.toFixed(2)} GB/day\n**Year 1:** ${Math.round(year1EPS).toLocaleString()} EPS, ${(results.dailyGB * (1 + (configuration.annualGrowth || 20)/100)).toFixed(2)} GB/day\n**Year 2:** ${Math.round(year2EPS).toLocaleString()} EPS, ${(results.dailyGB * Math.pow(1 + (configuration.annualGrowth || 20)/100, 2)).toFixed(2)} GB/day\n**Year 3:** ${Math.round(year3EPS).toLocaleString()} EPS\n\nHere's the thing - don't wait until you're at capacity to scale. I follow the 75% rule: when any resource hits 75% sustained, it's time to expand.\n\n**Scaling triggers to watch:**\n- CPU usage staying above 75% for more than an hour\n- Storage approaching 80% capacity\n- Search latency doubling from baseline\n\nAt your current ${results.infrastructure.dataIndexer.instances} indexer${results.infrastructure.dataIndexer.instances > 1 ? 's' : ''}, each one handles about ${Math.round(results.totalEPS / results.infrastructure.dataIndexer.instances).toLocaleString()} EPS. Rule of thumb: one indexer per 50k EPS. ${year2EPS > 50000 * (results.infrastructure.dataIndexer.instances + 1) ? `By year 2, you'll need to add another indexer.` : `You've got runway for a couple years.`}\n\n${totalDevices <= 1000 ? "You're small enough that vertical scaling (beefier servers) still makes sense. Upgrading RAM is usually your best bang for buck." : "You're past the point where vertical scaling helps. Focus on horizontal scaling - add more nodes rather than bigger nodes."}\n\nOne more thing: ${configuration.retentionPeriod} days retention is ${configuration.retentionPeriod > 180 ? 'generous' : 'tight'}. As you grow, consider tiering your data more aggressively.`;
    }
    
    if (q.includes('optimize') || q.includes('improve') || q.includes('performance') || q.includes('faster') || q.includes('slow')) {
      return `${starter}\n\nPerformance optimization is where you separate the pros from the amateurs. Let me share what actually moves the needle:\n\n**Indexing Performance (Priority #1)**\nYou're ingesting ${results.dailyGB.toFixed(2)} GB/day. That's about ${(results.dailyGB / 24).toFixed(2)} GB/hour sustained. First thing: make sure you're parsing at ingest, not at search time. Every field extraction you do during search is wasted CPU cycles.\n\nSet up parallel ingestion pipelines. Route heavy sources to dedicated indexers if possible. You'll see 20-30% throughput improvement just from intelligent routing.\n\n**Storage is Your Bottleneck**\nWith ${results.totalStorageTB.toFixed(2)} TB total, you're probably seeing I/O contention. ${configuration.hotColdSplit ? `Good news - you've got hot/cold split enabled. ${results.hotStorageGB.toFixed(2)} TB hot on fast storage, ${results.coldStorageGB.toFixed(2)} TB cold archived.` : 'Enable hot/cold tiering: 0-30 days on NVMe, 30+ days on object storage.'}\n\nYour compression is at ${configuration.compressionLevel}. ${configuration.compressionLevel === 'none' ? 'Turn that on! You could save 40-60% storage.' : configuration.compressionLevel === 'standard' ? 'You can go higher - 60% compression (high) is achievable.' : 'That\\'s excellent compression.'}\n\n**Search Performance**\nCreate summary indexes for your dashboards. Nobody wants to wait 30 seconds for a dashboard to load. Pre-compute the heavy stuff and your users will love you.\n\nUse data models for common queries. Think of them as indexed views - they make repeated searches exponentially faster.\n\n**Peak Load Handling**\nYou're planning for ${Math.round(results.peakEPS).toLocaleString()} EPS peaks. ${results.peakEPS > 100000 ? "That's aggressive - consider adding buffer capacity. Better to have it and not need it." : "That should be manageable with proper queue sizing."}\n\nKey metrics to watch:\n- Index lag < 60 seconds\n- Search response < 5 seconds for 24h queries\n- CPU at 65-75% sustained (not spiking to 95%)\n\nWant me to dig deeper into any of these?`;
    }
    
    // Default comprehensive response with variation
    const greetings = [
      "Looking at your setup, here's what stands out:",
      "Let me give you the rundown on your infrastructure:",
      "I've analyzed your configuration - here's what you need to know:",
      "Based on your inputs, here are my thoughts:"
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const platformRec = results.totalEPS > 50000 
      ? `At your scale (${results.totalEPS.toLocaleString()} EPS), you're in enterprise territory. Splunk or IBM QRadar make sense if you have the budget. Both handle this volume easily and give you advanced correlation. Elastic Security is the cost-conscious choice - you'll need skilled engineers, but it scales beautifully.`
      : results.totalEPS > 10000
      ? "You're in the mid-market sweet spot. Elastic Security or Splunk Cloud would work well. Elastic if you want flexibility and have good engineers, Splunk if you want a more turnkey experience."
      : "For your volume, I'd lean toward Elastic Stack or Wazuh. Both are cost-effective and will handle your needs without breaking the bank. Splunk works too if you prefer vendor support.";
    
    return `${greeting}\n\nYou're monitoring ${totalDevices.toLocaleString()} devices generating ${results.totalEPS.toLocaleString()} EPS (${Math.round(results.peakEPS).toLocaleString()} at peak). That's ${results.dailyGB.toFixed(2)} GB per day, or about ${results.monthlyTB.toFixed(2)} TB monthly.\n\n**Storage situation:**\nYou need ${results.totalStorageTB.toFixed(2)} TB total storage. ${configuration.hotColdSplit ? `Split between ${results.hotStorageGB.toFixed(2)} TB hot storage (fast SSDs) for your ${configuration.hotStorageDays}-day window, and ${results.coldStorageGB.toFixed(2)} TB cold storage for archive.` : `With ${configuration.compressionLevel} compression and ${configuration.replicationFactor}x replication.`}\n\n**Infrastructure you'll need:**\n${results.infrastructure.managementServer.instances}x management server${results.infrastructure.managementServer.instances > 1 ? 's' : ''} (${results.infrastructure.managementServer.cpu}vCPU, ${results.infrastructure.managementServer.ram}GB RAM), ${results.infrastructure.dataIndexer.instances}x indexer${results.infrastructure.dataIndexer.instances > 1 ? 's' : ''} (${results.infrastructure.dataIndexer.cpu}vCPU, ${results.infrastructure.dataIndexer.ram}GB RAM), and ${results.infrastructure.webConsole.instances}x console${results.infrastructure.webConsole.instances > 1 ? 's' : ''} (${results.infrastructure.webConsole.cpu}vCPU, ${results.infrastructure.webConsole.ram}GB RAM). Total compute: ${results.infrastructure.totalCPU} vCPUs and ${results.infrastructure.totalRAM} GB RAM.\n\n**Architecture: ${results.architecture.type}**\n${results.architecture.description}\n\n**Platform recommendation:**\n${platformRec}\n\n**Deployment approach:**\n${results.infrastructure.dataIndexer.instances === 1 ? 'Start with your single indexer and scale horizontally as you onboard log sources.' : `Start with ${Math.ceil(results.infrastructure.dataIndexer.instances/2)} indexers and scale as needed.`} ${configuration.hotColdSplit ? 'Your hot/cold architecture is already configured - good choice.' : 'Consider enabling hot/cold tiering for cost optimization.'} ${configuration.replicationFactor > 1 ? `You've got ${configuration.replicationFactor}x replication for HA - excellent.` : 'Add replication for high availability.'}\n\n${configuration.includeGrowth ? `Don't forget - you're planning ${configuration.annualGrowth}% growth. That means ${Math.round(results.totalEPS * (1 + configuration.annualGrowth/100)).toLocaleString()} EPS next year. Build for that, not today's numbers.` : 'Consider enabling growth projections for better capacity planning.'}\n\nWhat specific aspect would you like me to dive deeper into?`;
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