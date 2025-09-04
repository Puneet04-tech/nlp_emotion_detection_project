import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT || (PORT + 1);

// Handle deployment environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocalhost = process.env.NODE_ENV !== 'production';

// Enhanced storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).slice(2, 9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio_${timestamp}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept any audio file
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: '*', // Allow any origin for sharing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const metaDir = path.join(__dirname, 'meta');
const sessionsDir = path.join(__dirname, 'sessions');
const analyticsDir = path.join(__dirname, 'analytics');

[uploadsDir, metaDir, sessionsDir, analyticsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Session tracking
const activeSessions = new Map();
const sessionAnalytics = [];

// Get server info
function getServerInfo() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(ifname => {
    interfaces[ifname].forEach(iface => {
      if ('IPv4' !== iface.family || iface.internal !== false) return;
      ips.push(iface.address);
    });
  });

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    memory: {
      total: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
      free: Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB'
    },
    uptime: Math.round(os.uptime()),
    ips: ips,
    ports: {
      http: PORT,
      websocket: WS_PORT
    }
  };
}

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ port: WS_PORT });

// WebSocket for real-time updates to your laptop
let adminConnections = [];

wss.on('connection', function connection(ws, req) {
  console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);
  
  ws.on('message', function message(data) {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'admin_connect') {
        adminConnections.push(ws);
        console.log('👑 Admin connected for real-time monitoring');
        
        // Send current server status
        ws.send(JSON.stringify({
          type: 'server_status',
          data: {
            ...getServerInfo(),
            activeSessions: activeSessions.size,
            totalUploads: fs.readdirSync(metaDir).length,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', function close() {
    adminConnections = adminConnections.filter(conn => conn !== ws);
    console.log('🔌 WebSocket connection closed');
  });
});

// Broadcast to all admin connections
function broadcastToAdmins(data) {
  const message = JSON.stringify(data);
  adminConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// Session management
app.post('/api/session/start', (req, res) => {
  const sessionId = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  const session = {
    id: sessionId,
    startTime: new Date().toISOString(),
    ip: ip,
    userAgent: userAgent,
    recordings: 0,
    uploads: 0,
    emotions: [],
    lastActivity: new Date().toISOString()
  };

  activeSessions.set(sessionId, session);
  
  // Save session
  fs.writeFileSync(
    path.join(sessionsDir, `${sessionId}.json`), 
    JSON.stringify(session, null, 2)
  );

  // Notify admins
  broadcastToAdmins({
    type: 'new_session',
    data: session
  });

  console.log(`🆕 New session started: ${sessionId} from ${ip}`);
  
  res.json({ 
    success: true, 
    sessionId: sessionId,
    serverInfo: getServerInfo()
  });
});

// Enhanced upload endpoint
app.post('/api/upload', upload.single('audio'), (req, res) => {
  try {
    const { 
      sessionId,
      emotion, 
      transcript, 
      features, 
      voiceFeatures,
      bertAnalysis,
      confidence,
      processingTime,
      audioMetadata
    } = req.body;
    
    const file = req.file;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    
    // Parse JSON strings
    let parsedFeatures = null;
    let parsedVoiceFeatures = null;
    let parsedBertAnalysis = null;
    let parsedAudioMetadata = null;

    try {
      if (features) parsedFeatures = JSON.parse(features);
      if (voiceFeatures) parsedVoiceFeatures = JSON.parse(voiceFeatures);
      if (bertAnalysis) parsedBertAnalysis = JSON.parse(bertAnalysis);
      if (audioMetadata) parsedAudioMetadata = JSON.parse(audioMetadata);
    } catch (parseErr) {
      console.warn('JSON parse warning:', parseErr.message);
    }

    const uploadData = {
      id,
      sessionId,
      timestamp: new Date().toISOString(),
      
      // User info
      ip: ip,
      userAgent: userAgent,
      
      // Audio file info
      file: file ? {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      } : null,
      
      // Analysis results
      emotion: emotion,
      transcript: transcript,
      confidence: confidence ? parseFloat(confidence) : null,
      processingTime: processingTime ? parseFloat(processingTime) : null,
      
      // Detailed analysis
      features: parsedFeatures,
      voiceFeatures: parsedVoiceFeatures,
      bertAnalysis: parsedBertAnalysis,
      audioMetadata: parsedAudioMetadata,
      
      // Server info
      serverTimestamp: Date.now(),
      serverInfo: {
        hostname: os.hostname(),
        platform: os.platform()
      }
    };

    // Save metadata
    fs.writeFileSync(
      path.join(metaDir, `${id}.json`), 
      JSON.stringify(uploadData, null, 2)
    );

    // Update session
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.uploads++;
      session.lastActivity = new Date().toISOString();
      if (emotion) {
        session.emotions.push({
          emotion: emotion,
          confidence: confidence,
          timestamp: new Date().toISOString()
        });
      }
      
      // Update session file
      fs.writeFileSync(
        path.join(sessionsDir, `${sessionId}.json`), 
        JSON.stringify(session, null, 2)
      );
    }

    // Broadcast to admins in real-time
    broadcastToAdmins({
      type: 'new_upload',
      data: {
        ...uploadData,
        // Don't send full file data over websocket
        file: file ? {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size
        } : null
      }
    });

    console.log(`📤 New upload: ${id} from ${ip} (${emotion || 'No emotion'})`);
    
    res.json({ 
      success: true, 
      id: id,
      message: 'Upload processed successfully'
    });

  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Recording endpoint (for live speech recording)
app.post('/api/recording', (req, res) => {
  try {
    const {
      sessionId,
      audioData, // Base64 encoded audio
      emotion,
      transcript,
      confidence,
      duration,
      features
    } = req.body;

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 9);

    // Save audio data if provided
    let audioFile = null;
    if (audioData) {
      try {
        const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
        const audioPath = path.join(uploadsDir, `recording_${id}.webm`);
        fs.writeFileSync(audioPath, audioBuffer);
        audioFile = {
          filename: `recording_${id}.webm`,
          size: audioBuffer.length,
          path: audioPath
        };
      } catch (audioErr) {
        console.warn('Audio save warning:', audioErr.message);
      }
    }

    const recordingData = {
      id,
      sessionId,
      type: 'recording',
      timestamp: new Date().toISOString(),
      
      // User info
      ip: ip,
      userAgent: userAgent,
      
      // Recording info
      duration: duration ? parseFloat(duration) : null,
      audioFile: audioFile,
      
      // Analysis results
      emotion: emotion,
      transcript: transcript,
      confidence: confidence ? parseFloat(confidence) : null,
      features: features ? JSON.parse(features) : null,
      
      // Server info
      serverTimestamp: Date.now()
    };

    // Save metadata
    fs.writeFileSync(
      path.join(metaDir, `recording_${id}.json`), 
      JSON.stringify(recordingData, null, 2)
    );

    // Update session
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.recordings++;
      session.lastActivity = new Date().toISOString();
      if (emotion) {
        session.emotions.push({
          emotion: emotion,
          confidence: confidence,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Broadcast to admins
    broadcastToAdmins({
      type: 'new_recording',
      data: {
        ...recordingData,
        audioFile: audioFile ? {
          filename: audioFile.filename,
          size: audioFile.size
        } : null
      }
    });

    console.log(`🎙️ New recording: ${id} from ${ip} (${emotion || 'No emotion'})`);
    
    res.json({ 
      success: true, 
      id: id 
    });

  } catch (err) {
    console.error('❌ Recording error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get all data (for your laptop to download everything)
app.get('/api/data/all', (req, res) => {
  try {
    const metaFiles = fs.readdirSync(metaDir);
    const sessionFiles = fs.readdirSync(sessionsDir);
    
    const allData = {
      metadata: [],
      sessions: [],
      serverInfo: getServerInfo(),
      exportTime: new Date().toISOString()
    };

    // Read all metadata files
    metaFiles.forEach(filename => {
      try {
        const filePath = path.join(metaDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allData.metadata.push(data);
      } catch (err) {
        console.warn(`Error reading meta file ${filename}:`, err.message);
      }
    });

    // Read all session files
    sessionFiles.forEach(filename => {
      try {
        const filePath = path.join(sessionsDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allData.sessions.push(data);
      } catch (err) {
        console.warn(`Error reading session file ${filename}:`, err.message);
      }
    });

    res.json(allData);
    console.log(`📊 Data export requested - ${allData.metadata.length} uploads, ${allData.sessions.length} sessions`);

  } catch (err) {
    console.error('❌ Data export error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Real-time analytics
app.get('/api/analytics/live', (req, res) => {
  try {
    const metaFiles = fs.readdirSync(metaDir).length;
    const sessionFiles = fs.readdirSync(sessionsDir).length;
    
    // Get recent activity (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentUploads = fs.readdirSync(metaDir)
      .filter(filename => {
        const stats = fs.statSync(path.join(metaDir, filename));
        return stats.mtime.getTime() > oneDayAgo;
      }).length;

    const analytics = {
      totalUploads: metaFiles,
      totalSessions: sessionFiles,
      activeSessions: activeSessions.size,
      recentUploads: recentUploads,
      serverInfo: getServerInfo(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    res.json(analytics);

  } catch (err) {
    console.error('❌ Analytics error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Netlify data receiver endpoint
app.post('/api/netlify-data', (req, res) => {
  try {
    const netlifyData = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Netlify-User';

    const id = Date.now() + '-netlify-' + Math.random().toString(36).slice(2, 9);
    
    const processedData = {
      id,
      source: 'netlify_deployment',
      timestamp: new Date().toISOString(),
      
      // Original Netlify data
      ...netlifyData,
      
      // Server-side additions
      receivedAt: new Date().toISOString(),
      serverTimestamp: Date.now(),
      userAgent: userAgent,
      ipAddress: ip,
      
      // Mark as Netlify deployment data
      deploymentData: true
    };

    // Save to netlify-specific directory
    const netlifyDir = path.join(metaDir, 'netlify');
    if (!fs.existsSync(netlifyDir)) {
      fs.mkdirSync(netlifyDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(netlifyDir, `${id}.json`), 
      JSON.stringify(processedData, null, 2)
    );

    // Also save to main meta directory for unified access
    fs.writeFileSync(
      path.join(metaDir, `netlify_${id}.json`), 
      JSON.stringify(processedData, null, 2)
    );

    // Broadcast to admin dashboard
    broadcastToAdmins({
      type: 'netlify_data',
      data: {
        id: id,
        type: netlifyData.type || 'unknown',
        emotion: netlifyData.emotion,
        confidence: netlifyData.confidence,
        source: 'netlify',
        timestamp: processedData.timestamp
      }
    });

    console.log(`🌐 Netlify data received: ${id} - ${netlifyData.type || 'unknown'} (${netlifyData.emotion || 'no emotion'})`);
    
    res.json({ 
      success: true, 
      id: id,
      message: 'Netlify data received and stored'
    });

  } catch (err) {
    console.error('❌ Netlify data processing error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    serverInfo: getServerInfo()
  });
});

// Serve static files (for the web interface)
app.use(express.static(path.join(__dirname, '../')));

// Default route - serve the main application
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../index.html');
  console.log(`📱 Serving main app from: ${indexPath}`);
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Create a simple landing page if index.html doesn't exist
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>🎤 Voice Emotion Detection</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              text-align: center; 
              padding: 50px;
              margin: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            .btn { 
              background: #4CAF50; 
              color: white; 
              padding: 15px 30px; 
              border: none; 
              border-radius: 10px; 
              font-size: 18px; 
              cursor: pointer; 
              margin: 10px;
              text-decoration: none;
              display: inline-block;
            }
            .btn:hover { background: #45a049; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎤 Voice Emotion Detection System</h1>
            <p>Welcome! This system analyzes emotions in your voice and speech.</p>
            <h3>🚀 Quick Access:</h3>
            <a href="/admin-dashboard.html" class="btn">📊 Admin Dashboard</a>
            <br><br>
            <p>📱 <strong>Mobile Access:</strong> This URL works on phones and computers</p>
            <p>🎯 <strong>Features:</strong> Upload audio files or record live speech for emotion analysis</p>
            <p>🤖 <strong>AI Powered:</strong> Advanced BERT emotion detection with real transcripts</p>
            <hr style="margin: 30px 0; opacity: 0.3;">
            <p><small>Server Status: ✅ Online | Port: ${PORT}</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const serverInfo = getServerInfo();
  
  console.log('\n🚀 Enhanced Audio Analysis Server Started!');
  console.log('==============================================');
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔗 WebSocket Server: ws://localhost:${WS_PORT}`);
  console.log(`🌐 Network Access:`);
  serverInfo.ips.forEach(ip => {
    console.log(`   http://${ip}:${PORT}`);
  });
  console.log(`💾 Data Storage: ${metaDir}`);
  console.log(`📁 File Uploads: ${uploadsDir}`);
  console.log(`📊 Sessions: ${sessionsDir}`);
  console.log('==============================================');
  console.log('🎯 Features:');
  console.log('   ✅ File uploads with metadata collection');
  console.log('   ✅ Live recording capture');
  console.log('   ✅ Real-time WebSocket updates');
  console.log('   ✅ Session tracking');
  console.log('   ✅ Complete data export');
  console.log('   ✅ Network sharing ready');
  console.log('==============================================\n');
  
  console.log('📱 Share with others using any network IP above');
  console.log('💻 Monitor in real-time via WebSocket connection');
  console.log('📊 Export all data via /api/data/all endpoint\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  // Close WebSocket connections
  wss.clients.forEach(ws => {
    ws.close();
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

export default app;
