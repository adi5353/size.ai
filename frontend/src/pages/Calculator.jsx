import { useState } from 'react';
import Header from '@/components/layout/Header';
import DeviceInventory from '@/components/calculator/DeviceInventory';
import ConfigurationPanel from '@/components/calculator/ConfigurationPanel';
import ResultsPanel from '@/components/calculator/ResultsPanel';
import AIAssistant from '@/components/calculator/AIAssistant';
import { calculateSizing } from '@/utils/calculations';
import { motion } from 'framer-motion';

export const Calculator = () => {
  const [devices, setDevices] = useState({
    endpoints: { quantity: 0, eps: 2 },
    servers: { quantity: 0, eps: 10 },
    routers: { quantity: 0, eps: 300 },
    switches: { quantity: 0, eps: 100 },
    firewalls: { quantity: 0, eps: 500 },
    loadBalancers: { quantity: 0, eps: 200 },
    ids: { quantity: 0, eps: 1000 },
    waf: { quantity: 0, eps: 400 },
    emailGateways: { quantity: 0, eps: 150 },
    proxyServers: { quantity: 0, eps: 250 },
    cloudServices: { quantity: 0, eps: 100 },
    saasApps: { quantity: 0, eps: 50 },
    databases: { quantity: 0, eps: 200 },
    customSources: { quantity: 0, eps: 100 },
  });

  const [configuration, setConfiguration] = useState({
    retentionPeriod: 90,
    hotStorage: 30,
    growthFactor: 20,
    peakFactor: 2,
    compressionRatio: 3,
  });

  const results = calculateSizing(devices, configuration);

  const updateDevice = (deviceType, field, value) => {
    setDevices(prev => ({
      ...prev,
      [deviceType]: { ...prev[deviceType], [field]: value }
    }));
  };

  const updateConfiguration = (field, value) => {
    setConfiguration(prev => ({ ...prev, [field]: value }));
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Device Inventory */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DeviceInventory devices={devices} updateDevice={updateDevice} />
            <ConfigurationPanel configuration={configuration} updateConfiguration={updateConfiguration} />
            <AIAssistant devices={devices} configuration={configuration} results={results} />
          </motion.div>

          {/* Right Column - Results Panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-24">
              <ResultsPanel results={results} devices={devices} configuration={configuration} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Calculator;