const jwt = require('jsonwebtoken');
const db = require('../data/dbStorage');
const { findUserById } = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'fit_health_secret_jwt_bca_2026_key';

// In-Memory Revocation / Blacklist Store for Logged-Out Tokens
const tokenBlacklist = new Set();

const revokeToken = (token) => {
  if (token && typeof token === 'string') {
    tokenBlacklist.add(token.trim());
    // Auto-prune if set exceeds 10,000 entries
    if (tokenBlacklist.size > 10000) {
      const iter = tokenBlacklist.values();
      for (let i = 0; i < 2000; i++) {
        tokenBlacklist.delete(iter.next().value);
      }
    }
  }
};

const isTokenRevoked = (token) => {
  if (!token) return false;
  return tokenBlacklist.has(token.trim());
};

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided in header.'
      });
    }

    if (isTokenRevoked(token)) {
      return res.status(401).json({
        success: false,
        message: 'Session token has been invalidated upon logout. Please log in again.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    let user = null;
    const stored = await findUserById(decoded.id);
    if (stored) {
      const { password, ...safeUser } = stored;
      user = safeUser;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    req.userId = user.id || user._id;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying authentication credentials.',
      error: error.message
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required for this action.'
  });
};

module.exports = { authMiddleware, adminOnly, JWT_SECRET, revokeToken, isTokenRevoked };

