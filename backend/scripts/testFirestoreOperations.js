/**
 * Live Firestore Operations Verification Script
 * Validates Requirement 1, 2, 3, 4, 5, 6, 7, 10, 11
 * Reads service-account JSON, initializes Firebase Admin SDK, executes live Write, Read, Query, and Delete operations.
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { admin, initFirebase, getFirestore, isFirebaseActive, db } = require('../config/firebase');

async function runFirestoreVerification() {
  console.log('========================================================================');
  console.log('      FIT HEALTH - LIVE CLOUD FIRESTORE COMPREHENSIVE TEST SUITE       ');
  console.log('========================================================================\n');

  // Step 1: Validate Service Account File Path & Integrity
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  console.log(`[Step 1] Checking service account file path in configuration...`);
  console.log(`         Configured path: ${serviceAccountPath}`);

  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set in backend/.env');
  }

  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? path.normalize(serviceAccountPath)
    : path.resolve(__dirname, '..', serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Service account JSON file does not exist at: ${resolvedPath}`);
  }
  console.log(`         File verified on disk (${fs.statSync(resolvedPath).size} bytes).`);

  const fileData = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  console.log(`         Project ID from JSON: ${fileData.project_id}`);
  console.log(`         Client Email from JSON: ${fileData.client_email}`);
  console.log(`         Private Key ID: ${fileData.private_key_id}`);
  console.log('         [PASS] Service Account file loaded and validated.\n');

  // Step 2: Initialize Firebase Admin SDK
  console.log(`[Step 2] Initializing Firebase Admin SDK via admin.credential.cert()...`);
  const firestore = initFirebase();

  if (!firestore) {
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }

  if (!isFirebaseActive()) {
    throw new Error('Firebase reported as inactive after initialization.');
  }

  // Verify Singleton Pattern (Requirement 5: Initialize only once)
  console.log(`[Step 3] Verifying Singleton Initialization Pattern...`);
  const firestoreSecondCall = initFirebase();
  const firestoreGetterCall = getFirestore();
  if (firestore !== firestoreSecondCall || firestore !== firestoreGetterCall) {
    throw new Error('Singleton pattern check failed: multiple distinct instances created.');
  }
  console.log('         [PASS] Singleton instance confirmed. Firebase initialized only once.\n');

  // Step 4: Live Firestore WRITE Operation
  const testCollection = '_connection_verification';
  const testDocId = `test_healthcheck_${Date.now()}`;
  console.log(`[Step 4] Executing live Cloud Firestore WRITE operation...`);
  console.log(`         Target Collection: ${testCollection}`);
  console.log(`         Target Document:   ${testDocId}`);

  const testPayload = {
    testId: testDocId,
    service: 'Fit Health Backend',
    purpose: 'BCA Final Project Live Database Verification',
    environment: process.env.NODE_ENV || 'development',
    status: 'ACTIVE_AND_VERIFIED',
    database: 'Google Cloud Firestore',
    timestamp: new Date().toISOString()
  };

  const docRef = firestore.collection(testCollection).doc(testDocId);
  await docRef.set(testPayload);
  console.log('         [PASS] Document written to Cloud Firestore successfully.\n');

  // Step 5: Live Firestore READ Operation
  console.log(`[Step 5] Executing live Cloud Firestore READ operation...`);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    throw new Error(`Verification failed: Document ${testDocId} was not found on Firestore!`);
  }

  const retrievedData = docSnapshot.data();
  console.log(`         Retrieved Document ID: ${docSnapshot.id}`);
  console.log(`         Retrieved Status:      ${retrievedData.status}`);
  console.log(`         Retrieved Purpose:     ${retrievedData.purpose}`);
  console.log(`         Retrieved Timestamp:   ${retrievedData.timestamp}`);

  if (retrievedData.testId !== testDocId || retrievedData.status !== 'ACTIVE_AND_VERIFIED') {
    throw new Error('Verification failed: Retrieved data does not match written payload!');
  }
  console.log('         [PASS] Cloud Firestore READ verified with exact data match.\n');

  // Step 6: Live Firestore QUERY Operation
  console.log(`[Step 6] Executing live Cloud Firestore QUERY operation...`);
  const querySnapshot = await firestore
    .collection(testCollection)
    .where('status', '==', 'ACTIVE_AND_VERIFIED')
    .limit(5)
    .get();

  console.log(`         Found ${querySnapshot.size} matching document(s).`);
  console.log('         [PASS] Cloud Firestore QUERY execution verified.\n');

  // Step 7: Live Firestore CLEANUP / DELETE Operation
  console.log(`[Step 7] Executing live Cloud Firestore DELETE (Cleanup) operation...`);
  await docRef.delete();

  const postDeleteSnapshot = await docRef.get();
  if (postDeleteSnapshot.exists) {
    throw new Error(`Cleanup failed: Document ${testDocId} still exists after delete!`);
  }
  console.log('         [PASS] Test document removed from Cloud Firestore cleanly.\n');

  console.log('========================================================================');
  console.log('  ALL FIRESTORE TESTS PASSED SUCCESSFULLY! (100% OPERATIONAL)          ');
  console.log('  - Service Account JSON: Loaded via admin.credential.cert()          ');
  console.log('  - Reusable DB Instance: Exported via getFirestore() / db             ');
  console.log('  - Singleton Guard: Active (Initialized only once)                   ');
  console.log('  - Live Operations: WRITE, READ, QUERY, DELETE all verified           ');
  console.log('========================================================================\n');
}

runFirestoreVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[FIRESTORE VERIFICATION FAILED]:', err.message);
    process.exit(1);
  });
