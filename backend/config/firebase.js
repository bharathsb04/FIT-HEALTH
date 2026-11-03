const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firestoreInstance = null;
let isConfigured = false;

const initFirebase = () => {
  if (admin && admin.apps && Array.isArray(admin.apps) && admin.apps.length > 0) {
    firestoreInstance = admin.firestore();
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
      // Handle escaped multiline private key from .env
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
      console.log(`[Firebase] Initialized with Cloud Project: ${projectId}`);
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

  console.log('[Firebase] No Cloud Firestore credentials provided. Active: Zero-Config Local Persistent Database Engine.');
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
