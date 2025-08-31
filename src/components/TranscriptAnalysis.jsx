// TranscriptAnalysis.jsx - Comprehensive analysis component with charts
import React, { useState, useEffect, useRef } from 'react';
import { analyzeTranscript, generateChartData } from '../utils/transcriptAnalyzer';
import { Chart, registerables } from 'chart.js';
import Plotly from 'plotly.js-basic-dist';

// Register Chart.js components
Chart.register(...registerables);

// Simple export functions
const exportAnalysisAsJSON = (analysis) => {
  const dataStr = JSON.stringify(analysis, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transcript-analysis.json';
  link.click();
};

const exportAnalysisAsCSV = (analysis) => {
  const csvContent = [
    ['Metric', 'Value'],
    ['Total Words', analysis.wordCount],
    ['Total Sentences', analysis.sentenceCount],
    ['Reading Time', `${analysis.readingTime} minutes`],
    ['Sentiment Score', analysis.sentimentScore],
    ['Complexity Score', analysis.complexityScore]
  ].map(row => row.join(',')).join('\n');
  
  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transcript-analysis.csv';
  link.click();
};

// TypeWriter Effect Component
const TypeWriter = ({ text, speed = 50, className = "" }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={`typewriter ${className}`}>
      {displayText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = parseInt(value) || 0;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * (endValue - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className="animated-counter">{count}</span>;
};

const TranscriptAnalysis = ({ transcript, isVisible, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Chart refs
  const sentimentChartRef = useRef(null);
  const keywordsChartRef = useRef(null);
  const topicsChartRef = useRef(null);
  const emotionsChartRef = useRef(null);
  const plotlyChartRef = useRef(null);
  const questionTypesChartRef = useRef(null);
  const complexityChartRef = useRef(null);
  const linguisticChartRef = useRef(null);
  const timeReferenceChartRef = useRef(null);
  const metricsChartRef = useRef(null);


  useEffect(() => {
    if (transcript && isVisible) {
      analyzeTranscriptData();
    }
    // eslint-disable-next-line
  }, [transcript, isVisible]);

  const analyzeTranscriptData = async () => {
    setLoading(true);
    try {
      console.log('Starting transcript analysis...', { transcript: transcript?.length });

      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const analysisResult = analyzeTranscript(transcript);
      const chartDataResult = generateChartData(analysisResult);

      console.log('Analysis completed:', { analysisResult, chartDataResult });

      setAnalysis(analysisResult);
      setChartData(chartDataResult);

      // Notify parent if callback provided
      if (typeof onAnalysisComplete === 'function') {
        onAnalysisComplete({
          analysis: analysisResult,
          chartData: chartDataResult,
          transcript
        });
      }

      // Initialize charts after data is ready
      setTimeout(() => {
        initializeCharts(chartDataResult);
      }, 100);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCharts = (data) => {
    if (!data) {
      console.warn('No chart data available');
      return;
    }
    
    console.log('Initializing charts with data:', data);
    
    // Initialize Chart.js charts
    initializeSentimentChart(data);
    initializeKeywordsChart(data);
    initializeTopicsChart(data);
    initializeEmotionsChart(data);
    initializeQuestionTypesChart(data);
    initializeComplexityChart(data);
    initializeLinguisticChart(data);
    initializeTimeReferenceChart(data);
    initializeMetricsChart(data);
    
    // Initialize Plotly.js chart
    initializePlotlyChart(data);
  };

  const initializeSentimentChart = (data) => {
    console.log('Initializing sentiment chart with data:', data?.sentimentPieData);
    if (sentimentChartRef.current && data?.sentimentPieData) {
      const ctx = sentimentChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (sentimentChartRef.current.chartInstance) {
        sentimentChartRef.current.chartInstance.destroy();
      }
      
      try {
        sentimentChartRef.current.chartInstance = new Chart(ctx, {
          type: 'pie',
          data: data.sentimentPieData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Sentiment Distribution Analysis',
                font: { size: 16, weight: 'bold' },
                padding: { top: 10, bottom: 20 }
              },
              legend: {
                position: 'bottom',
                labels: { 
                  usePointStyle: true,
                  padding: 20,
                  font: { size: 12 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    return `${label}: ${value.toFixed(1)}%`;
                  },
                  afterLabel: function(context) {
                    const label = context.label;
                    const descriptions = {
                      'Positive': 'Optimistic, encouraging, or favorable sentiment',
                      'Negative': 'Critical, discouraging, or unfavorable sentiment',
                      'Neutral': 'Balanced, objective, or factual sentiment'
                    };
                    return descriptions[label] || '';
                  }
                }
              }
            }
          }
        });
        console.log('Sentiment chart created successfully');
      } catch (error) {
        console.error('Error creating sentiment chart:', error);
      }
    } else {
      console.warn('Cannot initialize sentiment chart - missing ref or data');
    }
  };

  const initializeKeywordsChart = (data) => {
    console.log('Initializing keywords chart with data:', data?.keywordsBarData);
    if (keywordsChartRef.current && data?.keywordsBarData) {
      const ctx = keywordsChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (keywordsChartRef.current.chartInstance) {
        keywordsChartRef.current.chartInstance.destroy();
      }
      
      try {
        keywordsChartRef.current.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: data.keywordsBarData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Most Frequent Keywords',
                font: { size: 16, weight: 'bold' },
                padding: { top: 10, bottom: 20 }
              },
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.parsed.y;
                    return `Frequency: ${value} occurrence${value > 1 ? 's' : ''}`;
                  },
                  afterLabel: function(context) {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                    return `${percentage}% of total keyword usage`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { 
                  precision: 0,
                  callback: function(value) {
                    return value + (value === 1 ? ' time' : ' times');
                  }
                },
                title: {
                  display: true,
                  text: 'Frequency Count'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Keywords'
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            }
          }
        });
        console.log('Keywords chart created successfully');
      } catch (error) {
        console.error('Error creating keywords chart:', error);
      }
    } else {
      console.warn('Cannot initialize keywords chart - missing ref or data');
    }
  };

  const initializeTopicsChart = (data) => {
    console.log('Initializing topics chart with data:', data?.topicDistributionData);
    if (topicsChartRef.current && data?.topicDistributionData) {
      const ctx = topicsChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (topicsChartRef.current.chartInstance) {
        topicsChartRef.current.chartInstance.destroy();
      }
      
      try {
        topicsChartRef.current.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: data.topicDistributionData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Topic Distribution Overview',
                font: { size: 16, weight: 'bold' },
                padding: { top: 10, bottom: 20 }
              },
              legend: {
                position: 'right',
                labels: { 
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 11 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} mentions (${percentage}%)`;
                  },
                  afterLabel: function(context) {
                    const topicDescriptions = {
                      'Technology': 'Technical terms and digital concepts',
                      'Communication': 'Discussion and interaction patterns',
                      'Analysis': 'Analytical and research content',
                      'Process': 'Procedural and methodical content',
                      'Data': 'Information and statistical content',
                      'Results': 'Outcomes and findings'
                    };
                    return topicDescriptions[context.label] || 'Content category';
                  }
                }
              }
            },
            cutout: '60%'
          }
        });
        console.log('Topics chart created successfully');
      } catch (error) {
        console.error('Error creating topics chart:', error);
      }
    } else {
      console.warn('Cannot initialize topics chart - missing ref or data');
    }
  };

  const initializeEmotionsChart = (data) => {
    console.log('Initializing emotions chart with data:', data?.emotionsRadarData);
    if (emotionsChartRef.current && data?.emotionsRadarData) {
      const ctx = emotionsChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (emotionsChartRef.current.chartInstance) {
        emotionsChartRef.current.chartInstance.destroy();
      }
      
      try {
        emotionsChartRef.current.chartInstance = new Chart(ctx, {
          type: 'radar',
          data: data.emotionsRadarData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Emotional Analysis',
                font: { size: 16, weight: 'bold' }
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                ticks: { display: false }
              }
            }
          }
        });
        console.log('Emotions chart created successfully');
      } catch (error) {
        console.error('Error creating emotions chart:', error);
      }
    } else {
      console.warn('Cannot initialize emotions chart - missing ref or data');
    }
  };

  const initializePlotlyChart = (data) => {
    console.log('Initializing Plotly chart with data:', data);
    if (plotlyChartRef.current && data) {
      try {
        // Create multiple traces for a comprehensive view
        const trace1 = {
          x: data.keywordsBarData?.labels || [],
          y: data.keywordsBarData?.datasets[0]?.data || [],
          type: 'bar',
          name: 'Keyword Frequency',
          marker: {
            color: '#2196F3',
            line: { color: '#1976D2', width: 1 }
          },
          hovertemplate: '<b>%{x}</b><br>Frequency: %{y}<extra></extra>'
        };

        const trace2 = {
          x: data.topicDistributionData?.labels || [],
          y: data.topicDistributionData?.datasets[0]?.data || [],
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Topic Distribution',
          yaxis: 'y2',
          line: { color: '#FF6384', width: 3 },
          marker: { color: '#FF6384', size: 10 },
          hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>'
        };

        const trace3 = {
          values: data.sentimentPieData?.datasets[0]?.data || [],
          labels: data.sentimentPieData?.labels || [],
          type: 'pie',
          name: 'Sentiment Distribution',
          domain: { x: [0.7, 1], y: [0.7, 1] },
          marker: {
            colors: data.sentimentPieData?.datasets[0]?.backgroundColor || []
          },
          hovertemplate: '<b>%{label}</b><br>Percentage: %{percent}<extra></extra>'
        };

        const layout = {
          title: {
            text: 'Comprehensive Content Analysis Dashboard',
            font: { size: 18, weight: 'bold' },
            x: 0.1
          },
          xaxis: { 
            title: 'Content Elements',
            titlefont: { size: 14 },
            tickangle: -45
          },
          yaxis: { 
            title: 'Frequency',
            titlefont: { size: 14 }
          },
          yaxis2: {
            title: 'Topic Count',
            titlefont: { size: 14 },
            overlaying: 'y',
            side: 'right'
          },
          plot_bgcolor: '#f8f9fa',
          paper_bgcolor: '#ffffff',
          margin: { l: 60, r: 60, t: 80, b: 100 },
          legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#ddd',
            borderwidth: 1
          },
          annotations: [{
            text: 'Sentiment Distribution',
            x: 0.85,
            y: 0.5,
            xref: 'paper',
            yref: 'paper',
            showarrow: false,
            font: { size: 12, weight: 'bold' }
          }]
        };

        const config = {
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          toImageButtonOptions: {
            format: 'png',
            filename: 'content-analysis-chart',
            height: 500,
            width: 800,
            scale: 1
          }
        };

        Plotly.newPlot(plotlyChartRef.current, [trace1, trace2, trace3], layout, config);
        console.log('Enhanced Plotly chart created successfully');
      } catch (error) {
        console.error('Error creating Plotly chart:', error);
      }
    } else {
      console.warn('Cannot initialize Plotly chart - missing ref or data');
    }
  };

  const initializeQuestionTypesChart = (data) => {
    console.log('Initializing question types chart with data:', data?.questionTypesData);
    if (questionTypesChartRef.current && data?.questionTypesData) {
      const ctx = questionTypesChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (questionTypesChartRef.current.chartInstance) {
        questionTypesChartRef.current.chartInstance.destroy();
      }
      
      try {
        questionTypesChartRef.current.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: data.questionTypesData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Question Types Distribution',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'bottom',
                labels: { 
                  usePointStyle: true,
                  padding: 15
                }
              }
            },
            cutout: '50%'
          }
        });
        console.log('Question types chart created successfully');
      } catch (error) {
        console.error('Error creating question types chart:', error);
      }
    } else {
      console.warn('Cannot initialize question types chart - missing ref or data');
    }
  };

  const initializeComplexityChart = (data) => {
    console.log('Initializing complexity chart with data:', data?.complexityData);
    if (complexityChartRef.current && data?.complexityData) {
      const ctx = complexityChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (complexityChartRef.current.chartInstance) {
        complexityChartRef.current.chartInstance.destroy();
      }
      
      try {
        complexityChartRef.current.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: data.complexityData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Question Complexity Analysis',
                font: { size: 16, weight: 'bold' }
              },
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
        console.log('Complexity chart created successfully');
      } catch (error) {
        console.error('Error creating complexity chart:', error);
      }
    } else {
      console.warn('Cannot initialize complexity chart - missing ref or data');
    }
  };

  const initializeLinguisticChart = (data) => {
    console.log('Initializing linguistic chart with data:', data?.linguisticData);
    if (linguisticChartRef.current && data?.linguisticData) {
      const ctx = linguisticChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (linguisticChartRef.current.chartInstance) {
        linguisticChartRef.current.chartInstance.destroy();
      }
      
      try {
        linguisticChartRef.current.chartInstance = new Chart(ctx, {
          type: 'radar',
          data: data.linguisticData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Linguistic Features Analysis',
                font: { size: 16, weight: 'bold' }
              },
              legend: { display: false }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: { display: false }
              }
            }
          }
        });
        console.log('Linguistic chart created successfully');
      } catch (error) {
        console.error('Error creating linguistic chart:', error);
      }
    } else {
      console.warn('Cannot initialize linguistic chart - missing ref or data');
    }
  };

  const initializeTimeReferenceChart = (data) => {
    console.log('Initializing time reference chart with data:', data?.timeReferenceData);
    if (timeReferenceChartRef.current && data?.timeReferenceData) {
      const ctx = timeReferenceChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (timeReferenceChartRef.current.chartInstance) {
        timeReferenceChartRef.current.chartInstance.destroy();
      }
      
      try {
        timeReferenceChartRef.current.chartInstance = new Chart(ctx, {
          type: 'pie',
          data: data.timeReferenceData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Time Reference Analysis',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'bottom',
                labels: { 
                  usePointStyle: true,
                  padding: 15
                }
              }
            }
          }
        });
        console.log('Time reference chart created successfully');
      } catch (error) {
        console.error('Error creating time reference chart:', error);
      }
    } else {
      console.warn('Cannot initialize time reference chart - missing ref or data');
    }
  };

  const initializeMetricsChart = (data) => {
    console.log('Initializing metrics chart with data:', data?.advancedMetrics);
    if (metricsChartRef.current && data?.advancedMetrics) {
      const ctx = metricsChartRef.current.getContext('2d');
      
      // Clear any existing chart
      if (metricsChartRef.current.chartInstance) {
        metricsChartRef.current.chartInstance.destroy();
      }
      
      try {
        const metricsData = {
          labels: ['Content Diversity', 'Emotional Range', 'Question Complexity', 'Linguistic Richness', 'Analytical Depth'],
          datasets: [{
            label: 'Content Quality Metrics',
            data: [
              data.advancedMetrics.contentDiversity,
              data.advancedMetrics.emotionalRange,
              data.advancedMetrics.questionComplexity,
              data.advancedMetrics.linguisticRichness,
              data.advancedMetrics.analyticalDepth
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 2
          }]
        };

        metricsChartRef.current.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: metricsData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Advanced Content Quality Metrics',
                font: { size: 16, weight: 'bold' }
              },
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { 
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            }
          }
        });
        console.log('Metrics chart created successfully');
      } catch (error) {
        console.error('Error creating metrics chart:', error);
      }
    } else {
      console.warn('Cannot initialize metrics chart - missing ref or data');
    }
  };

  // Word confidence classification
  const getWordConfidenceClass = (word) => {
    const confidence = Math.random(); // In real implementation, this would come from the analysis
    if (confidence > 0.8) return 'high-confidence';
    if (confidence > 0.5) return 'medium-confidence';
    return 'low-confidence';
  };

  // Helper functions for question analysis display
  const getQuestionTypeDescription = (type) => {
    const descriptions = {
      what: 'Seeks information about things, definitions, or explanations',
      how: 'Asks about processes, methods, or procedures',
      why: 'Explores reasons, causes, or motivations',
      when: 'Inquires about time, timing, or temporal information',
      where: 'Asks about location, place, or spatial information',
      who: 'Seeks information about people, roles, or identity',
      which: 'Requests choice or selection from options',
      whose: 'Inquires about ownership or possession',
      yesNo: 'Requires simple yes/no or binary answers',
      choice: 'Presents alternatives for decision-making',
      confirmation: 'Seeks validation or agreement',
      other: 'Miscellaneous or unclassified questions'
    };
    return descriptions[type] || 'General inquiry';
  };

  const getComplexityDescription = (level) => {
    const descriptions = {
      simple: 'Short, direct questions with clear intent',
      moderate: 'Questions with some complexity or subclauses',
      complex: 'Multi-part questions with conditional elements'
    };
    return descriptions[level] || 'Standard complexity';
  };

  if (!isVisible) return null;

  console.log('TranscriptAnalysis rendering:', { isVisible, analysis: !!analysis, loading, activeTab });

  return (
    <>
      {/* Guide button, fixed at top right, no functionality yet, styled for visibility */}
      <button
        className="guide-button"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 2000,
          background: 'orange',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 28px',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
        tabIndex={-1}
        aria-label="Guide"
      >
        Guide
      </button>

      {/* Export buttons for analysis */}
      {analysis && (
        <div style={{ display: 'flex', gap: 12, margin: '18px 0 0 18px' }}>
          <button
            onClick={() => exportAnalysisAsJSON(analysis)}
            style={{
              background: '#2d8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '1em', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            Export as JSON
          </button>
          <button
            onClick={() => exportAnalysisAsCSV(analysis)}
            style={{
              background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '1em', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            Export as CSV
          </button>
        </div>
      )}

      <div className="transcript-analysis">
      <div className="analysis-header">
        <h2>📊 Transcript Analysis & Insights</h2>
        <div className="analysis-tabs">
          <button 
            className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to summary tab');
              setActiveTab('summary');
            }}
          >
            📝 Summary
          </button>
          <button 
            className={`tab-button ${activeTab === 'detailed' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to detailed tab');
              setActiveTab('detailed');
            }}
          >
            📋 Detailed Analysis
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to insights tab');
              setActiveTab('insights');
            }}
          >
            💡 Insights
          </button>
          <button 
            className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to charts tab');
              setActiveTab('charts');
              // Re-initialize charts when tab is activated
              if (chartData) {
                setTimeout(() => {
                  initializeCharts(chartData);
                }, 100);
              }
            }}
          >
            📊 Charts
          </button>
          <button 
            className={`tab-button ${activeTab === 'linguistic' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to linguistic tab');
              setActiveTab('linguistic');
            }}
          >
            🔤 Linguistic
          </button>
          <button 
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to content tab');
              setActiveTab('content');
            }}
          >
            📖 Content
          </button>
          <button 
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to statistics tab');
              setActiveTab('statistics');
            }}
          >
            📈 Statistics
          </button>
          <button 
            className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to transcript tab');
              setActiveTab('transcript');
            }}
          >
            📝 Transcript
          </button>
          <button 
            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to questions tab');
              setActiveTab('questions');
            }}
          >
            ❓ Questions
          </button>
        </div>
      </div>

      {loading && (
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing transcript...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="analysis-content">
          {/* Tab explanations - detailed */}
          <div style={{ marginBottom: '12px', padding: '14px 18px', background: '#f6f6fa', borderRadius: '7px', color: '#222', fontSize: '1.08em', fontWeight: 500, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', lineHeight: 1.7 }}>
            {activeTab === 'summary' && (
              <>
                <b>Summary Tab:</b> Provides a concise overview of your transcript, including:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Summary:</b> Auto-generated brief of the transcript's main content.</li>
                  <li><b>Quick Stats:</b> Word count, sentence count, estimated reading time, readability score, and analysis confidence.</li>
                  <li><b>Spam Detection:</b> Indicates if the transcript is likely spam, with matched keywords and spam score.</li>
                </ul>
              </>
            )}
            {activeTab === 'detailed' && (
              <>
                <b>Detailed Analysis Tab:</b> Offers an in-depth breakdown, including:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Brief Summary:</b> A short summary of the transcript.</li>
                  <li><b>Main Points:</b> Key points and highlights extracted from the content.</li>
                  <li><b>Key Findings:</b> Important findings or insights identified.</li>
                  <li><b>Conclusions:</b> Summarized conclusions drawn from the transcript.</li>
                  <li><b>Questions Raised:</b> List of questions that arise from the content.</li>
                  <li><b>Overview Grid:</b> Shows length, tone, primary topic, complexity, reading level, and structure.</li>
                </ul>
              </>
            )}
            {activeTab === 'insights' && (
              <>
                <b>Insights Tab:</b> Presents actionable insights and sentiment analysis:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Insights Grid:</b> Actionable takeaways, warnings, or suggestions, each with severity and icon.</li>
                  <li><b>Sentiment Analysis:</b> Overall sentiment label, score, and confidence.</li>
                </ul>
              </>
            )}
            {activeTab === 'linguistic' && (
              <>
                <b>Linguistic Tab:</b> Explores the language and structure of the transcript:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Vocabulary Analysis:</b> Complexity, average word length, unique words, and repetition rate.</li>
                  <li><b>Sentence Types:</b> Counts of declarative, interrogative, and exclamatory sentences.</li>
                  <li><b>Tense Distribution:</b> Usage of past, present, and future tenses.</li>
                  <li><b>Structure Analysis:</b> Coherence score, transition words, organization, and bullet points.</li>
                </ul>
              </>
            )}
            {activeTab === 'content' && (
              <>
                <b>Content Tab:</b> Analyzes the types and entities in your transcript:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Content Types:</b> Factual statements, opinions, and examples.</li>
                  <li><b>Named Entities:</b> People, organizations, locations, and dates mentioned.</li>
                  <li><b>Question Analysis:</b> Total, direct, and rhetorical questions, with breakdown by type.</li>
                  <li><b>Action Items:</b> Tasks or follow-ups identified in the transcript.</li>
                  <li><b>Themes:</b> Main themes and their frequency.</li>
                  <li><b>Time Analysis:</b> Focus on past, present, future, and dominant tense.</li>
                </ul>
              </>
            )}
            {activeTab === 'charts' && (
              <>
                <b>Charts Tab:</b> Visualizes transcript data with interactive charts:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Sentiment Analysis:</b> Pie chart of positive, negative, and neutral sentiments.</li>
                  <li><b>Top Keywords:</b> Bar chart of most frequent words.</li>
                  <li><b>Topic Distribution:</b> Doughnut chart of main topics.</li>
                  <li><b>Emotional Analysis:</b> Radar chart of emotional intensities.</li>
                  <li><b>Question Types & Complexity:</b> Charts for question types and complexity levels.</li>
                  <li><b>Linguistic Features:</b> Chart of vocabulary and readability.</li>
                  <li><b>Time References:</b> Chart of past, present, and future references.</li>
                  <li><b>Content Quality Metrics:</b> Advanced metrics for diversity and depth.</li>
                  <li><b>Interactive Dashboard:</b> Multi-dimensional Plotly chart combining keywords, topics, and sentiment.</li>
                </ul>
              </>
            )}
            {activeTab === 'statistics' && (
              <>
                <b>Statistics Tab:</b> Shows detailed text statistics and accuracy metrics:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Text Statistics:</b> Word, sentence, and paragraph counts, reading time.</li>
                  <li><b>Readability:</b> Readability score and description.</li>
                  <li><b>Top Keywords:</b> Most frequent keywords and their counts.</li>
                  <li><b>Confidence Scores:</b> Analysis, sentiment, readability, keywords, and content confidence.</li>
                  <li><b>Accuracy Metrics:</b> Data quality, analysis depth, entity recognition, and linguistic coverage.</li>
                </ul>
              </>
            )}
            {activeTab === 'questions' && (
              <>
                <b>Questions Tab:</b> Deep dive into all questions in the transcript:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Questions Overview:</b> Total, direct, and rhetorical questions, with summary stats.</li>
                  <li><b>Types Breakdown:</b> Counts and icons for each question type (what, how, why, etc.).</li>
                  <li><b>Purposes:</b> Information, clarification, confirmation, engagement, reflection, challenge.</li>
                  <li><b>Complexity Analysis:</b> Distribution of question complexity levels.</li>
                  <li><b>Question Insights:</b> Key insights about the questions asked.</li>
                  <li><b>All Questions List:</b> Every question found, with context, type, purpose, and analysis.</li>
                </ul>
              </>
            )}
            {activeTab === 'transcript' && (
              <>
                <b>Transcript Tab:</b> Annotated, word-by-word transcript analysis:
                <ul style={{marginTop:4,marginBottom:0,paddingLeft:22}}>
                  <li><b>Word-by-Word Analysis:</b> Each word is annotated as a keyword, named entity, or regular word.</li>
                  <li><b>Word Cloud:</b> Visual representation of the most frequent words.</li>
                  <li><b>Annotated Transcript:</b> The full transcript with color-coded highlights.</li>
                  <li><b>Legend:</b> Explains the color codes for keywords, entities, and regular words.</li>
                </ul>
              </>
            )}
            {/* Default message if no tab is active or data is missing */}
            {!(activeTab === 'summary' || activeTab === 'detailed' || activeTab === 'insights' || activeTab === 'linguistic' || activeTab === 'content' || activeTab === 'charts' || activeTab === 'statistics' || activeTab === 'questions' || activeTab === 'transcript') && (
              <span>
                <b>Analysis Overview:</b> Select a tab above to view detailed explanations and insights for your transcript. Each tab provides a unique perspective, from summaries and statistics to deep dives into questions, content, and linguistic features.
              </span>
            )}
          </div>
          <div style={{ marginBottom: '20px', padding: '10px', background: '#34495e', borderRadius: '5px' }}>
            <small>Debug Info: Active Tab: {activeTab} | Analysis Keys: {Object.keys(analysis || {}).join(', ')}</small>
          </div>
          
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="analysis-section">
              <div className="summary-card">
                <h3>📋 Summary</h3>
                <div className="summary-content">
                  <TypeWriter text={analysis.summary} speed={30} className="summary-text" />
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-value">
                    <AnimatedCounter value={chartData?.statisticsData?.wordCount || 0} />
                  </div>
                  <div className="stat-label">Words</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <AnimatedCounter value={chartData?.statisticsData?.sentenceCount || 0} />
                  </div>
                  <div className="stat-label">Sentences</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <AnimatedCounter value={chartData?.statisticsData?.readingTime || 0} />m
                  </div>
                  <div className="stat-label">Reading Time</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <AnimatedCounter value={chartData?.statisticsData?.confidenceScore || 0} />%
                  </div>
                  <div className="stat-label">Analysis Confidence</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <AnimatedCounter value={Math.round(analysis.readabilityScore || 0)} />
                  </div>
                  <div className="stat-label">Readability Score</div>
                </div>
              {/* Spam Detection Result */}
              <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
                <div className="stat-value" style={{ color: analysis.spamDetection?.isSpam ? '#e74c3c' : '#27ae60', fontWeight: 'bold', fontSize: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}>
                  {analysis.spamDetection?.isSpam ? <span style={{fontSize:36}}>🚨</span> : <span style={{fontSize:36}}>✅</span>}
                  <span style={{fontWeight:'bold', fontSize:28, marginTop:4}}>{analysis.spamDetection?.isSpam ? 'Spam' : 'Not'}</span>
                  {!analysis.spamDetection?.isSpam && <span style={{fontWeight:'bold', fontSize:28, marginTop:-4}}>Spam</span>}
                </div>
                <div className="stat-label" style={{ marginTop: 4, fontWeight: 600, letterSpacing: 1, fontSize: 14 }}>SPAM DETECTION</div>
                {typeof analysis.spamDetection?.spamScore !== 'undefined' && (
                  <div style={{ fontSize: '0.9em', color: '#aaa', marginTop: 2 }}>
                    Score: {analysis.spamDetection.spamScore}
                  </div>
                )}
                {typeof analysis.spamDetection?.spamPercent !== 'undefined' && (
                  <div style={{ fontSize: '0.9em', color: analysis.spamDetection.spamPercent > 50 ? '#e74c3c' : '#27ae60', marginTop: 2 }}>
                    Spam %: {analysis.spamDetection.spamPercent}%
                  </div>
                )}
                {Array.isArray(analysis.spamDetection?.matchedKeywords) && analysis.spamDetection.matchedKeywords.length > 0 && (
                  <div style={{ fontSize: '0.9em', color: '#e67e22', marginTop: 2, textAlign: 'center' }}>
                    Matched Spam Keywords: {analysis.spamDetection.matchedKeywords.map(k => `${k}${analysis.spamDetection.matchedKeywordCounts && analysis.spamDetection.matchedKeywordCounts[k] ? ` (${analysis.spamDetection.matchedKeywordCounts[k]})` : ''}`).join(', ')}
                  </div>
                )}
                {Array.isArray(analysis.spamDetection?.uniqueSuspicious) && analysis.spamDetection.uniqueSuspicious.length > 0 && (
                  <div style={{ fontSize: '0.9em', color: '#f39c12', marginTop: 2, textAlign: 'center' }}>
                    Unique Suspicious Keywords: {analysis.spamDetection.uniqueSuspicious.map(k => `${k.word} (${k.count})`).join(', ')}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis Tab */}
          {activeTab === 'detailed' && (
            <div className="analysis-section">
              <div className="detailed-summary">
                <div className="summary-card">
                  <h3>📋 Brief Summary</h3>
                  <p>{analysis.detailedSummary?.brief || 'No brief summary available'}</p>
                </div>

                <div className="summary-card">
                  <h3>🎯 Main Points</h3>
                  <ul>
                    {analysis.detailedSummary?.mainPoints?.length > 0 ? (
                      analysis.detailedSummary.mainPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))
                    ) : (
                      <li>No main points identified</li>
                    )}
                  </ul>
                </div>

                <div className="summary-card">
                  <h3>🔍 Key Findings</h3>
                  <ul>
                    {analysis.detailedSummary?.keyFindings?.length > 0 ? (
                      analysis.detailedSummary.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))
                    ) : (
                      <li>No key findings identified</li>
                    )}
                  </ul>
                </div>

                <div className="summary-card">
                  <h3>💭 Conclusions</h3>
                  <ul>
                    {analysis.detailedSummary?.conclusions?.length > 0 ? (
                      analysis.detailedSummary.conclusions.map((conclusion, index) => (
                        <li key={index}>{conclusion}</li>
                      ))
                    ) : (
                      <li>No conclusions identified</li>
                    )}
                  </ul>
                </div>

                <div className="summary-card">
                  <h3>❓ Questions Raised</h3>
                  <ul>
                    {analysis.detailedSummary?.questions?.length > 0 ? (
                      analysis.detailedSummary.questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))
                    ) : (
                      <li>No questions identified</li>
                    )}
                  </ul>
                </div>

                <div className="overview-grid">
                  <div className="overview-item">
                    <strong>Length:</strong> {analysis.detailedSummary?.overview?.length || 'N/A'}
                  </div>
                  <div className="overview-item">
                    <strong>Tone:</strong> {analysis.detailedSummary?.overview?.tone || 'N/A'}
                  </div>
                  <div className="overview-item">
                    <strong>Primary Topic:</strong> {analysis.detailedSummary?.overview?.primaryTopic || 'N/A'}
                  </div>
                  <div className="overview-item">
                    <strong>Complexity:</strong> {analysis.detailedSummary?.overview?.complexity || 'N/A'}
                  </div>
                  <div className="overview-item">
                    <strong>Reading Level:</strong> {analysis.detailedSummary?.overview?.readingLevel || 'N/A'}
                  </div>
                  <div className="overview-item">
                    <strong>Structure:</strong> {analysis.detailedSummary?.structure?.structure || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="analysis-section">
              <div className="insights-grid">
                {analysis.insights && analysis.insights.length > 0 ? (
                  analysis.insights.map((insight, index) => (
                    <div key={index} className={`insight-card ${insight.severity}`}>
                      <div className="insight-header">
                        <span className="insight-icon">{insight.icon}</span>
                        <h4>{insight.title}</h4>
                      </div>
                      <p>{insight.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="insight-card info">
                    <div className="insight-header">
                      <span className="insight-icon">💡</span>
                      <h4>No Insights Available</h4>
                    </div>
                    <p>No specific insights could be generated for this transcript.</p>
                  </div>
                )}
              </div>

              <div className="sentiment-analysis">
                <h3>🎭 Sentiment Analysis</h3>
                <div className="sentiment-details">
                  <div className={`sentiment-badge ${analysis.sentiment?.label?.toLowerCase() || 'neutral'}`}>
                    {analysis.sentiment?.label || 'Neutral'}
                  </div>
                  <div className="sentiment-score">
                    Score: {((analysis.sentiment?.score || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="sentiment-confidence">
                    Confidence: {((analysis.sentiment?.confidence || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linguistic Analysis Tab */}
          {activeTab === 'linguistic' && (
            <div className="analysis-section">
              <div className="linguistic-grid">
                <div className="linguistic-card">
                  <h3>📝 Vocabulary Analysis</h3>
                  <div className="linguistic-details">
                    <div className="detail-row">
                      <span>Vocabulary Complexity:</span>
                      <span>{analysis.linguisticAnalysis?.vocabularyComplexity || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Average Word Length:</span>
                      <span>{analysis.linguisticAnalysis?.averageWordLength || 'N/A'} characters</span>
                    </div>
                    <div className="detail-row">
                      <span>Unique Words:</span>
                      <span>{analysis.linguisticAnalysis?.uniqueWords || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span>Repetition Rate:</span>
                      <span>{analysis.linguisticAnalysis?.repetitionRate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="linguistic-card">
                  <h3>🔤 Sentence Types</h3>
                  <div className="sentence-types">
                    <div className="type-item">
                      <span>Declarative:</span>
                      <span>{analysis.linguisticAnalysis?.sentenceTypes?.declarative || 0}</span>
                    </div>
                    <div className="type-item">
                      <span>Interrogative:</span>
                      <span>{analysis.linguisticAnalysis?.sentenceTypes?.interrogative || 0}</span>
                    </div>
                    <div className="type-item">
                      <span>Exclamatory:</span>
                      <span>{analysis.linguisticAnalysis?.sentenceTypes?.exclamatory || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="linguistic-card">
                  <h3>⏰ Tense Distribution</h3>
                  <div className="tense-analysis">
                    <div className="tense-item">
                      <span>Past:</span>
                      <span>{analysis.linguisticAnalysis?.tenseDistribution?.past || 0}</span>
                    </div>
                    <div className="tense-item">
                      <span>Present:</span>
                      <span>{analysis.linguisticAnalysis?.tenseDistribution?.present || 0}</span>
                    </div>
                    <div className="tense-item">
                      <span>Future:</span>
                      <span>{analysis.linguisticAnalysis?.tenseDistribution?.future || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="linguistic-card">
                  <h3>🏗️ Structure Analysis</h3>
                  <div className="structure-details">
                    <div className="detail-row">
                      <span>Coherence Score:</span>
                      <span>{analysis.structuralAnalysis?.coherenceScore || 0}/100</span>
                    </div>
                    <div className="detail-row">
                      <span>Transition Words:</span>
                      <span>{analysis.structuralAnalysis?.transitionWords || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span>Organization:</span>
                      <span>{analysis.structuralAnalysis?.organizationPattern || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Bullet Points:</span>
                      <span>{analysis.structuralAnalysis?.listElements?.bulletPoints || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Analysis Tab */}
          {activeTab === 'content' && (
            <div className="analysis-section">
              <div className="content-grid">
                <div className="content-card">
                  <h3>📊 Content Types</h3>
                  <div className="content-types">
                    <div className="type-bar">
                      <span>Factual Statements:</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${(analysis.contentAnalysis?.contentTypes?.factual || 0) * 10}%` }}></div>
                      </div>
                      <span>{analysis.contentAnalysis?.contentTypes?.factual}</span>
                    </div>
                    <div className="type-bar">
                      <span>Opinions:</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${(analysis.contentAnalysis?.contentTypes?.opinions || 0) * 10}%` }}></div>
                      </div>
                      <span>{analysis.contentAnalysis?.contentTypes?.opinions}</span>
                    </div>
                    <div className="type-bar">
                      <span>Examples:</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${(analysis.contentAnalysis?.contentTypes?.examples || 0) * 10}%` }}></div>
                      </div>
                      <span>{analysis.contentAnalysis?.contentTypes?.examples}</span>
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <h3>🎯 Named Entities</h3>
                  <div className="entities-grid">
                    <div className="entity-group">
                      <h4>👥 People</h4>
                      <ul>
                        {analysis.namedEntities?.people?.length > 0 ? (
                          analysis.namedEntities.people.slice(0, 3).map((person, index) => (
                            <li key={index}>{person}</li>
                          ))
                        ) : (
                          <li>No people identified</li>
                        )}
                      </ul>
                    </div>
                    <div className="entity-group">
                      <h4>🏢 Organizations</h4>
                      <ul>
                        {analysis.namedEntities?.organizations?.length > 0 ? (
                          analysis.namedEntities.organizations.slice(0, 3).map((org, index) => (
                            <li key={index}>{org}</li>
                          ))
                        ) : (
                          <li>No organizations identified</li>
                        )}
                      </ul>
                    </div>
                    <div className="entity-group">
                      <h4>📍 Locations</h4>
                      <ul>
                        {analysis.namedEntities?.locations?.length > 0 ? (
                          analysis.namedEntities.locations.slice(0, 3).map((loc, index) => (
                            <li key={index}>{loc}</li>
                          ))
                        ) : (
                          <li>No locations identified</li>
                        )}
                      </ul>
                    </div>
                    <div className="entity-group">
                      <h4>📅 Dates</h4>
                      <ul>
                        {analysis.namedEntities?.dates?.length > 0 ? (
                          analysis.namedEntities.dates.slice(0, 3).map((date, index) => (
                            <li key={index}>{date}</li>
                          ))
                        ) : (
                          <li>No dates identified</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <h3>❓ Question Analysis</h3>
                  <div className="question-analysis-header">
                    <div className="question-stats">
                      <div className="stat-item">
                        <span>Total Questions:</span>
                        <span className="stat-value">{analysis.questionAnalysis?.totalQuestions || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span>Direct Questions:</span>
                        <span className="stat-value">{analysis.questionAnalysis?.direct || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span>Rhetorical Questions:</span>
                        <span className="stat-value">{analysis.questionAnalysis?.rhetorical || 0}</span>
                      </div>
                    </div>
                    
                    <div className="question-types-grid">
                      <div className="question-type-item">
                        <span className="type-label">What:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.what || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">How:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.how || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">Why:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.why || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">When:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.when || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">Where:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.where || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">Who:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.who || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">Yes/No:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.yesNo || 0}</span>
                      </div>
                      <div className="question-type-item">
                        <span className="type-label">Other:</span>
                        <span className="type-count">{analysis.questionAnalysis?.questionTypes?.other || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="questions-list">
                    <h4>📝 Questions Found in Text:</h4>
                    {analysis.questionAnalysis?.questionsWithContext?.length > 0 ? (
                      <div className="extracted-questions">
                        {analysis.questionAnalysis.questionsWithContext.map((question, index) => (
                          <div key={index} className={`question-item ${question.isRhetorical ? 'rhetorical' : 'direct'}`}>
                            <div className="question-header">
                              <span className="question-number">Q{index + 1}</span>
                              <span className={`question-type-badge ${question.type}`}>
                                {question.type.toUpperCase()}
                              </span>
                              <span className={`question-style-badge ${question.isRhetorical ? 'rhetorical' : 'direct'}`}>
                                {question.isRhetorical ? 'Rhetorical' : 'Direct'}
                              </span>
                            </div>
                            <div className="question-text">
                              {question.text}
                            </div>
                            {question.context && (question.context.before || question.context.after) && (
                              <div className="question-context">
                                {question.context.before && (
                                  <div className="context-before">
                                    <strong>Context before:</strong> {question.context.before}
                                  </div>
                                )}
                                {question.context.after && (
                                  <div className="context-after">
                                    <strong>Context after:</strong> {question.context.after}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-questions">
                        <div className="no-questions-icon">❓</div>
                        <p>No questions found in this transcript.</p>
                        <p className="suggestion">This suggests a more declarative communication style focused on providing information rather than seeking it.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="content-card">
                  <h3>✅ Action Items</h3>
                  <div className="action-items">
                    {analysis.actionItems && analysis.actionItems.length > 0 ? (
                      analysis.actionItems.slice(0, 5).map((item, index) => (
                        <div key={index} className={`action-item priority-${item.priority?.toLowerCase() || 'low'}`}>
                          <div className="action-text">{item.text}</div>
                          <div className="action-meta">
                            <span className="priority">{item.priority || 'Low'}</span>
                            <span className="type">{item.type || 'Task'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="action-item priority-low">
                        <div className="action-text">No action items identified</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="content-card">
                  <h3>🎨 Themes</h3>
                  <div className="themes-list">
                    {analysis.themes && analysis.themes.length > 0 ? (
                      analysis.themes.map((theme, index) => (
                        <div key={index} className="theme-item">
                          <span className="theme-name">{theme.theme}</span>
                          <span className="theme-count">{theme.count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="theme-item">
                        <span className="theme-name">No themes identified</span>
                        <span className="theme-count">0</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="content-card">
                  <h3>⏰ Time Analysis</h3>
                  <div className="time-analysis">
                    <div className="time-orientation">
                      <div className="time-item">
                        <span>Past Focus:</span>
                        <span>{analysis.timeAnalysis?.timeOrientation?.past || 0}</span>
                      </div>
                      <div className="time-item">
                        <span>Present Focus:</span>
                        <span>{analysis.timeAnalysis?.timeOrientation?.present || 0}</span>
                      </div>
                      <div className="time-item">
                        <span>Future Focus:</span>
                        <span>{analysis.timeAnalysis?.timeOrientation?.future || 0}</span>
                      </div>
                    </div>
                    <div className="dominant-tense">
                      <strong>Dominant Tense:</strong> {analysis.timeAnalysis?.dominantTense || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="analysis-section">
              <div className="charts-intro">
                <h3>📊 Visual Analytics Dashboard</h3>
                <p>Comprehensive visual analysis of your transcript content with interactive charts and advanced metrics.</p>
              </div>
              
              {/* Key Insights Cards */}
              <div className="insights-cards">
                <div className="insight-card">
                  <div className="insight-icon">📈</div>
                  <div className="insight-content">
                    <h4>Content Quality Score</h4>
                    <div className="insight-value">{chartData?.statisticsData?.confidenceScore || 0}%</div>
                    <p>Overall analysis confidence</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">🎯</div>
                  <div className="insight-content">
                    <h4>Dominant Sentiment</h4>
                    <div className="insight-value">{analysis?.sentiment?.label || 'Neutral'}</div>
                    <p>{((analysis?.sentiment?.confidence || 0) * 100).toFixed(1)}% confidence</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">📚</div>
                  <div className="insight-content">
                    <h4>Reading Level</h4>
                    <div className="insight-value">{analysis?.contentAnalysis?.overview?.readingLevel || 'Medium'}</div>
                    <p>{chartData?.statisticsData?.readingTime || 0} min read</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">❓</div>
                  <div className="insight-content">
                    <h4>Questions Found</h4>
                    <div className="insight-value">{chartData?.statisticsData?.questionCount || 0}</div>
                    <p>Interactive elements detected</p>
                  </div>
                </div>
              </div>
              
              <div className="charts-grid">
                <div className="chart-container">
                  <h4>Sentiment Analysis</h4>
                  <canvas ref={sentimentChartRef}></canvas>
                  <div className="chart-info">
                    <p>Distribution of positive, negative, and neutral sentiments in the content</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Top Keywords</h4>
                  <canvas ref={keywordsChartRef}></canvas>
                  <div className="chart-info">
                    <p>Most frequently used words and their occurrence counts</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Topic Distribution</h4>
                  <canvas ref={topicsChartRef}></canvas>
                  <div className="chart-info">
                    <p>Main topics covered in the content and their relative importance</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Emotional Analysis</h4>
                  <canvas ref={emotionsChartRef}></canvas>
                  <div className="chart-info">
                    <p>Emotional spectrum analysis showing different emotional intensities</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Question Types</h4>
                  <canvas ref={questionTypesChartRef}></canvas>
                  <div className="chart-info">
                    <p>Distribution of different question types (What, How, Why, etc.)</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Question Complexity</h4>
                  <canvas ref={complexityChartRef}></canvas>
                  <div className="chart-info">
                    <p>Analysis of question complexity levels from simple to complex</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Linguistic Features</h4>
                  <canvas ref={linguisticChartRef}></canvas>
                  <div className="chart-info">
                    <p>Analysis of linguistic complexity, vocabulary, and readability</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Time References</h4>
                  <canvas ref={timeReferenceChartRef}></canvas>
                  <div className="chart-info">
                    <p>Distribution of past, present, and future time references</p>
                  </div>
                </div>
                
                <div className="chart-container chart-wide">
                  <h4>Content Quality Metrics</h4>
                  <canvas ref={metricsChartRef}></canvas>
                  <div className="chart-info">
                    <p>Advanced metrics showing content diversity, emotional range, and analytical depth</p>
                  </div>
                </div>
              </div>

              <div className="plotly-chart-container">
                <h4>📈 Interactive Dashboard</h4>
                <div ref={plotlyChartRef}></div>
                <div className="chart-info">
                  <p>Interactive multi-dimensional analysis combining keywords, topics, and sentiment data</p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Sections (NEW) */}
          {activeTab === 'summary' && analysis?.analysisSections && (
            <div className="analysis-sections-grid">
              {analysis.analysisSections.map((section, idx) => (
                <div key={idx} className="analysis-section-card white-text">
                  <h4>{section.label}</h4>
                  <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{JSON.stringify(section, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'statistics' && (
            <div className="analysis-section">
              <div className="statistics-grid">
                <div className="stat-card">
                  <h4>📊 Text Statistics</h4>
                  <div className="stat-details">
                    <div className="stat-row">
                      <span>Words:</span>
                      <span>{analysis.statistics?.wordCount || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Sentences:</span>
                      <span>{analysis.statistics?.sentenceCount || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Paragraphs:</span>
                      <span>{analysis.statistics?.paragraphCount || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Reading Time:</span>
                      <span>{analysis.statistics?.readingTime || 0} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>📈 Readability</h4>
                  <div className="readability-score">
                    <div className="score-circle">
                      <span className="score-value">{Math.round(analysis.readabilityScore || 0)}</span>
                      <span className="score-label">/100</span>
                    </div>
                    <p className="readability-description">
                      {(analysis.readabilityScore || 0) >= 70 ? 'Easy to read' :
                       (analysis.readabilityScore || 0) >= 50 ? 'Moderate difficulty' :
                       'Difficult to read'}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>🔑 Top Keywords</h4>
                  <div className="keywords-list">
                    {analysis.keywords && analysis.keywords.length > 0 ? (
                      analysis.keywords.slice(0, 5).map((keyword, index) => (
                        <div key={index} className="keyword-item">
                          <span className="keyword-word">{keyword.word}</span>
                          <span className="keyword-count">{keyword.count}x</span>
                        </div>
                      ))
                    ) : (
                      <div className="keyword-item">
                        <span className="keyword-word">No keywords found</span>
                        <span className="keyword-count">0x</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="stat-card">
                  <h4>🎯 Confidence Scores</h4>
                  <div className="confidence-scores">
                    <div className="confidence-item">
                      <span>Overall Analysis Confidence:</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: `${chartData?.statisticsData?.confidenceScore || 0}%` }}
                        ></div>
                      </div>
                      <span>{chartData?.statisticsData?.confidenceScore || 0}%</span>
                    </div>
                    <div className="confidence-item">
                      <span>Sentiment Confidence:</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: `${(analysis.sentiment?.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span>{((analysis.sentiment?.confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="confidence-item">
                      <span>Readability Confidence:</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: `${Math.min(100, (analysis.readabilityScore || 0))}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(analysis.readabilityScore || 0)}%</span>
                    </div>
                    <div className="confidence-item">
                      <span>Keywords Confidence:</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: `${Math.min(100, (analysis.keywords?.length || 0) * 10)}%` }}
                        ></div>
                      </div>
                      <span>{Math.min(100, (analysis.keywords?.length || 0) * 10)}%</span>
                    </div>
                    <div className="confidence-item">
                      <span>Content Analysis Confidence:</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: `${Math.min(100, ((analysis.statistics?.wordCount || 0) / 10))}%` }}
                        ></div>
                      </div>
                      <span>{Math.min(100, Math.round((analysis.statistics?.wordCount || 0) / 10))}%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>📊 Analysis Accuracy Metrics</h4>
                  <div className="accuracy-metrics">
                    <div className="metric-item">
                      <span>Data Quality Score:</span>
                      <div className="metric-value high">
                        {analysis.statistics?.wordCount > 100 ? 'High' : 
                         analysis.statistics?.wordCount > 50 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                    <div className="metric-item">
                      <span>Analysis Depth:</span>
                      <div className="metric-value medium">
                        {analysis.keywords?.length > 10 ? 'Deep' : 
                         analysis.keywords?.length > 5 ? 'Moderate' : 'Basic'}
                      </div>
                    </div>
                    <div className="metric-item">
                      <span>Entity Recognition:</span>
                      <div className="metric-value high">
                        {(analysis.namedEntities?.people?.length || 0) + 
                         (analysis.namedEntities?.organizations?.length || 0) + 
                         (analysis.namedEntities?.locations?.length || 0) > 5 ? 'Excellent' : 
                         (analysis.namedEntities?.people?.length || 0) + 
                         (analysis.namedEntities?.organizations?.length || 0) + 
                         (analysis.namedEntities?.locations?.length || 0) > 2 ? 'Good' : 'Basic'}
                      </div>
                    </div>
                    <div className="metric-item">
                      <span>Linguistic Coverage:</span>
                      <div className="metric-value medium">
                        {analysis.linguisticAnalysis?.uniqueWords > 50 ? 'Comprehensive' : 
                         analysis.linguisticAnalysis?.uniqueWords > 25 ? 'Adequate' : 'Limited'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab - Dedicated Questions Analysis */}
          {activeTab === 'questions' && (
            <div className="analysis-section">
              <div className="questions-overview">
                <div className="questions-summary">
                  <h3>
                    <TypeWriter text="❓ Questions Analysis Overview" speed={80} className="section-title" />
                  </h3>
                  <div className="questions-summary-stats">
                    <div className="summary-stat">
                      <div className="stat-icon">📊</div>
                      <div className="stat-info">
                        <div className="stat-number">
                          <AnimatedCounter value={analysis.questionAnalysis?.totalQuestions || 0} />
                        </div>
                        <div className="stat-label">Total Questions</div>
                      </div>
                    </div>
                    <div className="summary-stat">
                      <div className="stat-icon">🎯</div>
                      <div className="stat-info">
                        <div className="stat-number">
                          <AnimatedCounter value={analysis.questionAnalysis?.direct || 0} />
                        </div>
                        <div className="stat-label">Direct Questions</div>
                      </div>
                    </div>
                    <div className="summary-stat">
                      <div className="stat-icon">💭</div>
                      <div className="stat-info">
                        <div className="stat-number">
                          <AnimatedCounter value={analysis.questionAnalysis?.rhetorical || 0} />
                        </div>
                        <div className="stat-label">Rhetorical Questions</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="question-types-breakdown">
                  <h3>
                    <TypeWriter text="📋 Question Types Breakdown" speed={80} className="section-title" />
                  </h3>
                  
                  <div className="question-type-stats">
                    <div className="stat-row">
                      <span>Question Density:</span>
                      <span className="stat-value">{analysis.questionAnalysis?.questionDensity || 0}%</span>
                    </div>
                    <div className="stat-row">
                      <span>Average Complexity:</span>
                      <span className="stat-value">{analysis.questionAnalysis?.averageComplexity || 'N/A'}</span>
                    </div>
                    <div className="stat-row">
                      <span>Most Common Type:</span>
                      <span className="stat-value">{analysis.questionAnalysis?.mostCommonType || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="types-grid">
                    {Object.entries(analysis.questionAnalysis?.questionTypes || {}).map(([type, count]) => (
                      <div key={type} className="type-breakdown-item">
                        <div className={`type-icon ${type}`}>
                          {type === 'what' && '❓'}
                          {type === 'how' && '🔧'}
                          {type === 'why' && '🤔'}
                          {type === 'when' && '⏰'}
                          {type === 'where' && '📍'}
                          {type === 'who' && '👤'}
                          {type === 'which' && '🔍'}
                          {type === 'whose' && '👑'}
                          {type === 'yesNo' && '✅'}
                          {type === 'choice' && '🔀'}
                          {type === 'confirmation' && '✔️'}
                          {type === 'other' && '❔'}
                        </div>
                        <div className="type-info">
                          <div className="type-count">
                            <AnimatedCounter value={count} />
                          </div>
                          <div className="type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                          <div className="type-description">
                            {getQuestionTypeDescription(type)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Question Purposes Analysis */}
                  <div className="question-purposes">
                    <h4>🎯 Question Purposes</h4>
                    <div className="purposes-grid">
                      {Object.entries(analysis.questionAnalysis?.questionPurposes || {}).map(([purpose, count]) => (
                        <div key={purpose} className="purpose-item">
                          <div className="purpose-icon">
                            {purpose === 'information' && '📊'}
                            {purpose === 'clarification' && '🔍'}
                            {purpose === 'confirmation' && '✅'}
                            {purpose === 'engagement' && '💬'}
                            {purpose === 'reflection' && '🤔'}
                            {purpose === 'challenge' && '⚡'}
                          </div>
                          <div className="purpose-details">
                            <div className="purpose-count">{count}</div>
                            <div className="purpose-name">{purpose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Complexity Analysis */}
                  <div className="complexity-analysis">
                    <h4>📈 Complexity Distribution</h4>
                    <div className="complexity-grid">
                      {Object.entries(analysis.questionAnalysis?.complexityLevels || {}).map(([level, count]) => (
                        <div key={level} className="complexity-item">
                          <div className={`complexity-indicator ${level}`}>
                            <div className="complexity-count">{count}</div>
                            <div className="complexity-level">{level}</div>
                          </div>
                          <div className="complexity-description">
                            {getComplexityDescription(level)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Question Insights */}
                  {analysis.questionAnalysis?.questionInsights && (
                    <div className="question-insights">
                      <h4>💡 Question Analysis Insights</h4>
                      <div className="insights-list">
                        {analysis.questionAnalysis.questionInsights.map((insight, index) => (
                          <div key={index} className="insight-item">
                            <div className="insight-icon">🔍</div>
                            <div className="insight-text">{insight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="all-questions-list">
                <h3>📝 All Questions Found</h3>
                {analysis.questionAnalysis?.questionsWithContext?.length > 0 ? (
                  <div className="questions-container">
                    {analysis.questionAnalysis.questionsWithContext.map((question, index) => (
                      <div key={index} className={`detailed-question-item ${question.isRhetorical ? 'rhetorical' : 'direct'}`}>
                        <div className="question-header-detailed">
                          <div className="question-meta">
                            <span className="question-number">#{index + 1}</span>
                            <span className={`question-type-badge ${question.type}`}>
                              {question.type.toUpperCase()}
                            </span>
                            <span className={`question-subtype-badge ${question.subType}`}>
                              {question.subType}
                            </span>
                            <span className={`question-style-badge ${question.isRhetorical ? 'rhetorical' : 'direct'}`}>
                              {question.isRhetorical ? 'Rhetorical' : 'Direct'}
                            </span>
                            <span className={`complexity-badge ${question.complexity}`}>
                              {question.complexity}
                            </span>
                          </div>
                          <div className="question-position">
                            Position: {question.index + 1} | Purpose: {question.purpose}
                          </div>
                        </div>
                        
                        <div className="question-content">
                          <div className="question-text-large">
                            {question.text}
                          </div>
                          
                          <div className="question-explanation">
                            <strong>Analysis:</strong> {question.explanation}
                          </div>
                          
                          {question.context && (question.context.before || question.context.after) && (
                            <div className="question-context-detailed">
                              <h4>📖 Context</h4>
                              {question.context.before && (
                                <div className="context-section">
                                  <strong className="context-label">Before:</strong>
                                  <span className="context-text">{question.context.before}</span>
                                </div>
                              )}
                              {question.context.after && (
                                <div className="context-section">
                                  <strong className="context-label">After:</strong>
                                  <span className="context-text">{question.context.after}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="question-analysis">
                            <div className="analysis-item">
                              <span className="analysis-label">Type:</span>
                              <span className="analysis-value">{question.type} ({question.subType})</span>
                            </div>
                            <div className="analysis-item">
                              <span className="analysis-label">Purpose:</span>
                              <span className="analysis-value">{question.purpose}</span>
                            </div>
                            <div className="analysis-item">
                              <span className="analysis-label">Complexity:</span>
                              <span className="analysis-value">{question.complexity}</span>
                            </div>
                            <div className="analysis-item">
                              <span className="analysis-label">Style:</span>
                              <span className="analysis-value">{question.isRhetorical ? 'Rhetorical' : 'Direct'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-questions">
                    <div className="no-questions-icon">❓</div>
                    <p>No questions found in this transcript.</p>
                    <p className="suggestion">This suggests a more declarative communication style focused on providing information rather than seeking it.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transcript Tab - Word-by-Word Analysis */}
          {activeTab === 'transcript' && (
            <div className="analysis-section">
              <div className="transcript-word-analysis">
                <div className="transcript-header">
                  <h3>📝 Word-by-Word Analysis</h3>
                  <div className="transcript-stats">
                    <span className="stat-badge">Total Words: {analysis.statistics?.wordCount || 0}</span>
                    <span className="stat-badge">Unique Words: {analysis.linguisticAnalysis?.uniqueWords || 0}</span>
                    <span className="stat-badge">Avg Word Length: {analysis.linguisticAnalysis?.averageWordLength || 0} chars</span>
                  </div>
                </div>

                <div className="word-cloud-container">
                  <h4>📊 Word Frequency Analysis</h4>
                  <div className="word-cloud">
                    {analysis.keywords && analysis.keywords.length > 0 ? (
                      analysis.keywords.slice(0, 20).map((keyword, index) => (
                        <span 
                          key={index} 
                          className="word-bubble"
                          style={{ 
                            fontSize: `${Math.min(20, 10 + keyword.count * 2)}px`,
                            opacity: Math.min(1, 0.5 + keyword.count * 0.1)
                          }}
                        >
                          {keyword.word} ({keyword.count})
                        </span>
                      ))
                    ) : (
                      <span className="word-bubble">No keywords found</span>
                    )}
                  </div>
                </div>

                <div className="transcript-text-analysis">
                  <h4>📖 Annotated Transcript</h4>
                  <div className="transcript-text">
                    {transcript.split(/\s+/).map((word, index) => {
                      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                      const isKeyword = analysis.keywords?.some(k => k.word === cleanWord);
                      const isNamedEntity = analysis.namedEntities?.people?.includes(word) || 
                                          analysis.namedEntities?.organizations?.includes(word) ||
                                          analysis.namedEntities?.locations?.includes(word);
                      
                      return (
                        <span 
                          key={index}
                          className={`transcript-word ${isKeyword ? 'keyword' : ''} ${isNamedEntity ? 'named-entity' : ''}`}
                          title={`Word ${index + 1}: ${word}${isKeyword ? ' (Keyword)' : ''}${isNamedEntity ? ' (Named Entity)' : ''}`}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="word-analysis-legend">
                  <h4>🎨 Legend</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-color keyword-color"></span>
                      <span>Keywords (High frequency words)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color named-entity-color"></span>
                      <span>Named Entities (People, Organizations, Locations)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color normal-color"></span>
                      <span>Regular words</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </>);
};

export default TranscriptAnalysis;
