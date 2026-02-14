require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');
const ragRoutes = require('./routes/rag');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static React build (if available)
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Load USTAV data (Real USTAV documents, not mock data)
let ustav = null;
try {
  // Try to load data in this order (most specific first):
  // 1) ustav.json (AI-enhanced complete extraction)
  // 2) ustav-real.json (structured real data - fallback)
  // 3) ustav-from-txt.json (imported raw book - legacy)
  let ustavPath = path.join(__dirname, '../data/ustav.json');
  if (!fs.existsSync(ustavPath)) {
    ustavPath = path.join(__dirname, '../data/ustav-real.json');
  }
  if (!fs.existsSync(ustavPath)) {
    // Fallback to legacy path if previous files don't exist
    ustavPath = path.join(__dirname, '../data/ustav-from-txt.json');
  }
  const ustavData = fs.readFileSync(ustavPath, 'utf-8');
  ustav = JSON.parse(ustavData);
  console.log(`✓ Loaded USTAV data with ${ustav.chapters.length} chapters and ${ustav.metadata?.totalProblems || 'unknown'} problems`);
  console.log(`  >> Edition: ${ustav.metadata?.edition || 'unknown'}`);
  console.log(`  >> Target Audience: ${ustav.metadata?.targetAudience || 'unknown'}`);
} catch (err) {
  console.error('✗ Failed to load USTAV data:', err.message);
  process.exit(1);
}

// API Routes (includes RAG execution)
app.use('/api', apiRoutes(ustav));
app.use('/api/rag', ragRoutes);

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Global error handler (ENHANCED)
app.use((err, req, res, next) => {
  console.error('\n\n');
  console.error('╔════════════════════════════════════════════════════════╗');
  console.error('║  💥 GLOBAL ERROR HANDLER CAUGHT ERROR                  ║');
  console.error('╚════════════════════════════════════════════════════════╝');
  console.error('[Global Error] Message:', err.message);
  console.error('[Global Error] Stack:', err.stack);
  console.error('[Global Error] Full error:', err);
  console.error('[Global Error] Request URL:', req.url);
  console.error('[Global Error] Request Method:', req.method);
  console.error('[Global Error] Request Body:', JSON.stringify(req.body, null, 2));

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`✓ AISBS Backend running on http://localhost:${PORT}`);
  console.log(`✓ RAG system initialized with ${ustav.chapters.length} chapters (${ustav.chapters.reduce((sum, ch) => sum + ch.problems.length, 0)} problems)`);
});
