# 01 - Install Dependencies

This document provides the exact terminal commands to install all required dependencies for both the backend and frontend of **Fit Health**.

---

## Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

```bash
node -v
npm -v
```

---

## 1. Install Backend Dependencies

Open your terminal, navigate to the project directory, and install the backend packages (`express`, `firebase-admin`, `nodemailer`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`):

### Windows (PowerShell / Command Prompt)
```cmd
cd backend
npm install
cd ..
```

### macOS / Linux (Terminal)
```bash
cd backend
npm install
cd ..
```

---

## 2. Install Frontend Dependencies

Navigate to the `frontend` folder and install packages (`react`, `react-dom`, `lucide-react`, `leaflet`, `vite`):

### Windows (PowerShell / Command Prompt)
```cmd
cd frontend
npm install
cd ..
```

### macOS / Linux (Terminal)
```bash
cd frontend
npm install
cd ..
```

---

## 3. One-Liner (Install Both)

To install dependencies for both services in a single command from the project root:

### Windows (PowerShell)
```powershell
npm --prefix backend install; npm --prefix frontend install
```

### Windows (Command Prompt)
```cmd
npm --prefix backend install && npm --prefix frontend install
```

### macOS / Linux (Bash / Zsh)
```bash
npm --prefix backend install && npm --prefix frontend install
```

