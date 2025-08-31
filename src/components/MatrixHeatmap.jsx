
import React, { useState } from 'react';
import HeatMap from 'react-heatmap-grid';


// Simple POS and tense tagger (rule-based, not perfect)
function tagWord(word) {
  // Very basic rules for demonstration
  if (/ing$/.test(word)) return { pos: 'Verb', tense: 'Present' };
  if (/ed$/.test(word)) return { pos: 'Verb', tense: 'Past' };
  if (/s$/.test(word) && word.length > 3) return { pos: 'Noun', tense: null };
  if (/ly$/.test(word)) return { pos: 'Adverb', tense: null };
  if (/ous$|ful$|ive$|less$|able$|al$|ic$|ish$|est$|ing$/.test(word)) return { pos: 'Adjective', tense: null };
  if (['i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their'].includes(word)) return { pos: 'Pronoun', tense: null };
  if (['the','a','an'].includes(word)) return { pos: 'Article', tense: null };
  if (['and','but','or','so','because','although','if','when','while','where','after','before','since','until'].includes(word)) return { pos: 'Conjunction', tense: null };
  if (['in','on','at','by','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','for','of','off','over','under'].includes(word)) return { pos: 'Preposition', tense: null };
  return { pos: 'Noun', tense: null };
}

function getMatrix(transcript, mode = 'word', maxRows = 12, maxCols = 10) {
  if (!transcript) return { xLabels: [], yLabels: [], data: [] };
  // Split transcript into sentences
  const sentences = transcript.match(/[^.!?\n]+[.!?\n]?/g) || [];
  // Get all words
  const allWords = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  // Tag words
  const tags = allWords.map(tagWord);

  // Build matrix for selected mode
  let yLabels = [], data = [];
  if (mode === 'word') {
    // Top N words
    const freq = {};
    allWords.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxRows);
    yLabels = sorted.map(([w]) => w);
    data = yLabels.map(word =>
      sentences.slice(0, maxCols).map(s => {
        const re = new RegExp(`\\b${word}\\b`, 'gi');
        return (s.match(re) || []).length;
      })
    );
  } else if (mode === 'pos') {
    // POS categories
    const posList = ['Noun','Verb','Adjective','Adverb','Pronoun','Article','Conjunction','Preposition'];
    yLabels = posList;
    data = posList.map(pos =>
      sentences.slice(0, maxCols).map(s => {
        const words = s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
        return words.map(w => tagWord(w).pos === pos ? 1 : 0).reduce((a,b) => a+b,0);
      })
    );
  } else if (mode === 'tense') {
    // Tense categories
    const tenseList = ['Past','Present','Future','None'];
    yLabels = tenseList;
    data = tenseList.map(tense =>
      sentences.slice(0, maxCols).map(s => {
        const words = s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
        return words.map(w => {
          const t = tagWord(w).tense;
          if (!t && tense === 'None') return 1;
          return t === tense ? 1 : 0;
        }).reduce((a,b) => a+b,0);
      })
    );
  }
  const xLabels = sentences.slice(0, maxCols).map((s, i) => `S${i+1}`);
  return { xLabels, yLabels, data };
}



export default function MatrixHeatmap({ transcript }) {
  // Always show three heatmaps at the top: Word, POS, Tense
  const wordMatrix = getMatrix(transcript, 'word');
  const posMatrix = getMatrix(transcript, 'pos');
  const tenseMatrix = getMatrix(transcript, 'tense');
  if (!wordMatrix.xLabels.length || !wordMatrix.yLabels.length) return null;
  if (!posMatrix.xLabels.length || !posMatrix.yLabels.length) return null;
  if (!tenseMatrix.xLabels.length || !tenseMatrix.yLabels.length) return null;
  const maxValWord = Math.max(...wordMatrix.data.flat());
  const maxValPOS = Math.max(...posMatrix.data.flat());
  const maxValTense = Math.max(...tenseMatrix.data.flat());
  return (
    <div style={{ margin: '24px 0', background: '#181c2a', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px #0004' }}>
      <div style={{display:'flex', flexDirection:'column', gap:24, alignItems:'center', marginBottom: 0}}>
        <div style={{width:'100%'}}>
          <h4 style={{ color: '#60a5fa', margin: '0 0 8px 0', textAlign:'center' }}>Word x Sentence Heatmap</h4>
          <HeatMap
            xLabels={wordMatrix.xLabels}
            yLabels={wordMatrix.yLabels}
            data={wordMatrix.data}
            squares
            cellStyle={(_x, _y, value) => ({
              background: value
                ? `linear-gradient(135deg, #fbbf24 ${20 + 80 * (value / maxValWord)}%, #7ed957 100%)`
                : '#23272f',
              color: value > 0.5 * maxValWord ? '#23272f' : '#fff',
              fontWeight: 600,
              fontSize: '1.1em',
              borderRadius: 6,
            })}
            cellRender={value => value > 0 ? <span>{value}</span> : ''}
            xLabelsStyle={{ color: '#7ed957', fontWeight: 700, fontSize: '1em', textAlign: 'center' }}
            yLabelsStyle={{ color: '#a97fff', fontWeight: 700, fontSize: '1em', textAlign: 'right', paddingRight: 20, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'visible' }}
            height={38}
          />
          <div style={{color:'#aaa',fontSize:'0.95em',marginTop:8, textAlign:'center'}}>
            Rows: Top words | Columns: Sentences (S1, S2, ...)
          </div>
        </div>
        <div style={{width:'100%'}}>
          <h4 style={{ color: '#60a5fa', margin: '0 0 8px 0', textAlign:'center' }}>Part of Speech x Sentence Heatmap</h4>
          <HeatMap
            xLabels={posMatrix.xLabels}
            yLabels={posMatrix.yLabels}
            data={posMatrix.data}
            squares
            cellStyle={(_x, _y, value) => ({
              background: value
                ? `linear-gradient(135deg, #fbbf24 ${20 + 80 * (value / maxValPOS)}%, #7ed957 100%)`
                : '#23272f',
              color: value > 0.5 * maxValPOS ? '#23272f' : '#fff',
              fontWeight: 600,
              fontSize: '1.1em',
              borderRadius: 6,
            })}
            cellRender={value => value > 0 ? <span>{value}</span> : ''}
            xLabelsStyle={{ color: '#7ed957', fontWeight: 700, fontSize: '1em', textAlign: 'center' }}
            yLabelsStyle={{ color: '#a97fff', fontWeight: 700, fontSize: '1em', textAlign: 'right', paddingRight: 20, paddingLeft: 8, minWidth: 90, whiteSpace: 'nowrap', maxWidth: 140, overflow: 'visible' }}
            height={38}
          />
          <div style={{color:'#aaa',fontSize:'0.95em',marginTop:8, textAlign:'center'}}>
            Rows: POS | Columns: Sentences (S1, S2, ...)
          </div>
        </div>
        <div style={{width:'100%'}}>
          <h4 style={{ color: '#60a5fa', margin: '0 0 8px 0', textAlign:'center' }}>Tense x Sentence Heatmap</h4>
          <HeatMap
            xLabels={tenseMatrix.xLabels}
            yLabels={tenseMatrix.yLabels}
            data={tenseMatrix.data}
            squares
            cellStyle={(_x, _y, value) => ({
              background: value
                ? `linear-gradient(135deg, #fbbf24 ${20 + 80 * (value / maxValTense)}%, #7ed957 100%)`
                : '#23272f',
              color: value > 0.5 * maxValTense ? '#23272f' : '#fff',
              fontWeight: 600,
              fontSize: '1.1em',
              borderRadius: 6,
            })}
            cellRender={value => value > 0 ? <span>{value}</span> : ''}
            xLabelsStyle={{ color: '#7ed957', fontWeight: 700, fontSize: '1em', textAlign: 'center' }}
            yLabelsStyle={{ color: '#a97fff', fontWeight: 700, fontSize: '1em', textAlign: 'right', paddingRight: 20, paddingLeft: 8, minWidth: 90, whiteSpace: 'nowrap', maxWidth: 140, overflow: 'visible' }}
            height={38}
          />
          <div style={{color:'#aaa',fontSize:'0.95em',marginTop:8, textAlign:'center'}}>
            Rows: Tense | Columns: Sentences (S1, S2, ...)
          </div>
        </div>
      </div>
    </div>
  );
}
