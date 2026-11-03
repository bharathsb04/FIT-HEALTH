# Fit Health — SMTP Email & Live OTP Verification Setup Guide

This guide explains how to configure high-deliverability SMTP email transport for 6-digit OTP registration and password resets in Fit Health.

---

## Option 1: Google Gmail SMTP (Recommended for Personal & Student Projects)

Gmail provides free, instant SMTP relay via Google's secure mail servers.

### Step 1: Enable 2-Step Verification
1. Log in to your Google Account at [myaccount.google.com](https://myaccount.google.com/).
2. In the left navigation, click **Security**.
3. Under *How you sign in to Google*, ensure **2-Step Verification** is turned **ON**.

### Step 2: Generate a 16-Character App Password
1. In the search box at the top of your Google Account page, search for **App passwords**.
2. Click **App passwords**.
3. **App name**: Enter `Fit Health`.
4. Click **Create**.
5. Google will display a 16-character code (e.g. `abcd efgh ijkl mnop`). Copy this code (spaces can be kept or removed; the backend sanitizes them automatically).

### Step 3: Add to `backend/.env`
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="Fit Health Security" <your_email@gmail.com>
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

---

## Option 2: Brevo / Sendinblue (Recommended for Custom Domains)

1. Sign up for a free account at [brevo.com](https://www.brevo.com).
2. Go to **Transactional** ➔ **Settings** ➔ **Configuration (SMTP & API)**.
3. Configure your backend variables:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_brevo_account_email
SMTP_PASS=your_brevo_master_smtp_key
SMTP_FROM="Fit Health Security" <verified_sender@yourdomain.com>
```

---

## Verifying SMTP Configuration

Test your SMTP connection without sending an email by running:
```bash
cd backend
node -e "require('./services/emailService').verifySmtpConnection().then(console.log)"
```
When successful, it prints:
```json
{ "configured": true, "verified": true, "host": "smtp.gmail.com", "port": 465, "user": "..." }
```
