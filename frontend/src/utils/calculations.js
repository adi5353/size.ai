/**
 * Professional Security Infrastructure Sizing Calculations
 * Based on industry-standard SIEM/XDR platform requirements
 */

/**
 * Calculate comprehensive infrastructure sizing
 */
export const calculateInfrastructure = (devices, configuration) => {
  // Calculate total EPS
  let totalEPS = 0;
  let totalDevices = 0;
  
  Object.keys(devices).forEach(deviceType => {
    const device = devices[deviceType];
    totalEPS += device.quantity * device.eps;
    totalDevices += device.quantity;
  });

  // Calculate peak EPS with 30% buffer
  const peakEPS = totalEPS * 1.3;

  // Calculate data volume
  // Formula: 1,000 EPS ≈ 8.6 GB/day
  // Daily GB = (Total EPS × 86,400) / 125,000
  const dailyGB = (totalEPS * 86400) / 125000;
  const weeklyTB = (dailyGB * 7) / 1000;
  const monthlyTB = (dailyGB * 30) / 1000;
  const yearlyTB = (dailyGB * 365) / 1000;

  // Events per day/month
  const eventsPerDay = totalEPS * 86400;
  const eventsPerMonth = eventsPerDay * 30;

  // Calculate storage requirements
  const compressionFactors = {
    'none': 1.0,
    'standard': 0.6, // 40% compression
    'high': 0.4, // 60% compression
  };
  
  const compressionFactor = compressionFactors[configuration.compressionLevel] || 0.6;
  const replicationFactor = configuration.replicationFactor || 1;
  const indexingOverhead = 1.2; // 20% overhead
  
  // Raw storage for retention period
  const rawStorageGB = dailyGB * configuration.retentionPeriod;
  
  // With compression
  const compressedStorageGB = rawStorageGB * compressionFactor;
  
  // With replication
  const replicatedStorageGB = compressedStorageGB * replicationFactor;
  
  // Final with indexing overhead
  const totalStorageGB = replicatedStorageGB * indexingOverhead;
  const totalStorageTB = totalStorageGB / 1000;

  // Hot/Cold split if enabled
  let hotStorageGB = 0;
  let coldStorageGB = 0;
  
  if (configuration.hotColdSplit) {
    const hotDays = configuration.hotStorageDays || 30;
    const coldDays = configuration.retentionPeriod - hotDays;
    
    hotStorageGB = (dailyGB * hotDays * compressionFactor * replicationFactor * indexingOverhead);
    coldStorageGB = (dailyGB * coldDays * compressionFactor * 1 * indexingOverhead); // Cold typically no replication
  }

  // Calculate infrastructure components based on device count and EPS
  const infrastructure = calculateComponentSizing(totalDevices, totalEPS);

  // Calculate growth projections if enabled
  let growthProjections = null;
  if (configuration.includeGrowth) {
    growthProjections = calculateGrowthProjections(
      totalDevices,
      totalEPS,
      dailyGB,
      totalStorageTB,
      configuration.annualGrowth,
      configuration.retentionPeriod,
      compressionFactor,
      replicationFactor,
      indexingOverhead
    );
  }

  // Calculate cost estimates
  const costs = calculateCostEstimates(infrastructure, totalStorageGB, dailyGB * 30);

  // Get architecture recommendation
  const architecture = getArchitectureRecommendation(totalDevices, totalEPS);

  // Get warnings and recommendations
  const warnings = generateWarningsAndRecommendations(totalEPS, totalDevices, configuration);

  return {
    // Event Processing
    totalEPS,
    peakEPS,
    totalDevices,
    eventsPerDay,
    eventsPerMonth,
    
    // Data Volume
    dailyGB,
    weeklyTB,
    monthlyTB,
    yearlyTB,
    
    // Storage
    rawStorageGB,
    compressedStorageGB,
    replicatedStorageGB,
    totalStorageGB,
    totalStorageTB,
    hotStorageGB: hotStorageGB / 1000, // Convert to TB
    coldStorageGB: coldStorageGB / 1000, // Convert to TB
    
    // Storage breakdown by retention
    storageByRetention: calculateStorageByRetention(dailyGB, compressionFactor, replicationFactor, indexingOverhead),
    
    // Infrastructure
    infrastructure,
    
    // Architecture
    architecture,
    
    // Growth Projections
    growthProjections,
    
    // Costs
    costs,
    
    // Warnings & Recommendations
    warnings,
  };
};

/**
 * Calculate component sizing based on devices and EPS
 */
const calculateComponentSizing = (totalDevices, totalEPS) => {
  let managementServer, dataIndexer, webConsole;

  if (totalDevices < 100) {
    managementServer = { instances: 1, cpu: 4, ram: 8, storage: 50, notes: 'Single management node' };
    dataIndexer = { instances: 1, cpu: 4, ram: 8, storage: 100, notes: 'Single indexer' };
    webConsole = { instances: 1, cpu: 2, ram: 4, storage: 20, notes: 'Lightweight dashboard' };
  } else if (totalDevices < 1000) {
    managementServer = { instances: 1, cpu: 4, ram: 8, storage: 100, notes: 'Standard management node' };
    dataIndexer = { instances: 1, cpu: 8, ram: 16, storage: 500, notes: 'Enhanced indexer' };
    webConsole = { instances: 1, cpu: 4, ram: 8, storage: 50, notes: 'Standard dashboard' };
  } else if (totalDevices < 5000) {
    managementServer = { instances: 1, cpu: 8, ram: 16, storage: 200, notes: 'High-performance management' };
    dataIndexer = { instances: 1, cpu: 8, ram: 32, storage: 1000, notes: 'Large indexer' };
    webConsole = { instances: 1, cpu: 4, ram: 8, storage: 50, notes: 'Standard dashboard' };
  } else if (totalDevices < 10000) {
    managementServer = { instances: 1, cpu: 16, ram: 32, storage: 500, notes: 'Enterprise management' };
    dataIndexer = { instances: 1, cpu: 16, ram: 64, storage: 2000, notes: 'Enterprise indexer' };
    webConsole = { instances: 1, cpu: 8, ram: 16, storage: 100, notes: 'Enhanced dashboard' };
  } else {
    // Large enterprise
    const indexerNodes = Math.max(3, Math.ceil(totalEPS / 50000));
    managementServer = { instances: 1, cpu: 32, ram: 64, storage: 1000, notes: 'Enterprise-grade management cluster' };
    dataIndexer = { instances: indexerNodes, cpu: 16, ram: 64, storage: 2000, notes: 'Distributed indexer cluster' };
    webConsole = { instances: 2, cpu: 8, ram: 16, storage: 100, notes: 'Load-balanced dashboards' };
  }

  return {
    managementServer,
    dataIndexer,
    webConsole,
    totalCPU: (managementServer.instances * managementServer.cpu) + (dataIndexer.instances * dataIndexer.cpu) + (webConsole.instances * webConsole.cpu),
    totalRAM: (managementServer.instances * managementServer.ram) + (dataIndexer.instances * dataIndexer.ram) + (webConsole.instances * webConsole.ram),
    totalStorage: (managementServer.instances * managementServer.storage) + (dataIndexer.instances * dataIndexer.storage) + (webConsole.instances * webConsole.storage),
  };
};

/**
 * Calculate storage for different retention periods
 */
const calculateStorageByRetention = (dailyGB, compressionFactor, replicationFactor, indexingOverhead) => {
  const retentionPeriods = [30, 90, 180, 365];
  
  return retentionPeriods.map(days => {
    const raw = dailyGB * days;
    const compressed = raw * compressionFactor;
    const replicated = compressed * replicationFactor;
    const total = replicated * indexingOverhead;
    
    return {
      days,
      rawGB: raw,
      compressedGB: compressed,
      replicatedGB: replicated,
      totalGB: total,
      totalTB: total / 1000,
    };
  });
};

/**
 * Calculate growth projections
 */
const calculateGrowthProjections = (
  currentDevices,
  currentEPS,
  currentDailyGB,
  currentStorageTB,
  annualGrowthRate,
  retentionDays,
  compressionFactor,
  replicationFactor,
  indexingOverhead
) => {
  const growthFactor = 1 + (annualGrowthRate / 100);
  const years = [1, 2, 3];
  
  return years.map(year => {
    const projectedDevices = Math.round(currentDevices * Math.pow(growthFactor, year));
    const projectedEPS = Math.round(currentEPS * Math.pow(growthFactor, year));
    const projectedDailyGB = currentDailyGB * Math.pow(growthFactor, year);
    const projectedRawStorage = projectedDailyGB * retentionDays;
    const projectedStorage = (projectedRawStorage * compressionFactor * replicationFactor * indexingOverhead) / 1000;
    
    return {
      year,
      devices: projectedDevices,
      eps: projectedEPS,
      dailyGB: projectedDailyGB,
      storageTB: projectedStorage,
    };
  });
};

/**
 * Calculate cost estimates
 */
const calculateCostEstimates = (infrastructure, storageGB, monthlyDataGB) => {
  // VM/Hardware costs ($0.05 per vCPU per hour × 730 hours)
  const hardwareCostMonthly = infrastructure.totalCPU * 0.05 * 730;
  
  // Storage costs ($0.10 per GB per month)
  const storageCostMonthly = storageGB * 0.10;
  
  // Network costs ($50 base + $0.01 per GB)
  const networkCostMonthly = 50 + (monthlyDataGB * 0.01);
  
  const totalMonthly = hardwareCostMonthly + storageCostMonthly + networkCostMonthly;
  const totalAnnual = totalMonthly * 12;
  
  return {
    hardwareMonthly: hardwareCostMonthly,
    storageMonthly: storageCostMonthly,
    networkMonthly: networkCostMonthly,
    totalMonthly,
    totalAnnual,
  };
};

/**
 * Get architecture recommendation
 */
const getArchitectureRecommendation = (totalDevices, totalEPS) => {
  if (totalDevices < 100) {
    return {
      type: 'Single Node',
      description: 'All-in-one deployment suitable for small environments',
      deployment: 'Single server running all components (Management, Indexing, Dashboard)',
      ha: 'No high availability - suitable for non-critical environments',
      scaling: 'Vertical scaling (add more resources to single node)',
    };
  } else if (totalDevices < 1000) {
    return {
      type: 'Small Cluster',
      description: 'Basic distributed deployment for small to medium organizations',
      deployment: '2-3 servers: Dedicated management server, combined indexer/dashboard',
      ha: 'Basic redundancy with backup server',
      scaling: 'Add additional indexer as needed',
    };
  } else if (totalDevices < 5000) {
    return {
      type: 'Medium Cluster',
      description: 'Fully distributed architecture for medium enterprises',
      deployment: '3-5 servers: Separate management, indexing, and dashboard layers',
      ha: 'Active-passive management, load-balanced dashboards',
      scaling: 'Horizontal scaling of indexer and dashboard tiers',
    };
  } else if (totalDevices < 10000) {
    return {
      type: 'Large Cluster',
      description: 'Enterprise-grade distributed deployment',
      deployment: '5-10 servers: Clustered management, multiple indexers, load-balanced dashboards',
      ha: 'Full HA across all layers with automated failover',
      scaling: 'Horizontal scaling with auto-scaling capabilities',
    };
  } else {
    return {
      type: 'Enterprise Cluster',
      description: 'Highly scalable multi-tier architecture for large enterprises',
      deployment: '10+ servers: Management cluster, indexer cluster (3+ nodes), dashboard cluster',
      ha: 'Full HA with geographic distribution and disaster recovery',
      scaling: 'Elastic horizontal scaling with automated capacity management',
    };
  }
};

/**
 * Generate warnings and recommendations
 */
const generateWarningsAndRecommendations = (totalEPS, totalDevices, configuration) => {
  const warnings = [];
  const recommendations = [];
  const optimizations = [];
  const compliance = [];

  // EPS warnings
  if (totalEPS > 50000) {
    warnings.push({
      type: 'warning',
      title: 'High EPS Volume',
      message: `Your environment generates ${totalEPS.toLocaleString()} EPS, which requires enterprise-grade infrastructure. Consider distributed architecture and performance tuning.`,
    });
  }

  if (totalEPS === 0) {
    warnings.push({
      type: 'error',
      title: 'No Devices Configured',
      message: 'Please add at least one device type to calculate infrastructure requirements.',
    });
  }

  // Device count warnings
  if (totalDevices > 100000) {
    warnings.push({
      type: 'warning',
      title: 'Very Large Deployment',
      message: 'This is an exceptionally large deployment. We strongly recommend consulting with vendor professional services.',
    });
  }

  // Optimal sizing
  if (totalEPS > 1000 && totalEPS < 50000 && totalDevices > 100) {
    recommendations.push({
      type: 'success',
      title: 'Optimal Sizing',
      message: 'Your environment is well-suited for a standard cluster deployment with good scalability options.',
    });
  }

  // Optimization suggestions
  if (configuration.replicationFactor === 1) {
    optimizations.push({
      type: 'info',
      title: 'Consider Replication',
      message: 'No replication configured. For production environments, 2x or 3x replication is recommended for data durability.',
    });
  }

  if (configuration.compressionLevel === 'none') {
    optimizations.push({
      type: 'info',
      title: 'Enable Compression',
      message: 'Compression can reduce storage costs by 40-60% with minimal performance impact.',
    });
  }

  if (!configuration.hotColdSplit && configuration.retentionPeriod > 90) {
    optimizations.push({
      type: 'info',
      title: 'Hot/Cold Storage Split',
      message: 'For long retention periods, consider hot/cold storage tiering to optimize costs.',
    });
  }

  // Compliance notes
  const complianceMessages = {
    'pci-dss': {
      type: 'compliance',
      title: 'PCI-DSS Compliance',
      message: '90-day retention configured (PCI-DSS minimum). Ensure audit logging and secure log transmission are enabled.',
    },
    'hipaa': {
      type: 'compliance',
      title: 'HIPAA Compliance',
      message: '365-day retention configured. Note: HIPAA may require up to 6 years for certain audit logs.',
    },
    'gdpr': {
      type: 'compliance',
      title: 'GDPR Compliance',
      message: '180-day retention configured. Ensure data minimization and right-to-deletion processes are in place.',
    },
    'soc2': {
      type: 'compliance',
      title: 'SOC 2 Compliance',
      message: '365-day retention configured (typical for SOC 2 audits). Ensure immutable logging and access controls.',
    },
  };

  if (configuration.complianceTemplate && complianceMessages[configuration.complianceTemplate]) {
    compliance.push(complianceMessages[configuration.complianceTemplate]);
  }

  // Performance considerations
  if (totalEPS > 20000) {
    recommendations.push({
      type: 'info',
      title: 'Performance Considerations',
      message: 'At this EPS rate, ensure 10GbE network connectivity and SSD/NVMe storage for optimal performance.',
    });
  }

  return {
    warnings,
    recommendations,
    optimizations,
    compliance,
    all: [...warnings, ...recommendations, ...optimizations, ...compliance],
  };
};
