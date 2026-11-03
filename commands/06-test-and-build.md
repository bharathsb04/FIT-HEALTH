# 06 - Test and Build Automation

This document outlines how to execute the automated backend QA test suite and build the frontend production assets.

---

## 1. Run Automated Backend QA Test Suite

The test suite exercises 20 critical assertions across server health, JWT authentication, bcrypt hashing, profile retrieval, OTP generation and invalidation, 6-day split workouts, 21 seeded gyms, and role-based access control (RBAC).

### Terminal Command:
```bash
node backend/scripts/runTests.js
```

### Expected Output:
```
====================================================
🧪 Starting Fit Health Automated QA Test Suite
====================================================

[1/7] Testing Health Check API...
  ✓ PASS: Health check returns 200 OK
  ✓ PASS: Health status is online

[2/7] Testing Member Authentication & JWT Generation...
  ✓ PASS: Member login returns 200 OK
  ✓ PASS: JWT access token is returned
  ✓ PASS: User role is member

[3/7] Testing Admin Authentication & Role Enforcement...
  ✓ PASS: Admin login returns 200 OK
  ✓ PASS: User role is admin

[4/7] Testing Protected Profile Endpoint (/api/auth/me)...
  ✓ PASS: Authenticated profile returned
  ✓ PASS: Profile email matches authenticated user
  ✓ PASS: Password hash is strictly excluded from response

[5/7] Testing SMTP OTP Flow (Generate, Send & Verify)...
  ✓ PASS: OTP request accepted & dispatched
  ✓ PASS: Success flag is true
  ✓ PASS: Invalid OTP is rejected with 400 Bad Request

[6/7] Testing Core Fitness Endpoints (Workouts & Gyms)...
  ✓ PASS: Workout plans retrieved
  ✓ PASS: Workouts structure valid with 6-day split schedule
  ✓ PASS: Gyms list retrieved
  ✓ PASS: Seeded gyms are present (21 gyms found)

[7/7] Testing Facility Admin Console Endpoints & Role Enforcement...
  ✓ PASS: Admin dashboard returns 200 OK
  ✓ PASS: Admin stats are loaded
  ✓ PASS: Member cannot access Admin-only notes endpoint (403 Forbidden)

====================================================
📊 Test Results: 20 Passed, 0 Failed
====================================================
```

---

## 2. Compile Frontend Production Bundle

Builds and minifies the React application using Vite:

```bash
cd frontend
npm run build
```

Assets are written directly to `frontend/dist/`, which is immediately served by `backend/server.js`.

