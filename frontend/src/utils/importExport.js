/**
 * Import/Export utilities for configuration management
 * Supports JSON and CSV formats with validation
 */

/**
 * JSON Schema for configuration validation
 */
export const CONFIGURATION_SCHEMA = {
  type: 'object',
  required: ['name', 'devices', 'configuration', 'version'],
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+$' },
    exportedAt: { type: 'string' },
    devices: {
      type: 'object',
      properties: {
        workstations: { type: 'number', minimum: 0 },
        servers: { type: 'number', minimum: 0 },
        mobileDevices: { type: 'number', minimum: 0 },
        virtualMachines: { type: 'number', minimum: 0 },
        routers: { type: 'number', minimum: 0 },
        firewalls: { type: 'number', minimum: 0 },
        loadBalancers: { type: 'number', minimum: 0 },
        wirelessAP: { type: 'number', minimum: 0 },
        ids: { type: 'number', minimum: 0 },
        proxies: { type: 'number', minimum: 0 },
        dlp: { type: 'number', minimum: 0 },
        emailGateway: { type: 'number', minimum: 0 },
        cloudApps: { type: 'number', minimum: 0 },
        containers: { type: 'number', minimum: 0 },
        apiGateways: { type: 'number', minimum: 0 },
        databases: { type: 'number', minimum: 0 },
      },
    },
    configuration: {
      type: 'object',
      required: ['retentionDays', 'compliance'],
      properties: {
        retentionDays: { type: 'number', minimum: 1 },
        compliance: { type: 'string' },
        hotStorageDays: { type: 'number', minimum: 0 },
        compressionRatio: { type: 'number', minimum: 1 },
        replicationFactor: { type: 'number', minimum: 1 },
        includeGrowth: { type: 'boolean' },
        growthRate: { type: 'number', minimum: 0, maximum: 100 },
        peakFactor: { type: 'number', minimum: 1 },
        highAvailability: { type: 'boolean' },
        encryption: { type: 'boolean' },
      },
    },
  },
};

/**
 * Validate configuration against schema
 */
export const validateConfiguration = (config) => {
  const errors = [];

  // Check required fields
  if (!config.name) errors.push('Configuration name is required');
  if (!config.devices) errors.push('Device inventory is required');
  if (!config.configuration) errors.push('Configuration settings are required');
  if (!config.version) errors.push('Version is required');

  // Validate devices
  if (config.devices) {
    Object.entries(config.devices).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`Invalid device count for ${key}: must be a non-negative number`);
      }
    });
  }

  // Validate configuration
  if (config.configuration) {
    const cfg = config.configuration;
    if (!cfg.retentionDays || cfg.retentionDays < 1) {
      errors.push('Retention days must be at least 1');
    }
    if (!cfg.compliance) {
      errors.push('Compliance standard is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export configuration to JSON
 */
export const exportToJSON = (configuration) => {
  const exportData = {
    ...configuration,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: 'size.ai',
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const fileName = `${configuration.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', fileName);
  linkElement.click();

  return { success: true, fileName };
};

/**
 * Import configuration from JSON
 */
export const importFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        const validation = validateConfiguration(config);

        if (!validation.valid) {
          reject(new Error(`Invalid configuration: ${validation.errors.join(', ')}`));
          return;
        }

        resolve({
          success: true,
          configuration: config,
          fileName: file.name,
        });
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Export device inventory to CSV
 */
export const exportDevicesToCSV = (devices) => {
  const csvRows = [];
  csvRows.push('DeviceType,Quantity,EPS');

  // Device EPS mapping (default values)
  const deviceEPS = {
    workstations: 2,
    servers: 10,
    mobileDevices: 1,
    virtualMachines: 5,
    routers: 300,
    firewalls: 500,
    loadBalancers: 200,
    wirelessAP: 50,
    ids: 1000,
    proxies: 800,
    dlp: 600,
    emailGateway: 400,
    cloudApps: 100,
    containers: 3,
    apiGateways: 150,
    databases: 200,
  };

  Object.entries(devices).forEach(([deviceType, quantity]) => {
    if (quantity > 0) {
      const eps = deviceEPS[deviceType] || 0;
      csvRows.push(`${deviceType},${quantity},${eps}`);
    }
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const fileName = `device_inventory_${Date.now()}.csv`;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', fileName);
  linkElement.click();

  URL.revokeObjectURL(url);

  return { success: true, fileName };
};

/**
 * Import device inventory from CSV
 */
export const importDevicesFromCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        // Parse header
        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const deviceTypeIndex = header.indexOf('devicetype');
        const quantityIndex = header.indexOf('quantity');
        const epsIndex = header.indexOf('eps');

        if (deviceTypeIndex === -1 || quantityIndex === -1) {
          reject(new Error('CSV must have DeviceType and Quantity columns'));
          return;
        }

        const devices = {};
        const errors = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const deviceType = values[deviceTypeIndex];
          const quantity = parseInt(values[quantityIndex], 10);

          if (!deviceType) {
            errors.push(`Row ${i + 1}: Missing device type`);
            continue;
          }

          if (isNaN(quantity) || quantity < 0) {
            errors.push(`Row ${i + 1}: Invalid quantity for ${deviceType}`);
            continue;
          }

          devices[deviceType] = quantity;
        }

        if (errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${errors.join(', ')}`));
          return;
        }

        resolve({
          success: true,
          devices,
          fileName: file.name,
        });
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Configuration History Management
 */
const HISTORY_KEY = 'sizeai_config_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Save configuration to history
 */
export const saveToHistory = (configuration) => {
  try {
    const history = getHistory();
    
    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name: configuration.name,
      description: configuration.description,
      configuration: configuration,
    };

    // Add to beginning of array
    history.unshift(historyItem);

    // Keep only last MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

    return { success: true, id: historyItem.id };
  } catch (error) {
    console.error('Failed to save to history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get configuration history
 */
export const getHistory = () => {
  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

/**
 * Get configuration from history by ID
 */
export const getFromHistory = (id) => {
  const history = getHistory();
  return history.find(item => item.id === id);
};

/**
 * Delete configuration from history
 */
export const deleteFromHistory = (id) => {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete from history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all history
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compare two configurations and return differences
 */
export const compareConfigurations = (config1, config2) => {
  const differences = {
    devices: [],
    configuration: [],
    summary: {
      totalChanges: 0,
      devicesChanged: 0,
      settingsChanged: 0,
    },
  };

  // Compare devices
  const allDeviceTypes = new Set([
    ...Object.keys(config1.devices || {}),
    ...Object.keys(config2.devices || {}),
  ]);

  allDeviceTypes.forEach(deviceType => {
    const val1 = config1.devices?.[deviceType] || 0;
    const val2 = config2.devices?.[deviceType] || 0;

    if (val1 !== val2) {
      differences.devices.push({
        field: deviceType,
        oldValue: val1,
        newValue: val2,
        change: val2 - val1,
        changePercent: val1 > 0 ? ((val2 - val1) / val1 * 100).toFixed(1) : 'N/A',
      });
      differences.summary.devicesChanged++;
    }
  });

  // Compare configuration settings
  const configKeys = new Set([
    ...Object.keys(config1.configuration || {}),
    ...Object.keys(config2.configuration || {}),
  ]);

  configKeys.forEach(key => {
    const val1 = config1.configuration?.[key];
    const val2 = config2.configuration?.[key];

    if (val1 !== val2) {
      differences.configuration.push({
        field: key,
        oldValue: val1,
        newValue: val2,
        type: typeof val2,
      });
      differences.summary.settingsChanged++;
    }
  });

  differences.summary.totalChanges = differences.devices.length + differences.configuration.length;

  return differences;
};
