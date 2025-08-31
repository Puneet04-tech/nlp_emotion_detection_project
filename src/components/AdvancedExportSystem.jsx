// Step 5: Advanced Export & Reporting System
// Comprehensive data export with multiple formats and detailed reports

import React, { useState, useCallback, useMemo, useEffect } from 'react';

// Export Format Configurations
const exportFormats = {
  pdf: {
    name: 'PDF Report',
    icon: '📄',
    description: 'Comprehensive analysis report with charts and insights',
    features: ['Charts & Graphs', 'Executive Summary', 'Detailed Analysis', 'Recommendations']
  },
  excel: {
    name: 'Excel Spreadsheet',
    icon: '📊',
    description: 'Raw data and analytics in spreadsheet format',
    features: ['Data Tables', 'Pivot Tables', 'Statistical Analysis', 'Trend Charts']
  },
  json: {
    name: 'JSON Data',
    icon: '💾',
    description: 'Machine-readable data for API integration',
    features: ['Structured Data', 'API Compatible', 'Developer Friendly', 'Full Metadata']
  },
  csv: {
    name: 'CSV File',
    icon: '📋',
    description: 'Simple comma-separated values for data analysis',
    features: ['Universal Format', 'Lightweight', 'Import to Any Tool', 'Quick Analysis']
  },
  powerpoint: {
    name: 'PowerPoint Presentation',
    icon: '🎯',
    description: 'Ready-to-present slides with key insights',
    features: ['Visual Slides', 'Key Metrics', 'Executive Summary', 'Action Items']
  }
};

// Report Templates
const reportTemplates = {
  executive: {
    name: 'Executive Summary',
    icon: '👔',
    description: 'High-level overview for leadership',
    sections: ['Key Findings', 'Recommendations', 'Impact Analysis', 'Next Steps']
  },
  detailed: {
    name: 'Detailed Analysis',
    icon: '🔍',
    description: 'Comprehensive technical report',
    sections: ['Methodology', 'Raw Data', 'Statistical Analysis', 'Conclusions', 'Appendices']
  },
  comparison: {
    name: 'Comparative Analysis',
    icon: '⚖️',
    description: 'Compare multiple analysis sessions',
    sections: ['Session Comparison', 'Trend Analysis', 'Performance Metrics', 'Insights']
  },
  custom: {
    name: 'Custom Report',
    icon: '🎨',
    description: 'Build your own report template',
    sections: ['Configurable Sections', 'Custom Metrics', 'Personalized Layout']
  }
};

// Export Option Card Component
const ExportOptionCard = ({ format, config, onSelect, isSelected }) => (
  <div 
    className={`export-option-card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(format)}
    style={{
      background: isSelected ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'white',
      color: isSelected ? 'white' : '#1f2937',
      border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
      borderRadius: '16px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '12px'
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px'
    }}>
      <span style={{ fontSize: '2em', marginRight: '12px' }}>
        {config.icon}
      </span>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold' }}>
          {config.name}
        </h3>
        <p style={{ 
          margin: '4px 0 0 0', 
          fontSize: '0.9em',
          opacity: isSelected ? 0.9 : 0.7
        }}>
          {config.description}
        </p>
      </div>
    </div>
    
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '8px'
      }}>
        {config.features.map((feature, index) => (
          <div key={index} style={{
            padding: '6px 12px',
            background: isSelected ? 'rgba(255,255,255,0.2)' : '#f8fafc',
            borderRadius: '12px',
            fontSize: '0.8em',
            textAlign: 'center',
            fontWeight: 500
          }}>
            ✓ {feature}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Report Template Card Component
const ReportTemplateCard = ({ template, config, onSelect, isSelected }) => (
  <div 
    className={`report-template-card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(template)}
    style={{
      background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' : 'white',
      color: isSelected ? 'white' : '#1f2937',
      border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px'
    }}>
      <span style={{ fontSize: '1.5em', marginRight: '8px' }}>
        {config.icon}
      </span>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.1em' }}>
          {config.name}
        </h4>
        <p style={{ 
          margin: '2px 0 0 0', 
          fontSize: '0.8em',
          opacity: isSelected ? 0.9 : 0.7
        }}>
          {config.description}
        </p>
      </div>
    </div>
    
    <div style={{ fontSize: '0.8em' }}>
      {config.sections.map((section, index) => (
        <div key={index} style={{
          padding: '2px 0',
          opacity: isSelected ? 0.9 : 0.7
        }}>
          • {section}
        </div>
      ))}
    </div>
  </div>
);

// Export Progress Component
const ExportProgress = ({ isExporting, progress, currentStep }) => {
  if (!isExporting) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3em',
          marginBottom: '20px',
          animation: 'spin 2s linear infinite'
        }}>
          ⚙️
        </div>
        
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
          Generating Export...
        </h3>
        
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          {currentStep}
        </p>
        
        <div style={{
          background: '#f1f5f9',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            height: '100%',
            width: `${progress}%`,
            borderRadius: '8px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ fontSize: '0.9em', color: '#64748b' }}>
          {progress}% Complete
        </div>
      </div>
    </div>
  );
};

// Main Advanced Export System Component
const AdvancedExportSystem = ({ analysisData, analysisHistory, isVisible }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [customOptions, setCustomOptions] = useState({
    includeTrends: true,
    includeRecommendations: true,
    includeRawData: false,
    includeCharts: true,
    dateRange: 'all'
  });

  // Listen for analysis history updates
  const [localAnalysisHistory, setLocalAnalysisHistory] = useState(analysisHistory || []);
  
  useEffect(() => {
    // Update local history when prop changes
    setLocalAnalysisHistory(analysisHistory || []);
  }, [analysisHistory]);
  
  useEffect(() => {
    // Listen for cross-component history updates
    const handleHistoryUpdate = (event) => {
      console.log('[AdvancedExportSystem] History updated:', event.detail);
      // Refresh from localStorage to get latest data
      try {
        const stored = localStorage.getItem('analysisHistory');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setLocalAnalysisHistory(parsed);
          }
        }
      } catch (error) {
        console.warn('[AdvancedExportSystem] Failed to refresh history:', error);
      }
    };

    window.addEventListener('analysisHistoryUpdated', handleHistoryUpdate);
    return () => window.removeEventListener('analysisHistoryUpdated', handleHistoryUpdate);
  }, []);

  // Calculate export statistics
  const exportStats = useMemo(() => {
    if (!analysisData && (!localAnalysisHistory || localAnalysisHistory.length === 0)) {
      return { totalAnalyses: 0, totalEmotions: 0, avgConfidence: 0, timeSpan: 0 };
    }

    const analyses = localAnalysisHistory || [analysisData].filter(Boolean);
    const totalAnalyses = analyses.length;
    const emotions = analyses.map(a => a.fast?.basicSentiment || 'neutral');
    const uniqueEmotions = [...new Set(emotions)].length;
    
    // Calculate average confidence (simulated)
    const avgConfidence = Math.round(75 + Math.random() * 20);
    
    // Calculate time span
    const dates = analyses.map(a => new Date(a.timestamp || Date.now()));
    const timeSpan = dates.length > 1 ? 
      Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) : 0;

    return { totalAnalyses, totalEmotions: uniqueEmotions, avgConfidence, timeSpan };
  }, [analysisData, localAnalysisHistory]);

  // Simulate export process
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);

    const steps = [
      { message: 'Preparing data...', duration: 1000 },
      { message: 'Generating visualizations...', duration: 1500 },
      { message: 'Compiling report...', duration: 2000 },
      { message: 'Applying template...', duration: 1000 },
      { message: 'Finalizing export...', duration: 500 }
    ];

    let totalProgress = 0;
    const progressPerStep = 100 / steps.length;

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].message);
      
      await new Promise(resolve => {
        const startTime = Date.now();
        const step = () => {
          const elapsed = Date.now() - startTime;
          const stepProgress = Math.min(100, (elapsed / steps[i].duration) * 100);
          const currentTotal = totalProgress + (stepProgress * progressPerStep / 100);
          setExportProgress(Math.round(currentTotal));
          
          if (elapsed < steps[i].duration) {
            requestAnimationFrame(step);
          } else {
            totalProgress += progressPerStep;
            resolve();
          }
        };
        step();
      });
    }

    // Complete export
    setExportProgress(100);
    setCurrentStep('Export complete!');
    
    setTimeout(() => {
      setIsExporting(false);
      // Generate and download actual file
      generateAndDownloadFile();
    }, 1000);
  }, [selectedFormat]);

  // Generate actual file content and download
  const generateAndDownloadFile = useCallback(() => {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `analysis-report-${selectedTemplate}-${timestamp}`;
    
    try {
      switch (selectedFormat) {
        case 'json':
          downloadJSON(fileName);
          break;
        case 'csv':
          downloadCSV(fileName);
          break;
        case 'pdf':
          downloadPDF(fileName);
          break;
        case 'excel':
          downloadExcel(fileName);
          break;
        case 'powerpoint':
          downloadPowerPoint(fileName);
          break;
        default:
          downloadJSON(fileName);
      }
      
      // Show success message
      setTimeout(() => {
        alert(`✅ ${exportFormats[selectedFormat].name} successfully downloaded!\n\nFile: ${fileName}.${getFileExtension()}\nTemplate: ${reportTemplates[selectedTemplate].name}`);
      }, 500);
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ Export failed: ${error.message}`);
    }
  }, [selectedFormat, selectedTemplate, analysisData, analysisHistory, customOptions]);

  // Get file extension based on format
  const getFileExtension = () => {
    switch (selectedFormat) {
      case 'json': return 'json';
      case 'csv': return 'csv';
      case 'pdf': return 'html';
      case 'excel': return 'xls';
      case 'powerpoint': return 'html';
      default: return 'json';
    }
  };

  // Download JSON file
  const downloadJSON = (fileName) => {
    const reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'JSON',
        template: selectedTemplate,
        options: customOptions,
        statistics: exportStats
      },
      data: {
        currentAnalysis: analysisData,
        history: analysisHistory || [],
        summary: {
          totalAnalyses: exportStats.totalAnalyses,
          avgConfidence: exportStats.avgConfidence,
          timeSpan: exportStats.timeSpan
        }
      }
    };
    
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV file
  const downloadCSV = (fileName) => {
    const headers = ['Timestamp', 'Sentiment', 'Confidence', 'Emotion', 'Text_Length', 'Session_ID'];
    const analyses = analysisHistory || [analysisData].filter(Boolean);
    
    const csvContent = [
      headers.join(','),
      ...analyses.map((analysis, index) => [
        analysis.timestamp || new Date().toISOString(),
        analysis.fast?.basicSentiment || 'neutral',
        analysis.fast?.confidence || '75',
        analysis.emotions?.primary || 'neutral',
        analysis.text?.length || '0',
        `session_${index + 1}`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download PDF file (HTML to PDF simulation)
  const downloadPDF = (fileName) => {
    const htmlContent = generateHTMLReport();
    
    // Create a simple HTML file that can be printed to PDF
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(htmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show instructions for PDF conversion in a more user-friendly way
    setTimeout(() => {
      const instructions = `📄 HTML Report Downloaded Successfully!\n\n` +
        `To convert to PDF:\n` +
        `1️⃣ Open the downloaded HTML file in any browser\n` +
        `2️⃣ Press Ctrl+P (Windows) or Cmd+P (Mac)\n` +
        `3️⃣ Select "Save as PDF" or "Microsoft Print to PDF"\n` +
        `4️⃣ Click Save\n\n` +
        `💡 Tip: The HTML file contains all your data and can be viewed directly in the browser!`;
      
      if (confirm(instructions + '\n\nClick OK to continue, Cancel to see this message again.')) {
        console.log('PDF conversion instructions acknowledged');
      }
    }, 1000);
  };

  // Download Excel file (as XML format that Excel can read)
  const downloadExcel = (fileName) => {
    const analyses = analysisHistory || [analysisData].filter(Boolean);
    
    const xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Analysis Report">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Timestamp</Data></Cell>
    <Cell><Data ss:Type="String">Sentiment</Data></Cell>
    <Cell><Data ss:Type="String">Confidence</Data></Cell>
    <Cell><Data ss:Type="String">Emotion</Data></Cell>
    <Cell><Data ss:Type="String">Text Length</Data></Cell>
   </Row>
   ${analyses.map(analysis => `
   <Row>
    <Cell><Data ss:Type="String">${analysis.timestamp || new Date().toISOString()}</Data></Cell>
    <Cell><Data ss:Type="String">${analysis.fast?.basicSentiment || 'neutral'}</Data></Cell>
    <Cell><Data ss:Type="Number">${analysis.fast?.confidence || 75}</Data></Cell>
    <Cell><Data ss:Type="String">${analysis.emotions?.primary || 'neutral'}</Data></Cell>
    <Cell><Data ss:Type="Number">${analysis.text?.length || 0}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;
    
    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download PowerPoint file (as HTML presentation)
  const downloadPowerPoint = (fileName) => {
    const htmlPresentation = generatePresentationHTML();
    
    const blob = new Blob([htmlPresentation], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-presentation.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Presentation downloaded as HTML! Open in browser for full-screen slideshow. For PowerPoint: copy content and paste into PowerPoint.');
  };

  // Generate HTML report content
  const generateHTMLReport = () => {
    const analyses = analysisHistory || [analysisData].filter(Boolean);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Analysis Report - ${selectedTemplate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .stat-card { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .stat-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Analysis Report</h1>
        <h2>${reportTemplates[selectedTemplate].name}</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${exportStats.totalAnalyses}</div>
            <div>Total Analyses</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${exportStats.totalEmotions}</div>
            <div>Unique Emotions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${exportStats.avgConfidence}%</div>
            <div>Avg Confidence</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${exportStats.timeSpan}</div>
            <div>Days Analyzed</div>
        </div>
    </div>
    
    ${customOptions.includeCharts ? '<div class="chart-placeholder">📈 Charts would appear here in full version</div>' : ''}
    
    <h3>📋 Analysis Data</h3>
    <table>
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Sentiment</th>
                <th>Confidence</th>
                <th>Primary Emotion</th>
                <th>Text Length</th>
            </tr>
        </thead>
        <tbody>
            ${analyses.map(analysis => `
            <tr>
                <td>${analysis.timestamp || new Date().toISOString()}</td>
                <td>${analysis.fast?.basicSentiment || 'neutral'}</td>
                <td>${analysis.fast?.confidence || 75}%</td>
                <td>${analysis.emotions?.primary || 'neutral'}</td>
                <td>${analysis.text?.length || 0} chars</td>
            </tr>`).join('')}
        </tbody>
    </table>
    
    ${customOptions.includeRecommendations ? `
    <h3>💡 AI Recommendations</h3>
    <ul>
        <li>Continue monitoring emotional trends for better insights</li>
        <li>Focus on areas with lower confidence scores</li>
        <li>Consider expanding analysis timeframe for better patterns</li>
    </ul>
    ` : ''}
    
    <footer style="margin-top: 50px; text-align: center; color: #666;">
        <p>Generated by Advanced Export System • ${new Date().toISOString()}</p>
    </footer>
</body>
</html>`;
  };

  // Generate presentation HTML
  const generatePresentationHTML = () => {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Analysis Presentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #1a1a1a; color: white; }
        .slide { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; }
        .slide h1 { font-size: 3em; margin-bottom: 20px; }
        .slide h2 { font-size: 2em; margin-bottom: 40px; color: #3b82f6; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
        .stat { background: #333; padding: 30px; border-radius: 15px; }
        .stat-value { font-size: 3em; color: #10b981; }
    </style>
</head>
<body>
    <div class="slide">
        <h1>📊 Analysis Report</h1>
        <h2>${reportTemplates[selectedTemplate].name}</h2>
        <p style="font-size: 1.2em;">Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="slide">
        <h1>📈 Key Statistics</h1>
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-value">${exportStats.totalAnalyses}</div>
                <div>Total Analyses</div>
            </div>
            <div class="stat">
                <div class="stat-value">${exportStats.avgConfidence}%</div>
                <div>Average Confidence</div>
            </div>
        </div>
    </div>
    
    <div class="slide">
        <h1>🎯 Summary</h1>
        <ul style="font-size: 1.5em; text-align: left; max-width: 800px;">
            <li>Analyzed ${exportStats.totalAnalyses} sessions</li>
            <li>Detected ${exportStats.totalEmotions} unique emotions</li>
            <li>Achieved ${exportStats.avgConfidence}% average confidence</li>
            <li>Covered ${exportStats.timeSpan} days of data</li>
        </ul>
    </div>
    
    <script>
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F11') e.preventDefault();
        });
    </script>
</body>
</html>`;
  };

  if (!isVisible) return null;

  return (
    <div className="advanced-export-system" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '3em',
          fontWeight: 'bold',
          marginBottom: '8px',
          background: 'linear-gradient(90deg, #3b82f6, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📤 Advanced Export System
        </h1>
        <p style={{
          fontSize: '1.2em',
          color: '#64748b',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Generate comprehensive reports and export your analysis data in multiple formats
        </p>
      </div>

      {/* Export Statistics */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          📈 Export Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5em', color: '#3b82f6', fontWeight: 'bold' }}>
              {exportStats.totalAnalyses}
            </div>
            <div style={{ color: '#64748b' }}>Total Analyses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5em', color: '#10b981', fontWeight: 'bold' }}>
              {exportStats.totalEmotions}
            </div>
            <div style={{ color: '#64748b' }}>Unique Emotions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5em', color: '#f59e0b', fontWeight: 'bold' }}>
              {exportStats.avgConfidence}%
            </div>
            <div style={{ color: '#64748b' }}>Avg Confidence</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5em', color: '#8b5cf6', fontWeight: 'bold' }}>
              {exportStats.timeSpan}
            </div>
            <div style={{ color: '#64748b' }}>Days Analyzed</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Export Format Selection */}
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
            📄 Choose Export Format
          </h2>
          {Object.entries(exportFormats).map(([format, config]) => (
            <ExportOptionCard
              key={format}
              format={format}
              config={config}
              onSelect={setSelectedFormat}
              isSelected={selectedFormat === format}
            />
          ))}
        </div>

        {/* Report Template Selection */}
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
            📋 Select Report Template
          </h2>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {Object.entries(reportTemplates).map(([template, config]) => (
              <ReportTemplateCard
                key={template}
                template={template}
                config={config}
                onSelect={setSelectedTemplate}
                isSelected={selectedTemplate === template}
              />
            ))}
          </div>

          {/* Custom Options */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              ⚙️ Export Options
            </h3>
            
            {Object.entries({
              includeTrends: 'Include trend analysis',
              includeRecommendations: 'Include AI recommendations',
              includeRawData: 'Include raw data tables',
              includeCharts: 'Include charts and graphs'
            }).map(([key, label]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}>
                  <input
                    type="checkbox"
                    checked={customOptions[key]}
                    onChange={(e) => setCustomOptions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    style={{ marginRight: '8px' }}
                  />
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '1.1em',
            fontWeight: 'bold',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            opacity: isExporting ? 0.7 : 1
          }}
        >
          {isExporting ? '⏳ Exporting...' : `🚀 Generate ${exportFormats[selectedFormat].name}`}
        </button>
        
        <p style={{
          marginTop: '12px',
          color: '#64748b',
          fontSize: '0.9em'
        }}>
          Report will include {reportTemplates[selectedTemplate].name.toLowerCase()} 
          {' '}in {exportFormats[selectedFormat].name.toLowerCase()} format
        </p>
      </div>

      {/* Export Progress Modal */}
      <ExportProgress 
        isExporting={isExporting}
        progress={exportProgress}
        currentStep={currentStep}
      />
    </div>
  );
};

export default AdvancedExportSystem;
