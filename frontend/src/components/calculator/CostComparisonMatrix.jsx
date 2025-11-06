import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, CheckCircle, XCircle, Info, 
  Award, Shield, Cloud, Server, Zap, Users 
} from 'lucide-react';
import { SIEM_VENDORS, getAllVendorComparisons } from '@/data/vendorPricing';
import { Button } from '@/components/ui/button';

export const CostComparisonMatrix = ({ results, devices, configuration }) => {
  const [selectedView, setSelectedView] = useState('cost'); // 'cost' or 'features'
  const [selectedVendors, setSelectedVendors] = useState(['SPLUNK', 'ELASTIC', 'AZURE_SENTINEL']);

  // Calculate requirements for vendor pricing
  const requirements = useMemo(() => ({
    dailyDataGB: results?.dataVolume?.dailyGB || 0,
    totalDevices: Object.values(devices || {}).reduce((sum, d) => sum + (d.quantity || 0), 0),
    retentionDays: configuration?.retentionPeriod || 90,
    peakEPS: results?.eventProcessing?.peakEPS || 0,
  }), [results, devices, configuration]);

  // Get vendor comparisons
  const vendorComparisons = useMemo(() => 
    getAllVendorComparisons(requirements),
    [requirements]
  );

  const toggleVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      if (selectedVendors.length > 1) {
        setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
      }
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFeatureIcon = (feature) => {
    switch(feature) {
      case 'Excellent': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Advanced': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Good': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'Moderate': return <CheckCircle className="w-4 h-4 text-yellow-400" />;
      case 'Basic': return <CheckCircle className="w-4 h-4 text-yellow-400" />;
      case 'Limited': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'Yes': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'No': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const selectedComparisons = vendorComparisons.filter(v => 
    selectedVendors.includes(v.vendorId)
  );

  const cheapestVendor = vendorComparisons[0];
  const mostExpensive = vendorComparisons[vendorComparisons.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              SIEM Vendor Cost Comparison
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Compare pricing and features across leading SIEM vendors
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'cost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('cost')}
            >
              Cost Analysis
            </Button>
            <Button
              variant={selectedView === 'features' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('features')}
            >
              Feature Matrix
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Most Affordable</div>
            <div className="font-semibold text-green-400">{cheapestVendor?.vendor}</div>
            <div className="text-sm text-slate-300">{formatCurrency(cheapestVendor?.monthlyCost)}/mo</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Premium Option</div>
            <div className="font-semibold text-purple-400">{mostExpensive?.vendor}</div>
            <div className="text-sm text-slate-300">{formatCurrency(mostExpensive?.monthlyCost)}/mo</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Price Range</div>
            <div className="font-semibold text-blue-400">
              {((mostExpensive?.monthlyCost / cheapestVendor?.monthlyCost) || 1).toFixed(1)}x
            </div>
            <div className="text-sm text-slate-300">Variation</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Comparing</div>
            <div className="font-semibold text-cyan-400">{vendorComparisons.length} Vendors</div>
            <div className="text-sm text-slate-300">{selectedVendors.length} Selected</div>
          </div>
        </div>
      </div>

      {/* Vendor Selection */}
      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4">Select Vendors to Compare</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(SIEM_VENDORS).map(vendor => (
            <button
              key={vendor.id}
              onClick={() => toggleVendor(vendor.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedVendors.includes(vendor.id)
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-slate-800/30 hover:border-white/20'
              }`}
            >
              <div className="font-semibold">{vendor.name}</div>
              <div className="text-xs text-slate-400 mt-1">{vendor.vendor}</div>
              <div className="text-xs text-slate-500 mt-1">{vendor.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cost Comparison View */}
      {selectedView === 'cost' && (
        <div className="space-y-4">
          {selectedComparisons.map((comparison, index) => (
            <motion.div
              key={comparison.vendorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold">{comparison.vendor}</h4>
                  <p className="text-sm text-slate-400">{SIEM_VENDORS[comparison.vendorId].pricingModel}</p>
                </div>
                {index === 0 && (
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Best Value
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Monthly Cost</div>
                  <div className="text-xl font-bold text-purple-400">
                    {formatCurrency(comparison.monthlyCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Annual Cost</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(comparison.annualCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">3-Year TCO</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(comparison.threeYearTCO)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Setup Cost</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(comparison.setupCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Cost per Device</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(comparison.costPerDevice)}
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-xs font-semibold text-green-400 mb-2">✓ Pros</div>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {SIEM_VENDORS[comparison.vendorId].pros.slice(0, 3).map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">✗ Cons</div>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {SIEM_VENDORS[comparison.vendorId].cons.slice(0, 3).map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal For */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs font-semibold text-blue-400 mb-2">Ideal For:</div>
                <div className="flex flex-wrap gap-2">
                  {SIEM_VENDORS[comparison.vendorId].idealFor.map((ideal, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                      {ideal}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feature Comparison View */}
      {selectedView === 'features' && (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold">Feature</th>
                {selectedComparisons.map(comparison => (
                  <th key={comparison.vendorId} className="text-center py-3 px-4 text-sm font-semibold">
                    {comparison.vendor}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(SIEM_VENDORS[selectedVendors[0]]?.features || {}).map(([featureKey, _]) => (
                <tr key={featureKey} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4 text-sm">
                    {featureKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </td>
                  {selectedComparisons.map(comparison => {
                    const value = SIEM_VENDORS[comparison.vendorId].features[featureKey];
                    return (
                      <td key={comparison.vendorId} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getFeatureIcon(value)}
                          <span className="text-sm">{value}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ROI Insights */}
      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          ROI & Decision Insights
        </h4>
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            • <strong>Budget Optimization:</strong> Consider {cheapestVendor?.vendor} for cost-effective SIEM with {formatCurrency(cheapestVendor?.monthlyCost)}/mo
          </p>
          <p>
            • <strong>Feature vs Cost:</strong> {mostExpensive?.vendor} offers premium features at {((mostExpensive?.monthlyCost / cheapestVendor?.monthlyCost) || 1).toFixed(1)}x the cost
          </p>
          <p>
            • <strong>3-Year Planning:</strong> Total ownership costs range from {formatCurrency(cheapestVendor?.threeYearTCO)} to {formatCurrency(mostExpensive?.threeYearTCO)}
          </p>
          <p>
            • <strong>Recommendation:</strong> Choose based on your security maturity, team skills, and budget constraints
          </p>
        </div>
      </div>
    </div>
  );
};
