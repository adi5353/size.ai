import { useState } from 'react';
import Header from '@/components/layout/Header';
import DeviceInventory from '@/components/calculator/DeviceInventory';
import ConfigurationPanel from '@/components/calculator/ConfigurationPanel';
import ResultsDashboard from '@/components/calculator/ResultsDashboard';
import { calculateInfrastructure } from '@/utils/calculations';
import { motion } from 'framer-motion';

export const Calculator = () => {
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
    compressionLevel: 'standard', // none, standard (40%), high (60%)
    hotColdSplit: false,
    hotStorageDays: 30,
  });

  const results = calculateInfrastructure(devices, configuration);

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

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />
      
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
    </div>
  );
};

export default Calculator;