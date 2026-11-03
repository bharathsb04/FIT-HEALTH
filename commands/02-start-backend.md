# 02 - Start Backend Server

This guide explains how to start the **Fit Health** backend API server.

---

## What the Backend Server Does

- Initializes **Firebase Cloud Firestore** (or falls back seamlessly to the persistent zero-config database engine).
- Exposes all RESTful endpoints under `/api/*` (Authentication, SMTP OTP, Workouts, Nutrition, Vitals, Hydration, GPS Gyms, Admin Console).
- Serves the compiled production frontend static bundle if built (`frontend/dist`).
- Binds to `http://localhost:5000` (or `http://127.0.0.1:5000`).

---

## Step-by-Step Command

### Windows (PowerShell / Command Prompt)
```cmd
cd backend
npm run dev
```
*Alternatively, for production mode:*
```cmd
cd backend
npm start
```

### macOS / Linux (Terminal)
```bash
cd backend
npm run dev
```

---

## Verification

Once running, verify the backend is online by opening your browser or running:

```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "online",
  "appName": "Fit Health Unified App & API Server",
  "version": "1.0.0",
  "timestamp": "..."
}
```

