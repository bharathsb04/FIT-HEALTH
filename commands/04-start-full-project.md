# 04 - Start Full Project (Frontend + Backend)

You can run **Fit Health** in either of two recommended modes:
1. **Unified Production Mode (Single Port 5000)** — Recommended for presentation, local evaluation, and Cloudflare Tunnels.
2. **Dual Development Mode (Ports 5000 & 5173)** — Recommended for active UI hacking with Vite instant reload.

---

## Option A: Unified Single-Port Mode (Port 5000)

In this mode, the frontend is built into `frontend/dist`, and the backend Express server serves both the frontend static site and the `/api` backend from `http://localhost:5000`.

### Windows (PowerShell)
```powershell
# 1. Build the frontend production bundle
cd frontend; npm run build; cd ..

# 2. Start the unified server
cd backend; node server.js
```

### Windows (Command Prompt)
```cmd
cd frontend && npm run build && cd .. && cd backend && node server.js
```

### macOS / Linux (Bash)
```bash
(cd frontend && npm run build) && (cd backend && node server.js)
```

Now open:
👉 **`http://localhost:5000`** — Full website, landing page, and all APIs active on one port!

---

## Option B: Dual Development Server Mode

Run the backend and frontend in separate terminal windows for active development.

### Terminal 1 (Backend API Server)
```bash
cd backend
npm run dev
```

### Terminal 2 (Frontend Vite Server)
```bash
cd frontend
npm run dev
```

Open:
- Frontend: **`http://localhost:5173`**
- Backend Health: **`http://localhost:5000/api/health`**

