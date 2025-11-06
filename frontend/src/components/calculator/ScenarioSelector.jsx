import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Check, X, TrendingUp, Shield, 
  AlertTriangle, DollarSign, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllScenarios, getCategories } from '@/data/scenarioTemplates';
import { toast } from 'sonner';

export const ScenarioSelector = ({ onSelectScenario, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScenario, setSelectedScenario] = useState(null);
  
  const scenarios = getAllScenarios();
  const categories = ['All', ...getCategories()];
  
  const filteredScenarios = selectedCategory === 'All' 
    ? scenarios 
    : scenarios.filter(s => s.category === selectedCategory);

  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleApply = () => {
    if (selectedScenario) {
      onSelectScenario(selectedScenario);
      toast.success(`${selectedScenario.name} scenario loaded!`);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalDevices = (devices) => {
    return Object.values(devices).reduce((sum, d) => sum + (d.quantity || 0), 0);
  };

  const getTotalEPS = (devices) => {
    return Object.entries(devices).reduce((sum, [_, d]) => {
      return sum + (d.quantity * d.eps);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">SIEM Deployment Scenarios</h2>
              <p className="text-sm text-slate-400 mt-1">
                Pre-built templates for common use cases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-5 cursor-pointer transition-all hover:border-purple-500/50 ${
                  selectedScenario?.id === scenario.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : ''
                }`}
                onClick={() => handleSelectScenario(scenario)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{scenario.icon}</span>
                  {selectedScenario?.id === scenario.id && (
                    <div className="p-1 bg-purple-500 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-1">{scenario.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{scenario.description}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">
                      {getTotalDevices(scenario.devices).toLocaleString()} devices
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-slate-300">
                      {getTotalEPS(scenario.devices).toLocaleString()} EPS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="text-slate-300">
                      {scenario.configuration.complianceTemplate}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/10 p-6 bg-slate-800/50"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Architecture
                </h4>
                <p className="text-sm text-slate-300 mb-2">
                  <strong>Type:</strong> {selectedScenario.architecture.type}
                </p>
                <p className="text-sm text-slate-300 mb-3">
                  <strong>Regions:</strong> {selectedScenario.architecture.regions.join(', ')}
                </p>
                <ul className="space-y-1">
                  {selectedScenario.architecture.recommendedComponents.slice(0, 3).map((component, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{component}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Estimated Annual Costs
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hardware:</span>
                    <span className="text-slate-200">{formatCurrency(selectedScenario.estimatedCosts.hardware)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Storage:</span>
                    <span className="text-slate-200">{formatCurrency(selectedScenario.estimatedCosts.storage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Licenses:</span>
                    <span className="text-slate-200">{formatCurrency(selectedScenario.estimatedCosts.licenses)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 font-semibold">
                    <span className="text-slate-200">Total:</span>
                    <span className="text-purple-400">
                      {formatCurrency(Object.values(selectedScenario.estimatedCosts).reduce((a, b) => a + b, 0))}
                    </span>
                  </div>
                </div>

                {selectedScenario.risks.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Key Risks
                    </h5>
                    <ul className="space-y-1">
                      {selectedScenario.risks.slice(0, 2).map((risk, i) => (
                        <li key={i} className="text-xs text-slate-400">
                          • {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedScenario}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Scenario
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
