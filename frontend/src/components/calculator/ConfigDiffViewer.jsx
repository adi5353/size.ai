import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, TrendingUp, TrendingDown, Minus, Check, X } from 'lucide-react';
import { compareConfigurations } from '@/utils/importExport';

export const ConfigDiffViewer = ({ config1, config2, config1Label = 'Configuration A', config2Label = 'Configuration B' }) => {
  const diff = compareConfigurations(config1, config2);

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const formatDeviceName = (deviceType) => {
    return deviceType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatConfigName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="w-4 h-4 text-green-400 inline" /> : <X className="w-4 h-4 text-red-400 inline" />;
    }
    return value?.toString() || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <GitCompare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Configuration Comparison</h3>
            <p className="text-sm text-slate-400">
              {config1Label} vs {config2Label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{diff.summary.totalChanges}</div>
            <div className="text-sm text-slate-400">Total Changes</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{diff.summary.devicesChanged}</div>
            <div className="text-sm text-slate-400">Devices Changed</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{diff.summary.settingsChanged}</div>
            <div className="text-sm text-slate-400">Settings Changed</div>
          </div>
        </div>
      </div>

      {/* Device Differences */}
      {diff.devices.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Device Inventory Changes ({diff.devices.length})
          </h4>
          <div className="space-y-2">
            {diff.devices.map((change, index) => (
              <motion.div
                key={change.field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getChangeIcon(change.change)}
                  <span className="font-medium">{formatDeviceName(change.field)}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-slate-400">
                    {change.oldValue}
                  </div>
                  <div className="text-slate-600">→</div>
                  <div className={getChangeColor(change.change) + ' font-semibold'}>
                    {change.newValue}
                  </div>
                  {change.change !== 0 && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      change.change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {change.change > 0 ? '+' : ''}{change.change}
                      {change.changePercent !== 'N/A' && ` (${change.changePercent}%)`}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Differences */}
      {diff.configuration.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            Configuration Settings Changes ({diff.configuration.length})
          </h4>
          <div className="space-y-2">
            {diff.configuration.map((change, index) => (
              <motion.div
                key={change.field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Minus className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">{formatConfigName(change.field)}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-slate-400">
                    {formatValue(change.oldValue)}
                  </div>
                  <div className="text-slate-600">→</div>
                  <div className="text-cyan-400 font-semibold">
                    {formatValue(change.newValue)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Changes */}
      {diff.summary.totalChanges === 0 && (
        <div className="glass-card p-12 text-center">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h4 className="font-semibold text-lg mb-2">Configurations Are Identical</h4>
          <p className="text-sm text-slate-400">
            No differences found between the two configurations
          </p>
        </div>
      )}
    </div>
  );
};
