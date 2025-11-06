/**
 * Compliance Templates for SIEM/XDR Infrastructure Sizing
 * Regional and industry-specific compliance requirements
 */

export const COMPLIANCE_TEMPLATES = {
  GDPR: {
    id: 'GDPR',
    name: 'GDPR (General Data Protection Regulation)',
    region: 'European Union',
    description: 'EU data protection and privacy regulation',
    requirements: {
      minRetentionDays: 180,
      maxRetentionDays: 365,
      defaultRetentionDays: 180,
      encryptionRequired: true,
      dataLocalityRequired: true,
      rightToErasure: true,
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 30,
      coldStorageDays: 150,
      compressionRatio: 10,
      replicationFactor: 2,
      highAvailability: true,
    },
    warnings: [
      'Data must be stored within EU boundaries or equivalent protection',
      'Implement data encryption at rest and in transit',
      'Enable audit logging for all data access',
      'Implement automated data retention policies',
    ],
    industryStandards: ['ISO 27001', 'ISO 27018'],
  },
  
  CCPA: {
    id: 'CCPA',
    name: 'CCPA (California Consumer Privacy Act)',
    region: 'California, USA',
    description: 'California consumer data privacy law',
    requirements: {
      minRetentionDays: 180,
      maxRetentionDays: 365,
      defaultRetentionDays: 180,
      encryptionRequired: true,
      dataLocalityRequired: false,
      rightToErasure: true,
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 30,
      coldStorageDays: 150,
      compressionRatio: 10,
      replicationFactor: 2,
      highAvailability: true,
    },
    warnings: [
      'Consumers have right to know what data is collected',
      'Implement mechanisms for data deletion requests',
      'Enable opt-out functionality for data sales',
      'Maintain detailed data processing records',
    ],
    industryStandards: ['NIST Cybersecurity Framework'],
  },
  
  PIPEDA: {
    id: 'PIPEDA',
    name: 'PIPEDA (Personal Information Protection)',
    region: 'Canada',
    description: 'Canadian privacy law for private sector',
    requirements: {
      minRetentionDays: 365,
      maxRetentionDays: 730,
      defaultRetentionDays: 365,
      encryptionRequired: true,
      dataLocalityRequired: true,
      rightToErasure: true,
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 60,
      coldStorageDays: 305,
      compressionRatio: 10,
      replicationFactor: 2,
      highAvailability: true,
    },
    warnings: [
      'Data must be stored in Canada or with adequate protection',
      'Obtain consent for data collection and use',
      'Implement breach notification procedures',
      'Maintain data inventory and processing records',
    ],
    industryStandards: ['ISO 27001', 'CSA Privacy Code'],
  },
  
  HIPAA: {
    id: 'HIPAA',
    name: 'HIPAA (Health Insurance Portability)',
    region: 'United States',
    description: 'US healthcare data protection standard',
    requirements: {
      minRetentionDays: 365,
      maxRetentionDays: 2555, // 7 years
      defaultRetentionDays: 365,
      encryptionRequired: true,
      dataLocalityRequired: false,
      rightToErasure: false, // Healthcare records have specific rules
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 90,
      coldStorageDays: 275,
      compressionRatio: 8,
      replicationFactor: 3, // Higher for healthcare
      highAvailability: true,
    },
    warnings: [
      'PHI must be encrypted at rest and in transit (AES-256)',
      'Implement comprehensive audit logging (6 years retention)',
      'Business Associate Agreements required for vendors',
      'Regular security risk assessments mandatory',
      'Implement access controls and authentication',
    ],
    industryStandards: ['NIST 800-53', 'HITRUST CSF'],
  },
  
  PCI_DSS: {
    id: 'PCI_DSS',
    name: 'PCI-DSS (Payment Card Industry)',
    region: 'Global',
    description: 'Payment card data security standard',
    requirements: {
      minRetentionDays: 90,
      maxRetentionDays: 365,
      defaultRetentionDays: 90,
      encryptionRequired: true,
      dataLocalityRequired: false,
      rightToErasure: false,
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 90,
      coldStorageDays: 0, // PCI-DSS prefers shorter retention
      compressionRatio: 8,
      replicationFactor: 2,
      highAvailability: true,
    },
    warnings: [
      'Cardholder data must be encrypted (AES-256 minimum)',
      'Implement network segmentation for cardholder data',
      'Log and monitor all access to cardholder data',
      'Quarterly vulnerability scans required',
      'Annual penetration testing required',
      'File integrity monitoring for critical files',
    ],
    industryStandards: ['PCI-DSS v4.0', 'PA-DSS'],
  },
  
  SOC2: {
    id: 'SOC2',
    name: 'SOC 2 (Service Organization Control)',
    region: 'Global',
    description: 'Cloud service provider security standard',
    requirements: {
      minRetentionDays: 365,
      maxRetentionDays: 1095, // 3 years
      defaultRetentionDays: 365,
      encryptionRequired: true,
      dataLocalityRequired: false,
      rightToErasure: true,
      privacyByDesign: true,
    },
    recommendations: {
      hotStorageDays: 90,
      coldStorageDays: 275,
      compressionRatio: 10,
      replicationFactor: 3,
      highAvailability: true,
    },
    warnings: [
      'Implement comprehensive logging for all trust services',
      'Maintain audit trail for 3 years minimum',
      'Document security policies and procedures',
      'Regular third-party security assessments required',
      'Incident response procedures must be documented',
      'Change management process required',
    ],
    industryStandards: ['AICPA TSC', 'ISO 27001', 'NIST CSF'],
  },
  
  NONE: {
    id: 'NONE',
    name: 'Custom / No Specific Compliance',
    region: 'Global',
    description: 'General best practices without specific compliance',
    requirements: {
      minRetentionDays: 30,
      maxRetentionDays: 3650,
      defaultRetentionDays: 90,
      encryptionRequired: false,
      dataLocalityRequired: false,
      rightToErasure: false,
      privacyByDesign: false,
    },
    recommendations: {
      hotStorageDays: 30,
      coldStorageDays: 60,
      compressionRatio: 10,
      replicationFactor: 1,
      highAvailability: false,
    },
    warnings: [
      'Consider implementing encryption for sensitive data',
      'Establish data retention policies',
      'Implement access controls and authentication',
    ],
    industryStandards: ['ISO 27001', 'NIST CSF'],
  },
};

/**
 * Get compliance template by ID
 */
export const getComplianceTemplate = (complianceId) => {
  return COMPLIANCE_TEMPLATES[complianceId] || COMPLIANCE_TEMPLATES.NONE;
};

/**
 * Get all compliance options for dropdown
 */
export const getComplianceOptions = () => {
  return Object.values(COMPLIANCE_TEMPLATES).map(template => ({
    value: template.id,
    label: template.name,
    region: template.region,
  }));
};

/**
 * Validate retention period against compliance requirements
 */
export const validateRetention = (retentionDays, complianceId) => {
  const template = getComplianceTemplate(complianceId);
  const { minRetentionDays, maxRetentionDays } = template.requirements;
  
  const warnings = [];
  
  if (retentionDays < minRetentionDays) {
    warnings.push({
      type: 'error',
      message: `${template.name} requires minimum ${minRetentionDays} days retention. Current: ${retentionDays} days.`,
    });
  }
  
  if (retentionDays > maxRetentionDays) {
    warnings.push({
      type: 'warning',
      message: `${template.name} typically uses maximum ${maxRetentionDays} days retention. Current: ${retentionDays} days may increase costs.`,
    });
  }
  
  return warnings;
};

/**
 * Get compliance-specific warnings based on configuration
 */
export const getComplianceWarnings = (configuration, complianceId) => {
  const template = getComplianceTemplate(complianceId);
  const warnings = [];
  
  // Check retention
  const retentionWarnings = validateRetention(configuration.retentionDays, complianceId);
  warnings.push(...retentionWarnings);
  
  // Check encryption requirement
  if (template.requirements.encryptionRequired && !configuration.encryption) {
    warnings.push({
      type: 'error',
      message: `${template.name} requires data encryption. Enable encryption in your configuration.`,
    });
  }
  
  // Check high availability
  if (template.recommendations.highAvailability && !configuration.highAvailability) {
    warnings.push({
      type: 'warning',
      message: `${template.name} recommends high availability configuration for production environments.`,
    });
  }
  
  // Add template-specific warnings
  if (template.warnings && template.warnings.length > 0) {
    template.warnings.forEach(warning => {
      warnings.push({
        type: 'info',
        message: warning,
      });
    });
  }
  
  return warnings;
};
