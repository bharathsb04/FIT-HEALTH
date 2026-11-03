# Fit Health — The Ultimate Gym Fitness Companion

> **Production Full-Stack Application & BCA Final Project**  
> A complete, enterprise-grade, full-stack fitness and gym ecosystem unifying gym discovery, 6-day split workout planning, nutrition tracking, vitals monitoring, supplement guidance, hydration tracking, sleep/recovery analysis, and live hardware biometrics synchronization (Samsung Health, Health Connect, Apple Health, Fitbit, Garmin, Withings, Oura, Whoop, Polar).

---

## Architecture & Technology Stack

Fit Health is engineered as **exactly two independent application services**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                     FIT HEALTH ECOSYSTEM                     │
 └──────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     SERVICE 1: FRONTEND       │       │      SERVICE 2: BACKEND       │
│  React 19 + Vite SPA          │──────▶│  Express REST API             │
│  Deployed on Vercel           │ HTTP  │  Deployed on Vercel           │
│  Domain: frontend.vercel.app  │ CORS  │  Domain: backend.vercel.app   │
└───────────────────────────────┘       └───────────────┬───────────────┘
                                                        │
                                        ┌───────────────┴───────────────┐
                                        ▼                               ▼
                        ┌───────────────────────────────┐ ┌─────────────┴─────────────┐
                        │   MANAGED APPLICATION DB      │ │    SMTP EMAIL SERVICE     │
                        │   Firebase Cloud Firestore    │ │    Google Gmail SMTP      │
                        │   23 Protected Collections    │ │    Live 6-Digit OTP Auth  │
                        └───────────────────────────────┘ └───────────────────────────┘
```

### Service 1: Frontend (Client SPA)
- **Framework**: React 19 with Vite
- **UI Components**: Lucide React icons, Canvas Confetti, Leaflet & React-Leaflet maps
- **Deployment**: Standalone Vercel Project with SPA client routing (`frontend/vercel.json`)
- **API Communication**: Unified API service client (`frontend/src/services/api.js`) targeting configured backend domain

### Service 2: Backend (Serverless API)
- **Framework**: Node.js & Express
- **Database Engine**: **Firebase Cloud Firestore** (Exclusive application database; MongoDB & local JSON storage completely removed)
- **Authentication**: JWT session tokens with HMAC-SHA256 signature verification & in-memory token blacklist
- **Security & OTP**: Nodemailer SMTP email service with cryptographic 6-digit OTP generation, HMAC-SHA256 hashing, 60s cooldown, and attempt limits
- **Data Protection**: Hardware-grade AES-256-GCM encryption at rest for biometrics telemetry (`BIOMETRICS_ENCRYPTION_KEY`)
- **Deployment**: Standalone Vercel Serverless Function Project (`backend/vercel.json` / `backend/api/index.js`)

---

## Key Features

1. **Authentication & Security**:
   - Genuine user registration (Member & Gym Admin roles).
   - Live SMTP email OTP verification with countdown timer, paste support, and attempt rate limiting.
   - Secure login via password or Email OTP.
   - Password reset via verified email OTP.
   - Zero demo users, zero hardcoded credentials.

2. **Vitals & Biometrics Telemetry**:
   - Provider adapter pattern supporting Samsung Health, Health Connect, Apple Health, Fitbit, Garmin, Withings, Oura, Whoop, and Polar.
   - Batch sync endpoint (`POST /api/biometrics/sync`) with deduplication.
   - Daily aggregates (`GET /api/biometrics/summary`), history, and latest vitals.
   - Member consent controls and GDPR/HIPAA-compliant data purge.

3. **Workout & Nutrition**:
   - 6-Day Push-Pull-Legs and Arnold splits.
   - Interactive workout video demonstrator.
   - Calorie, protein, carb, fat, and fiber macro rings.
   - Food catalog with 50+ nutritional items.

4. **GPS Gym Locator & Day Pass Desk**:
   - Proximity-based gym discovery.
   - Digital day pass reservation and front-desk reception cash voucher generation.

5. **Gym Admin Portal**:
   - 4-digit PIN Quick Check-In for arriving members.
   - Member roster management, fee collection tracking, equipment inventory, and maintenance directory.

---

## Deployment Documentation

Complete deployment and configuration documentation is located in the [`deployment/`](deployment/) directory:

- 🌐 [Frontend Vercel Deployment](deployment/frontend-vercel.md)
- ⚙️ [Backend Vercel Deployment](deployment/backend-vercel.md)
- 🔥 [Firebase Cloud Firestore Setup](deployment/firebase-setup.md)
- 📧 [SMTP Email & OTP Setup](deployment/smtp-setup.md)
- 🔐 [Environment Variables Reference](deployment/environment-variables.md)
- 🧪 [Production Testing Guide](deployment/production-testing.md)

---

## Local Development Quickstart

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Files
- Copy `backend/.env.example` to `backend/.env` and supply your Firebase and SMTP credentials.
- Copy `frontend/.env.example` to `frontend/.env` (contains `VITE_API_URL=http://localhost:5000`).

### 3. Run Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.
