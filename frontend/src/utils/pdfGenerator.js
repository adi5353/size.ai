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

  const totalDevices = results.totalDevices || Object.values(devices).reduce((sum, d) => sum + d.quantity, 0);
  
  const summaryLines = [
    `Total Devices Monitored: ${totalDevices.toLocaleString()}`,
    `Average EPS: ${results.totalEPS ? results.totalEPS.toLocaleString() : '0'}`,
    `Peak EPS: ${results.peakEPS ? Math.round(results.peakEPS).toLocaleString() : '0'}`,
    `Daily Log Volume: ${results.dailyGB ? results.dailyGB.toFixed(2) : '0'} GB`,
    `Total Storage Required: ${results.totalStorageTB ? results.totalStorageTB.toFixed(2) : '0'} TB`,
    `Compressed Storage: ${results.compressedStorageGB ? (results.compressedStorageGB / 1000).toFixed(2) : '0'} TB`,
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

  if (deviceRows.length > 0) {
    yPos = drawTable(['Device Type', 'Quantity', 'EPS/Device', 'Total EPS'], deviceRows, yPos);
  } else {
    doc.setFontSize(10);
    doc.text('No devices configured', 25, yPos);
    yPos += 10;
  }

  // Storage Analysis
  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Storage Analysis', 20, yPos);

  yPos += 10;

  const compressionPct = configuration.compressionLevel === 'none' ? '0%' : 
                        configuration.compressionLevel === 'standard' ? '40%' : '60%';
  
  const storageRows = [
    ['Raw Storage', `${configuration.retentionPeriod} days`, `${(results.rawStorageGB / 1000).toFixed(2)} TB`],
    ['After Compression', compressionPct, `${(results.compressedStorageGB / 1000).toFixed(2)} TB`],
    ['Replication Factor', `${configuration.replicationFactor}x`, '-'],
    ['After Replication', '-', `${(results.replicatedStorageGB / 1000).toFixed(2)} TB`],
    ['Final (with indexing)', '+20% overhead', `${results.totalStorageTB.toFixed(2)} TB`]
  ];

  if (configuration.hotColdSplit) {
    storageRows.push(['Hot Storage', `${configuration.hotStorageDays} days`, `${results.hotStorageGB.toFixed(2)} TB`]);
    storageRows.push(['Cold Storage', `${configuration.retentionPeriod - configuration.hotStorageDays} days`, `${results.coldStorageGB.toFixed(2)} TB`]);
  }

  yPos = drawTable(['Storage Type', 'Configuration', 'Capacity'], storageRows, yPos);

  // Infrastructure Recommendations
  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Infrastructure Recommendations', 20, yPos);

  yPos += 10;

  const infraRows = [
    ['Management Server', `${results.infrastructure.managementServer.instances}x`, `${results.infrastructure.managementServer.cpu}vCPU, ${results.infrastructure.managementServer.ram}GB RAM`, results.infrastructure.managementServer.notes],
    ['Data Indexers', `${results.infrastructure.dataIndexer.instances}x`, `${results.infrastructure.dataIndexer.cpu}vCPU, ${results.infrastructure.dataIndexer.ram}GB RAM`, results.infrastructure.dataIndexer.notes],
    ['Web Console', `${results.infrastructure.webConsole.instances}x`, `${results.infrastructure.webConsole.cpu}vCPU, ${results.infrastructure.webConsole.ram}GB RAM`, results.infrastructure.webConsole.notes],
    ['Total Resources', '-', `${results.infrastructure.totalCPU}vCPU, ${results.infrastructure.totalRAM}GB RAM`, `${results.infrastructure.totalStorage}GB storage`]
  ];

  yPos = drawTable(['Component', 'Instances', 'Specs', 'Notes'], infraRows, yPos);

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
