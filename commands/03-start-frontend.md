# 03 - Start Frontend Development Server

This guide explains how to start the **Fit Health** React + Vite development server with Hot Module Replacement (HMR).

---

## Configuration Note

The frontend reads the backend API URL exclusively from `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```
No extraneous environment variables are placed in the frontend directory.

---

## Step-by-Step Command

### Windows (PowerShell / Command Prompt)
```cmd
cd frontend
npm run dev
```

### macOS / Linux (Terminal)
```bash
cd frontend
npm run dev
```

---

## Access the Frontend

Once the Vite development server boots, it will display:
```
  VITE v8.3.2  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your web browser to interact with the Fit Health Landing Page and application interfaces.

