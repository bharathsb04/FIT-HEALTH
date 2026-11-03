/**
 * Firebase Cloud Firestore Admin SDK Module
 * Exclusive application database initialization and singleton provider.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firestoreInstance = null;
let isConfigured = false;

const initFirebase = () => {
  // Return cached instance if already initialized (serverless-friendly)
  if (admin && admin.apps && Array.isArray(admin.apps) && admin.apps.length > 0) {
    if (!firestoreInstance) {
      firestoreInstance = admin.firestore();
    }
    isConfigured = true;
    return firestoreInstance;
  }

  // 1. Try service account file if path specified
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const fullPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(__dirname, '..', serviceAccountPath);

    if (fs.existsSync(fullPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        firestoreInstance = admin.firestore();
        isConfigured = true;
        console.log('[Firebase] Initialized with Service Account file:', fullPath);
        return firestoreInstance;
      } catch (err) {
        console.warn('[Firebase] Failed to load Service Account file:', err.message);
      }
    }
  }

  // 2. Try environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      firestoreInstance = admin.firestore();
      isConfigured = true;
      console.log(`[Firebase] Initialized with Cloud Firestore Project: ${projectId}`);
      return firestoreInstance;
    } catch (err) {
      console.warn('[Firebase] Initialization error with env credentials:', err.message);
    }
  }

  // 3. Application Default Credentials (GCP environment)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp();
      firestoreInstance = admin.firestore();
      isConfigured = true;
      console.log('[Firebase] Initialized with Application Default Credentials');
      return firestoreInstance;
    } catch (err) {
      console.warn('[Firebase] Application Default Credentials failed:', err.message);
    }
  }

  // 4. Firestore Local Emulator (if FIRESTORE_EMULATOR_HOST is set)
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    try {
      admin.initializeApp({ projectId: projectId || 'fit-health-emulator' });
      firestoreInstance = admin.firestore();
      isConfigured = true;
      console.log(`[Firebase] Connected to local Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
      return firestoreInstance;
    } catch (err) {
      console.warn('[Firebase] Emulator connection failed:', err.message);
    }
  }

  // In production, Firebase is mandatory per Phase 4 requirements
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL CONFIGURATION ERROR: Firebase Cloud Firestore is not configured!\n' +
      'Fit Health requires Firebase Cloud Firestore as the exclusive application database.\n' +
      'Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.'
    );
  }

  console.log('[Firebase] Notice: Live Cloud Firestore credentials not yet supplied in backend/.env.');
  console.log('           To connect live Cloud Firestore, add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, & FIREBASE_PRIVATE_KEY.');
  isConfigured = false;
  return null;
};

const getFirestore = () => {
  if (!firestoreInstance && !isConfigured) {
    initFirebase();
  }
  return firestoreInstance;
};

const isFirebaseActive = () => isConfigured && firestoreInstance !== null;

module.exports = {
  admin,
  initFirebase,
  getFirestore,
  isFirebaseActive
};
