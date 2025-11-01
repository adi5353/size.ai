/**
 * Calculate SIEM/XDR infrastructure sizing based on device inventory and configuration
 */
export const calculateSizing = (devices, configuration) => {
  // Calculate total EPS
  let totalEPS = 0;
  Object.keys(devices).forEach(deviceType => {
    const device = devices[deviceType];
    totalEPS += device.quantity * device.eps;
  });

  const averageEPS = totalEPS;
  const peakEPS = totalEPS * configuration.peakFactor;

  // Calculate daily log volume (1000 EPS ≈ 8.6 GB/day)
  const dailyGB = (averageEPS / 1000) * 8.6;
  const monthlyTB = (dailyGB * 30) / 1000;
  const yearlyTB = (dailyGB * 365) / 1000;

  // Calculate storage requirements
  const hotStorageTB = (dailyGB * configuration.hotStorage) / 1000;
  const coldStorageDays = configuration.retentionPeriod - configuration.hotStorage;
  const coldStorageTB = (dailyGB * coldStorageDays) / 1000;
  const totalStorageTB = hotStorageTB + coldStorageTB;
  const compressedStorageTB = totalStorageTB / configuration.compressionRatio;

  // Calculate infrastructure requirements
  const indexers = Math.max(2, Math.ceil(averageEPS / 50000)); // 1 indexer per 50k EPS
  const searchHeads = Math.max(2, Math.ceil(indexers / 3)); // 1 search head per 3 indexers
  const cpuCores = indexers * 16 + searchHeads * 8; // 16 cores per indexer, 8 per search head
  const ramGB = indexers * 64 + searchHeads * 32; // 64GB per indexer, 32GB per search head
  const networkGbps = Math.ceil(peakEPS / 10000); // 1 Gbps per 10k EPS

  // Calculate with growth factor
  const futureStorageTB = totalStorageTB * (1 + configuration.growthFactor / 100);
  const futureCompressedStorageTB = futureStorageTB / configuration.compressionRatio;

  return {
    averageEPS,
    peakEPS,
    dailyGB,
    monthlyTB,
    yearlyTB,
    hotStorageTB,
    coldStorageTB,
    totalStorageTB,
    compressedStorageTB,
    infrastructure: {
      indexers,
      searchHeads,
      cpuCores,
      ramGB,
      networkGbps,
      forwarders: Math.ceil(Object.values(devices).reduce((sum, d) => sum + d.quantity, 0) / 100), // 1 forwarder per 100 devices
    },
    future: {
      totalStorageTB: futureStorageTB,
      compressedStorageTB: futureCompressedStorageTB,
    }
  };
};