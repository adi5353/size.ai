/**
 * Pre-built SIEM Deployment Scenario Templates
 * Real-world scenarios for common use cases
 */

export const SCENARIO_TEMPLATES = {
  FORTUNE_500: {
    id: 'FORTUNE_500',
    name: 'Fortune 500 Enterprise',
    category: 'Enterprise',
    description: '10,000+ devices, multi-region deployment with high availability',
    icon: '🏢',
    
    devices: {
      workstations: { quantity: 8000, eps: 2 },
      servers: { quantity: 1500, eps: 10 },
      mobileDevices: { quantity: 3000, eps: 1 },
      virtualMachines: { quantity: 2000, eps: 5 },
      routers: { quantity: 200, eps: 300 },
      firewalls: { quantity: 100, eps: 500 },
      loadBalancers: { quantity: 50, eps: 200 },
      wirelessAP: { quantity: 500, eps: 50 },
      ids: { quantity: 50, eps: 1000 },
      proxies: { quantity: 40, eps: 800 },
      dlp: { quantity: 30, eps: 600 },
      emailGateway: { quantity: 20, eps: 400 },
      cloudApps: { quantity: 100, eps: 100 },
      containers: { quantity: 5000, eps: 3 },
      apiGateways: { quantity: 50, eps: 150 },
      databases: { quantity: 200, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 180,
      complianceTemplate: 'SOC2',
      includeGrowth: true,
      annualGrowth: 15,
      replicationFactor: 3,
      compressionLevel: 'high',
      hotColdSplit: true,
      hotStorageDays: 60,
      highAvailability: true,
      encryption: true,
    },
    
    architecture: {
      type: 'Distributed Multi-Region',
      regions: ['US-East', 'US-West', 'EU-Central'],
      recommendedComponents: [
        'Load balancer for multi-region traffic distribution',
        'Dedicated search head cluster (6+ nodes)',
        'Index cluster with replication (12+ indexers)',
        'Hot-warm-cold architecture for cost optimization',
        'Dedicated forwarders at each site',
        'Global search federation',
      ],
    },
    
    risks: [
      'High data volume requires significant storage investment',
      'Multi-region latency considerations',
      'Complex disaster recovery procedures',
      'Compliance data sovereignty requirements',
    ],
    
    estimatedCosts: {
      hardware: 150000,
      storage: 80000,
      network: 20000,
      licenses: 200000,
      support: 50000,
    },
  },

  MSP_CLOUD: {
    id: 'MSP_CLOUD',
    name: 'MSP/Cloud Provider',
    category: 'Service Provider',
    description: 'Multi-tenant environment with dynamic scaling',
    icon: '☁️',
    
    devices: {
      workstations: { quantity: 2000, eps: 2 },
      servers: { quantity: 500, eps: 10 },
      mobileDevices: { quantity: 1000, eps: 1 },
      virtualMachines: { quantity: 3000, eps: 5 },
      routers: { quantity: 100, eps: 300 },
      firewalls: { quantity: 80, eps: 500 },
      loadBalancers: { quantity: 60, eps: 200 },
      wirelessAP: { quantity: 200, eps: 50 },
      ids: { quantity: 40, eps: 1000 },
      proxies: { quantity: 50, eps: 800 },
      dlp: { quantity: 30, eps: 600 },
      emailGateway: { quantity: 40, eps: 400 },
      cloudApps: { quantity: 500, eps: 100 },
      containers: { quantity: 10000, eps: 3 },
      apiGateways: { quantity: 100, eps: 150 },
      databases: { quantity: 300, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 90,
      complianceTemplate: 'SOC2',
      includeGrowth: true,
      annualGrowth: 30,
      replicationFactor: 2,
      compressionLevel: 'high',
      hotColdSplit: true,
      hotStorageDays: 30,
      highAvailability: true,
      encryption: true,
    },
    
    architecture: {
      type: 'Multi-Tenant Cloud-Native',
      regions: ['Multi-Cloud (AWS, Azure, GCP)'],
      recommendedComponents: [
        'Kubernetes-based deployment for auto-scaling',
        'Tenant isolation with dedicated indexes',
        'Cloud-native load balancing (ALB/NLB)',
        'Object storage for cold tier (S3/Blob)',
        'Centralized log aggregation',
        'API-first architecture for integrations',
      ],
    },
    
    risks: [
      'Tenant data isolation complexity',
      'Variable load requires dynamic scaling',
      'Multi-cloud data transfer costs',
      'Complex billing and metering requirements',
    ],
    
    estimatedCosts: {
      hardware: 0, // Cloud-native
      storage: 40000,
      network: 30000,
      licenses: 80000,
      support: 20000,
    },
  },

  CLOUD_STARTUP: {
    id: 'CLOUD_STARTUP',
    name: 'Cloud-Native Startup',
    category: 'Startup',
    description: 'AWS/Azure/GCP, containers, serverless architecture',
    icon: '🚀',
    
    devices: {
      workstations: { quantity: 200, eps: 2 },
      servers: { quantity: 50, eps: 10 },
      mobileDevices: { quantity: 100, eps: 1 },
      virtualMachines: { quantity: 100, eps: 5 },
      routers: { quantity: 10, eps: 300 },
      firewalls: { quantity: 5, eps: 500 },
      loadBalancers: { quantity: 10, eps: 200 },
      wirelessAP: { quantity: 20, eps: 50 },
      ids: { quantity: 5, eps: 1000 },
      proxies: { quantity: 5, eps: 800 },
      dlp: { quantity: 2, eps: 600 },
      emailGateway: { quantity: 2, eps: 400 },
      cloudApps: { quantity: 50, eps: 100 },
      containers: { quantity: 2000, eps: 3 },
      apiGateways: { quantity: 20, eps: 150 },
      databases: { quantity: 30, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 60,
      complianceTemplate: 'NONE',
      includeGrowth: true,
      annualGrowth: 50,
      replicationFactor: 2,
      compressionLevel: 'standard',
      hotColdSplit: true,
      hotStorageDays: 30,
      highAvailability: false,
      encryption: true,
    },
    
    architecture: {
      type: 'Cloud-Native Serverless',
      regions: ['Single Cloud Region (US-East-1)'],
      recommendedComponents: [
        'Managed SIEM service (Azure Sentinel/AWS SecurityHub)',
        'Serverless log forwarders (Lambda/Functions)',
        'Cloud-native storage (S3/Blob)',
        'API Gateway for integrations',
        'CloudWatch/Azure Monitor integration',
        'Cost-optimized with auto-scaling',
      ],
    },
    
    risks: [
      'Rapid growth may outpace budget',
      'Vendor lock-in with cloud-native services',
      'Limited customization with managed services',
      'Cost unpredictability with serverless',
    ],
    
    estimatedCosts: {
      hardware: 0,
      storage: 5000,
      network: 3000,
      licenses: 15000,
      support: 5000,
    },
  },

  FINANCE: {
    id: 'FINANCE',
    name: 'Regulated Industry - Finance',
    category: 'Finance',
    description: 'PCI-DSS compliance, 90+ day retention, high security',
    icon: '🏦',
    
    devices: {
      workstations: { quantity: 3000, eps: 2 },
      servers: { quantity: 500, eps: 10 },
      mobileDevices: { quantity: 1000, eps: 1 },
      virtualMachines: { quantity: 800, eps: 5 },
      routers: { quantity: 80, eps: 300 },
      firewalls: { quantity: 60, eps: 500 },
      loadBalancers: { quantity: 40, eps: 200 },
      wirelessAP: { quantity: 150, eps: 50 },
      ids: { quantity: 30, eps: 1000 },
      proxies: { quantity: 40, eps: 800 },
      dlp: { quantity: 25, eps: 600 },
      emailGateway: { quantity: 15, eps: 400 },
      cloudApps: { quantity: 80, eps: 100 },
      containers: { quantity: 1000, eps: 3 },
      apiGateways: { quantity: 40, eps: 150 },
      databases: { quantity: 150, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 365,
      complianceTemplate: 'PCI_DSS',
      includeGrowth: true,
      annualGrowth: 10,
      replicationFactor: 3,
      compressionLevel: 'standard',
      hotColdSplit: true,
      hotStorageDays: 90,
      highAvailability: true,
      encryption: true,
    },
    
    architecture: {
      type: 'Highly Secure Segmented',
      regions: ['On-Premises Primary', 'Cloud DR'],
      recommendedComponents: [
        'Network segmentation (CDE isolation)',
        'Encrypted storage volumes (FIPS 140-2)',
        'Dedicated audit logging infrastructure',
        'Real-time alerting for compliance violations',
        'Quarterly vulnerability scanning',
        'Annual penetration testing capability',
      ],
    },
    
    risks: [
      'Strict audit requirements increase overhead',
      'Quarterly PCI-DSS assessments required',
      'High cost of compliance maintenance',
      'Limited flexibility due to regulations',
    ],
    
    estimatedCosts: {
      hardware: 80000,
      storage: 50000,
      network: 15000,
      licenses: 120000,
      support: 40000,
    },
  },

  HEALTHCARE: {
    id: 'HEALTHCARE',
    name: 'Regulated Industry - Healthcare',
    category: 'Healthcare',
    description: 'HIPAA compliance, encryption, 365-day retention',
    icon: '🏥',
    
    devices: {
      workstations: { quantity: 2000, eps: 2 },
      servers: { quantity: 400, eps: 10 },
      mobileDevices: { quantity: 800, eps: 1 },
      virtualMachines: { quantity: 600, eps: 5 },
      routers: { quantity: 60, eps: 300 },
      firewalls: { quantity: 50, eps: 500 },
      loadBalancers: { quantity: 30, eps: 200 },
      wirelessAP: { quantity: 200, eps: 50 },
      ids: { quantity: 25, eps: 1000 },
      proxies: { quantity: 30, eps: 800 },
      dlp: { quantity: 20, eps: 600 },
      emailGateway: { quantity: 15, eps: 400 },
      cloudApps: { quantity: 60, eps: 100 },
      containers: { quantity: 500, eps: 3 },
      apiGateways: { quantity: 30, eps: 150 },
      databases: { quantity: 100, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 365,
      complianceTemplate: 'HIPAA',
      includeGrowth: true,
      annualGrowth: 12,
      replicationFactor: 3,
      compressionLevel: 'standard',
      hotColdSplit: true,
      hotStorageDays: 90,
      highAvailability: true,
      encryption: true,
    },
    
    architecture: {
      type: 'HIPAA-Compliant Secure',
      regions: ['US-Only (Data Sovereignty)'],
      recommendedComponents: [
        'PHI data encryption (AES-256)',
        'BAA-compliant cloud services only',
        'Comprehensive audit logging (6-year retention)',
        'Access control with MFA',
        'Breach detection and notification',
        'Regular security risk assessments',
      ],
    },
    
    risks: [
      'Breach notification requirements (strict timelines)',
      'High penalties for non-compliance',
      'Complex access control requirements',
      'Extended audit log retention (6 years)',
    ],
    
    estimatedCosts: {
      hardware: 70000,
      storage: 45000,
      network: 12000,
      licenses: 100000,
      support: 35000,
    },
  },

  MANUFACTURING: {
    id: 'MANUFACTURING',
    name: 'Manufacturing & IoT',
    category: 'Industrial',
    description: 'IoT sensors, critical infrastructure, air-gapped networks',
    icon: '🏭',
    
    devices: {
      workstations: { quantity: 1000, eps: 2 },
      servers: { quantity: 200, eps: 10 },
      mobileDevices: { quantity: 300, eps: 1 },
      virtualMachines: { quantity: 400, eps: 5 },
      routers: { quantity: 100, eps: 300 },
      firewalls: { quantity: 40, eps: 500 },
      loadBalancers: { quantity: 20, eps: 200 },
      wirelessAP: { quantity: 150, eps: 50 },
      ids: { quantity: 30, eps: 1000 },
      proxies: { quantity: 20, eps: 800 },
      dlp: { quantity: 10, eps: 600 },
      emailGateway: { quantity: 10, eps: 400 },
      cloudApps: { quantity: 30, eps: 100 },
      containers: { quantity: 200, eps: 3 },
      apiGateways: { quantity: 15, eps: 150 },
      databases: { quantity: 80, eps: 200 },
    },
    
    configuration: {
      retentionPeriod: 180,
      complianceTemplate: 'NONE',
      includeGrowth: true,
      annualGrowth: 8,
      replicationFactor: 2,
      compressionLevel: 'high',
      hotColdSplit: true,
      hotStorageDays: 60,
      highAvailability: true,
      encryption: true,
    },
    
    architecture: {
      type: 'Hybrid Air-Gapped + Cloud',
      regions: ['On-Premises (Air-Gapped)', 'Cloud (Corporate)'],
      recommendedComponents: [
        'Air-gapped SIEM for OT network',
        'One-way data diodes for log export',
        'Separate IT and OT security zones',
        'Industrial protocol parsers (Modbus, DNP3)',
        'Real-time anomaly detection for ICS',
        'Incident response for critical infrastructure',
      ],
    },
    
    risks: [
      'OT/ICS systems difficult to patch',
      'Limited security tools for industrial protocols',
      'Downtime risks with production systems',
      'Air-gap complexity for centralized monitoring',
    ],
    
    estimatedCosts: {
      hardware: 60000,
      storage: 30000,
      network: 8000,
      licenses: 70000,
      support: 25000,
    },
  },
};

/**
 * Get all scenario templates
 */
export const getAllScenarios = () => {
  return Object.values(SCENARIO_TEMPLATES);
};

/**
 * Get scenario by ID
 */
export const getScenarioById = (id) => {
  return SCENARIO_TEMPLATES[id];
};

/**
 * Get scenarios by category
 */
export const getScenariosByCategory = (category) => {
  return getAllScenarios().filter(scenario => scenario.category === category);
};

/**
 * Get all categories
 */
export const getCategories = () => {
  const categories = new Set(getAllScenarios().map(s => s.category));
  return Array.from(categories);
};
