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
  // Try to load real USTAV data first
  let ustavPath = path.join(__dirname, '../data/ustav-real.json');
  if (!fs.existsSync(ustavPath)) {
    // Fallback to standard path if real data file doesn't exist
    ustavPath = path.join(__dirname, '../data/ustav.json');
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

// API Routes
app.use('/api', apiRoutes(ustav));

// RAG Routes (independent of main API routes)
console.log(`✓ Initializing RAG System...`);
app.use('/api', ragRoutes);

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`✓ AISBS Backend running on http://localhost:${PORT}`);
  console.log(`✓ RAG system initialized with ${ustav.chapters.length} chapters (${ustav.chapters.reduce((sum, ch) => sum + ch.problems.length, 0)} problems)`);
});
