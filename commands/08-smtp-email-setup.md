# 08 - SMTP Email & OTP Verification Setup

This document provides setup instructions for configuring real SMTP email dispatch for **Fit Health** 6-digit OTP verification codes.

---

## 1. How OTP Verification Works

1. The user requests an OTP for **Registration**, **Login**, or **Password Recovery**.
2. The backend generates a cryptographically secure 6-digit numeric OTP code (`crypto.randomInt`).
3. An HMAC-SHA256 hash of the OTP is saved with a 10-minute expiry timestamp.
4. The backend dispatches a responsive HTML email via the configured SMTP transport.
5. In development mode (when SMTP credentials are blank or unverified), the backend activates the built-in **Dev Simulator**, printing the code directly to terminal logs for zero-friction testing.
6. Once entered, the backend verifies the code, invalidates it (single-use), and activates the account or session.

---

## 2. Supported SMTP Providers

### Option A: Gmail App Password
1. Enable 2-Step Verification in your Google Account.
2. Go to **Security -> App Passwords** and generate a password for "Fit Health Mailer".
3. Update `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM="Fit Health Security <your-email@gmail.com>"
```

---

### Option B: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
SMTP_FROM="noreply@fithealth.io"
```

---

### Option C: Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
SMTP_FROM="Fit Health <noreply@your-domain.mailgun.org>"
```

---

### Option D: AWS SES (Amazon Simple Email Service)
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASS=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMTP_FROM="Fit Health System <noreply@verified-domain.com>"
```

---

## 3. Testing Email Dispatch

To test the OTP dispatch without running the full frontend:

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "purpose": "registration"}'
```

Response:
```json
{
  "success": true,
  "message": "A 6-digit verification code has been dispatched to your-email@example.com.",
  "expiresInMinutes": 10
}
```

