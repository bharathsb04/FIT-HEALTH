# 05 - Cloudflare Tunnel Configuration & Public URL

This guide explains how to expose your local **Fit Health** instance securely to the public internet using Cloudflare Tunnel (`cloudflared`) for live mobile device testing, presentation demos, or external client evaluation without opening router firewall ports.

---

## 1. Install Cloudflare Tunnel CLI (`cloudflared`)

### Windows
- Via Winget:
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
- Or download the executable directly from Cloudflare:
  [https://github.com/cloudflare/cloudflared/releases/latest](https://github.com/cloudflare/cloudflared/releases/latest)

### macOS (Homebrew)
```bash
brew install cloudflared
```

### Linux (Debian / Ubuntu)
```bash
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install cloudflared
```

---

## 2. Launching Quick Ephemeral Tunnel (Zero Configuration)

You can generate a temporary, free public HTTPS URL instantly without creating a Cloudflare account.

### Step 1: Ensure Fit Health Unified Server is Running on Port 5000
```bash
cd backend
node server.js
```

### Step 2: Open a New Terminal and Run `cloudflared`
```bash
cloudflared tunnel --url http://localhost:5000
```

### Output:
`cloudflared` will generate a public link ending in `.trycloudflare.com`, for example:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://fithealth-demo-alpha.trycloudflare.com                                            |
+--------------------------------------------------------------------------------------------+
```

---

## 3. CORS & Security Verification

The backend server in `backend/server.js` automatically permits requests from `*.trycloudflare.com` origins and handles credentials seamlessly.

Test the tunnel from any smartphone or remote browser:
- **Landing Page & App:** `https://your-tunnel-subdomain.trycloudflare.com`
- **API Health Check:** `https://your-tunnel-subdomain.trycloudflare.com/api/health`

