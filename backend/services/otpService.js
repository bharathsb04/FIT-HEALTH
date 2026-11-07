/**
 * Cryptographically Secure OTP Service
 * Generates, stores, hashes, and verifies 6-digit one-time passwords.
 * Database Storage: 'otps' collection/table in Cloud Firestore & persistent store.
 * Security: HMAC-SHA256 hashed form only. Plaintext OTPs are NEVER stored in the database.
 */

const crypto = require('crypto');
const db = require('../data/dbStorage');
const { getFirestore, isFirebaseActive } = require('../config/firebase');

// Fast In-Memory Cache: email:purpose -> { hash, expiresAt, attempts, resendAfter, verified, createdAt }
const otpStore = new Map();

// Rate-limiting store: identifier -> [timestamps]
const rateLimitStore = new Map();

const getOtpConfig = () => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

  return {
    expiryMs: expiryMinutes * 60 * 1000,
    cooldownMs: cooldownSeconds * 1000,
    cooldownSeconds,
    maxAttempts
  };
};

/**
 * Cryptographically secure HMAC-SHA256 hash helper.
 * Generates a one-way deterministic hash of the OTP bound to the user's email.
 */
const hashOtp = (email, otp) => {
  const secretSalt = process.env.JWT_SECRET || 'fit_health_otp_salt_key_2026';
  return crypto.createHmac('sha256', secretSalt).update(`${email.toLowerCase().trim()}:${String(otp).trim()}`).digest('hex');
};

/**
 * Constant-time buffer comparison to prevent timing side-channel attacks.
 */
const timingSafeHashCompare = (hashA, hashB) => {
  try {
    const bufA = Buffer.from(String(hashA), 'hex');
    const bufB = Buffer.from(String(hashB), 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

/**
 * Unpredictable cryptographically secure 6-digit numeric OTP generator.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Sliding-window rate limiter per email or IP (Max 10 OTP requests per 10 minutes).
 */
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
 * Creates, hashes, and stores an OTP in the database 'otps' table.
 * Plaintext OTP is returned ONLY for immediate SMTP email transmission.
 * The database receives exclusively the cryptographic hash.
 */
const createAndStoreOTP = async (email, purpose = 'registration', clientIp = null) => {
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
  const expiresAt = now + config.expiryMs;
  const resendAfter = now + config.cooldownMs;

  const existing = otpStore.get(storeKey);
  if (existing && existing.resendAfter > now) {
    const remainingSeconds = Math.ceil((existing.resendAfter - now) / 1000);
    throw new Error(`Please wait ${remainingSeconds} second(s) before requesting another verification code.`);
  }

  const plainOtp = generateOTP();
  const hashed = hashOtp(normalizedEmail, plainOtp);
  const docId = `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;

  const otpRecord = {
    id: `otp_${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`,
    email: normalizedEmail,
    purpose,
    otpHash: hashed,           // Stored in HASHED form only
    hash: hashed,              // Legacy compatibility alias
    expiresAt: new Date(expiresAt).toISOString(),
    expiresAtMs: expiresAt,
    resendAfter: new Date(resendAfter).toISOString(),
    resendAfterMs: resendAfter,
    attempts: 0,
    maxAttempts: config.maxAttempts,
    verified: false,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString()
  };

  // 1. Update In-Memory cache for low-latency lookups
  otpStore.set(storeKey, {
    hash: hashed,
    otpHash: hashed,
    expiresAt,
    resendAfter,
    attempts: 0,
    verified: false,
    purpose,
    createdAt: now
  });

  // 2. Persist to local database 'otps' table (upsert)
  try {
    const existingDbOtp = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
    if (existingDbOtp) {
      db.update('otps', existingDbOtp.id, otpRecord);
    } else {
      db.create('otps', otpRecord);
    }
  } catch (err) {
    console.warn('[Database OTP Storage] Local storage warning:', err.message);
  }

  // 3. Persist to Cloud Firestore 'otps' collection in HASHED form (CRITICAL for Serverless Vercel)
  try {
    const firestore = getFirestore();
    if (firestore) {
      await firestore.collection('otps').doc(docId).set({
        id: otpRecord.id,
        email: normalizedEmail,
        purpose,
        otpHash: hashed,         // HASHED FORM ONLY
        hash: hashed,
        attempts: 0,
        maxAttempts: config.maxAttempts,
        verified: false,
        expiresAtMs: expiresAt,
        expiresAt: new Date(expiresAt).toISOString(),
        resendAfterMs: resendAfter,
        resendAfter: new Date(resendAfter).toISOString(),
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString()
      });
      console.log(`[Cloud Firestore otps] Persisted OTP hash for ${normalizedEmail} (${purpose})`);
    }
  } catch (e) {
    console.warn('[Cloud Firestore otps] Sync warning:', e.message);
  }

  return plainOtp;
};

/**
 * Verifies an incoming OTP code against the stored hash in the database 'otps' table.
 * Enforces attempt count limits, expiration, and timing-safe comparison.
 * Fully supports Serverless multi-container instances via Cloud Firestore synchronization.
 */
const verifyOTP = async (email, otp, purpose = 'registration') => {
  if (!email || !otp) {
    return { success: false, message: 'Email and 6-digit verification code are required.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  const config = getOtpConfig();
  const now = Date.now();

  // 1. Try In-Memory cache first
  let record = otpStore.get(storeKey);

  // 2. Fallback to local database 'otps' table
  if (!record) {
    try {
      const dbRecord = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
      if (dbRecord) {
        record = {
          hash: dbRecord.otpHash || dbRecord.hash,
          otpHash: dbRecord.otpHash || dbRecord.hash,
          expiresAt: dbRecord.expiresAtMs || new Date(dbRecord.expiresAt).getTime(),
          attempts: dbRecord.attempts || 0,
          verified: Boolean(dbRecord.verified),
          purpose: dbRecord.purpose
        };
        otpStore.set(storeKey, record);
      }
    } catch (_) {}
  }

  // 3. Fallback to Cloud Firestore 'otps' collection (Crucial for Vercel Serverless containers)
  if (!record) {
    try {
      const firestore = getFirestore();
      if (firestore) {
        const docId = `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;
        let docSnap = await firestore.collection('otps').doc(docId).get();

        // Check alternate purpose if direct purpose didn't hit
        if (!docSnap.exists) {
          const altPurpose = purpose === 'registration' ? 'login' : 'registration';
          const altDocId = `${normalizedEmail.replace(/[@.]/g, '_')}_${altPurpose}`;
          docSnap = await firestore.collection('otps').doc(altDocId).get();
        }

        // Query by email directly if document key variant
        if (!docSnap.exists) {
          const querySnap = await firestore.collection('otps')
            .where('email', '==', normalizedEmail)
            .limit(2)
            .get();
          if (!querySnap.empty) {
            docSnap = querySnap.docs[0];
          }
        }

        if (docSnap && docSnap.exists) {
          const d = docSnap.data();
          record = {
            docId: docSnap.id,
            hash: d.otpHash || d.hash,
            otpHash: d.otpHash || d.hash,
            expiresAt: d.expiresAtMs || (d.expiresAt?.toDate ? d.expiresAt.toDate().getTime() : new Date(d.expiresAt).getTime()),
            attempts: d.attempts || 0,
            verified: Boolean(d.verified),
            purpose: d.purpose || purpose
          };
          otpStore.set(storeKey, record);
        }
      }
    } catch (err) {
      console.warn('[Cloud Firestore OTP Lookup Warning]:', err.message);
    }
  }

  if (!record) {
    return {
      success: false,
      message: 'No active verification code found for this email. Please request a new code.'
    };
  }

  // Expiration check
  if (record.expiresAt < now) {
    otpStore.delete(storeKey);
    try {
      const existing = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
      if (existing) db.delete('otps', existing.id);
    } catch (_) {}
    return {
      success: false,
      message: 'Verification code has expired. Please request a fresh code.'
    };
  }

  // Max attempts enforcement
  if (record.attempts >= config.maxAttempts) {
    otpStore.delete(storeKey);
    try {
      const existing = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
      if (existing) db.delete('otps', existing.id);
    } catch (_) {}
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
  const targetHash = record.otpHash || record.hash;
  const isMatch = timingSafeHashCompare(incomingHash, targetHash);

  if (!isMatch) {
    record.attempts += 1;
    const remaining = config.maxAttempts - record.attempts;

    // Sync attempts to database 'otps' table
    try {
      const existing = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
      if (existing) {
        db.update('otps', existing.id, {
          attempts: record.attempts,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (_) {}

    // Sync attempts to Cloud Firestore 'otps' collection
    try {
      const firestore = getFirestore();
      if (firestore) {
        const targetDocId = record.docId || `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;
        await firestore.collection('otps').doc(targetDocId).update({
          attempts: record.attempts,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (_) {}

    return {
      success: false,
      message: remaining > 0
        ? `Incorrect verification code. ${remaining} attempt(s) remaining.`
        : 'Maximum attempts exceeded. This verification code has been invalidated.'
    };
  }

  // Code verified successfully
  record.verified = true;
  record.attempts += 1; // Prevent replay

  // Update verified status in database 'otps' table
  try {
    const existing = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
    if (existing) {
      db.update('otps', existing.id, {
        verified: true,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (_) {}

  // Update verified status in Cloud Firestore 'otps' collection
  try {
    const firestore = getFirestore();
    if (firestore) {
      const targetDocId = record.docId || `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;
      await firestore.collection('otps').doc(targetDocId).update({
        verified: true,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    }
  } catch (_) {}

  return {
    success: true,
    message: 'Verification successful!'
  };
};

const isEmailVerified = async (email, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  const record = otpStore.get(storeKey);
  if (record && record.verified) return true;

  try {
    const dbRecord = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
    if (dbRecord && dbRecord.verified) return true;
  } catch (_) {}

  // Cloud Firestore fallback check
  try {
    const firestore = getFirestore();
    if (firestore) {
      const docId = `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;
      const docSnap = await firestore.collection('otps').doc(docId).get();
      if (docSnap.exists && docSnap.data()?.verified) return true;
    }
  } catch (_) {}

  return false;
};

const consumeVerifiedOTP = async (email, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();
  const storeKey = `${normalizedEmail}:${purpose}`;
  otpStore.delete(storeKey);

  // Remove from database 'otps' table
  try {
    const existing = db.findOne('otps', o => o.email === normalizedEmail && o.purpose === purpose);
    if (existing) db.delete('otps', existing.id);
  } catch (_) {}

  // Remove from Cloud Firestore 'otps' collection
  try {
    const firestore = getFirestore();
    if (firestore) {
      const docId = `${normalizedEmail.replace(/[@.]/g, '_')}_${purpose}`;
      await firestore.collection('otps').doc(docId).delete().catch(() => {});
      const altPurpose = purpose === 'registration' ? 'login' : 'registration';
      const altDocId = `${normalizedEmail.replace(/[@.]/g, '_')}_${altPurpose}`;
      await firestore.collection('otps').doc(altDocId).delete().catch(() => {});
    }
  } catch (_) {}
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
  getOtpConfig,
  hashOtp
};
