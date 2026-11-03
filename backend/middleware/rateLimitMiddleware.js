/**
 * In-Memory Sliding Window Rate Limiter
 * Enforces per-member or per-IP rate limits for critical ingestion endpoints.
 */
function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 60, message = 'Too many sync requests. Please try again shortly.' } = {}) {
  const requests = new Map();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, valid);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const key = (req.userId || req.ip || 'anonymous').toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = requests.get(key) || [];
    const recent = timestamps.filter(t => t > windowStart);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000)
      });
    }

    recent.push(now);
    requests.set(key, recent);
    next();
  };
}

module.exports = {
  createRateLimiter
};

