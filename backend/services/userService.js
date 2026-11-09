/**
 * Fit Health - Unified User Persistence & Uniqueness Service
 * Bridges local in-memory DB and Firebase Cloud Firestore.
 * Implements strict E.164 mobile number normalization, email normalization,
 * uniqueness checks, and secure role preservation.
 */

require('../config/envLoader');
const db = require('../data/dbStorage');
const { getFirestore } = require('../config/firebase');
const { normalizeE164 } = require('./smsService');

/**
 * Timeout wrapper for Cloud Firestore network calls to ensure
 * requests never hang if network is slow or unreachable.
 */
const withTimeout = (promise, ms = 2500) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore query timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

/**
 * Normalizes email address (lowercase, trim).
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

/**
 * Normalizes mobile number to E.164 format.
 */
function normalizeMobile(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return normalizeE164(phone) || phone.trim().replace(/[\s\-\(\)]/g, '');
}

/**
 * Finds a user by email (checks normalizedEmail and email fields).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findUserByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = normalizeEmail(email);

  // 1. Check local in-memory DB
  const localUser = db.findOne('users', u => 
    (u.normalizedEmail && u.normalizedEmail === cleanEmail) || 
    (u.email && u.email.toLowerCase() === cleanEmail)
  );
  if (localUser) {
    return localUser;
  }

  // 2. Query Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      // Query by normalizedEmail first
      let snap = await withTimeout(
        firestore.collection('users').where('normalizedEmail', '==', cleanEmail).limit(1).get(),
        2500
      );

      // Fallback query by email if normalizedEmail didn't hit
      if (snap.empty) {
        snap = await withTimeout(
          firestore.collection('users').where('email', '==', cleanEmail).limit(1).get(),
          2500
        );
      }

      if (!snap.empty) {
        const doc = snap.docs[0];
        const user = {
          id: doc.id,
          ...doc.data()
        };

        // Cache into local in-memory DB
        try {
          const existingInDb = db.findById('users', user.id);
          if (!existingInDb) {
            db.create('users', user);
          } else {
            db.update('users', user.id, user);
          }
        } catch (_) {}

        return user;
      }
    }
  } catch (err) {
    console.warn('[User Service] Firestore lookup by email warning:', err.message);
  }

  return null;
}

/**
 * Finds a user by mobile phone number (checks normalizedMobileNumber and phone fields).
 * @param {string} phone
 * @returns {Promise<object|null>}
 */
async function findUserByPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const e164 = normalizeMobile(phone);
  const digits = phone.replace(/\D/g, '');
  if (!digits || digits.length < 7) return null;

  // 1. Check local in-memory DB
  const localUser = db.findOne('users', u => {
    if (u.normalizedMobileNumber && e164 && u.normalizedMobileNumber === e164) return true;
    if (u.mobileNumber && normalizeMobile(u.mobileNumber) === e164) return true;
    if (u.phone) {
      const uDigits = u.phone.replace(/\D/g, '');
      if (uDigits === digits) return true;
      if (digits.length >= 10 && uDigits.endsWith(digits.slice(-10))) return true;
      if (uDigits.length >= 10 && digits.endsWith(uDigits.slice(-10))) return true;
    }
    return false;
  });
  if (localUser) {
    return localUser;
  }

  // 2. Query Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      // Query by normalizedMobileNumber
      if (e164) {
        const snap = await withTimeout(
          firestore.collection('users').where('normalizedMobileNumber', '==', e164).limit(1).get(),
          2500
        );
        if (!snap.empty) {
          const doc = snap.docs[0];
          const user = { id: doc.id, ...doc.data() };
          try { db.create('users', user); } catch (_) {}
          return user;
        }
      }

      // Query by mobileNumber
      const snapPhone = await withTimeout(
        firestore.collection('users').where('mobileNumber', '==', phone.trim()).limit(1).get(),
        2500
      );
      if (!snapPhone.empty) {
        const doc = snapPhone.docs[0];
        const user = { id: doc.id, ...doc.data() };
        try { db.create('users', user); } catch (_) {}
        return user;
      }

      // Query by legacy phone field
      const snapLegacy = await withTimeout(
        firestore.collection('users').where('phone', '==', phone.trim()).limit(1).get(),
        2500
      );
      if (!snapLegacy.empty) {
        const doc = snapLegacy.docs[0];
        const user = { id: doc.id, ...doc.data() };
        try { db.create('users', user); } catch (_) {}
        return user;
      }
    }
  } catch (err) {
    console.warn('[User Service] Firestore lookup by phone warning:', err.message);
  }

  return null;
}

/**
 * Finds a user by ID, checking in-memory cache first, then Cloud Firestore.
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function findUserById(userId) {
  if (!userId) return null;

  // 1. Check local in-memory DB
  const localUser = db.findById('users', userId);
  if (localUser) {
    return localUser;
  }

  // 2. Query Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      const doc = await withTimeout(firestore.collection('users').doc(userId).get(), 2500);
      if (doc.exists) {
        const user = {
          id: doc.id,
          ...doc.data()
        };
        try { db.create('users', user); } catch (_) {}
        return user;
      }
    }
  } catch (err) {
    console.warn('[User Service] Firestore lookup by ID warning:', err.message);
  }

  return null;
}

/**
 * Finds a user by email OR mobile phone number seamlessly.
 * @param {string} identifier
 * @returns {Promise<object|null>}
 */
async function findUserByIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const clean = identifier.trim();

  // If email address (contains @)
  if (clean.includes('@')) {
    return await findUserByEmail(clean);
  }

  // Otherwise, lookup by mobile phone number
  const byPhone = await findUserByPhone(clean);
  if (byPhone) return byPhone;

  // Check if registered under mobile synthetic email
  const digits = clean.replace(/\D/g, '');
  if (digits) {
    const bySynthetic = await findUserByEmail(`${digits}@mobile.fithealth.io`);
    if (bySynthetic) return bySynthetic;
  }

  return await findUserByEmail(clean);
}

/**
 * Check if an email is already registered in the system.
 */
async function isEmailTaken(email, excludeUserId = null) {
  const existing = await findUserByEmail(email);
  if (existing && (!excludeUserId || existing.id !== excludeUserId)) {
    return true;
  }
  return false;
}

/**
 * Check if a mobile number is already registered in the system.
 */
async function isMobileTaken(phone, excludeUserId = null) {
  const existing = await findUserByPhone(phone);
  if (existing && (!excludeUserId || existing.id !== excludeUserId)) {
    return true;
  }
  return false;
}

/**
 * Saves a user record to both local DB and Cloud Firestore with standard field structure:
 * userId, fullName, email, normalizedEmail, mobileNumber, normalizedMobileNumber,
 * role, emailVerified, mobileVerified, passwordHash, createdAt, updatedAt, accountStatus
 * @param {object} userRecord
 * @returns {Promise<object>}
 */
async function saveUser(userRecord) {
  if (!userRecord) throw new Error('User record is required.');

  const userId = userRecord.userId || userRecord.id || `user_${Date.now()}`;
  const fullName = (userRecord.fullName || userRecord.name || '').trim();
  const rawEmail = (userRecord.email || '').trim();
  const normalizedEmailStr = normalizeEmail(rawEmail);
  const rawMobile = (userRecord.mobileNumber || userRecord.phone || '').trim();
  const normalizedMobileStr = normalizeMobile(rawMobile);
  const role = userRecord.role === 'admin' ? 'admin' : 'member';
  const passwordHash = userRecord.passwordHash || userRecord.password || '';

  const fullRecord = {
    userId,
    id: userId, // Compatibility alias
    fullName,
    name: fullName, // Compatibility alias
    email: rawEmail,
    normalizedEmail: normalizedEmailStr,
    mobileNumber: rawMobile,
    phone: rawMobile, // Compatibility alias
    normalizedMobileNumber: normalizedMobileStr,
    role,
    emailVerified: Boolean(userRecord.emailVerified),
    mobileVerified: Boolean(userRecord.mobileVerified),
    passwordHash,
    password: passwordHash, // Compatibility alias
    createdAt: userRecord.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountStatus: userRecord.accountStatus || 'active',
    // Preserve biometrics and workout profile fields
    age: userRecord.age !== undefined ? Number(userRecord.age) : 24,
    gender: userRecord.gender || 'Male',
    height: userRecord.height !== undefined ? Number(userRecord.height) : 175,
    weight: userRecord.weight !== undefined ? Number(userRecord.weight) : 75,
    targetWeight: userRecord.targetWeight !== undefined ? Number(userRecord.targetWeight) : 80,
    fitnessLevel: userRecord.fitnessLevel || 'Intermediate',
    primaryGoal: userRecord.primaryGoal || 'General fitness',
    activityLevel: userRecord.activityLevel || 'Moderately Active (3-5 days/week)',
    dietaryPreference: userRecord.dietaryPreference || 'High Protein',
    workoutExperience: userRecord.workoutExperience || '1-2 Years',
    membershipId: userRecord.membershipId || null
  };

  // 1. Local in-memory DB upsert
  try {
    const existing = db.findById('users', userId);
    if (existing) {
      db.update('users', userId, fullRecord);
    } else {
      db.create('users', fullRecord);
    }
  } catch (err) {
    console.warn('[User Service] Local DB save warning:', err.message);
  }

  // 2. Cloud Firestore persist (non-blocking async sync)
  try {
    const firestore = getFirestore();
    if (firestore) {
      firestore.collection('users').doc(userId).set(fullRecord, { merge: true }).then(() => {
        console.log(`[User Service] Persisted user ${normalizedEmailStr || normalizedMobileStr} (${userId}) to Cloud Firestore.`);
      }).catch(err => {
        console.warn('[User Service] Firestore persist warning:', err.message);
      });
    }
  } catch (err) {
    console.warn('[User Service] Firestore persist error:', err.message);
  }

  return fullRecord;
}

/**
 * Updates an existing user record in both local DB and Cloud Firestore.
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateUser(userId, updates) {
  if (!userId) return null;

  const normalizedUpdates = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (updates.email) {
    normalizedUpdates.normalizedEmail = normalizeEmail(updates.email);
  }
  if (updates.mobileNumber || updates.phone) {
    normalizedUpdates.normalizedMobileNumber = normalizeMobile(updates.mobileNumber || updates.phone);
  }

  // 1. Local in-memory DB
  let updatedRecord = null;
  try {
    updatedRecord = db.update('users', userId, normalizedUpdates);
  } catch (_) {}

  // 2. Cloud Firestore (non-blocking async sync)
  try {
    const firestore = getFirestore();
    if (firestore) {
      firestore.collection('users').doc(userId).set(normalizedUpdates, { merge: true }).catch(err => {
        console.warn('[User Service] Firestore update warning:', err.message);
      });
    }
  } catch (err) {
    console.warn('[User Service] Firestore update error:', err.message);
  }

  return updatedRecord;
}

/**
 * Strips password hash and sensitive security tokens before returning user object to client.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, otpHash, hash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  normalizeEmail,
  normalizeMobile,
  findUserByEmail,
  findUserByPhone,
  findUserByIdentifier,
  findUserById,
  isEmailTaken,
  isMobileTaken,
  saveUser,
  updateUser,
  sanitizeUser
};
