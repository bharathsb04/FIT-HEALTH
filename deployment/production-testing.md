# Fit Health — Production Testing & Verification Guide

This guide details the exact automated and manual test procedures used to verify all application functionality across authentication, database, and API layers.

---

## 1. Automated Test Suite Execution

Run the built-in end-to-end verification script:

```bash
cd backend
node scripts/testCompleteAuthSecurity.js
```

### What is tested automatically:
1. **Database Layer**:
   - Verifies Firebase Admin initialization.
   - Verifies Firestore CRUD operations.
   - Verifies that zero MongoDB drivers, connections, or models are present.
   - Verifies that no demo user accounts exist in the database.
2. **Authentication Flow**:
   - Member registration with 6-digit OTP email dispatch.
   - Timing-safe HMAC-SHA256 OTP verification.
   - Rate limiting and 60-second cooldown enforcement.
   - Invalidation after maximum failed attempts.
   - Password hashing via bcrypt (cost factor 10).
   - JWT issuance, verification, and revocation on logout.
   - Forgot Password reset flow with email verification.
3. **Biometrics & Security**:
   - AES-256-GCM hardware-grade key format validation.
   - Encryption at rest and decryption on authorized retrieval.
   - Conflict resolution preferring primary health providers.
   - Rate limiting on `POST /api/biometrics/sync`.
4. **CORS & Headers**:
   - Strict origin allowlist enforcement.
   - Prevention of wildcard `*` with credentials.
   - OPTIONS preflight response with 24-hour cache max-age.

---

## 2. Manual Verification Checklist

### A. Authentication & Sign Up
- [ ] Open frontend application in browser.
- [ ] Select **Create User** / **Sign Up**.
- [ ] Enter a real email address and click **Send Verification Code**.
- [ ] Check inbox for the branded 6-digit OTP email from `Fit Health Security`.
- [ ] Enter the 6-digit code.
- [ ] Complete registration and verify redirection to the Dashboard.

### B. Forgot Password Flow
- [ ] On the Login page, click **Forgot?**.
- [ ] Enter your registered email address.
- [ ] Receive the password reset verification code in your email.
- [ ] Enter the code and set a new password.
- [ ] Log in with the new password.

### C. Biometrics & Wearable Integration
- [ ] Navigate to **Vitals & Biometrics**.
- [ ] Click **Connect Companion** or click any provider card (e.g. Fitbit, Garmin, Samsung Health).
- [ ] Follow the setup steps.
- [ ] Click **Sync Now** to stream live telemetry.
- [ ] Check that Steps, Heart Rate, Sleep, and Calories update in real time.
- [ ] Navigate to the **Privacy** tab and verify the option to disconnect and erase synced telemetry.

### D. Workout & Nutrition Features
- [ ] Navigate to **Workout**.
- [ ] Select workout splits (Push, Pull, Legs, Upper, Lower) and verify video demonstrator.
- [ ] Navigate to **Nutrition & Vitals**.
- [ ] Log meals, track water intake, and record blood pressure/weight.

### E. Gym Admin Portal
- [ ] Toggle to **Admin Portal** on the login screen.
- [ ] Sign in with administrative credentials.
- [ ] Test the **Quick Check-In** with a 4-digit PIN.
- [ ] Verify members roster, fee plans, maintenance directory, and audit logs.
