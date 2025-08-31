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

app.listen(PORT, () => console.log(`Training server running at http://localhost:${PORT}`));
