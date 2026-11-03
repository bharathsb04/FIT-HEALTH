const crypto = require('crypto');
const { getFirestore, isFirebaseActive } = require('../config/firebase');

// In-Memory Token Vault: email:purpose -> { hash, expiresAt, attempts, resendAfter, verified, createdAt }
const otpStore = new Map();

// Rate-limiting store: identifier -> [timestamps]
const rateLimitStore = new Map();

const getOtpConfig = () => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  // Enforce 60-second cooldown per Requirement 5
  const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

  return {
    expiryMs: expiryMinutes * 60 * 1000,
    cooldownMs: cooldownSeconds * 1000,
    cooldownSeconds,
    maxAttempts
  };
};

// Cryptographically secure HMAC-SHA256 hash helper
const hashOtp = (email, otp) => {
  const secretSalt = process.env.JWT_SECRET || 'fit_health_otp_salt_key_2026';
  return crypto.createHmac('sha256', secretSalt).update(`${email.toLowerCase().trim()}:${String(otp).trim()}`).digest('hex');
};

// Constant-time buffer comparison to prevent timing side-channel attacks
const timingSafeHashCompare = (hashA, hashB) => {
  try {
    const bufA = Buffer.from(hashA, 'hex');
    const bufB = Buffer.from(hashB, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

// Unpredictable cryptographically secure 6-digit numeric OTP generator
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Sliding-window rate limiter per email or IP (Max 10 OTP requests per 10 minutes)
const checkRateLimit = (identifier, maxRequests = 10, windowMs = 10 * 60 * 1000) => {
  const now = Date.now();
  const timestamps = rateLimitStore.get(identifier) || [];
  const recent = timestamps.filter(ts => now - ts < windowMs);

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const waitSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    throw new Error(`Too many verification requests. Please wait ${waitSeconds} seconds before trying again.`);
  }

  recent.push(now);
  rateLimitStore.set(identifier, recent);
};

/**
 * Creates and securely stores an HMAC-hashed OTP for an email and purpose.
 * Enforces 60s cooldown periods and replaces any previous unverified code.
 * Persists to Firebase Cloud Firestore if active.
 */
const createAndStoreOTP = (email, purpose = 'registration', clientIp = null) => {
  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required for OTP generation.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const config = getOtpConfig();

  // Enforce IP and email sliding-window rate limits
  if (clientIp) checkRateLimit(`ip:${clientIp}`);
  checkRateLimit(`email:${normalizedEmail}`);

  const storeKey = `${normalizedEmail}:${purpose}`;
  const now = Date.now();

  const existing = otpStore.get(storeKey);
  if (existing && existing.resendAfter > now) {
    const remainingSeconds = Math.ceil((existing.resendAfter - now) / 1000);
    throw new Error(`Please wait ${remainingSeconds} second(s) before requesting another verification code.`);
  }

  const plainOtp = generateOTP();
  const hashed = hashOtp(normalizedEmail, plainOtp);

  const record = {
    hash: hashed,
    expiresAt: now + config.expiryMs,
    resendAfter: now + config.cooldownMs,
    attempts: 0,
    verified: false,
    purpose,
    createdAt: now
  };

  // Overwrite any older code atomically in memory
  otpStore.set(storeKey, record);

  // Synchronize to Firebase Cloud Firestore if active
  if (isFirebaseActive()) {
    try {
      const firestore = getFirestore();
      firestore.collection('pending_verifications').doc(storeKey.replace(/[@.]/g, '_')).set({
        email: normalizedEmail,
        purpose,
        hash: hashed,
        expiresAt: new Date(record.expiresAt),
        attempts: 0,
        verified: false,
        createdAt: new Date(now)
      }).catch(err => console.warn('[Firebase Firestore] Async OTP persist warning:', err.message));
    } catch (e) {
      console.warn('[Firebase Firestore] Sync error:', e.message);
    }
  }

  return plainOtp;
};

/**
 * Verifies an incoming OTP code against the stored hash.
 * Enforces attempt count limits, expiration, and timing-safe comparison.
 */
const verifyOTP = (email, otp, purpose = 'registration') => {
  if (!email || !otp) {
    return { success: false, message: 'Email and 6-digit verification code are required.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  const record = otpStore.get(storeKey);
  const config = getOtpConfig();

  if (!record) {
    return {
      success: false,
      message: 'No active verification code found for this email. Please request a new code.'
    };
  }

  const now = Date.now();

  // Expiration check
  if (record.expiresAt < now) {
    otpStore.delete(storeKey);
    return {
      success: false,
      message: 'Verification code has expired. Please request a fresh code.'
    };
  }

  // Max attempts enforcement
  if (record.attempts >= config.maxAttempts) {
    otpStore.delete(storeKey);
    return {
      success: false,
      message: `Maximum verification attempts (${config.maxAttempts}) exceeded. This code has been invalidated for security. Please request a new code.`
    };
  }

  const cleanOtp = String(otp).trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      message: 'Verification code must be exactly 6 numeric digits.'
    };
  }

  const incomingHash = hashOtp(normalizedEmail, cleanOtp);
  const isMatch = timingSafeHashCompare(incomingHash, record.hash);

  if (!isMatch) {
    record.attempts += 1;
    const remaining = config.maxAttempts - record.attempts;

    // Sync attempts to Firestore if active
    if (isFirebaseActive()) {
      try {
        const firestore = getFirestore();
        firestore.collection('pending_verifications').doc(storeKey.replace(/[@.]/g, '_')).update({
          attempts: record.attempts
        }).catch(() => {});
      } catch {}
    }

    return {
      success: false,
      message: remaining > 0
        ? `Incorrect verification code. ${remaining} attempt(s) remaining.`
        : 'Maximum attempts exceeded. This verification code has been invalidated.'
    };
  }

  // Code verified successfully
  record.verified = true;
  record.attempts += 1; // Prevent subsequent replay attacks

  if (isFirebaseActive()) {
    try {
      const firestore = getFirestore();
      firestore.collection('pending_verifications').doc(storeKey.replace(/[@.]/g, '_')).update({
        verified: true,
        verifiedAt: new Date()
      }).catch(() => {});
    } catch {}
  }

  return {
    success: true,
    message: 'Verification successful!'
  };
};

const isEmailVerified = (email, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  const record = otpStore.get(storeKey);
  return Boolean(record && record.verified);
};

const consumeVerifiedOTP = (email, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  otpStore.delete(storeKey);

  if (isFirebaseActive()) {
    try {
      const firestore = getFirestore();
      firestore.collection('pending_verifications').doc(storeKey.replace(/[@.]/g, '_')).delete().catch(() => {});
    } catch {}
  }
};

// Periodic garbage collection for expired entries (runs every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

module.exports = {
  createAndStoreOTP,
  verifyOTP,
  isEmailVerified,
  consumeVerifiedOTP,
  getOtpConfig
};
