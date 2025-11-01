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
    
    if (q.includes('hardware') || q.includes('specification') || q.includes('server')) {
      return `# Hardware Specifications & Recommendations\n\n**Based on ${results.averageEPS.toLocaleString()} EPS (${results.peakEPS.toLocaleString()} peak):**\n\n**Indexer/Data Nodes (${results.infrastructure.indexers} nodes):**\n- CPU: 16 cores @ 2.5GHz+ (Intel Xeon or AMD EPYC)\n- RAM: 64GB DDR4 ECC minimum, 128GB recommended\n- Storage: \n  * OS: 2x 500GB SSD (RAID 1)\n  * Hot Data: 8x 2TB NVMe SSD (RAID 10) = 8TB usable\n  * Expected capacity per node: ${(results.hotStorageTB / results.infrastructure.indexers).toFixed(2)} TB\n- Network: Dual 10GbE NICs (bonded)\n- RAID Controller: Hardware RAID with battery backup\n\n**Search Head Nodes (${results.infrastructure.searchHeads} nodes):**\n- CPU: 8 cores @ 2.8GHz+\n- RAM: 32GB DDR4 ECC minimum, 64GB recommended\n- Storage: 2x 500GB SSD (RAID 1)\n- Network: Dual 10GbE NICs\n\n**Storage Servers (for Cold Tier):**\n- CPU: 8 cores (storage I/O focused)\n- RAM: 32GB\n- Storage: ${Math.ceil(results.coldStorageTB / 10)} nodes with:\n  * 12x 8TB SATA drives (RAID 6) = 80TB usable per node\n  * Total: ${results.coldStorageTB.toFixed(2)} TB across cluster\n- Network: Dual 10GbE NICs\n\n**Network Infrastructure:**\n- Core Switches: ${Math.ceil(results.infrastructure.networkGbps / 10)} × 10/25/40GbE switches\n- Minimum bandwidth: ${results.infrastructure.networkGbps} Gbps aggregate\n- Recommended: ${Math.ceil(results.infrastructure.networkGbps * 1.5)} Gbps for overhead\n\n**Forwarders (${results.infrastructure.forwarders} lightweight agents):**\n- Minimal footprint: 1 CPU core, 512MB RAM per device\n- Automatically deployed across ${totalDevices} endpoints\n\n**Virtualization Considerations:**\n${results.averageEPS > 50000 ? '- At your scale, bare metal recommended for indexers\n- Search heads can be virtualized\n- Ensure dedicated physical network for data plane' : '- Full virtualization acceptable\n- Use anti-affinity rules for HA\n- Dedicated resource pools recommended'}\n\n**Cloud Instance Mapping:**\n- AWS: r6i.4xlarge for indexers, r6i.2xlarge for search heads\n- Azure: E16s v5 for indexers, E8s v5 for search heads\n- GCP: n2-highmem-16 for indexers, n2-highmem-8 for search heads`;
    }
    
    if (q.includes('scaling') || q.includes('growth') || q.includes('future')) {
      return `# Scaling Strategy & Future Growth Planning\n\n**Current Capacity:**\n- ${results.averageEPS.toLocaleString()} EPS average\n- ${results.dailyGB.toFixed(2)} GB/day\n- ${results.infrastructure.indexers} indexer nodes\n\n**Projected Growth (${configuration.growthFactor}% annually):**\n\n**Year 1:**\n- EPS: ${(results.averageEPS * (1 + configuration.growthFactor/100)).toLocaleString()}\n- Daily GB: ${(results.dailyGB * (1 + configuration.growthFactor/100)).toFixed(2)} GB\n- Storage: ${results.future.totalStorageTB.toFixed(2)} TB\n- Action: Monitor current capacity\n\n**Year 2:**\n- EPS: ${(results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 2)).toLocaleString()}\n- Daily GB: ${(results.dailyGB * Math.pow(1 + configuration.growthFactor/100, 2)).toFixed(2)} GB\n- Storage: ${(results.totalStorageTB * Math.pow(1 + configuration.growthFactor/100, 2)).toFixed(2)} TB\n- Action: ${results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 2) > 50000 ? 'Add 1-2 indexer nodes' : 'Current capacity sufficient'}\n\n**Year 3:**\n- EPS: ${(results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 3)).toLocaleString()}\n- Daily GB: ${(results.dailyGB * Math.pow(1 + configuration.growthFactor/100, 3)).toFixed(2)} GB\n- Storage: ${(results.totalStorageTB * Math.pow(1 + configuration.growthFactor/100, 3)).toFixed(2)} TB\n- Action: Plan for ${Math.ceil((results.averageEPS * Math.pow(1 + configuration.growthFactor/100, 3)) / 50000)} indexer nodes\n\n**Scaling Triggers:**\n\n📈 **Add Indexer Node When:**\n- CPU utilization > 75% sustained\n- Index queue > 500 consistently\n- Search latency increases > 2x baseline\n- Approaching 50k EPS per indexer\n\n📈 **Add Search Head When:**\n- User count > 50 concurrent\n- Search response time > 10s average\n- CPU > 80% on search heads\n\n📈 **Expand Storage When:**\n- Hot tier > 80% capacity\n- Cold tier > 85% capacity\n- 90 days before projected full\n\n**Horizontal vs Vertical Scaling:**\n\n${results.infrastructure.indexers <= 3 ? '**Current Phase: Vertical Scaling OK**\n- Can increase RAM/CPU on existing nodes\n- More cost-effective at small scale\n- Simpler management' : '**Current Phase: Horizontal Scaling Recommended**\n- Add more nodes rather than upgrade\n- Better fault tolerance\n- Linear performance gains'}\n\n**Cloud Auto-Scaling Strategy:**\n1. Baseline: ${results.infrastructure.indexers} nodes\n2. Scale up: Add 1 node per 5k EPS increase\n3. Scale down: Remove nodes during off-hours (if supported)\n4. Use spot/preemptible instances for 30% cost savings\n\n**Data Retention Scaling:**\n- Hot tier stays constant (${configuration.hotStorage} days)\n- Migrate warm data to cheaper tiers\n- Archive cold data to S3 Glacier/Azure Archive\n- Delete or compress data > ${configuration.retentionPeriod} days`;
    }
    
    if (q.includes('optimize') || q.includes('improve') || q.includes('performance')) {
      return `# Performance Optimization Recommendations\n\n**Current Configuration Analysis:**\n- ${results.averageEPS.toLocaleString()} EPS average load\n- Peak factor: ${configuration.peakFactor}x (${results.peakEPS.toLocaleString()} EPS)\n- Compression: ${configuration.compressionRatio}:1\n\n**Immediate Optimizations:**\n\n**1. Indexing Performance**\n- ✓ Use parallel ingestion pipelines\n- ✓ Implement data routing to specific indexers\n- ✓ Optimize parsing at ingest time\n- Expected gain: 20-30% throughput improvement\n\n**2. Storage Optimization**\n- Current: ${results.totalStorageTB.toFixed(2)} TB raw storage\n- With better compression: ${(results.totalStorageTB / 4).toFixed(2)} TB (4:1 ratio)\n- Savings: ${(results.totalStorageTB - results.totalStorageTB/4).toFixed(2)} TB\n- Action: Enable columnar compression, deduplicate similar events\n\n**3. Search Performance**\n- Implement acceleration for common searches\n- Use summary indexing for dashboards\n- Create data models for frequently accessed data\n- Expected improvement: 5-10x faster dashboard loads\n\n**4. Data Tiering Strategy**\n- Hot (0-${configuration.hotStorage} days): NVMe SSD - instant search\n- Warm (${configuration.hotStorage}-60 days): SATA SSD - fast search\n- Cold (60-${configuration.retentionPeriod} days): HDD/Object - archive search\n- Frozen (${configuration.retentionPeriod}+ days): S3 Glacier - compliance only\n\n**5. Resource Allocation**\n- CPU: Pin processes to specific cores\n- RAM: Allocate ${Math.ceil(results.infrastructure.ramGB * 0.7)} GB to index caches\n- Network: Enable jumbo frames (9000 MTU)\n- Disk: Use separate volumes for OS, index, and search\n\n**6. Ingestion Optimization**\n${totalDevices > 500 ? '- Deploy intermediate forwarders (1 per 100 devices)\n- Implement load balancing across indexers\n- Use automatic load balancing groups' : '- Universal forwarders directly to indexers OK\n- Consider intermediate layer for future growth'}\n\n**7. Query Optimization**\n- Use indexed fields instead of regex\n- Limit time ranges to necessary windows\n- Pre-filter data before complex operations\n- Create report acceleration for scheduled searches\n\n**Peak Load Handling (${configuration.peakFactor}x normal):**\n- Current capacity: ${results.peakEPS.toLocaleString()} EPS\n- Buffer capacity: ${((results.peakEPS * 1.2) - results.peakEPS).toLocaleString()} EPS (20% headroom)\n- Recommendation: ${results.peakEPS > 100000 ? 'Add 1-2 nodes for peak buffer' : 'Current capacity adequate with monitoring'}\n\n**Monitoring KPIs:**\n- Index time lag: < 60 seconds target\n- Search response: < 5 seconds for 1-day queries\n- CPU utilization: 60-75% sustained (not > 85%)\n- Disk I/O: < 80% capacity\n- Network throughput: < 70% bandwidth`;
    }
    
    // Default comprehensive response
    return `# SIEM Infrastructure Analysis & Recommendations\n\n**Your Infrastructure Summary:**\n- Total Devices: ${totalDevices.toLocaleString()}\n- Average EPS: ${results.averageEPS.toLocaleString()}\n- Peak EPS: ${results.peakEPS.toLocaleString()}\n- Daily Volume: ${results.dailyGB.toFixed(2)} GB\n- Monthly Volume: ${results.monthlyTB.toFixed(2)} TB\n- Annual Volume: ${results.yearlyTB.toFixed(2)} TB\n\n**Storage Architecture:**\n- Hot Storage (${configuration.hotStorage} days): ${results.hotStorageTB.toFixed(2)} TB on NVMe/SSD\n- Cold Storage (${configuration.retentionPeriod - configuration.hotStorage} days): ${results.coldStorageTB.toFixed(2)} TB on archive\n- Total Raw: ${results.totalStorageTB.toFixed(2)} TB\n- After ${configuration.compressionRatio}:1 compression: ${results.compressedStorageTB.toFixed(2)} TB\n\n**Recommended Platform:**\n${results.averageEPS > 50000 ? '**Enterprise Tier** - Consider Splunk Enterprise or IBM QRadar\n- Your volume justifies enterprise features\n- Advanced correlation and threat detection\n- Comprehensive vendor support' : results.averageEPS > 10000 ? '**Mid-Market** - Elastic Security or Splunk Cloud recommended\n- Good balance of features and cost\n- Scalable architecture\n- Strong community support' : '**SMB/Starter** - Elastic Stack or Wazuh recommended\n- Cost-effective for your volume\n- Open source options available\n- Community-driven support'}\n\n**Infrastructure Requirements:**\n- ${results.infrastructure.indexers} indexer/data nodes (16 cores, 64GB RAM each)\n- ${results.infrastructure.searchHeads} search heads (8 cores, 32GB RAM each)\n- ${results.infrastructure.forwarders} forwarders across devices\n- ${results.infrastructure.cpuCores} total CPU cores\n- ${results.infrastructure.ramGB} GB total RAM\n- ${results.infrastructure.networkGbps} Gbps network bandwidth\n\n**Deployment Strategy:**\n1. Start with ${Math.ceil(results.infrastructure.indexers/2)} indexers, scale horizontally\n2. Use hot-warm-cold architecture from day 1\n3. Implement replication factor 2 for HA\n4. Deploy forwarders in phases (critical systems first)\n\n**Key Considerations:**\n- Growth Factor: ${configuration.growthFactor}% annually planned\n- Plan for ${(results.averageEPS * (1 + configuration.growthFactor/100)).toLocaleString()} EPS next year\n- Budget for storage growth: ${results.future.totalStorageTB.toFixed(2)} TB\n\n**Next Steps:**\n1. Evaluate 2-3 platforms with POC\n2. Define use cases and correlation rules\n3. Plan phased deployment (30-60-90 days)\n4. Train SOC team on platform\n5. Establish baseline metrics and alerting\n\n**Questions to Consider:**\n- Compliance requirements (PCI, HIPAA, SOC2)?\n- Cloud, on-prem, or hybrid deployment?\n- Existing security tools to integrate?\n- SOC team size and skill level?\n\nFeel free to ask specific questions about any aspect!`;
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