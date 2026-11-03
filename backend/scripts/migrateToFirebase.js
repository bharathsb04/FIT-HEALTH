const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { initFirebase, getFirestore, isFirebaseActive } = require('../config/firebase');

async function runMigration() {
  console.log('================================================================');
  console.log('🚀 Fit Health — Cloud Firestore Full Database Migration Tool');
  console.log('================================================================\n');

  initFirebase();

  if (!isFirebaseActive()) {
    console.error('❌ Firebase is not initialized. Please ensure FIREBASE_PROJECT_ID,');
    console.error('   FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are defined in backend/.env,');
    console.error('   or provide FIREBASE_SERVICE_ACCOUNT_PATH.');
    console.log('\nMigration aborted.');
    process.exit(1);
  }

  const firestore = getFirestore();
  const dbFile = path.join(__dirname, '..', 'data', 'fit_health_store.json');

  if (!fs.existsSync(dbFile)) {
    console.error('❌ Source database file not found at:', dbFile);
    process.exit(1);
  }

  console.log('📖 Reading source database from:', dbFile);
  const rawData = fs.readFileSync(dbFile, 'utf8');
  const data = JSON.parse(rawData);

  const collections = Object.keys(data);
  console.log(`📦 Discovered ${collections.length} collections/entities to migrate.\n`);

  let totalMigrated = 0;
  const BATCH_LIMIT = 450; // Firestore maximum is 500 operations per batch

  for (const colName of collections) {
    const colValue = data[colName];

    if (Array.isArray(colValue)) {
      if (colValue.length === 0) {
        console.log(`- ⏩ Collection "${colName}": 0 records (skipped)`);
        continue;
      }

      console.log(`- 🔄 Migrating "${colName}" (${colValue.length} documents)...`);
      let batch = firestore.batch();
      let opCount = 0;
      let colSuccessCount = 0;

      for (let i = 0; i < colValue.length; i++) {
        const item = colValue[i];
        const docId = String(item.id || item._id || `${colName}_${i + 1}`);
        const docRef = firestore.collection(colName).doc(docId);

        // Clean undefined values for Firestore
        const cleanItem = JSON.parse(JSON.stringify(item));
        batch.set(docRef, cleanItem, { merge: true });
        opCount++;
        colSuccessCount++;

        if (opCount >= BATCH_LIMIT || i === colValue.length - 1) {
          await batch.commit();
          batch = firestore.batch();
          opCount = 0;
        }
      }

      console.log(`  ✅ Successfully committed ${colSuccessCount} documents to "${colName}"`);
      totalMigrated += colSuccessCount;
    } else if (typeof colValue === 'object' && colValue !== null) {
      // Single config/terms object
      console.log(`- 🔄 Migrating object state "${colName}"...`);
      const docRef = firestore.collection('systemState').doc(colName);
      const cleanObj = JSON.parse(JSON.stringify(colValue));
      await docRef.set(cleanObj, { merge: true });
      console.log(`  ✅ Successfully committed state object "${colName}"`);
      totalMigrated++;
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 Migration Completed Successfully! Total records synced: ${totalMigrated}`);
  console.log('================================================================');
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed with error:', err);
  process.exit(1);
});

