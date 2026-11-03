const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables before any application modules are evaluated
dotenv.config({ path: path.join(__dirname, '.env') });

const { initFirebase } = require('./config/firebase');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gymRoutes = require('./routes/gymRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const hydrationRoutes = require('./routes/hydrationRoutes');
const progressRoutes = require('./routes/progressRoutes');
const supplementRoutes = require('./routes/supplementRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const biometricsRoutes = require('./routes/biometricsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Strict Production & Development CORS Configuration
const rawAllowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
]
  .map(o => o ? o.trim().replace(/\/$/, '') : '')
  .filter(Boolean);

const allowedOrigins = [...new Set(rawAllowedOrigins)];

// Always ensure standard local dev origins in development
if (process.env.NODE_ENV !== 'production') {
  ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'].forEach(o => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, companion apps, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
      (normalizedOrigin.endsWith('.vercel.app') && allowedOrigins.some(o => o.endsWith('.vercel.app'))) ||
      (process.env.NODE_ENV !== 'production' && (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint: provides a simple status response when the backend URL is opened in a browser.
app.get('/', (req, res) => {
  res.status(200).json({
    appName: 'FIT HEALTH Backend',
    status: 'online',
    message: 'Backend API is running successfully.',
    healthEndpoint: '/api/health'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'Fit Health Unified App & API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/biometrics', biometricsRoutes);
app.use('/api/health', healthRoutes);

// Serve Frontend Static Files (Same Unified Host & Port)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA Fallback for non-API client routes
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 for unhandled API requests
app.use('/api/*', notFoundHandler);

// Error Handling Middleware
app.use(errorHandler);

// Environment & Security Validator
const validateEnvironment = async () => {
  const issues = [];
  const warnings = [];

  // JWT Secret Validation
  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET is missing in backend/.env. Using insecure default secret.');
  } else if (process.env.JWT_SECRET.length < 16) {
    warnings.push('JWT_SECRET is short (<16 characters). Recommend 32+ characters for production security.');
  }

  // SMTP Settings Validation
  const { verifySmtpConnection } = require('./services/emailService');
  const smtpStatus = await verifySmtpConnection();

  console.log(`\n----------------- Fit Health Security Diagnostics -----------------`);
  console.log(`🔐 JWT Secret:        ${process.env.JWT_SECRET ? '✅ Configured (' + process.env.JWT_SECRET.slice(0, 4) + '...)' : '⚠️ Default Fallback In Use'}`);
  if (smtpStatus.verified) {
    console.log(`📧 SMTP Transport:    ✅ Verified Active -> ${smtpStatus.host}:${smtpStatus.port} (${smtpStatus.user})`);
  } else if (smtpStatus.configured) {
    console.log(`📧 SMTP Transport:    ⚠️ Configured but handshake failed -> ${smtpStatus.error || smtpStatus.message}`);
    console.log(`   💡 Tip: For Gmail, verify 2-Step Verification is ON and a 16-character App Password is used.`);
  } else {
    console.log(`📧 SMTP Transport:    ℹ️ Incomplete/Not Configured (${smtpStatus.message})`);
    console.log(`   💡 Configure SMTP_USER and SMTP_PASS in backend/.env to send live emails to user inboxes.`);
  }

  if (issues.length > 0) {
    console.warn(`[Security Notice] Configuration warnings:`);
    issues.forEach(i => console.warn(`   ⚠️ ${i}`));
  }
  console.log(`-------------------------------------------------------------------\n`);
};

// Start Server
const startServer = async () => {
  initFirebase();
  await validateEnvironment();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Fit Health Unified App Running on Localhost!`);
    console.log(`🌐 Unified Link (Frontend + Backend): http://localhost:${PORT}`);
    console.log(`🔗 Backend Health API: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;

