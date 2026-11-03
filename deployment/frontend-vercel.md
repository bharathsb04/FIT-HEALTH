# Fit Health — Frontend Vercel Deployment Guide

This guide details the independent production deployment of the **Fit Health Frontend** (React 19 + Vite) as a standalone Vercel application service.

---

## 1. Project Configuration Overview

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing Configuration**: [`frontend/vercel.json`](file:///c:/Users/Dell/OneDrive/Desktop/BCA%20FINAL%20PROJECT/frontend/vercel.json) includes SPA rewrite fallback (`/(.*)` -> `/index.html`) to ensure deep client-side routes (e.g. `/dashboard`, `/admin/biometrics`) reload without 404 errors.

---

## 2. Step-by-Step Vercel Deployment

### Step A: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Select your GitHub repository: **`bharathsb04/FIT-HEALTH`**.
4. In the Project Setup screen:
   - **Project Name**: `fit-health-frontend` *(or your preferred lowercase name)*
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`.

### Step B: Configure Environment Variables
Under the **Environment Variables** section, add only the backend API URL:

| Key | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://fit-health-backend.vercel.app` | The production URL of your deployed backend service. |

> **Security Rule**: The frontend must NEVER receive `JWT_SECRET`, Firebase service account private keys, or SMTP credentials.

### Step C: Deploy
1. Click **Deploy**.
2. Vercel will run `vite build` and publish your optimized static assets to the global Edge CDN in ~30 seconds.
3. Note your assigned production domain (e.g., `https://fit-health-frontend.vercel.app`).
4. Add this frontend URL to your Backend Vercel project's `CORS_ORIGINS` and `FRONTEND_URL` environment variables.
