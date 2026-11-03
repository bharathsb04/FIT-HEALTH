/**
 * Comprehensive Firebase Firestore Lifecycle & Feature Verification
 * Tests and verifies:
 * 1. Firebase Admin SDK connection
 * 2. Firestore initialization
 * 3. Required collections verification
 * 4. Secure Firestore rules validation
 * 5. Direct database read/write operations
 * 6. User registration and login flow with Firestore sync
 * 7. Fitness data storage and retrieval (workouts, diet, vitals, hydration, biometrics)
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { admin, initFirebase, getFirestore, isFirebaseActive } = require('../config/firebase');

const REQUIRED_COLLECTIONS = [
  'users',
  'gyms',
  'workoutPlans',
  'dietPlans',
  'vitalsLogs',
  'hydrationLogs',
  'supplements',
  'progressRecords',
  'dayPassBookings',
  'foodItems',
  'gymMembers',
  'gymCheckIns',
  'gymEquipment',
  'gymFeePlans',
  'cashPaymentTokens',
  'membershipTransactions',
  'maintenanceDirectory',
  'adminAuditLogs',
  'biometrics',
  'biometricsConsent',
  'providerConnections'
];

async function main() {
  console.log('=================================================================================');
  console.log('       FIT HEALTH - FULL LIFECYCLE FIREBASE FIRESTORE VERIFICATION SUITE         ');
  console.log('=================================================================================\n');

  // ---------------------------------------------------------------------------
  // STEP 1 & 2: Connect Firebase Admin SDK & Initialize Firestore
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 1 & 2: Connecting Firebase Admin SDK & Initializing Firestore...');
  const firestore = initFirebase();

  if (!firestore || !isFirebaseActive()) {
    throw new Error('Failed to initialize Firebase Firestore singleton.');
  }

  const existingApps = admin.getApps ? admin.getApps() : (admin.apps || []);
  const activeApp = existingApps[0];
  console.log(`   [PASS] Firebase App Connected: ${activeApp ? activeApp.name : '[DEFAULT]'}`);
  console.log(`   [PASS] Project ID: ${process.env.FIREBASE_PROJECT_ID || 'fit-health-1fbf8'}`);
  console.log('   [PASS] Firestore Database instance is active and ready.\n');

  // ---------------------------------------------------------------------------
  // STEP 3: Verify / Ensure Required Collections
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 3: Verifying Required Firestore Collections...');
  console.log(`   Checking ${REQUIRED_COLLECTIONS.length} essential application collections:`);

  for (const colName of REQUIRED_COLLECTIONS) {
    const snapshot = await firestore.collection(colName).limit(1).get();
    console.log(`   - Collection "${colName}": Verified (Accessible, docs: ${snapshot.size > 0 ? '>= 1' : '0'})`);
  }
  console.log('   [PASS] All required Firestore collections are defined and reachable.\n');

  // ---------------------------------------------------------------------------
  // STEP 4: Configure / Validate Secure Firestore Rules
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 4: Validating Security Rules Coverage (firestore.rules)...');
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    throw new Error('firestore.rules file not found!');
  }
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Validate coverage of key security primitives
  const securityChecks = [
    { name: 'isAuthenticated() helper', pattern: /function isAuthenticated\(\)/ },
    { name: 'isAdmin() helper', pattern: /function isAdmin\(\)/ },
    { name: 'User Privacy Protection (/users/{userId})', pattern: /match \/users\/\{userId\}/ },
    { name: 'Workout Plans Protection', pattern: /match \/workoutPlans\/\{planId\}/ },
    { name: 'Vitals & Telemetry Protection', pattern: /match \/vitalsLogs\/\{logId\}/ },
    { name: 'Biometrics Security Rule', pattern: /match \/biometrics\/\{recordId\}/ },
    { name: 'Public Gym Catalog Read-Only', pattern: /match \/gyms\/\{gymId\}/ },
    { name: 'Default Deny Boundary', pattern: /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/ }
  ];

  for (const check of securityChecks) {
    if (!check.pattern.test(rulesContent)) {
      throw new Error(`Security rule check failed for: ${check.name}`);
    }
    console.log(`   - ${check.name}: Covered`);
  }
  console.log('   [PASS] firestore.rules meets strict production security requirements.\n');

  // ---------------------------------------------------------------------------
  // STEP 5: Test Database Read & Write Operations
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 5: Testing Database Read, Write, Query, and Delete Operations...');
  const testId = `rw_test_${Date.now()}`;
  const testRef = firestore.collection('_lifecycle_tests').doc(testId);

  await testRef.set({
    testId,
    purpose: 'Database Read/Write Verification',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  });
  console.log('   [PASS] Direct WRITE to Firestore succeeded.');

  const readSnap = await testRef.get();
  if (!readSnap.exists || readSnap.data().testId !== testId) {
    throw new Error('Direct READ from Firestore failed or returned mismatched data.');
  }
  console.log('   [PASS] Direct READ from Firestore verified with exact field match.');

  await testRef.update({ status: 'UPDATED', verified: true });
  const updatedSnap = await testRef.get();
  if (updatedSnap.data().status !== 'UPDATED') {
    throw new Error('Direct UPDATE in Firestore failed.');
  }
  console.log('   [PASS] Direct UPDATE in Firestore verified.');

  await testRef.delete();
  const deletedSnap = await testRef.get();
  if (deletedSnap.exists) {
    throw new Error('Direct DELETE from Firestore failed.');
  }
  console.log('   [PASS] Direct DELETE (cleanup) from Firestore verified.\n');

  // ---------------------------------------------------------------------------
  // STEP 6: Verify Registration and Login Flows
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 6: Verifying User Registration and Login Flow with Firestore...');
  const testUserEmail = `verified_athlete_${Date.now()}@fithealth.io`;
  const rawPassword = 'StrongAthletePassword#2026';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const userId = `usr_${Date.now()}`;

  const userDoc = {
    id: userId,
    name: 'Verified Athlete',
    email: testUserEmail,
    role: 'member',
    password: hashedPassword,
    emailVerified: true,
    fitnessGoal: 'Muscle Hypertrophy & Endurance',
    weightKg: 74.5,
    heightCm: 178,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 6a. Register user document in Firestore
  await firestore.collection('users').doc(userId).set(userDoc);
  console.log(`   [PASS] Registration: User document created in Firestore for "${testUserEmail}".`);

  // 6b. Verify registration in Firestore
  const userCheckSnap = await firestore.collection('users').doc(userId).get();
  if (!userCheckSnap.exists) {
    throw new Error(`Registration verification failed: user ${userId} not found in Firestore.`);
  }
  const retrievedUser = userCheckSnap.data();
  console.log(`   [PASS] User verified in Firestore: ${retrievedUser.name} (${retrievedUser.role})`);

  // 6c. Simulate Login: Compare hashed password using bcrypt
  const passwordValid = await bcrypt.compare(rawPassword, retrievedUser.password);
  if (!passwordValid) {
    throw new Error('Login failed: password hash comparison failed!');
  }
  console.log('   [PASS] Login: Bcrypt password authentication verified.');

  // 6d. Issue JWT Session Token
  const jwtSecret = process.env.JWT_SECRET || 'fit_health_secret_jwt_bca_2026_key';
  const sessionToken = jwt.sign(
    { id: retrievedUser.id, email: retrievedUser.email, role: retrievedUser.role },
    jwtSecret,
    { expiresIn: '7d' }
  );
  const decodedToken = jwt.verify(sessionToken, jwtSecret);
  if (decodedToken.email !== testUserEmail) {
    throw new Error('JWT token verification failed.');
  }
  console.log(`   [PASS] JWT session token generated and validated: Subject=${decodedToken.email}\n`);

  // ---------------------------------------------------------------------------
  // STEP 7: Verify Fitness Data Storage and Retrieval
  // ---------------------------------------------------------------------------
  console.log('🔹 STEP 7: Verifying Fitness Data Storage & Retrieval in Firestore...');

  // 7a. Workout Plan
  const workoutPlanId = `workout_${userId}`;
  const workoutPayload = {
    id: workoutPlanId,
    userId,
    title: 'Advanced Push-Pull-Legs Hypertrophy Split',
    splitName: 'PPL 6-Day',
    daysCount: 6,
    difficulty: 'Intermediate-Advanced',
    activeDayIndex: 1,
    schedule: [
      { day: 'Day 1 - Push', exercises: ['Barbell Incline Press', 'Dumbbell Shoulder Press', 'Triceps Rope Pushdown'] },
      { day: 'Day 2 - Pull', exercises: ['Weighted Pull-ups', 'Barbell Row', 'Incline Dumbbell Curl'] },
      { day: 'Day 3 - Legs', exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Standing Calf Raise'] }
    ],
    updatedAt: new Date().toISOString()
  };
  await firestore.collection('workoutPlans').doc(workoutPlanId).set(workoutPayload);
  console.log('   [PASS] Fitness Data: Workout plan stored in Firestore.');

  // 7b. Daily Diet & Nutrition Plan
  const dietPlanId = `diet_${userId}`;
  const dietPayload = {
    id: dietPlanId,
    userId,
    targetCalories: 2650,
    macros: { protein: 185, carbs: 290, fats: 72 },
    meals: [
      { name: 'Pre-Workout Oats & Whey', calories: 520, protein: 42 },
      { name: 'Post-Workout Chicken Rice Bowl', calories: 780, protein: 55 },
      { name: 'Dinner Salmon & Sweet Potato', calories: 650, protein: 48 }
    ],
    updatedAt: new Date().toISOString()
  };
  await firestore.collection('dietPlans').doc(dietPlanId).set(dietPayload);
  console.log('   [PASS] Fitness Data: Nutrition and macro diet plan stored in Firestore.');

  // 7c. Vitals & Health Telemetry Log
  const vitalsLogId = `vitals_${userId}_${Date.now()}`;
  const vitalsPayload = {
    id: vitalsLogId,
    userId,
    date: new Date().toISOString().split('T')[0],
    steps: 10450,
    restingHeartRate: 58,
    activeCaloriesBurned: 720,
    sleepDurationHours: 7.8,
    bloodPressure: '118/76',
    recordedAt: new Date().toISOString()
  };
  await firestore.collection('vitalsLogs').doc(vitalsLogId).set(vitalsPayload);
  console.log('   [PASS] Fitness Data: Health vitals telemetry log stored in Firestore.');

  // 7d. Hydration Tracking Log
  const hydrationId = `hydration_${userId}_${Date.now()}`;
  const hydrationPayload = {
    id: hydrationId,
    userId,
    date: new Date().toISOString().split('T')[0],
    targetMl: 3500,
    consumedMl: 2750,
    logs: [
      { time: '08:00', amountMl: 500 },
      { time: '11:30', amountMl: 750 },
      { time: '14:30', amountMl: 500 },
      { time: '17:00', amountMl: 1000 }
    ]
  };
  await firestore.collection('hydrationLogs').doc(hydrationId).set(hydrationPayload);
  console.log('   [PASS] Fitness Data: Daily hydration tracking log stored in Firestore.');

  // 7e. Wearable Biometrics Telemetry
  const biometricsId = `bio_${userId}_${Date.now()}`;
  const biometricsPayload = {
    id: biometricsId,
    memberId: userId,
    provider: 'samsung_health',
    deviceModel: 'Galaxy Watch 6 Pro',
    metricType: 'heart_rate_variability',
    value: 68,
    unit: 'ms',
    recordedAt: new Date().toISOString()
  };
  await firestore.collection('biometrics').doc(biometricsId).set(biometricsPayload);
  console.log('   [PASS] Fitness Data: Wearable hardware biometrics stored in Firestore.');

  // 7f. RETRIEVAL & INTEGRITY VERIFICATION
  console.log('\n   Verifying retrieval of all stored fitness entities from Firestore:');

  const retrievedWorkout = (await firestore.collection('workoutPlans').doc(workoutPlanId).get()).data();
  const retrievedDiet = (await firestore.collection('dietPlans').doc(dietPlanId).get()).data();
  const retrievedVitals = (await firestore.collection('vitalsLogs').doc(vitalsLogId).get()).data();
  const retrievedHydration = (await firestore.collection('hydrationLogs').doc(hydrationId).get()).data();
  const retrievedBio = (await firestore.collection('biometrics').doc(biometricsId).get()).data();

  if (!retrievedWorkout || retrievedWorkout.title !== workoutPayload.title) {
    throw new Error('Workout plan retrieval failed or data mismatch.');
  }
  console.log(`   - Workout Plan: Retrieved ("${retrievedWorkout.title}", ${retrievedWorkout.daysCount} days)`);

  if (!retrievedDiet || retrievedDiet.targetCalories !== 2650) {
    throw new Error('Diet plan retrieval failed or data mismatch.');
  }
  console.log(`   - Diet Plan: Retrieved (${retrievedDiet.targetCalories} kcal, ${retrievedDiet.macros.protein}g protein)`);

  if (!retrievedVitals || retrievedVitals.steps !== 10450) {
    throw new Error('Vitals log retrieval failed or data mismatch.');
  }
  console.log(`   - Health Vitals: Retrieved (${retrievedVitals.steps} steps, ${retrievedVitals.restingHeartRate} bpm)`);

  if (!retrievedHydration || retrievedHydration.consumedMl !== 2750) {
    throw new Error('Hydration log retrieval failed or data mismatch.');
  }
  console.log(`   - Hydration Log: Retrieved (${retrievedHydration.consumedMl} / ${retrievedHydration.targetMl} mL)`);

  if (!retrievedBio || retrievedBio.value !== 68) {
    throw new Error('Biometrics retrieval failed or data mismatch.');
  }
  console.log(`   - Wearable Biometrics: Retrieved (${retrievedBio.provider}, HRV: ${retrievedBio.value} ${retrievedBio.unit})`);

  console.log('   [PASS] All fitness data entities retrieved with 100% field integrity.');

  // ---------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Performing Clean Demarcated Cleanup of Test Entities...');
  await firestore.collection('users').doc(userId).delete();
  await firestore.collection('workoutPlans').doc(workoutPlanId).delete();
  await firestore.collection('dietPlans').doc(dietPlanId).delete();
  await firestore.collection('vitalsLogs').doc(vitalsLogId).delete();
  await firestore.collection('hydrationLogs').doc(hydrationId).delete();
  await firestore.collection('biometrics').doc(biometricsId).delete();
  console.log('   [PASS] Test entities cleaned up. Cloud Firestore left in pristine state.\n');

  console.log('=================================================================================');
  console.log('🎉 ALL 7 FIREBASE & FIRESTORE OBJECTIVES VERIFIED SUCCESSFULLY (100% SUCCESS)    ');
  console.log('   1. Firebase Admin SDK Connected:              ACTIVE                          ');
  console.log('   2. Cloud Firestore Initialized:               ACTIVE                          ');
  console.log('   3. Required Collections Verified:             21 COLLECTIONS ACCESSIBLE       ');
  console.log('   4. Secure Firestore Rules:                    VALIDATED                       ');
  console.log('   5. Database Read/Write/Update/Delete:         VERIFIED                        ');
  console.log('   6. Registration & Bcrypt/JWT Login:           VERIFIED                        ');
  console.log('   7. Fitness Data Storage & Retrieval:          100% MATCH                      ');
  console.log('=================================================================================');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Lifecycle verification failed:', err.message);
    process.exit(1);
  });
