/**
 * Fit Health - Unified User Persistence Service
 * Bridges local in-memory DB and Firebase Cloud Firestore.
 * Guarantees seamless authentication and session persistence across Vercel serverless containers.
 */

require('../config/envLoader');
const db = require('../data/dbStorage');
const { getFirestore } = require('../config/firebase');

/**
 * Finds a user by email, checking in-memory cache first, then Cloud Firestore.
 * Automatically synchronizes fetched Firestore records into local memory.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findUserByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check local in-memory DB
  const localUser = db.findOne('users', u => u.email && u.email.toLowerCase() === cleanEmail);
  if (localUser) {
    return localUser;
  }

  // 2. Query Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      const snap = await firestore.collection('users')
        .where('email', '==', cleanEmail)
        .limit(1)
        .get();

      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();
        const user = {
          id: doc.id,
          ...data
        };

        // Cache into local in-memory DB for rapid subsequent requests on this instance
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
      const doc = await firestore.collection('users').doc(userId).get();
      if (doc.exists) {
        const data = doc.data();
        const user = {
          id: doc.id,
          ...data
        };

        // Cache into local in-memory DB
        try {
          db.create('users', user);
        } catch (_) {}

        return user;
      }
    }
  } catch (err) {
    console.warn('[User Service] Firestore lookup by ID warning:', err.message);
  }

  return null;
}

/**
 * Saves a user record to both local DB and Cloud Firestore.
 * Retains bcrypt password hash in Cloud Firestore to enable multi-container authentication.
 * @param {object} userRecord
 * @returns {Promise<object>}
 */
async function saveUser(userRecord) {
  if (!userRecord || !userRecord.email) {
    throw new Error('Valid user record with email is required.');
  }

  const cleanEmail = userRecord.email.toLowerCase().trim();
  const normalizedRecord = {
    ...userRecord,
    email: cleanEmail,
    updatedAt: new Date().toISOString()
  };

  // 1. Local in-memory DB
  try {
    const existing = db.findById('users', normalizedRecord.id);
    if (existing) {
      db.update('users', normalizedRecord.id, normalizedRecord);
    } else {
      db.create('users', normalizedRecord);
    }
  } catch (err) {
    console.warn('[User Service] Local DB save warning:', err.message);
  }

  // 2. Cloud Firestore (synchronous await ensures persistence before response)
  try {
    const firestore = getFirestore();
    if (firestore) {
      await firestore.collection('users').doc(normalizedRecord.id).set({
        ...normalizedRecord,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[User Service] Persisted user ${cleanEmail} (${normalizedRecord.id}) to Cloud Firestore.`);
    }
  } catch (err) {
    console.warn('[User Service] Firestore persist error:', err.message);
  }

  return normalizedRecord;
}

/**
 * Updates an existing user record in both local DB and Cloud Firestore.
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateUser(userId, updates) {
  if (!userId) return null;

  // 1. Local in-memory DB
  let updatedRecord = null;
  try {
    updatedRecord = db.update('users', userId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (_) {}

  // 2. Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      await firestore.collection('users').doc(userId).set({
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[User Service] Firestore update error:', err.message);
  }

  return updatedRecord;
}

/**
 * Finds a user by mobile phone number, checking in-memory cache first, then Cloud Firestore.
 * Supports exact match and digits-only normalization.
 * @param {string} phone
 * @returns {Promise<object|null>}
 */
async function findUserByPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits || digits.length < 6) return null;

  // 1. Check local in-memory DB
  const localUser = db.findOne('users', u => {
    if (!u.phone) return false;
    const uDigits = u.phone.replace(/\D/g, '');
    return uDigits === digits || (digits.length >= 10 && uDigits.endsWith(digits.slice(-10))) || (uDigits.length >= 10 && digits.endsWith(uDigits.slice(-10)));
  });
  if (localUser) {
    return localUser;
  }

  // 2. Query Cloud Firestore
  try {
    const firestore = getFirestore();
    if (firestore) {
      const snap = await firestore.collection('users')
        .where('phone', '==', phone.trim())
        .limit(1)
        .get();

      if (!snap.empty) {
        const doc = snap.docs[0];
        const user = { id: doc.id, ...doc.data() };
        try {
          db.create('users', user);
        } catch (_) {}
        return user;
      }
    }
  } catch (err) {
    console.warn('[User Service] Firestore lookup by phone warning:', err.message);
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

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findUserByIdentifier,
  findUserById,
  saveUser,
  updateUser
};

