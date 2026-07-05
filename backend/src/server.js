// src/server.js  –  AA_GROW Backend API
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');

const authRoutes       = require('./routes/auth.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');
const diseaseRoutes    = require('./routes/disease.routes');
const fertilizerRoutes = require('./routes/fertilizer.routes');
const marketRoutes     = require('./routes/market.routes');
const irrigationRoutes = require('./routes/irrigation.routes');
const aiRoutes         = require('./routes/ai.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── CORS ──────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

/* ── Body parsers ──────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));       // Allow base64 image uploads
app.use(express.urlencoded({ extended: true }));

/* ── Request logger (dev) ─────────────────────────────── */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method}  ${req.url}`);
    next();
  });
}

/* ── Routes ────────────────────────────────────────────── */
app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/disease',     diseaseRoutes);
app.use('/api/fertilizer',  fertilizerRoutes);
app.use('/api/market',      marketRoutes);
app.use('/api/irrigation',  irrigationRoutes);
app.use('/api/ai',          aiRoutes);

/* ── Health check ──────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    message: 'AA_GROW API is running 🌱',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

/* ── 404 handler ───────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ── Global error handler ─────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

/* ── Start server ──────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🌱  AA_GROW API running on http://localhost:${PORT}`);
  console.log(`    Health:     http://localhost:${PORT}/api/health`);
  console.log(`    Auth:       http://localhost:${PORT}/api/auth`);
  console.log(`    Dashboard:  http://localhost:${PORT}/api/dashboard`);
  console.log(`    Disease:    http://localhost:${PORT}/api/disease`);
  console.log(`    Fertilizer: http://localhost:${PORT}/api/fertilizer`);
  console.log(`    Market:     http://localhost:${PORT}/api/market`);
  console.log(`    Irrigation: http://localhost:${PORT}/api/irrigation`);
  console.log(`    AI Chat:    http://localhost:${PORT}/api/ai\n`);
});

module.exports = app;
