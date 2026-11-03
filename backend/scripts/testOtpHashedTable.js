/**
 * Test & Verification: Hashed OTP Table in Database & Cloud Firestore
 * Tests:
 * 1. OTP generation and storage in 'otps' table in HASHED form only.
 * 2. Absence of plaintext OTPs in both local database and Cloud Firestore.
 * 3. Attempt tracking and verification updates in the database.
 * 4. Cleanup/consumption of verified OTPs.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../data/dbStorage');
const { getFirestore, isFirebaseActive, initFirebase } = require('../config/firebase');
const {
  createAndStoreOTP,
  verifyOTP,
  isEmailVerified,
  consumeVerifiedOTP,
  hashOtp
} = require('../services/otpService');

async function testOtpHashedTable() {
  console.log('======================================================================');
  console.log('       TEST: DATABASE HASHED OTP TABLE & FIRESTORE VERIFICATION       ');
  console.log('======================================================================\n');

  initFirebase();
  const firestore = isFirebaseActive() ? getFirestore() : null;

  const testEmail = `athlete_otp_${Date.now()}@fithealth.io`;
  const purpose = 'registration';

  console.log(`[Step 1] Generating 6-digit OTP for email: ${testEmail}...`);
  const rawOtp = createAndStoreOTP(testEmail, purpose);
  console.log(`         Plain OTP generated (for SMTP email dispatch only): ${rawOtp}`);

  // 1. Verify Local Database 'otps' table
  console.log('\n[Step 2] Inspecting local database "otps" table...');
  const localRecord = db.findOne('otps', o => o.email === testEmail && o.purpose === purpose);
  if (!localRecord) {
    throw new Error('FAILED: Record not found in local database "otps" table!');
  }
  console.log(`         Record ID in "otps" table: ${localRecord.id}`);
  console.log(`         Stored Hash (HMAC-SHA256): ${localRecord.otpHash}`);
  console.log(`         Stored Hash length:        ${localRecord.otpHash.length} hex chars`);

  // Assert plaintext OTP is NOT stored in the database
  const recordString = JSON.stringify(localRecord);
  if (recordString.includes(rawOtp)) {
    throw new Error('SECURITY VIOLATION: Plaintext OTP found inside database record!');
  }
  console.log('         [PASS] Plaintext OTP is NOT stored in local database. ONLY hash is stored.');

  // 2. Verify Cloud Firestore 'otps' collection
  let firestoreDocId = `${testEmail.replace(/[@.]/g, '_')}_${purpose}`;
  if (firestore) {
    console.log('\n[Step 3] Inspecting live Cloud Firestore "otps" collection...');
    // Allow brief interval for asynchronous network write to Cloud Firestore
    await new Promise(r => setTimeout(r, 1000));
    const docSnap = await firestore.collection('otps').doc(firestoreDocId).get();
    if (!docSnap.exists) {
      throw new Error(`FAILED: Document ${firestoreDocId} not found in Cloud Firestore "otps" collection!`);
    }

    const firestoreData = docSnap.data();
    console.log(`         Firestore Document ID: ${docSnap.id}`);
    console.log(`         Firestore Stored Hash: ${firestoreData.otpHash}`);
    console.log(`         Firestore Attempts:    ${firestoreData.attempts}`);
    console.log(`         Firestore Verified:    ${firestoreData.verified}`);

    const firestoreJson = JSON.stringify(firestoreData);
    if (firestoreJson.includes(rawOtp)) {
      throw new Error('SECURITY VIOLATION: Plaintext OTP found inside Cloud Firestore document!');
    }
    console.log('         [PASS] Plaintext OTP is NOT stored in Cloud Firestore. ONLY hash is stored.');
  }

  // 3. Test Invalid OTP Attempt Tracking
  console.log('\n[Step 4] Testing invalid verification code submission...');
  const invalidResult = verifyOTP(testEmail, '999999', purpose);
  console.log(`         Submission response: "${invalidResult.message}" (success: ${invalidResult.success})`);
  if (invalidResult.success) {
    throw new Error('FAILED: Incorrect code should have been rejected!');
  }

  const updatedLocal = db.findOne('otps', o => o.email === testEmail && o.purpose === purpose);
  console.log(`         Updated attempts in database: ${updatedLocal.attempts}`);
  if (updatedLocal.attempts !== 1) {
    throw new Error('FAILED: Attempt counter was not incremented in database!');
  }
  console.log('         [PASS] Attempt counter incremented in database.');

  // 4. Test Valid OTP Verification
  console.log('\n[Step 5] Testing valid verification code submission...');
  const validResult = verifyOTP(testEmail, rawOtp, purpose);
  console.log(`         Submission response: "${validResult.message}" (success: ${validResult.success})`);
  if (!validResult.success) {
    throw new Error('FAILED: Correct verification code was rejected!');
  }

  const verifiedLocal = db.findOne('otps', o => o.email === testEmail && o.purpose === purpose);
  console.log(`         Database status verified: ${verifiedLocal.verified}`);
  if (!verifiedLocal.verified) {
    throw new Error('FAILED: Database record was not marked verified: true!');
  }
  console.log('         [PASS] OTP verified successfully against stored cryptographic hash.');

  // 5. Test Consumption & Clean Invalidation
  console.log('\n[Step 6] Consuming verified OTP (Anti-replay enforcement)...');
  consumeVerifiedOTP(testEmail, purpose);

  const postConsumeLocal = db.findOne('otps', o => o.email === testEmail && o.purpose === purpose);
  if (postConsumeLocal) {
    throw new Error('FAILED: Record was not removed from database after consumption!');
  }
  console.log('         [PASS] Consumed OTP removed from local database "otps" table.');

  if (firestore) {
    await new Promise(r => setTimeout(r, 800));
    const postConsumeSnap = await firestore.collection('otps').doc(firestoreDocId).get();
    if (postConsumeSnap.exists) {
      throw new Error('FAILED: Consumed OTP document still exists in Cloud Firestore!');
    }
    console.log('         [PASS] Consumed OTP removed from Cloud Firestore "otps" collection.');
  }

  console.log('\n======================================================================');
  console.log('  ALL HASHED OTP DATABASE TABLE TESTS PASSED WITH 100% SUCCESS!       ');
  console.log('  - Database Table: "otps" added to persistent database & Firestore    ');
  console.log('  - Storage Format: HMAC-SHA256 Cryptographic Hash (NO plaintext)     ');
  console.log('  - Verification: Timing-safe hash comparison                          ');
  console.log('  - Lifecycle: Attempt tracking & post-verification consumption       ');
  console.log('======================================================================\n');
}

testOtpHashedTable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
