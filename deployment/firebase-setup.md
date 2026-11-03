# Fit Health — Firebase Cloud Firestore Setup Guide

This guide explains how to set up **Firebase Cloud Firestore** as the exclusive, production-grade application database for Fit Health.

---

## 1. Create Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `fit-health-bca`).
4. Choose whether to enable Google Analytics (optional).
5. Click **Create project** and wait for provisioning to complete.

---

## 2. Enable Cloud Firestore

1. In the left-hand navigation menu of your project, click **Build** ➔ **Firestore Database**.
2. Click **Create database**.
3. **Database ID**: leave as `(default)`.
4. **Location**: Select your preferred regional multi-region (e.g. `asia-south1` or `us-central1`).
5. **Security rules**: Select **Start in production mode** (all reads and writes denied by default).
6. Click **Create**.

---

## 3. Apply Firestore Security Rules

1. Navigate to the **Rules** tab in the Firestore Database console.
2. Replace all existing text with the rules provided in [`firestore.rules`](file:///c:/Users/Dell/OneDrive/Desktop/BCA%20FINAL%20PROJECT/firestore.rules).
3. Click **Publish**.

These rules guarantee:
- Catalogs (`gyms`, `supplements`, `foodItems`) are public read-only and admin-write.
- User data (`workoutPlans`, `dietPlans`, `vitalsLogs`, `biometrics`) can ONLY be accessed by the verified document owner or platform administrators.
- Sensitive admin audits, gym finances, and reception desk tokens require strict administrative privileges.

---

## 4. Generate Service Account Credentials

1. In the Firebase Console, click the **Settings Gear (⚙️)** in the top-left ➔ **Project settings**.
2. Go to the **Service accounts** tab.
3. Verify that **Firebase Admin SDK** is selected.
4. Click the blue button **Generate new private key**.
5. A `.json` file will download to your computer. Open this JSON file in a text editor to view your credentials:
   - `project_id` ➔ Maps to `FIREBASE_PROJECT_ID`
   - `client_email` ➔ Maps to `FIREBASE_CLIENT_EMAIL`
   - `private_key` ➔ Maps to `FIREBASE_PRIVATE_KEY`

---

## 5. Seed / Migrate Data to Cloud Firestore

Run the automated migration tool to sync all gym catalogs, food databases, and real user data to your new Firestore instance:

```bash
cd backend
node scripts/migrateToFirebase.js
```

The script will batch-commit all 23 collections to Cloud Firestore in seconds without any demo accounts!
