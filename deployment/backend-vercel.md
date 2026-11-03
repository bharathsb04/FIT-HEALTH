# Fit Health — Backend Vercel Deployment Guide

This guide details the independent production deployment of the **Fit Health Backend API** (Express + Firebase Admin SDK) as a standalone Vercel Serverless Function application service.

---

## 1. Architecture & Serverless Entry Point

- **Runtime**: Node.js 18+ Serverless Functions (Vercel)
- **Root Directory**: `backend` (or project root with `backend/api/index.js`)
- **Serverless Handler**: [`backend/api/index.js`](file:///c:/Users/Dell/OneDrive/Desktop/BCA%20FINAL%20PROJECT/backend/api/index.js) (exports the Express `app` instance)
- **Configuration**: [`backend/vercel.json`](file:///c:/Users/Dell/OneDrive/Desktop/BCA%20FINAL%20PROJECT/backend/vercel.json) routes all requests to `/api/index.js`.
- **Database**: Cloud Firestore via Firebase Admin SDK (exclusive database, no MongoDB, no local filesystem dependence).

---

## 2. Step-by-Step Vercel Deployment

### Step A: Import into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Select your repository: **`bharathsb04/FIT-HEALTH`**.
4. In the Project Setup screen:
   - **Project Name**: `fit-health-backend` *(all lowercase, no spaces)*
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and select `backend`.

### Step B: Configure Environment Variables
Expand **Environment Variables** and add all required production secrets:

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `FRONTEND_URL` | Yes | `https://fit-health-frontend.vercel.app` |
| `CORS_ORIGINS` | Yes | `https://fit-health-frontend.vercel.app,http://localhost:3000` |
| `JWT_SECRET` | Yes | 32+ character cryptographically random key |
| `JWT_EXPIRES_IN` | Yes | `7d` |
| `FIREBASE_PROJECT_ID` | Yes | Your Google Cloud / Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | `firebase-adminsdk@...iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Yes | Private key string including `-----BEGIN/END PRIVATE KEY-----` |
| `SMTP_HOST` | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | `465` |
| `SMTP_SECURE` | Yes | `true` |
| `SMTP_USER` | Yes | Your verified sending email |
| `SMTP_PASS` | Yes | Gmail 16-character App Password |
| `SMTP_FROM` | Yes | `"Fit Health Security" <your_email@gmail.com>` |
| `OTP_EXPIRY_MINUTES` | Yes | `10` |
| `OTP_RESEND_COOLDOWN_SECONDS` | Yes | `60` |
| `OTP_MAX_ATTEMPTS` | Yes | `5` |
| `BIOMETRICS_ENCRYPTION_KEY` | Yes | 64-hex char AES-256 hardware encryption key |
| `BIOMETRICS_RATE_LIMIT_PER_MINUTE` | Yes | `60` |

### Step C: Deploy & Connect
1. Click **Deploy**.
2. Note your backend live URL (e.g., `https://fit-health-backend.vercel.app`).
3. Set `VITE_API_URL=https://fit-health-backend.vercel.app` in your frontend Vercel project environment variables.
4. Verify backend health endpoint: `https://fit-health-backend.vercel.app/api/health`.

