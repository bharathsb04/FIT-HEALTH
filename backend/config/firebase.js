/**
 * Firebase Cloud Firestore Admin SDK Module
 * Exclusive application database initialization and singleton provider.
 * Supports:
 *  1. Local development via service-account JSON file (FIREBASE_SERVICE_ACCOUNT_PATH)
 *  2. Cloud / Vercel serverless deployment via environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */

// Ensure all essential environment configurations are loaded
require('./envLoader');

const admin = require('firebase-admin');
const { getFirestore: getFirestoreModular } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Ensure backward and forward compatibility for admin.credential.cert() and admin.firestore()
if (!admin.credential) {
  admin.credential = {
    cert: (certData) => (admin.cert ? admin.cert(certData) : certData)
  };
}
if (!admin.firestore) {
  admin.firestore = (app) => (app ? getFirestoreModular(app) : getFirestoreModular());
}

let firestoreInstance = null;
let isConfigured = false;

/**
 * Initialize Firebase Admin SDK singleton.
 * Ensures Firebase is initialized only once.
 * @returns {FirebaseFirestore.Firestore | null}
 */
const initFirebase = () => {
  // Return cached instance if already initialized (Requirement 5: Initialize only once)
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const existingApps = admin.getApps ? admin.getApps() : (admin.apps || []);
  if (existingApps.length > 0) {
    firestoreInstance = admin.firestore(existingApps[0]);
    firestoreInstance.settings({ ignoreUndefinedProperties: true });
    isConfigured = true;
    return firestoreInstance;
  }

  // 1. Local JSON File Mode: Read service-account JSON if specified (Requirements 1, 2, 3, 7)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? path.normalize(serviceAccountPath)
      : path.resolve(__dirname, '..', serviceAccountPath);

    if (fs.existsSync(resolvedPath)) {
      try {
        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);

        // Requirement 2: Initialize Firebase Admin using admin.credential.cert()
        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

        firestoreInstance = admin.firestore(app);
        firestoreInstance.settings({ ignoreUndefinedProperties: true });
        isConfigured = true;
        console.log(`[Firebase Admin SDK] Initialized successfully using service-account JSON file.`);
        console.log(`[Firebase Admin SDK] Project ID: ${serviceAccount.project_id}`);
        console.log(`[Firebase Admin SDK] Client Email: ${serviceAccount.client_email}`);
        return firestoreInstance;
      } catch (err) {
        console.error('[Firebase Admin SDK] Failed to load Service Account JSON file:', err.message);
      }
    } else {
      console.warn(`[Firebase Admin SDK] Service account file not found at: ${resolvedPath}. Falling back to environment variables...`);
    }
  }

  // 2. Vercel / Cloud Environment Mode: Environment Variables (Requirement 10)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });

      firestoreInstance = admin.firestore(app);
      firestoreInstance.settings({ ignoreUndefinedProperties: true });
      isConfigured = true;
      console.log(`[Firebase Admin SDK] Initialized using environment credentials for project: ${projectId}`);
      return firestoreInstance;
    } catch (err) {
      console.error('[Firebase Admin SDK] Initialization error with environment credentials:', err.message);
    }
  }

  // 3. Application Default Credentials (Google Cloud Platform environment)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const app = admin.initializeApp();
      firestoreInstance = admin.firestore(app);
      firestoreInstance.settings({ ignoreUndefinedProperties: true });
      isConfigured = true;
      console.log('[Firebase Admin SDK] Initialized with Application Default Credentials');
      return firestoreInstance;
    } catch (err) {
      console.warn('[Firebase Admin SDK] Application Default Credentials failed:', err.message);
    }
  }

  // In production, Firebase is mandatory per project requirements
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL CONFIGURATION ERROR: Firebase Cloud Firestore is not configured!\n' +
      'Fit Health requires Firebase Cloud Firestore as the exclusive application database.\n' +
      'Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_PATH).'
    );
  }

  console.log('[Firebase Admin SDK] Notice: Live Cloud Firestore credentials not loaded.');
  isConfigured = false;
  return null;
};

/**
 * Returns the reusable Firestore instance.
 * Automatically initializes if not already initialized.
 * @returns {FirebaseFirestore.Firestore | null}
 */
const getFirestore = () => {
  if (!firestoreInstance && !isConfigured) {
    initFirebase();
  }
  return firestoreInstance;
};

/**
 * Check if Firebase is active and ready for queries.
 * @returns {boolean}
 */
const isFirebaseActive = () => isConfigured && firestoreInstance !== null;

module.exports = {
  admin,
  initFirebase,
  getFirestore,
  isFirebaseActive,
  get db() {
    return getFirestore();
  }
};
