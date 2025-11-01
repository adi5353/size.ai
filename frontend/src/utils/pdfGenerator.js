import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a comprehensive PDF report for SIEM/XDR sizing
 */
export const generatePDFReport = (results, devices, configuration) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Cover Page
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('size.ai', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('SIEM/XDR Infrastructure Sizing Report', pageWidth / 2, 45, { align: 'center' });

  yPos = 80;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.text('Report Generated:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleString(), 70, yPos);

  // Executive Summary
  yPos += 20;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Executive Summary', 20, yPos);

  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  const totalDevices = Object.values(devices).reduce((sum, d) => sum + d.quantity, 0);
  
  const summaryData = [
    ['Total Devices Monitored:', totalDevices.toLocaleString()],
    ['Average EPS:', results.averageEPS.toLocaleString()],
    ['Peak EPS:', results.peakEPS.toLocaleString()],
    ['Daily Log Volume:', `${results.dailyGB.toFixed(2)} GB`],
    ['Total Storage Required:', `${results.totalStorageTB.toFixed(2)} TB (raw)`],
    ['Compressed Storage:', `${results.compressedStorageTB.toFixed(2)} TB`],
    ['Retention Period:', `${configuration.retentionPeriod} days`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 'auto' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Device Breakdown
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Device Inventory Breakdown', 20, yPos);

  yPos += 10;

  const deviceData = [];
  Object.keys(devices).forEach(deviceType => {
    const device = devices[deviceType];
    if (device.quantity > 0) {
      const name = deviceType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      deviceData.push([
        name,
        device.quantity.toLocaleString(),
        device.eps.toLocaleString(),
        (device.quantity * device.eps).toLocaleString()
      ]);
    }
  });

  doc.autoTable({
    startY: yPos,
    head: [['Device Type', 'Quantity', 'EPS per Device', 'Total EPS']],
    body: deviceData,
    theme: 'striped',
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Storage Analysis
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Storage Analysis', 20, yPos);

  yPos += 10;

  const storageData = [
    ['Hot Storage (SSD/NVMe)', `${configuration.hotStorage} days`, `${results.hotStorageTB.toFixed(2)} TB`],
    ['Cold Storage (Archive)', `${configuration.retentionPeriod - configuration.hotStorage} days`, `${results.coldStorageTB.toFixed(2)} TB`],
    ['Total Raw Storage', `${configuration.retentionPeriod} days`, `${results.totalStorageTB.toFixed(2)} TB`],
    ['Compression Ratio', `${configuration.compressionRatio}:1`, '-'],
    ['Compressed Storage', '-', `${results.compressedStorageTB.toFixed(2)} TB`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Storage Type', 'Duration', 'Capacity']],
    body: storageData,
    theme: 'striped',
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Infrastructure Recommendations
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Infrastructure Recommendations', 20, yPos);

  yPos += 10;

  const infraData = [
    ['Indexer/Data Nodes', results.infrastructure.indexers.toString(), 'For data ingestion and indexing'],
    ['Search Head Nodes', results.infrastructure.searchHeads.toString(), 'For query distribution'],
    ['Forwarder Nodes', results.infrastructure.forwarders.toString(), 'For log collection'],
    ['Total CPU Cores', results.infrastructure.cpuCores.toString(), 'Distributed across cluster'],
    ['Total RAM', `${results.infrastructure.ramGB} GB`, 'For optimal performance'],
    ['Network Bandwidth', `${results.infrastructure.networkGbps} Gbps`, 'Required throughput'],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Component', 'Requirement', 'Notes']],
    body: infraData,
    theme: 'striped',
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Configuration Parameters
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Configuration Parameters', 20, yPos);

  yPos += 10;

  const configData = [
    ['Retention Period', `${configuration.retentionPeriod} days`],
    ['Hot Storage Duration', `${configuration.hotStorage} days`],
    ['Cold Storage Duration', `${configuration.retentionPeriod - configuration.hotStorage} days`],
    ['Annual Growth Factor', `${configuration.growthFactor}%`],
    ['Peak Load Multiplier', `${configuration.peakFactor}x`],
    ['Compression Ratio', `${configuration.compressionRatio}:1`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Parameter', 'Value']],
    body: configData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 'auto' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Calculation Methodology
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Calculation Methodology', 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const methodology = [
    'EPS Calculation: Sum of (Device Quantity × EPS per Device) for all device types',
    'Peak EPS: Average EPS × Peak Factor',
    `Daily Volume: (Average EPS ÷ 1000) × 8.6 GB (industry standard)`,
    'Storage Requirements: Daily Volume × Retention Period',
    'Compressed Storage: Raw Storage ÷ Compression Ratio',
    'Indexer Nodes: 1 indexer per 50,000 EPS (minimum 2)',
    'Search Heads: 1 search head per 3 indexers (minimum 2)',
  ];

  methodology.forEach((item, index) => {
    checkPageBreak(10);
    doc.text(`• ${item}`, 25, yPos, { maxWidth: pageWidth - 40 });
    yPos += 8;
  });

  // Assumptions
  yPos += 10;
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Assumptions', 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const assumptions = [
    'EPS values are based on industry averages for each device type',
    'Compression ratios vary by data type and SIEM platform (2:1 to 10:1)',
    'Infrastructure sizing follows vendor best practices',
    'Network bandwidth calculated for peak load scenarios',
    'Growth factor applies to annual data volume increase',
    'Hot storage uses fast SSD/NVMe, cold storage uses archive/object storage',
  ];

  assumptions.forEach((item) => {
    checkPageBreak(10);
    doc.text(`• ${item}`, 25, yPos, { maxWidth: pageWidth - 40 });
    yPos += 8;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by size.ai | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`SizeAI_SIEM_Sizing_Report_${timestamp}.pdf`);
};
