import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, Database, HardDrive, Cpu, Download, Save, 
  TrendingUp, AlertTriangle, CheckCircle, Info, Shield 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const ResultsDashboard = ({ results, devices, configuration }) => {
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    setAnimateNumbers(true);
    const timer = setTimeout(() => setAnimateNumbers(false), 500);
    return () => clearTimeout(timer);
  }, [results]);

  const handleGeneratePDF = () => {
    try {
      generatePDFReport(results, devices, configuration);
      toast.success('PDF Report Generated!', {
        description: 'Your sizing report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', {
        description: error.message || 'Please try again or check your inputs.',
      });
    }
  };

  const handleSaveConfig = () => {
    try {
      const config = {
        devices,
        configuration,
        results,
        timestamp: new Date().toISOString(),
        generatedBy: 'size.ai'
      };
      
      const configText = `size.ai - Security Infrastructure Configuration Export
========================================
Generated: ${new Date().toLocaleString()}

## DEVICE INVENTORY
${Object.entries(devices)
  .filter(([_, device]) => device.quantity > 0)
  .map(([type, device]) => `${type}: ${device.quantity} devices @ ${device.eps} EPS each`)
  .join('\\n')}

## CONFIGURATION
Retention Period: ${configuration.retentionPeriod} days
Replication Factor: ${configuration.replicationFactor}x
Compression: ${configuration.compressionLevel}
${configuration.hotColdSplit ? `Hot Storage: ${configuration.hotStorageDays} days\\nCold Storage: ${configuration.retentionPeriod - configuration.hotStorageDays} days` : ''}
${configuration.includeGrowth ? `Annual Growth: ${configuration.annualGrowth}%` : ''}

## CALCULATED RESULTS
Total Devices: ${results.totalDevices.toLocaleString()}
Average EPS: ${results.totalEPS.toLocaleString()}
Peak EPS: ${results.peakEPS.toLocaleString()}
Daily Volume: ${results.dailyGB.toFixed(2)} GB
Monthly Volume: ${results.monthlyTB.toFixed(2)} TB
Yearly Volume: ${results.yearlyTB.toFixed(2)} TB

Total Storage Required: ${results.totalStorageTB.toFixed(2)} TB
Architecture: ${results.architecture.type}

## Infrastructure Components
Management Server: ${results.infrastructure.managementServer.instances}x (${results.infrastructure.managementServer.cpu}vCPU, ${results.infrastructure.managementServer.ram}GB RAM)
Data Indexers: ${results.infrastructure.dataIndexer.instances}x (${results.infrastructure.dataIndexer.cpu}vCPU, ${results.infrastructure.dataIndexer.ram}GB RAM)
Web Console: ${results.infrastructure.webConsole.instances}x (${results.infrastructure.webConsole.cpu}vCPU, ${results.infrastructure.webConsole.ram}GB RAM)

Total: ${results.infrastructure.totalCPU} vCPUs, ${results.infrastructure.totalRAM} GB RAM

## JSON DATA (for import)
${JSON.stringify(config, null, 2)}
`;

      const blob = new Blob([configText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `sizeai-security-config-${timestamp}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Configuration Downloaded!', {
        description: 'Your settings have been saved to a text file.',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save configuration');
    }
  };

  const MetricCard = ({ icon: Icon, label, value, unit, color = "text-foreground" }) => (
    <motion.div 
      className="p-4 rounded-lg bg-gradient-card border border-border/50"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-secondary/50">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <motion.p 
          className={`text-2xl font-heading font-bold ${color}`}
          animate={animateNumbers ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {value}
          {unit && <span className="text-sm ml-1 text-muted-foreground">{unit}</span>}
        </motion.p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Card 1: Event Processing Summary */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-bold text-foreground">Event Processing Summary</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            icon={Activity} 
            label="Total EPS" 
            value={results.totalEPS.toLocaleString()} 
            unit="eps"
            color="text-primary"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Peak EPS" 
            value={Math.round(results.peakEPS).toLocaleString()} 
            unit="eps"
            color="text-accent"
          />
          <MetricCard 
            icon={Database} 
            label="Total Devices" 
            value={results.totalDevices.toLocaleString()} 
            color="text-foreground"
          />
          <MetricCard 
            icon={Activity} 
            label="Events/Day" 
            value={(results.eventsPerDay / 1000000).toFixed(1)} 
            unit="M"
            color="text-foreground"
          />
        </div>
      </Card>

      {/* Card 2: Data Volume */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-bold text-foreground">Data Volume</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily</span>
              <span className="font-semibold">{results.dailyGB.toFixed(2)} GB</span>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((results.dailyGB / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Weekly</span>
              <span className="font-semibold">{results.weeklyTB.toFixed(2)} TB</span>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-2">
              <div 
                className="bg-gradient-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((results.weeklyTB / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Monthly</span>
              <span className="font-semibold">{results.monthlyTB.toFixed(2)} TB</span>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((results.monthlyTB / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Yearly</span>
              <span className="font-semibold text-primary">{results.yearlyTB.toFixed(2)} TB</span>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((results.yearlyTB / 500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Card 3: Storage Requirements */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-bold text-foreground">Storage Requirements</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Storage</span>
              <span className="text-lg font-bold text-primary">{results.totalStorageTB.toFixed(2)} TB</span>
            </div>
          </div>
          {configuration.hotColdSplit && (
            <>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hot Storage</span>
                  <span className="text-sm font-semibold text-accent">{results.hotStorageGB.toFixed(2)} TB</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cold Storage</span>
                  <span className="text-sm font-semibold text-muted-foreground">{results.coldStorageGB.toFixed(2)} TB</span>
                </div>
              </div>
            </>
          )}
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Compression: {configuration.compressionLevel}</span>
              <span className="text-sm font-semibold">
                {configuration.compressionLevel === 'none' ? '0%' : 
                 configuration.compressionLevel === 'standard' ? '40%' : '60%'}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Replication Factor</span>
              <span className="text-sm font-semibold">{configuration.replicationFactor}x</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Card 4: Infrastructure Components */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-bold text-foreground">Infrastructure Components</h3>
          </div>
          <p className="text-xs text-muted-foreground">Hardware sizing for {results.architecture.type}</p>
        </div>
        <div className="space-y-4">
          {/* Management Server */}
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Management Server</span>
              <span className="text-xs text-accent">{results.infrastructure.managementServer.instances}x instances</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">CPU</span>
                <p className="font-semibold">{results.infrastructure.managementServer.cpu} vCPU</p>
              </div>
              <div>
                <span className="text-muted-foreground">RAM</span>
                <p className="font-semibold">{results.infrastructure.managementServer.ram} GB</p>
              </div>
              <div>
                <span className="text-muted-foreground">Storage</span>
                <p className="font-semibold">{results.infrastructure.managementServer.storage} GB</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{results.infrastructure.managementServer.notes}</p>
          </div>

          {/* Data Indexer */}
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Data Indexer{results.infrastructure.dataIndexer.instances > 1 ? 's' : ''}</span>
              <span className="text-xs text-accent">{results.infrastructure.dataIndexer.instances}x instances</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">CPU</span>
                <p className="font-semibold">{results.infrastructure.dataIndexer.cpu} vCPU</p>
              </div>
              <div>
                <span className="text-muted-foreground">RAM</span>
                <p className="font-semibold">{results.infrastructure.dataIndexer.ram} GB</p>
              </div>
              <div>
                <span className="text-muted-foreground">Storage</span>
                <p className="font-semibold">{results.infrastructure.dataIndexer.storage} GB</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{results.infrastructure.dataIndexer.notes}</p>
          </div>

          {/* Web Console */}
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Web Console{results.infrastructure.webConsole.instances > 1 ? 's' : ''}</span>
              <span className="text-xs text-accent">{results.infrastructure.webConsole.instances}x instances</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">CPU</span>
                <p className="font-semibold">{results.infrastructure.webConsole.cpu} vCPU</p>
              </div>
              <div>
                <span className="text-muted-foreground">RAM</span>
                <p className="font-semibold">{results.infrastructure.webConsole.ram} GB</p>
              </div>
              <div>
                <span className="text-muted-foreground">Storage</span>
                <p className="font-semibold">{results.infrastructure.webConsole.storage} GB</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{results.infrastructure.webConsole.notes}</p>
          </div>

          {/* Total Resources */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="text-sm font-semibold text-primary mb-2">Total Resources</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total CPU</span>
                <p className="font-bold text-primary">{results.infrastructure.totalCPU} vCPU</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total RAM</span>
                <p className="font-bold text-primary">{results.infrastructure.totalRAM} GB</p>
              </div>
              <div>
                <span className="text-muted-foreground">System Storage</span>
                <p className="font-bold text-primary">{results.infrastructure.totalStorage} GB</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card 5: Architecture Recommendation */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-heading font-bold text-foreground">Architecture Recommendation</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-gradient-card border border-accent/30">
            <div className="text-xl font-heading font-bold text-accent mb-2">{results.architecture.type}</div>
            <p className="text-sm text-foreground mb-3">{results.architecture.description}</p>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold">Deployment:</span>
                <p className="text-foreground mt-1">{results.architecture.deployment}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">High Availability:</span>
                <p className="text-foreground mt-1">{results.architecture.ha}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Scaling:</span>
                <p className="text-foreground mt-1">{results.architecture.scaling}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card 6: High Availability Recommendations */}
      <Card className="glass-card p-6 shadow-glow">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-heading font-bold text-foreground">High Availability Setup</h3>
          </div>
          <p className="text-xs text-muted-foreground">Based on {configuration.replicationFactor}x replication</p>
        </div>
        <div className="space-y-3">
          {/* Replication Status */}
          <div className={`p-4 rounded-lg border ${
            configuration.replicationFactor >= 2 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-start space-x-2">
              {configuration.replicationFactor >= 2 ? (
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1">
                  {configuration.replicationFactor >= 2 ? 'HA Enabled' : 'No HA Configured'}
                </div>
                <p className="text-xs text-foreground">
                  {configuration.replicationFactor >= 3
                    ? `Excellent! ${configuration.replicationFactor}x replication provides strong data durability and fault tolerance. Can survive ${configuration.replicationFactor - 1} node failures.`
                    : configuration.replicationFactor === 2
                    ? '2x replication provides basic HA. Your data is protected against single node failure.'
                    : 'Warning: No replication configured. Data loss risk if a node fails. Recommend 2x minimum for production.'}
                </p>
              </div>
            </div>
          </div>

          {/* HA Recommendations */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Recommended HA Configuration:</div>
            
            {/* Management Layer */}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Management Layer</span>
                {results.infrastructure.managementServer.instances >= 2 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Info className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {results.infrastructure.managementServer.instances >= 2
                  ? 'Active-passive cluster configured for redundancy'
                  : results.totalDevices > 1000
                  ? 'Recommend: Add standby management server for failover'
                  : 'Single instance acceptable for this scale'}
              </p>
            </div>

            {/* Data Layer */}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Data Layer</span>
                {configuration.replicationFactor >= 2 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {configuration.replicationFactor >= 2
                  ? `Data replicated across ${configuration.replicationFactor}x nodes. RPO: near-zero, RTO: < 5 minutes`
                  : 'No replication configured. Data at risk. Enable 2x replication minimum.'}
              </p>
            </div>

            {/* Search/Dashboard Layer */}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Search/Dashboard Layer</span>
                {results.infrastructure.webConsole.instances >= 2 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Info className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {results.infrastructure.webConsole.instances >= 2
                  ? 'Load-balanced across multiple instances for high availability'
                  : results.totalDevices > 5000
                  ? 'Recommend: Add second console for load balancing'
                  : 'Single console acceptable for this scale'}
              </p>
            </div>
          </div>

          {/* Network/Storage HA */}
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="text-xs font-semibold text-foreground mb-2">Additional HA Considerations:</div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>Network: Deploy dual NICs with bonding for network redundancy</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>Storage: Use RAID 10 for hot data, RAID 6 for cold data</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>Backup: Implement automated snapshots every {configuration.retentionPeriod >= 365 ? '6' : '12'} hours</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>Geographic: {results.totalDevices > 5000 ? 'Consider multi-datacenter deployment for DR' : 'Single datacenter acceptable'}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>Monitoring: Deploy health checks every 30 seconds with auto-failover</span>
              </div>
            </div>
          </div>

          {/* RTO/RPO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="text-xs text-muted-foreground mb-1">Recovery Time Objective</div>
              <div className="text-lg font-bold text-primary">
                {configuration.replicationFactor >= 3 ? '< 2 min' : 
                 configuration.replicationFactor === 2 ? '< 5 min' : 
                 '> 1 hour'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Time to restore service</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
              <div className="text-xs text-muted-foreground mb-1">Recovery Point Objective</div>
              <div className="text-lg font-bold text-accent">
                {configuration.replicationFactor >= 2 ? 'Near-zero' : 'Hours'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Potential data loss</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Card 6: Growth Projections */}
      {configuration.includeGrowth && results.growthProjections && results.growthProjections.length > 0 && (
        <Card className="glass-card p-6 shadow-glow">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-foreground">Growth Projections</h3>
            </div>
            <p className="text-xs text-muted-foreground">Projected growth at {configuration.annualGrowth}% annually</p>
          </div>
          <div className="space-y-3">
            {results.growthProjections.map((projection, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-card border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-accent">Year {projection.year}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().getFullYear() + projection.year}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">Devices</div>
                    <div className="text-base font-bold text-foreground">
                      {projection.devices.toLocaleString()}
                    </div>
                    <div className="text-xs text-accent mt-0.5">
                      +{((projection.devices / results.totalDevices - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">EPS</div>
                    <div className="text-base font-bold text-foreground">
                      {projection.eps.toLocaleString()}
                    </div>
                    <div className="text-xs text-accent mt-0.5">
                      +{((projection.eps / results.totalEPS - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">Daily Volume</div>
                    <div className="text-base font-bold text-foreground">
                      {projection.dailyGB.toFixed(1)} GB
                    </div>
                    <div className="text-xs text-accent mt-0.5">
                      +{((projection.dailyGB / results.dailyGB - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">Storage Needed</div>
                    <div className="text-base font-bold text-primary">
                      {projection.storageTB.toFixed(2)} TB
                    </div>
                    <div className="text-xs text-accent mt-0.5">
                      +{((projection.storageTB / results.totalStorageTB - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Card 7: Cost Estimation */}
      {results.costs && (
        <Card className="glass-card p-6 shadow-glow">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-foreground">Cost Estimation</h3>
            </div>
            <p className="text-xs text-muted-foreground">Estimated infrastructure costs (USD)</p>
          </div>
          <div className="space-y-4">
            {/* Monthly Breakdown */}
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-3">Monthly Cost Breakdown</div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Hardware/Compute</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${results.costs.hardwareMonthly.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground">Storage</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${results.costs.storageMonthly.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-foreground" />
                      <span className="text-sm text-foreground">Network/Bandwidth</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${results.costs.networkMonthly.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total Costs */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-primary/10 border border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Total Monthly</span>
                  <span className="text-xl font-bold text-primary">
                    ${results.costs.totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Total Annual</span>
                  <span className="text-xl font-bold text-accent">
                    ${results.costs.totalAnnual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Notes */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Estimates based on cloud infrastructure pricing. Actual costs may vary based on provider, region, reserved instances, and enterprise discounts. Does not include licensing, support, or personnel costs.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Warnings & Recommendations */}
      {results.warnings && results.warnings.all && results.warnings.all.length > 0 && (
        <Card className="glass-card p-6 shadow-glow">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-foreground">Recommendations</h3>
            </div>
          </div>
          <div className="space-y-3">
            {results.warnings.all.map((item, index) => (
              <Alert key={index} className={
                item.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' :
                item.type === 'error' ? 'border-red-500/50 bg-red-500/10' :
                item.type === 'success' ? 'border-green-500/50 bg-green-500/10' :
                item.type === 'compliance' ? 'border-blue-500/50 bg-blue-500/10' :
                'border-border/50 bg-secondary/20'
              }>
                <div className="flex items-start space-x-2">
                  {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                  {item.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                  {item.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                  {item.type === 'compliance' && <Shield className="w-4 h-4 text-blue-500 mt-0.5" />}
                  {item.type === 'info' && <Info className="w-4 h-4 text-accent mt-0.5" />}
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-semibold">{item.title}</AlertTitle>
                    <AlertDescription className="text-xs mt-1">{item.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleGeneratePDF}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Generate PDF Report
        </Button>
        <Button 
          onClick={handleSaveConfig}
          variant="outline"
          className="w-full border-border/50 hover:bg-secondary/50"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Download Configuration
        </Button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
