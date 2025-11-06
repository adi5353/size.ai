/**
 * SIEM Vendor Pricing Models and Feature Comparison
 * Updated for 2025 pricing estimates
 */

export const SIEM_VENDORS = {
  SPLUNK: {
    id: 'SPLUNK',
    name: 'Splunk Enterprise Security',
    vendor: 'Splunk Inc.',
    type: 'Commercial',
    pricingModel: 'GB per day ingestion',
    
    pricing: {
      basePrice: 150, // USD per GB per day
      setupFee: 50000, // One-time setup
      professionalServices: 25000, // Implementation
      annualSupport: 0.20, // 20% of license cost
      
      // Tiered pricing
      tiers: [
        { minGB: 0, maxGB: 100, pricePerGB: 150 },
        { minGB: 100, maxGB: 500, pricePerGB: 135 },
        { minGB: 500, maxGB: 1000, pricePerGB: 120 },
        { minGB: 1000, maxGB: 999999, pricePerGB: 100 },
      ],
    },
    
    features: {
      eventCorrelation: 'Advanced',
      threatIntelligence: 'Premium (ES+)',
      userBehaviorAnalytics: 'Yes (UBA)',
      incidentResponse: 'Advanced (SOAR)',
      dataVisualization: 'Excellent',
      apiIntegrations: '2000+ apps',
      customDashboards: 'Unlimited',
      alerting: 'Advanced',
      compliance: 'Extensive',
      cloudNative: 'Yes (Cloud)',
      onPremise: 'Yes',
      scalability: 'Enterprise',
      support: '24/7 Premium',
      machineLearning: 'Advanced ML',
      forensics: 'Advanced',
    },
    
    pros: [
      'Industry-leading search and analytics',
      'Massive app ecosystem',
      'Excellent scalability',
      'Advanced threat detection',
      'Mature product with proven track record',
    ],
    
    cons: [
      'Highest cost in the market',
      'Complex licensing model',
      'Resource-intensive',
      'Steep learning curve',
      'Can be overkill for small organizations',
    ],
    
    idealFor: ['Enterprise', 'Large organizations', 'Complex environments', 'Security operations centers'],
    
    additionalCosts: {
      hardware: 'High (self-hosted) or included (cloud)',
      training: '$3,000-5,000 per person',
      consultants: '$200-350/hour',
    },
  },

  ELASTIC: {
    id: 'ELASTIC',
    name: 'Elastic Security (ELK Stack)',
    vendor: 'Elastic',
    type: 'Open Source / Commercial',
    pricingModel: 'Subscription tiers',
    
    pricing: {
      // Open source is free, but Enterprise has costs
      openSourceCost: 0,
      basicTier: 0, // Free
      goldTier: 95, // USD per host per month
      platinumTier: 175, // USD per host per month
      enterpriseTier: 250, // USD per host per month
      setupFee: 15000,
      professionalServices: 15000,
      
      // Cloud pricing (per GB stored per month)
      cloudPricing: {
        hotStorage: 0.15, // per GB per month
        warmStorage: 0.05,
        coldStorage: 0.02,
      },
    },
    
    features: {
      eventCorrelation: 'Good',
      threatIntelligence: 'Basic (Gold+)',
      userBehaviorAnalytics: 'Limited (ML)',
      incidentResponse: 'Moderate (Cases)',
      dataVisualization: 'Excellent (Kibana)',
      apiIntegrations: 'Extensive',
      customDashboards: 'Unlimited',
      alerting: 'Good',
      compliance: 'Moderate',
      cloudNative: 'Yes',
      onPremise: 'Yes',
      scalability: 'Enterprise',
      support: 'Community/Paid',
      machineLearning: 'Yes (Platinum+)',
      forensics: 'Moderate',
    },
    
    pros: [
      'Open source option available',
      'Flexible and customizable',
      'Excellent for log analytics',
      'Strong community support',
      'Cost-effective for large datasets',
    ],
    
    cons: [
      'Requires technical expertise',
      'Manual configuration needed',
      'Security features not as mature',
      'Support can be limited (open source)',
      'Resource management complexity',
    ],
    
    idealFor: ['Tech-savvy teams', 'Cost-conscious organizations', 'Custom requirements', 'DevOps teams'],
    
    additionalCosts: {
      hardware: 'Moderate (self-hosted)',
      training: '$2,000-4,000 per person',
      consultants: '$150-250/hour',
    },
  },

  AZURE_SENTINEL: {
    id: 'AZURE_SENTINEL',
    name: 'Microsoft Azure Sentinel',
    vendor: 'Microsoft',
    type: 'Cloud-Native SaaS',
    pricingModel: 'Consumption-based (GB ingested)',
    
    pricing: {
      payAsYouGo: 2.76, // USD per GB ingested
      commitment100GB: 2.30, // per GB with 100GB/day commitment
      commitment200GB: 2.07, // per GB with 200GB/day commitment
      commitment1TB: 1.84, // per GB with 1TB/day commitment
      
      dataRetention: {
        first90Days: 0, // Free
        after90Days: 0.12, // per GB per month
      },
      
      setupFee: 0, // No setup fee
      professionalServices: 20000, // Optional implementation
    },
    
    features: {
      eventCorrelation: 'Advanced (Fusion)',
      threatIntelligence: 'Excellent (MS Threat Intel)',
      userBehaviorAnalytics: 'Yes (Built-in)',
      incidentResponse: 'Advanced (Automation)',
      dataVisualization: 'Good (Azure)',
      apiIntegrations: 'Excellent (Azure ecosystem)',
      customDashboards: 'Yes (Workbooks)',
      alerting: 'Advanced',
      compliance: 'Extensive',
      cloudNative: 'Yes (Azure-only)',
      onPremise: 'No',
      scalability: 'Unlimited (Cloud)',
      support: '24/7 Microsoft',
      machineLearning: 'Advanced (Azure ML)',
      forensics: 'Good',
    },
    
    pros: [
      'Seamless Azure integration',
      'No infrastructure management',
      'Built-in threat intelligence',
      'AI/ML powered detection',
      'Consumption-based pricing',
    ],
    
    cons: [
      'Azure-centric (less multi-cloud)',
      'Cost can escalate with data volume',
      'Limited on-premise option',
      'Learning curve for non-Azure users',
      'Vendor lock-in',
    ],
    
    idealFor: ['Azure customers', 'Cloud-first organizations', 'Enterprises', 'Multi-tenant scenarios'],
    
    additionalCosts: {
      hardware: 'N/A (Cloud)',
      training: '$2,500-4,500 per person',
      consultants: '$175-300/hour',
    },
  },

  WAZUH: {
    id: 'WAZUH',
    name: 'Wazuh (Open Source)',
    vendor: 'Wazuh Inc.',
    type: 'Open Source',
    pricingModel: 'Infrastructure costs only',
    
    pricing: {
      licenseCost: 0, // Free and open source
      setupFee: 0,
      professionalServices: 10000, // Optional
      
      // Only infrastructure costs
      infrastructureCosts: {
        manager: 500, // per month
        indexer: 800, // per month
        dashboard: 300, // per month
      },
      
      // Cloud option
      cloudHosting: 1200, // per month (estimated)
    },
    
    features: {
      eventCorrelation: 'Good',
      threatIntelligence: 'Moderate (Feeds)',
      userBehaviorAnalytics: 'Limited',
      incidentResponse: 'Basic',
      dataVisualization: 'Good (OpenSearch)',
      apiIntegrations: 'Good',
      customDashboards: 'Yes',
      alerting: 'Good',
      compliance: 'Excellent (PCI, HIPAA, GDPR)',
      cloudNative: 'Yes',
      onPremise: 'Yes',
      scalability: 'Good',
      support: 'Community',
      machineLearning: 'Limited',
      forensics: 'Moderate',
    },
    
    pros: [
      'Completely free and open source',
      'Strong compliance focus',
      'Active community',
      'Flexible deployment',
      'Low total cost of ownership',
    ],
    
    cons: [
      'Limited enterprise features',
      'Community support only',
      'Requires technical expertise',
      'Manual configuration',
      'Less mature than commercial options',
    ],
    
    idealFor: ['Budget-conscious organizations', 'SMBs', 'Security researchers', 'Self-managed teams'],
    
    additionalCosts: {
      hardware: 'Low-Moderate (self-hosted)',
      training: '$1,000-2,000 per person',
      consultants: '$100-175/hour',
    },
  },

  DATADOG: {
    id: 'DATADOG',
    name: 'Datadog Security Monitoring',
    vendor: 'Datadog',
    type: 'Cloud SaaS',
    pricingModel: 'Per host + ingestion',
    
    pricing: {
      proTier: 31, // USD per host per month
      enterpriseTier: 'Custom',
      logIngestion: 0.10, // per GB ingested
      logRetention15Days: 0.0275, // per million log events
      logRetention30Days: 0.055,
      
      setupFee: 5000,
      professionalServices: 15000,
    },
    
    features: {
      eventCorrelation: 'Good',
      threatIntelligence: 'Good',
      userBehaviorAnalytics: 'Limited',
      incidentResponse: 'Moderate',
      dataVisualization: 'Excellent',
      apiIntegrations: '500+ integrations',
      customDashboards: 'Unlimited',
      alerting: 'Advanced',
      compliance: 'Moderate',
      cloudNative: 'Yes',
      onPremise: 'No',
      scalability: 'Excellent',
      support: '24/7',
      machineLearning: 'Yes (Anomaly Detection)',
      forensics: 'Good',
    },
    
    pros: [
      'Unified observability platform',
      'Real-time analytics',
      'Easy to use',
      'Cloud-native architecture',
      'Strong APM integration',
    ],
    
    cons: [
      'Cost can add up with scale',
      'Less focused on pure SIEM',
      'Limited compliance features',
      'Cloud-only',
      'Better for DevOps than SecOps',
    ],
    
    idealFor: ['DevOps teams', 'Cloud-native apps', 'Hybrid monitoring', 'Fast-growing companies'],
    
    additionalCosts: {
      hardware: 'N/A (Cloud)',
      training: '$1,500-3,000 per person',
      consultants: '$150-250/hour',
    },
  },

  CROWDSTRIKE: {
    id: 'CROWDSTRIKE',
    name: 'CrowdStrike Falcon',
    vendor: 'CrowdStrike',
    type: 'Cloud-Native EDR/XDR',
    pricingModel: 'Per endpoint',
    
    pricing: {
      falconPro: 8.99, // per endpoint per month
      falconEnterprise: 15.99,
      falconPremium: 22.99,
      falconComplete: 29.99,
      
      logScale: 1.50, // per GB ingested (add-on)
      
      setupFee: 10000,
      professionalServices: 20000,
    },
    
    features: {
      eventCorrelation: 'Advanced',
      threatIntelligence: 'Excellent (CrowdStrike Intel)',
      userBehaviorAnalytics: 'Yes (Identity Protection)',
      incidentResponse: 'Advanced (Forensics)',
      dataVisualization: 'Good',
      apiIntegrations: 'Good',
      customDashboards: 'Yes',
      alerting: 'Advanced',
      compliance: 'Good',
      cloudNative: 'Yes',
      onPremise: 'No',
      scalability: 'Excellent',
      support: '24/7 Premium',
      machineLearning: 'Advanced (Behavioral AI)',
      forensics: 'Excellent',
    },
    
    pros: [
      'Best-in-class endpoint protection',
      'Lightweight agent',
      'Real-time threat intelligence',
      'No infrastructure required',
      'Rapid deployment',
    ],
    
    cons: [
      'Endpoint-focused (not full SIEM)',
      'Can be expensive at scale',
      'Less log management',
      'Cloud-only',
      'Limited log retention',
    ],
    
    idealFor: ['Endpoint security focus', 'Fast deployment needs', 'Threat hunting teams', 'Zero-trust architecture'],
    
    additionalCosts: {
      hardware: 'N/A (Cloud)',
      training: '$2,000-4,000 per person',
      consultants: '$175-300/hour',
    },
  },
};

/**
 * Calculate vendor costs based on infrastructure requirements
 */
export const calculateVendorCost = (vendor, requirements) => {
  const { dailyDataGB, totalDevices, retentionDays, peakEPS } = requirements;
  const vendorData = SIEM_VENDORS[vendor];
  
  if (!vendorData) return null;
  
  let monthlyCost = 0;
  let setupCost = vendorData.pricing.setupFee || 0;
  let implementationCost = vendorData.pricing.professionalServices || 0;
  
  switch (vendor) {
    case 'SPLUNK':
      // Calculate based on tiered GB pricing
      const tier = vendorData.pricing.tiers.find(
        t => dailyDataGB >= t.minGB && dailyDataGB < t.maxGB
      );
      const dailyCost = dailyDataGB * (tier?.pricePerGB || 150);
      monthlyCost = dailyCost * 30;
      
      // Add support (20% annually)
      const annualLicense = dailyCost * 365;
      monthlyCost += (annualLicense * vendorData.pricing.annualSupport) / 12;
      break;
      
    case 'ELASTIC':
      // Assuming Platinum tier for enterprise features
      const hostsNeeded = Math.ceil(totalDevices / 100); // Rough estimate
      monthlyCost = hostsNeeded * vendorData.pricing.platinumTier;
      
      // Add cloud storage costs
      const monthlyDataTB = (dailyDataGB * 30) / 1000;
      monthlyCost += monthlyDataTB * 1000 * vendorData.pricing.cloudPricing.hotStorage;
      break;
      
    case 'AZURE_SENTINEL':
      // Consumption-based
      const monthlyGB = dailyDataGB * 30;
      let pricePerGB = vendorData.pricing.payAsYouGo;
      
      // Apply commitment discount if applicable
      if (dailyDataGB >= 1000) {
        pricePerGB = vendorData.pricing.commitment1TB;
      } else if (dailyDataGB >= 200) {
        pricePerGB = vendorData.pricing.commitment200GB;
      } else if (dailyDataGB >= 100) {
        pricePerGB = vendorData.pricing.commitment100GB;
      }
      
      monthlyCost = monthlyGB * pricePerGB;
      
      // Add data retention cost (after 90 days)
      if (retentionDays > 90) {
        const retentionGB = monthlyGB * ((retentionDays - 90) / 30);
        monthlyCost += retentionGB * vendorData.pricing.dataRetention.after90Days;
      }
      break;
      
    case 'WAZUH':
      // Only infrastructure costs
      monthlyCost = vendorData.pricing.cloudHosting;
      setupCost = 0; // Free software
      break;
      
    case 'DATADOG':
      // Per host + ingestion
      const hosts = Math.ceil(totalDevices / 50); // Rough estimate
      monthlyCost = hosts * vendorData.pricing.proTier;
      
      // Add log ingestion
      const monthlyIngestionGB = dailyDataGB * 30;
      monthlyCost += monthlyIngestionGB * vendorData.pricing.logIngestion;
      break;
      
    case 'CROWDSTRIKE':
      // Per endpoint (Complete tier for full protection)
      monthlyCost = totalDevices * vendorData.pricing.falconComplete;
      
      // Add LogScale if using SIEM features
      const logScaleGB = dailyDataGB * 30;
      monthlyCost += logScaleGB * vendorData.pricing.logScale;
      break;
  }
  
  const annualCost = monthlyCost * 12;
  const threeYearTCO = (annualCost * 3) + setupCost + implementationCost;
  
  return {
    vendor: vendorData.name,
    vendorId: vendor,
    monthlyCost: Math.round(monthlyCost),
    annualCost: Math.round(annualCost),
    setupCost,
    implementationCost,
    threeYearTCO: Math.round(threeYearTCO),
    costPerGB: Math.round(monthlyCost / (dailyDataGB * 30)),
    costPerDevice: Math.round(monthlyCost / totalDevices),
  };
};

/**
 * Get all vendor comparisons
 */
export const getAllVendorComparisons = (requirements) => {
  return Object.keys(SIEM_VENDORS).map(vendorId => 
    calculateVendorCost(vendorId, requirements)
  ).filter(Boolean).sort((a, b) => a.monthlyCost - b.monthlyCost);
};
