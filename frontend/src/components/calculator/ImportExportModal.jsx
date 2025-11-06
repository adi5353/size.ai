import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Upload, FileJson, FileSpreadsheet, X, 
  Check, AlertCircle, History, GitCompare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  exportToJSON,
  importFromJSON,
  exportDevicesToCSV,
  importDevicesFromCSV,
  getHistory,
  deleteFromHistory,
} from '@/utils/importExport';

export const ImportExportModal = ({ isOpen, onClose, currentConfig, onImport }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const handleExportJSON = () => {
    try {
      const result = exportToJSON(currentConfig);
      toast.success(`Configuration exported: ${result.fileName}`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const handleExportCSV = () => {
    try {
      const result = exportDevicesToCSV(currentConfig.devices);
      toast.success(`Device inventory exported: ${result.fileName}`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await importFromJSON(file);
      toast.success(`Configuration imported: ${result.fileName}`);
      onImport(result.configuration);
      onClose();
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await importDevicesFromCSV(file);
      toast.success(`Device inventory imported: ${result.fileName}`);
      onImport({ ...currentConfig, devices: result.devices });
      onClose();
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleLoadFromHistory = (item) => {
    onImport(item.configuration);
    toast.success(`Loaded configuration: ${item.name}`);
    onClose();
  };

  const handleDeleteHistory = (id, event) => {
    event.stopPropagation();
    deleteFromHistory(id);
    setHistory(getHistory());
    toast.success('Configuration removed from history');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Import / Export</h2>
              <p className="text-sm text-slate-400 mt-1">Manage your configurations</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 px-6 py-3 font-medium transition-all ${
                activeTab === 'export'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Download className="w-4 h-4 inline-block mr-2" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 px-6 py-3 font-medium transition-all ${
                activeTab === 'import'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Import
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-3 font-medium transition-all ${
                activeTab === 'history'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4 inline-block mr-2" />
              History ({history.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="glass-card p-6 hover:border-purple-500/30 transition-all cursor-pointer" onClick={handleExportJSON}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <FileJson className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Export as JSON</h3>
                      <p className="text-sm text-slate-400">
                        Download complete configuration including devices, settings, and results.
                        Compatible with import feature.
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="glass-card p-6 hover:border-purple-500/30 transition-all cursor-pointer" onClick={handleExportCSV}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Export Device Inventory as CSV</h3>
                      <p className="text-sm text-slate-400">
                        Download device inventory in CSV format for spreadsheet applications.
                        Includes DeviceType, Quantity, and EPS columns.
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />

                <div 
                  className="glass-card p-6 hover:border-purple-500/30 transition-all cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <FileJson className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Import from JSON</h3>
                      <p className="text-sm text-slate-400">
                        Load a previously exported configuration. Will replace current settings.
                      </p>
                      {isProcessing && <p className="text-xs text-purple-400 mt-2">Processing...</p>}
                    </div>
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div 
                  className="glass-card p-6 hover:border-blue-500/30 transition-all cursor-pointer" 
                  onClick={() => csvInputRef.current?.click()}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Import Device Inventory from CSV</h3>
                      <p className="text-sm text-slate-400">
                        Load device inventory from CSV file. Required columns: DeviceType, Quantity.
                      </p>
                      {isProcessing && <p className="text-xs text-blue-400 mt-2">Processing...</p>}
                    </div>
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <strong>Note:</strong> Importing will replace your current configuration. 
                    Make sure to export your current settings first if you want to keep them.
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No configuration history yet</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Configurations are automatically saved when you make changes
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card p-4 hover:border-purple-500/30 transition-all cursor-pointer group"
                      onClick={() => handleLoadFromHistory(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{formatDate(item.timestamp)}</span>
                            <span>{Object.values(item.configuration.devices || {}).reduce((a, b) => a + b, 0)} devices</span>
                            <span>{item.configuration.configuration?.compliance || 'N/A'}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
