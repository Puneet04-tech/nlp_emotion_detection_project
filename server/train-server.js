import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: path.join(__dirname, 'uploads') });
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ensure uploads/meta directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const metaDir = path.join(__dirname, 'meta');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });

app.post('/upload', upload.single('audio'), (req, res) => {
  try {
    const { emotion, transcript, features } = req.body;
    const file = req.file;
  // metaDir ensured above

    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    const meta = {
      id,
      emotion,
      transcript,
      features: features ? JSON.parse(features) : null,
      file: file ? file.filename : null,
      originalName: file ? file.originalname : null,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(path.join(metaDir, id + '.json'), JSON.stringify(meta, null, 2));

    res.json({ ok: true, id });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/uploads/:file', (req, res) => {
  const file = path.join(__dirname, 'uploads', req.params.file);
  res.sendFile(file);
});

// Return list of all metadata JSONs
app.get('/meta', (req, res) => {
  try {
    const files = fs.readdirSync(metaDir).filter(f => f.endsWith('.json'));
    const metas = files.map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(metaDir, f), 'utf8')); } catch (e) { return null; }
    }).filter(Boolean);
    res.json({ ok: true, metas });
  } catch (err) { res.status(500).json({ ok: false, error: String(err) }); }
});

app.get('/meta/:id', (req, res) => {
  try {
    const id = req.params.id;
    const filePath = path.join(metaDir, id + '.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ ok: false, error: 'not found' });
    const meta = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ ok: true, meta });
  } catch (err) { res.status(500).json({ ok: false, error: String(err) }); }
});

app.get('/', (req, res) => res.send('Training upload server running'));

// Status endpoint for diagnostics
app.get('/status', (req, res) => {
  try {
    const uploadsCount = fs.readdirSync(uploadsDir).length;
    const metaCount = fs.readdirSync(metaDir).filter(f => f.endsWith('.json')).length;
    
    res.json({
      ok: true,
      status: 'running',
      server: 'Voice Emotion Training Server',
      version: '1.0.0',
      port: PORT,
      uploadedFiles: uploadsCount,
      trainingSamples: metaCount,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Samples endpoint for getting training data
app.get('/samples', (req, res) => {
  try {
    const files = fs.readdirSync(metaDir).filter(f => f.endsWith('.json'));
    const samples = files.map(f => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(metaDir, f), 'utf8'));
        return {
          id: content.id,
          emotion: content.emotion,
          timestamp: content.timestamp,
          hasAudio: !!content.file,
          hasFeatures: !!content.features,
          hasTranscript: !!content.transcript && content.transcript !== '[object Object]'
        };
      } catch (e) {
        console.warn('Failed to parse meta file:', f, e);
        return null;
      }
    }).filter(Boolean);
    
    const stats = {
      total: samples.length,
      byEmotion: {},
      recentSamples: samples.slice(0, 5),
      lastUpdated: samples.length > 0 ? Math.max(...samples.map(s => new Date(s.timestamp).getTime())) : null
    };
    
    samples.forEach(s => {
      stats.byEmotion[s.emotion] = (stats.byEmotion[s.emotion] || 0) + 1;
    });
    
    res.json({
      ok: true,
      samples,
      stats
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Training server running at http://localhost:${PORT}`));
