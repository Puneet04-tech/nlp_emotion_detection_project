import React from 'react';
import HeatMap from 'react-heatmap-grid';

// Utility to compute word frequency matrix for heatmap
function getWordFrequencyMatrix(transcript, maxWords = 12) {
  if (!transcript) return { xLabels: [], yLabels: [], data: [] };
  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  // Sort by frequency, take top N
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords);
  const xLabels = sorted.map(([w]) => w);
  const yLabels = ['Frequency'];
  const data = [sorted.map(([, count]) => count)];
  return { xLabels, yLabels, data };
}

export default function WordFrequencyHeatmap({ transcript }) {
  const { xLabels, yLabels, data } = getWordFrequencyMatrix(transcript);
  if (!xLabels.length) return null;
  return (
    <div style={{ margin: '24px 0', background: '#181c2a', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px #0004' }}>
      <h4 style={{ color: '#fbbf24', marginBottom: 12 }}>Word Frequency Heatmap</h4>
      <HeatMap
        xLabels={xLabels}
        yLabels={yLabels}
        data={data}
        squares
        cellStyle={(_x, _y, value) => ({
          background: `rgba(126,217,87,${0.2 + 0.8 * (value / Math.max(...data[0]))})`,
          color: value > 0.5 * Math.max(...data[0]) ? '#23272f' : '#fff',
          fontWeight: 600,
          fontSize: '1.1em',
          borderRadius: 6,
        })}
        cellRender={value => value && <span>{value}</span>}
        xLabelsStyle={{ color: '#7ed957', fontWeight: 700, fontSize: '1em' }}
        yLabelsStyle={{ color: '#a97fff', fontWeight: 700, fontSize: '1em' }}
        height={38}
      />
    </div>
  );
}
