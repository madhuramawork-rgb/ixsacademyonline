require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security & logging ──────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be loaded cross-origin by the frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ─────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting on the API (basic abuse protection) ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Static file serving for uploaded images ─────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'IXS Academy API is running' });
});

// ── API routes ───────────────────────────────────
app.use('/api/v1', routes);

// ── 404 for anything else ───────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Centralized error handler (must be last) ────
app.use(errorHandler);

module.exports = app;
