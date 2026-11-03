# Fit Health — Environment Variables Reference

This document provides a clean, unified reference of every environment variable used in Fit Health across both frontend and backend deployment services.

---

## 1. Frontend Environment (`frontend/.env`)

The frontend contains **ONLY** the backend API location.

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `VITE_API_URL` | No (in prod) / Yes (in dev) | `http://localhost:5000` *(dev)*<br>`https://backend.vercel.app` *(prod)* | Sets the API endpoint for browser `fetch` requests. When deployed on the same domain, leave empty to use relative `/api`. |

> **Security Rule**: Never put `JWT_SECRET`, database credentials, private keys, or SMTP passwords in frontend files.

---

## 2. Backend Environment (`backend/.env`)

The backend holds all application logic secrets and runtime configurations.

### Server Networking
| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | No | `5000` | Port for the local Express server |
| `NODE_ENV` | Yes | `development` / `production` | Execution mode (enables strict validation in production) |
| `BACKEND_URL` | No | `http://localhost:5000` | Canonical backend base URL |
| `FRONTEND_URL` | Yes | `https://frontend.vercel.app` | Target frontend origin for OAuth redirects and CORS |
| `CORS_ORIGINS` | Yes | `https://frontend.vercel.app,http://localhost:3000` | Comma-separated list of allowed frontend origins |

### Authentication & JWT
| Variable | Required | Example | Purpose |
|---|---|---|---|
| `JWT_SECRET` | Yes | `64_char_crypto_random_string` | Signing key for HMAC-SHA256 user session tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime before re-authentication is required |

### Firebase Cloud Firestore (Exclusive Application Database)
| Variable | Required | Example | Purpose |
|---|---|---|---|
| `FIREBASE_PROJECT_ID` | Yes | `fit-health-bca-2026` | Google Cloud / Firebase project identifier |
| `FIREBASE_CLIENT_EMAIL` | Yes | `firebase-adminsdk@...iam.gserviceaccount.com` | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Yes | `"-----BEGIN PRIVATE KEY-----\n..."` | Service account private key string |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No | `./config/serviceAccountKey.json` | Path to JSON key file (alternative to env vars) |

### SMTP Email Service & OTP Verification
| Variable | Required | Example | Purpose |
|---|---|---|---|
| `SMTP_HOST` | Yes | `smtp.gmail.com` | SMTP relay server host |
| `SMTP_PORT` | Yes | `465` (SSL) or `587` (TLS) | Port for SMTP mail transfer |
| `SMTP_SECURE` | Yes | `true` (for 465) / `false` (for 587) | Use SSL/TLS encryption |
| `SMTP_USER` | Yes | `your_email@gmail.com` | Sending email account address |
| `SMTP_PASS` | Yes | `16_character_app_password` | App password or SMTP API key |
| `SMTP_FROM` | Yes | `"Fit Health Security" <your_email@gmail.com>` | Sender header in delivered emails |
| `OTP_EXPIRY_MINUTES` | No | `10` | Lifetime of 6-digit verification code |
| `OTP_RESEND_COOLDOWN_SECONDS` | No | `60` | Minimum wait time between code dispatches |
| `OTP_MAX_ATTEMPTS` | No | `5` | Maximum failed entry attempts before invalidation |

### Biometrics AES-256 Hardware Encryption
| Variable | Required | Example | Purpose |
|---|---|---|---|
| `BIOMETRICS_ENCRYPTION_KEY` | Yes | `64_hex_chars_32_bytes` | Master AES-256-GCM hardware-grade key for encrypting health data at rest |
| `BIOMETRICS_RATE_LIMIT_PER_MINUTE` | No | `60` | Maximum sync pushes per member per minute |

### Cloud Health Provider OAuth API Keys
| Variable | Required | Mode | Purpose |
|---|---|---|---|
| `FITBIT_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Fitbit activity and sleep integration |
| `GARMIN_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Garmin Connect telemetry integration |
| `WITHINGS_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Withings smart scale & vitals integration |
| `OURA_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Oura ring sleep & readiness integration |
| `WHOOP_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Whoop strain & recovery integration |
| `POLAR_CLIENT_ID` / `_SECRET` | No | Demo if empty, Live if populated | Polar heart rate & workout integration |
