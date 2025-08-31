import React from 'react';
import MatrixHeatmap from './MatrixHeatmap';

// Helper to generate random demo data for heatmaps
function randomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      +(Math.random() * (max - min) + min).toFixed(2)
    )
  );
}

const colorSchemes = [
  ['#ffecd2', '#fcb69f'], // Peach
  ['#a1c4fd', '#c2e9fb'], // Blue
  ['#fbc2eb', '#a6c1ee'], // Pink
  ['#fdcbf1', '#e6dee9'], // Lavender
  ['#f6d365', '#fda085'], // Orange
  ['#84fab0', '#8fd3f4'], // Green
  ['#fccb90', '#d57eeb'], // Gold
  ['#e0c3fc', '#8ec5fc'], // Purple
];

const features = [
  {
    title: 'Word × Sentence Frequency',
    description: 'Frequency of top words across sentences.',
    key: 'word_sentence',
  },
  {
    title: 'POS Tag Distribution',
    description: 'Distribution of part-of-speech tags per sentence.',
    key: 'pos_tag',
  },
  {
    title: 'Sentiment per Sentence',
    description: 'Sentiment score (positive/negative/neutral) for each sentence.',
    key: 'sentiment',
  },
  {
    title: 'Emotion per Sentence',
    description: 'Emotion score (joy, anger, etc.) for each sentence.',
    key: 'emotion',
  },
  {
    title: 'Keyword Density',
    description: 'Density of keywords in transcript sections.',
    key: 'keyword_density',
  },
  {
    title: 'Topic Distribution',
    description: 'Distribution of topics across sentences.',
    key: 'topic',
  },
  {
    title: 'NER Frequency',
    description: 'Named Entity Recognition frequency per sentence.',
    key: 'ner',
  },
  {
    title: 'Word Length Distribution',
    description: 'Distribution of word lengths per sentence.',
    key: 'word_length',
  },
];

// Demo heatmap cell renderer
function Heatmap({ matrix, rowLabels, colLabels, colors, min, max }) {
  const getColor = (val) => {
    // Linear interpolation between colors[0] and colors[1]
    const t = (val - min) / (max - min);
    const lerp = (a, b, t) => a + (b - a) * t;
    // Convert hex to rgb
    const hexToRgb = (hex) => {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
      const num = parseInt(hex, 16);
      return [num >> 16, (num >> 8) & 255, num & 255];
    };
    const rgb0 = hexToRgb(colors[0]);
    const rgb1 = hexToRgb(colors[1]);
    const rgb = rgb0.map((c, i) => Math.round(lerp(c, rgb1[i], t)));
    return `rgb(${rgb.join(',')})`;
  };
  return (
    <div style={{ display: 'inline-block', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((val, j) => (
                <td
                  key={j}
                  title={`Row: ${rowLabels[i] || i}, Col: ${colLabels[j] || j}, Value: ${val}`}
                  style={{
                    width: 24,
                    height: 24,
                    background: getColor(val),
                    textAlign: 'center',
                    color: '#23272f',
                    fontWeight: 600,
                    fontSize: '0.95em',
                    border: '1px solid #eee',
                  }}
                >
                  {val > min && val === Math.max(...row) ? val : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to build a matrix from analysis data
function buildMatrixFromAnalysis(feature, analysis) {
  if (!analysis) return null;
  switch (feature.key) {
    case 'word_sentence':
      if (analysis.wordSentenceMatrix) return analysis.wordSentenceMatrix;
      if (analysis.keywords && analysis.sentences) {
        const words = analysis.keywords.slice(0, 8).map(k => k.word);
        const matrix = words.map(word =>
          analysis.sentences.map(sentence =>
            (sentence.toLowerCase().split(/\s+/).filter(w => w === word).length)
          )
        );
        return {
          rowLabels: words,
          colLabels: analysis.sentences.map((_, i) => `S${i + 1}`),
          data: matrix,
        };
      }
      break;
    case 'pos_tag':
      if (analysis.posMatrix) return analysis.posMatrix;
      if (analysis.sentences && analysis.posTags) {
        const tags = Object.keys(analysis.posTags).slice(0, 8);
        const matrix = tags.map(tag =>
          analysis.sentences.map((_, i) =>
            (analysis.posTags[tag][i] || 0)
          )
        );
        return {
          rowLabels: tags,
          colLabels: analysis.sentences.map((_, i) => `S${i + 1}`),
          data: matrix,
        };
      }
      break;
    case 'sentiment':
      if (analysis.sentenceSentiments) {
        return {
          rowLabels: ['Sentiment'],
          colLabels: analysis.sentenceSentiments.map((_, i) => `S${i + 1}`),
          data: [analysis.sentenceSentiments.map(s => Math.round((s.score + 1) * 50))],
        };
      }
      break;
    case 'emotion':
      if (analysis.sentenceEmotions) {
        const emotions = Object.keys(analysis.sentenceEmotions[0] || {}).slice(0, 8);
        const matrix = emotions.map(em =>
          analysis.sentenceEmotions.map(e => e[em] || 0)
        );
        return {
          rowLabels: emotions,
          colLabels: analysis.sentenceEmotions.map((_, i) => `S${i + 1}`),
          data: matrix,
        };
      }
      break;
    case 'keyword_density':
      if (analysis.keywordDensityMatrix) return analysis.keywordDensityMatrix;
      break;
    case 'topic':
      if (analysis.topicDistribution && analysis.sentences) {
        const topics = analysis.topicDistribution.map(t => t.topic).slice(0, 8);
        const matrix = topics.map(topic =>
          analysis.sentences.map(sentence =>
            sentence.toLowerCase().includes(topic.toLowerCase()) ? 1 : 0
          )
        );
        return {
          rowLabels: topics,
          colLabels: analysis.sentences.map((_, i) => `S${i + 1}`),
          data: matrix,
        };
      }
      break;
    case 'ner':
      if (analysis.namedEntities && analysis.sentences) {
        const types = ['people', 'organizations', 'locations', 'dates'];
        const matrix = types.map(type =>
          analysis.sentences.map(sentence =>
            (analysis.namedEntities[type] || []).filter(entity =>
              sentence.includes(entity)
            ).length
          )
        );
        return {
          rowLabels: types,
          colLabels: analysis.sentences.map((_, i) => `S${i + 1}`),
          data: matrix,
        };
      }
      break;
    case 'word_length':
      if (analysis.sentences) {
        const matrix = analysis.sentences.map(sentence =>
          sentence.split(/\s+/).map(w => w.length)
        );
        const maxLen = Math.max(...matrix.map(row => row.length));
        const data = Array.from({ length: matrix.length }, (_, i) =>
          Array.from({ length: maxLen }, (_, j) => matrix[i][j] || 0)
        );
        return {
          rowLabels: analysis.sentences.map((_, i) => `S${i + 1}`),
          colLabels: Array.from({ length: maxLen }, (_, i) => `W${i + 1}`),
          data,
        };
      }
      break;
    default:
      return null;
  }
  return null;
}

export default function MultiFeatureHeatmaps({ analysis }) {
  const rows = 8, cols = 10;
  return (
    <div style={{ margin: '40px 0 0 0' }}>
      <h2 style={{ color: '#7ed957', fontWeight: 800, fontSize: '1.35em', marginBottom: 18, letterSpacing: '1px', textShadow: '0 2px 8px #fff8' }}>
        🌈 Multi-Feature Heatmaps
      </h2>
      <div style={{ background: 'rgba(30,34,53,0.92)', color: '#e6e6f0', borderRadius: 12, padding: '18px 18px 12px 18px', marginBottom: 24, fontSize: '1.08em', boxShadow: '0 2px 12px #0003' }}>
        <b>What is a Heatmap?</b> A heatmap is a graphical representation of data where values are depicted by color. In these multi-feature heatmaps, each colored cell shows the intensity or frequency of a specific feature (such as word usage, sentiment, or named entities) across sentences or sections of your transcript.<br /><br />
        <b>How to Read:</b> <ul style={{margin:'8px 0 0 18px',padding:0}}>
          <li><b>Rows</b> represent different features (e.g., top words, POS tags, emotions).</li>
          <li><b>Columns</b> represent sentences or word positions in your transcript.</li>
          <li><b>Color Intensity</b> shows the value or frequency: darker or more vibrant colors mean higher values.</li>
        </ul>
        <span style={{color:'#7ed957'}}>Use these heatmaps to quickly spot patterns, trends, and outliers in your speech or text analysis!</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {features.map((feature, idx) => {
          const matrixObj = buildMatrixFromAnalysis(feature, analysis);
          const matrix = matrixObj?.data || randomMatrix(rows, cols, 0, 1 + idx * 0.5);
          const rowLabels = matrixObj?.rowLabels || Array.from({ length: rows }, (_, i) => `R${i + 1}`);
          const colLabels = matrixObj?.colLabels || Array.from({ length: cols }, (_, i) => `C${i + 1}`);
          return (
            <div key={feature.key} style={{ flex: '1 1 320px', minWidth: 320, maxWidth: 400, background: 'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)', borderRadius: 14, boxShadow: '0 2px 16px #0005', padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.12em', color: colorSchemes[idx % colorSchemes.length][0], marginBottom: 6 }}>{feature.title}</div>
              <div style={{ color: '#b0b0c0', fontSize: '0.98em', marginBottom: 10 }}>{feature.description}</div>
              <Heatmap
                matrix={matrix}
                rowLabels={rowLabels}
                colLabels={colLabels}
                colors={colorSchemes[idx % colorSchemes.length]}
                min={0}
                max={1 + idx * 0.5}
                yLabelsStyle={{ color: '#a97fff', fontWeight: 700, fontSize: '1em', textAlign: 'right', paddingRight: 8 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const posList = ['Noun','Verb','Adjective','Adverb','Pronoun','Article','Conjunction','Preposition'];
