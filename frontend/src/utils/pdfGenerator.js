import { jsPDF } from 'jspdf';

/**
 * Generate a comprehensive PDF report for SIEM/XDR sizing
 */
export const generatePDFReport = (results, devices, configuration) => {
  try {
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

  // Helper function to draw a simple table
  const drawTable = (headers, rows, startY) => {
    const colWidth = (pageWidth - 40) / headers.length;
    let currentY = startY;
    
    // Draw header
    doc.setFillColor(102, 126, 234);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, currentY, pageWidth - 40, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, i) => {
      doc.text(header, 22 + (i * colWidth), currentY + 7);
    });
    
    currentY += 10;
    
    // Draw rows
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    rows.forEach((row, rowIndex) => {
      if (currentY + 10 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, currentY, pageWidth - 40, 10, 'F');
      }
      
      row.forEach((cell, i) => {
        doc.text(String(cell), 22 + (i * colWidth), currentY + 7);
      });
      
      currentY += 10;
    });
    
    return currentY + 5;
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
  
  const summaryLines = [
    `Total Devices Monitored: ${totalDevices.toLocaleString()}`,
    `Average EPS: ${results.averageEPS.toLocaleString()}`,
    `Peak EPS: ${results.peakEPS.toLocaleString()}`,
    `Daily Log Volume: ${results.dailyGB.toFixed(2)} GB`,
    `Total Storage Required: ${results.totalStorageTB.toFixed(2)} TB (raw)`,
    `Compressed Storage: ${results.compressedStorageTB.toFixed(2)} TB`,
    `Retention Period: ${configuration.retentionPeriod} days`
  ];

  summaryLines.forEach(line => {
    yPos += 8;
    const parts = line.split(':');
    doc.setFont('helvetica', 'bold');
    doc.text(parts[0] + ':', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(parts[1], 90, yPos);
  });

  // Device Breakdown
  yPos += 20;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Device Inventory Breakdown', 20, yPos);

  yPos += 10;

  const deviceRows = [];
  Object.keys(devices).forEach(deviceType => {
    const device = devices[deviceType];
    if (device.quantity > 0) {
      const name = deviceType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      deviceRows.push([
        name,
        device.quantity.toLocaleString(),
        device.eps.toLocaleString(),
        (device.quantity * device.eps).toLocaleString()
      ]);
    }
  });

  yPos = drawTable(['Device Type', 'Quantity', 'EPS/Device', 'Total EPS'], deviceRows, yPos);

  // Storage Analysis
  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Storage Analysis', 20, yPos);

  yPos += 10;

  const storageRows = [
    ['Hot Storage (SSD/NVMe)', `${configuration.hotStorage} days`, `${results.hotStorageTB.toFixed(2)} TB`],
    ['Cold Storage (Archive)', `${configuration.retentionPeriod - configuration.hotStorage} days`, `${results.coldStorageTB.toFixed(2)} TB`],
    ['Total Raw Storage', `${configuration.retentionPeriod} days`, `${results.totalStorageTB.toFixed(2)} TB`],
    ['Compression Ratio', `${configuration.compressionRatio}:1`, '-'],
    ['Compressed Storage', '-', `${results.compressedStorageTB.toFixed(2)} TB`]
  ];

  yPos = drawTable(['Storage Type', 'Duration', 'Capacity'], storageRows, yPos);

  // Infrastructure Recommendations
  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Infrastructure Recommendations', 20, yPos);

  yPos += 10;

  const infraRows = [
    ['Indexer/Data Nodes', results.infrastructure.indexers.toString(), 'For data ingestion'],
    ['Search Head Nodes', results.infrastructure.searchHeads.toString(), 'For query distribution'],
    ['Forwarder Nodes', results.infrastructure.forwarders.toString(), 'For log collection'],
    ['Total CPU Cores', results.infrastructure.cpuCores.toString(), 'Distributed across cluster'],
    ['Total RAM', `${results.infrastructure.ramGB} GB`, 'For optimal performance'],
    ['Network Bandwidth', `${results.infrastructure.networkGbps} Gbps`, 'Required throughput']
  ];

  yPos = drawTable(['Component', 'Requirement', 'Notes'], infraRows, yPos);

  // Configuration Parameters
  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Configuration Parameters', 20, yPos);

  yPos += 10;

  const configLines = [
    `Retention Period: ${configuration.retentionPeriod} days`,
    `Hot Storage Duration: ${configuration.hotStorage} days`,
    `Cold Storage Duration: ${configuration.retentionPeriod - configuration.hotStorage} days`,
    `Annual Growth Factor: ${configuration.growthFactor}%`,
    `Peak Load Multiplier: ${configuration.peakFactor}x`,
    `Compression Ratio: ${configuration.compressionRatio}:1`
  ];

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  configLines.forEach(line => {
    yPos += 8;
    const parts = line.split(':');
    doc.setFont('helvetica', 'bold');
    doc.text(parts[0] + ':', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(parts[1], 90, yPos);
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
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
