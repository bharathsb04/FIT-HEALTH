# Fit Health — Firebase Cloud Firestore Setup & Verification Guide

This guide explains how **Firebase Cloud Firestore** is configured and verified as the exclusive, production-grade application database for Fit Health.

---

## 1. Credentials Configuration (Dual Mode)

Fit Health supports two seamless credential mechanisms:

### Mode A: Local Development (Service Account JSON File)
For local development on Windows, point directly to your downloaded service-account JSON file:
```env
# backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=C:/Users/Dell/Downloads/fit-health-1fbf8-firebase-adminsdk-fbsvc-0d0ffa60d4.json
```
- Firebase Admin SDK initializes directly using `admin.credential.cert(serviceAccount)`.
- The JSON file is automatically ignored by Git via `.gitignore` and `.vercelignore` to protect credentials.
- The JSON file is strictly backend-only and never exposed to frontend code.

### Mode B: Production / Vercel Serverless Deployment (Environment Variables)
When deployed to Vercel (where local Windows file paths do not exist), provide environment variables:
```env
FIREBASE_PROJECT_ID=fit-health-1fbf8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fit-health-1fbf8.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
The initialization module (`backend/config/firebase.js`) automatically falls back to these variables when `FIREBASE_SERVICE_ACCOUNT_PATH` is not on the filesystem.

---

## 2. Singleton Initialization & Export

Firebase Admin SDK is initialized **only once** as a thread-safe singleton in `backend/config/firebase.js`:
```javascript
const { admin, initFirebase, getFirestore, isFirebaseActive, db } = require('../config/firebase');

// Obtain the reusable Firestore instance:
const firestore = getFirestore(); // or db
```

---

## 3. Live Firestore Verification Test

Run the live Firestore test suite to execute actual Read, Write, Query, and Delete operations against Cloud Firestore:

```bash
cd backend
node scripts/testFirestoreOperations.js
```

### Verified Operations:
1. **Service Account Verification:** Reads and parses JSON file via `admin.credential.cert()`.
2. **Singleton Guard:** Asserts identical instance across multiple calls.
3. **Live Write:** Writes a verification document to `_connection_verification`.
4. **Live Read:** Fetches the written document and asserts exact field parity.
5. **Live Query:** Queries documents matching index filters.
6. **Live Delete:** Removes the test document cleanly.

---

## 4. Live Data Migration Tool

To migrate all 25 collections (gyms, supplements, food catalogs, real users, biometrics, etc.) into Cloud Firestore:

```bash
cd backend
node scripts/migrateToFirebase.js
```

---

## 5. Security Rules Protection

The full security policy is deployed in `firestore.rules`:
- Catalogs (`gyms`, `supplements`, `foodItems`) are public read-only and admin-write.
- User data (`workoutPlans`, `dietPlans`, `vitalsLogs`, `biometrics`) can ONLY be accessed by the verified document owner or platform administrators.
- Demo users are completely removed and blocked from being created.
