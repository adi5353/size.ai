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
