import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, Database, HardDrive, Cpu, Download, Save, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const ResultsPanel = ({ results, devices, configuration }) => {
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
      toast.error('Failed to generate PDF', {
        description: 'Please try again or check your inputs.',
      });
    }
  };

  const handleSaveConfig = () => {
    try {
      const config = { devices, configuration, timestamp: new Date().toISOString() };
      localStorage.setItem('sizeai_config', JSON.stringify(config));
      toast.success('Configuration Saved!', {
        description: 'Your settings have been saved to browser storage.',
      });
    } catch (error) {
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
          <span className="text-sm ml-1 text-muted-foreground">{unit}</span>
        </motion.p>
      </div>
    </motion.div>
  );

  return (
    <Card className="glass-card p-6 shadow-glow">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Sizing Results</h2>
        </div>
        <p className="text-xs text-muted-foreground">Real-time infrastructure calculations</p>
      </div>

      {/* EPS Metrics */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Events Per Second</h3>
        <div className="space-y-3">
          <MetricCard 
            icon={Activity} 
            label="Average EPS" 
            value={results.averageEPS.toLocaleString()} 
            unit="eps"
            color="text-primary"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Peak EPS" 
            value={results.peakEPS.toLocaleString()} 
            unit="eps"
            color="text-accent"
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Storage Metrics */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Daily Log Volume</h3>
        <div className="space-y-3">
          <MetricCard 
            icon={Database} 
            label="GB per Day" 
            value={results.dailyGB.toFixed(2)} 
            unit="GB"
            color="text-foreground"
          />
          <MetricCard 
            icon={Database} 
            label="TB per Month" 
            value={results.monthlyTB.toFixed(2)} 
            unit="TB"
            color="text-foreground"
          />
          <MetricCard 
            icon={Database} 
            label="TB per Year" 
            value={results.yearlyTB.toFixed(2)} 
            unit="TB"
            color="text-foreground"
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Storage Requirements */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Storage Requirements</h3>
        <div className="space-y-3">
          <MetricCard 
            icon={HardDrive} 
            label="Hot Storage (SSD/NVMe)" 
            value={results.hotStorageTB.toFixed(2)} 
            unit="TB"
            color="text-accent"
          />
          <MetricCard 
            icon={HardDrive} 
            label="Cold Storage (Archive)" 
            value={results.coldStorageTB.toFixed(2)} 
            unit="TB"
            color="text-muted-foreground"
          />
          <MetricCard 
            icon={HardDrive} 
            label="Total Raw Storage" 
            value={results.totalStorageTB.toFixed(2)} 
            unit="TB"
            color="text-primary"
          />
          <MetricCard 
            icon={HardDrive} 
            label="After Compression" 
            value={results.compressedStorageTB.toFixed(2)} 
            unit="TB"
            color="text-accent"
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Infrastructure Recommendations */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Infrastructure Recommendations</h3>
        <div className="space-y-3">
          <MetricCard 
            icon={Cpu} 
            label="Indexer Nodes" 
            value={results.infrastructure.indexers} 
            unit="nodes"
            color="text-primary"
          />
          <MetricCard 
            icon={Cpu} 
            label="Search Heads" 
            value={results.infrastructure.searchHeads} 
            unit="nodes"
            color="text-primary"
          />
          <MetricCard 
            icon={Cpu} 
            label="Total CPU Cores" 
            value={results.infrastructure.cpuCores} 
            unit="cores"
            color="text-accent"
          />
          <MetricCard 
            icon={Cpu} 
            label="Total RAM" 
            value={results.infrastructure.ramGB} 
            unit="GB"
            color="text-accent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mt-6">
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
          Save Configuration
        </Button>
      </div>
    </Card>
  );
};

export default ResultsPanel;