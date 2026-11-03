# 07 - Firebase Cloud Firestore Setup & Migration

This document provides complete instructions for connecting **Firebase Cloud Firestore** to the **Fit Health** backend and running the idempotent data migration script.

---

## 1. Firebase Project Setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a new project named **Fit Health** (or choose an existing project).
2. Under **Build**, select **Firestore Database** and click **Create Database**.
3. Choose your preferred primary region (e.g., `nam5 (us-central)` or `asia-south1`).
4. Select **Start in production mode** (we enforce security rules in the next step).

---

## 2. Obtain Service Account Credentials

1. In the Firebase Console, navigate to **Project settings** (gear icon) -> **Service accounts**.
2. Select **Node.js** and click **Generate new private key**.
3. A JSON file will download (e.g., `fit-health-firebase-adminsdk.json`).
4. Move this file securely to `backend/config/serviceAccountKey.json` (this file is excluded by `.gitignore`).

---

## 3. Update `backend/.env` Configuration

Add the credentials to `backend/.env`:

```env
# Option A: Service account file path (Recommended for Local Dev)
FIREBASE_SERVICE_ACCOUNT_PATH=config/serviceAccountKey.json

# Option B: Direct Environment Variables (Recommended for Cloud Hosting / CI/CD)
FIREBASE_PROJECT_ID=fit-health-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@fit-health-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
```

---

## 4. Run the Idempotent Data Migration Script

To migrate all 21 collections (users, gyms, workoutPlans, dietPlans, vitalsLogs, supplements, progressRecords, hydrationLogs, dayPassBookings, foodItems, gymMembers, gymCheckIns, gymEquipment, gymFeePlans, cashPaymentTokens, membershipTransactions, adminNotes, maintenanceDirectory, adminAuditLogs, gymTerms, stretchingState) into Cloud Firestore:

```bash
cd backend
node scripts/migrateToFirebase.js
```

### Features of the Migration Script:
- **Idempotency:** Preserves existing Firestore documents and checks document IDs to prevent duplicates.
- **Batching:** Writes documents in batches of 450 to adhere to Firestore limits.
- **Timestamp normalization:** Automatically formats ISO dates into Firestore Timestamps.

---

## 5. Deploy Firestore Security Rules

Deploy the least-privilege security rules provided in the project root:

```bash
firebase deploy --only firestore:rules
```

Or copy the contents of `firestore.rules` directly into the **Firestore Database -> Rules** editor in the Firebase console.

