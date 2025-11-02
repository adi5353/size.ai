import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import DeviceInventory from '@/components/calculator/DeviceInventory';
import ConfigurationPanel from '@/components/calculator/ConfigurationPanel';
import ResultsDashboard from '@/components/calculator/ResultsDashboard';
import AIAssistant from '@/components/calculator/AIAssistant';
import { calculateInfrastructure } from '@/utils/calculations';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2 } from 'lucide-react';

export const Calculator = () => {
  const { isAuthenticated, token } = useAuth();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const [devices, setDevices] = useState({
    // Endpoints
    windowsWorkstations: { quantity: 0, eps: 3 },
    linuxWorkstations: { quantity: 0, eps: 2 },
    macWorkstations: { quantity: 0, eps: 2 },
    // Servers
    windowsServers: { quantity: 0, eps: 20 },
    linuxServers: { quantity: 0, eps: 15 },
    databaseServers: { quantity: 0, eps: 30 },
    applicationServers: { quantity: 0, eps: 25 },
    // Network Devices
    firewalls: { quantity: 0, eps: 200 },
    switches: { quantity: 0, eps: 50 },
    routers: { quantity: 0, eps: 300 },
    loadBalancers: { quantity: 0, eps: 150 },
    idsIps: { quantity: 0, eps: 500 },
    // Cloud Resources
    awsResources: { quantity: 0, eps: 10 },
    azureResources: { quantity: 0, eps: 10 },
    gcpResources: { quantity: 0, eps: 10 },
    otherCloud: { quantity: 0, eps: 10 },
    // Security Devices
    siemAgents: { quantity: 0, eps: 5 },
    edrAgents: { quantity: 0, eps: 15 },
    webAppFirewalls: { quantity: 0, eps: 100 },
  });

  const [configuration, setConfiguration] = useState({
    retentionPeriod: 90,
    complianceTemplate: 'custom',
    includeGrowth: false,
    annualGrowth: 20,
    replicationFactor: 2,
    compressionLevel: 'standard',
    hotColdSplit: false,
    hotStorageDays: 30,
  });

  // Save/Load configuration state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Memoize results to prevent recalculation on every render
  const results = useMemo(() => {
    return calculateInfrastructure(devices, configuration);
  }, [devices, configuration]);

  const updateDevice = (deviceType, field, value) => {
    setDevices(prev => ({
      ...prev,
      [deviceType]: { ...prev[deviceType], [field]: value }
    }));
  };

  const updateConfiguration = (field, value) => {
    setConfiguration(prev => ({ ...prev, [field]: value }));
  };

  const applyComplianceTemplate = (template) => {
    const templates = {
      'pci-dss': {
        retentionPeriod: 90,
        replicationFactor: 2,
        compressionLevel: 'standard',
      },
      'hipaa': {
        retentionPeriod: 365,
        replicationFactor: 3,
        compressionLevel: 'standard',
      },
      'gdpr': {
        retentionPeriod: 180,
        replicationFactor: 2,
        compressionLevel: 'high',
      },
      'soc2': {
        retentionPeriod: 365,
        replicationFactor: 2,
        compressionLevel: 'standard',
      },
    };

    if (templates[template]) {
      setConfiguration(prev => ({
        ...prev,
        ...templates[template],
        complianceTemplate: template,
      }));
    }
  };

  // Save configuration to account
  const handleSaveConfig = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save configurations');
      return;
    }
    setSaveDialogOpen(true);
  };

  const saveConfiguration = async () => {
    if (!configName.trim()) {
      toast.error('Please enter a configuration name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: configName,
          description: configDescription,
          devices,
          configuration,
          results
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast.success('Configuration saved successfully!');
      setSaveDialogOpen(false);
      setConfigName('');
      setConfigDescription('');
    } catch (error) {
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  // Load configurations
  const handleLoadConfigs = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to load configurations');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/configurations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load configurations');
      }

      const configs = await response.json();
      setSavedConfigs(configs);
      setLoadDialogOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = (config) => {
    setDevices(config.devices);
    setConfiguration(config.configuration);
    setLoadDialogOpen(false);
    toast.success(`Loaded configuration: ${config.name}`);
  };

  const deleteConfiguration = async (configId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/configurations/${configId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      toast.success('Configuration deleted');
      // Refresh the list
      setSavedConfigs(prev => prev.filter(c => c.id !== configId));
    } catch (error) {
      toast.error(error.message || 'Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header onSaveConfig={handleSaveConfig} onLoadConfigs={handleLoadConfigs} />
      
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <main className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Introduction */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Professional Security Infrastructure Calculator</h2>
          <p className="text-muted-foreground text-lg">Plan your SIEM/XDR deployment with confidence • Calculate hardware, storage, and costs</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DeviceInventory devices={devices} updateDevice={updateDevice} />
            <ConfigurationPanel 
              configuration={configuration} 
              updateConfiguration={updateConfiguration}
              applyComplianceTemplate={applyComplianceTemplate}
            />
            <AIAssistant devices={devices} configuration={configuration} results={results} />
          </motion.div>

          {/* Right Column - Quick Summary */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-24">
              <ResultsDashboard results={results} devices={devices} configuration={configuration} />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Save Configuration Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current configuration to load it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">Configuration Name *</Label>
              <Input
                id="config-name"
                placeholder="e.g., Production Environment 2025"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-description">Description (optional)</Label>
              <Textarea
                id="config-description"
                placeholder="Add notes about this configuration..."
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                className="bg-secondary/50 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setSaveDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={saveConfiguration}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Configuration Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-[600px] glass-card border-border/50 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Configurations</DialogTitle>
            <DialogDescription>
              Load a previously saved configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {savedConfigs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No saved configurations yet</p>
                <p className="text-sm mt-2">Save your first configuration to see it here</p>
              </div>
            ) : (
              savedConfigs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{config.name}</h3>
                      {config.description && (
                        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{config.results?.totalDevices || 0} devices</span>
                        <span>{config.results?.totalEPS || 0} EPS</span>
                        <span>{new Date(config.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => loadConfiguration(config)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConfiguration(config.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calculator;