import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Calculator, TrendingUp, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { CostComparisonMatrix } from '@/components/calculator/CostComparisonMatrix';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CostComparisonPage = () => {
  const navigate = useNavigate();
  
  // Get default sample data
  const getDefaultSampleData = () => ({
    results: {
      eventProcessing: {
        averageEPS: 5000,
        peakEPS: 15000,
        dailyEvents: 432000000,
      },
      dataVolume: {
        dailyGB: 100,
        monthlyTB: 3,
        annualTB: 36,
      },
      storage: {
        hotStorageTB: 10,
        coldStorageTB: 26,
        totalStorageTB: 36,
        withReplicationTB: 72,
      },
    },
    devices: {
      workstations: { quantity: 500, eps: 2 },
      servers: { quantity: 50, eps: 10 },
      firewalls: { quantity: 10, eps: 500 },
      ids: { quantity: 5, eps: 1000 },
    },
    configuration: {
      retentionPeriod: 90,
      complianceTemplate: 'HIPAA',
      includeGrowth: true,
      annualGrowth: 20,
    },
  });

  // Sample data - in real use, this would come from calculator state or localStorage
  const [sampleData] = useState(() => {
    // Try to get data from localStorage (from calculator)
    const savedConfig = localStorage.getItem('lastCalculatorConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Validate the data structure
        if (parsed && parsed.results && parsed.devices && parsed.configuration) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved config:', e);
      }
    }
    
    // Return default sample data
    return getDefaultSampleData();
  });

  const totalDevices = useMemo(() => {
    if (!sampleData?.devices) return 0;
    return Object.values(sampleData.devices).reduce((sum, d) => sum + (d?.quantity || 0), 0);
  }, [sampleData]);

  const hasRealData = useMemo(() => {
    const savedConfig = localStorage.getItem('lastCalculatorConfig');
    return !!savedConfig;
  }, []);

  // Safe data access with fallbacks
  const safeData = useMemo(() => {
    const defaultData = getDefaultSampleData();
    return {
      results: {
        eventProcessing: {
          averageEPS: sampleData?.results?.eventProcessing?.averageEPS || defaultData.results.eventProcessing.averageEPS,
          peakEPS: sampleData?.results?.eventProcessing?.peakEPS || defaultData.results.eventProcessing.peakEPS,
          dailyEvents: sampleData?.results?.eventProcessing?.dailyEvents || defaultData.results.eventProcessing.dailyEvents,
        },
        dataVolume: {
          dailyGB: sampleData?.results?.dataVolume?.dailyGB || defaultData.results.dataVolume.dailyGB,
          monthlyTB: sampleData?.results?.dataVolume?.monthlyTB || defaultData.results.dataVolume.monthlyTB,
          annualTB: sampleData?.results?.dataVolume?.annualTB || defaultData.results.dataVolume.annualTB,
        },
        storage: {
          hotStorageTB: sampleData?.results?.storage?.hotStorageTB || defaultData.results.storage.hotStorageTB,
          coldStorageTB: sampleData?.results?.storage?.coldStorageTB || defaultData.results.storage.coldStorageTB,
          totalStorageTB: sampleData?.results?.storage?.totalStorageTB || defaultData.results.storage.totalStorageTB,
          withReplicationTB: sampleData?.results?.storage?.withReplicationTB || defaultData.results.storage.withReplicationTB,
        },
      },
      devices: sampleData?.devices || defaultData.devices,
      configuration: {
        retentionPeriod: sampleData?.configuration?.retentionPeriod || defaultData.configuration.retentionPeriod,
        complianceTemplate: sampleData?.configuration?.complianceTemplate || defaultData.configuration.complianceTemplate,
        includeGrowth: sampleData?.configuration?.includeGrowth ?? defaultData.configuration.includeGrowth,
        annualGrowth: sampleData?.configuration?.annualGrowth || defaultData.configuration.annualGrowth,
      },
    };
  }, [sampleData]);

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
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calculator')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </Button>
          </div>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4"
            >
              <DollarSign className="w-8 h-8 text-purple-400" />
            </motion.div>
            
            <h1 className="text-4xl font-bold gradient-text mb-2">
              SIEM Vendor Cost Comparison
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Compare pricing and features across 6 leading SIEM vendors. Make informed decisions based on your infrastructure requirements.
            </p>
          </div>
        </motion.div>

        {/* Info Alert */}
        {!hasRealData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Alert className="glass-card border-blue-500/50 bg-blue-500/10">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-sm text-slate-300 ml-2">
                <strong>Using sample data.</strong> Go to the{' '}
                <button 
                  onClick={() => navigate('/calculator')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Calculator page
                </button>
                {' '}to input your actual infrastructure requirements for accurate cost estimates.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Requirements Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              Your Infrastructure Requirements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Total Devices</div>
                <div className="text-2xl font-bold text-purple-400">{totalDevices.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Daily Data</div>
                <div className="text-2xl font-bold text-blue-400">
                  {sampleData.results.dataVolume.dailyGB} GB
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Peak EPS</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {sampleData.results.eventProcessing.peakEPS.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Retention</div>
                <div className="text-2xl font-bold text-green-400">
                  {sampleData.configuration.retentionPeriod} days
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cost Comparison Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CostComparisonMatrix
            results={sampleData.results}
            devices={sampleData.devices}
            configuration={sampleData.configuration}
          />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="glass-card p-6 max-w-4xl mx-auto">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Need Help Deciding?</h4>
            <p className="text-sm text-slate-400 mb-4">
              Consider factors like your team's technical expertise, existing infrastructure, 
              compliance requirements, and long-term scalability needs when choosing a SIEM vendor.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/calculator')}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Update Requirements
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ai-assistant')}
              >
                <Info className="w-4 h-4 mr-2" />
                Ask AI Assistant
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CostComparisonPage;
