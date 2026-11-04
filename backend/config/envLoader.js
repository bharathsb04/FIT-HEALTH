/**
 * Environment Configuration & Fallback Loader
 * Ensures all essential secrets, database credentials, SMTP configuration,
 * and security keys are always loaded in all environments (Local, Vercel Serverless, Cloud).
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// 1. Attempt to load from backend/.env if on disk
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Try root .env as fallback
  const rootEnvPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  }
}

// 2. Default Configuration Fallbacks for Production / Serverless Deployments
const DEFAULTS = {
  PORT: '5000',
  NODE_ENV: process.env.NODE_ENV || 'production',
  JWT_SECRET: 'cc0843dce4e83ac8d95e93f37b78412c7462140e6bfb3ac3c0f706ac38b8a9f18b1a1e46d85b0f9b0949fbeb2010d28e78ae0a65720b6a04365a1d134e6610d1',
  JWT_EXPIRES_IN: '7d',
  
  // SMTP Email Delivery Configuration (Gmail App Password)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'sbabubharath1976@gmail.com',
  SMTP_PASS: 'yqxbsyqstivnwvka',
  SMTP_FROM: '"Fit Health Security" <sbabubharath1976@gmail.com>',
  OTP_EXPIRY_MINUTES: '10',
  OTP_RESEND_COOLDOWN_SECONDS: '60',
  OTP_MAX_ATTEMPTS: '5',

  // Firebase Cloud Firestore Credentials
  FIREBASE_PROJECT_ID: 'fit-health-1fbf8',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@fit-health-1fbf8.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4jrYEhSZquorH\n6lXVU9FIByoUzn9LfzB2t5Xb32Su2y+5CFWWfTQWAdE/+EigsUGMz/FTsHAS3o7W\nBa995qgRlvztG7rhT7et71lqVDC/C5hgYGLwRFWy65yLc/8a9oWqdGzltktNwCQB\nEhmgjJx5PU5TN908anZNgOK1bk4xLfFPAwiaf9WQ3EFYHSKz0gZ9gLSeLNdtrOcq\nKlW5V+mnie1KC9uLLS/8LxpVEdT9dgR9Gbd4+mT+tph8irTj6jWOqsHeU4rXbH3t\noEE7CvnwOdNITWqribxuwpAJF0h+Wz3Yi2Kw/iq3d1gFvD/57IDkPZSqW4w5zmgc\njeB4ZmV/AgMBAAECggEAWRscQKGVRKTMVN/61mfeeoJrARuIQgH+V0j4VeMPnqng\nQWat/C21awBKyjKRot344Gi5nKV/gBw+O5a9M5bpgKjO0pfi1pwz/ox0UyyMbyjS\nfxZ+0aDF0kcqD0pN1ZY0FAf59B32gBCWN7YL7uUJwWMLfcTksKB/+cfvPlilenZH\nkpq3B0XCiITmRow2b8je5RUr+MXV/OeiTRXF94Z0aHIVJvL9Oda7GcTOTEpp/j7y\nfPVB2Einan4GjP0WugS9tNvn1j4EyFvOHpbxvPbVVyxHjchVttfcuzxf8pd08A/u\njqKASiIWNT54mWGb9lXPQJpdkcy7GolHvr7HUKKuNQKBgQD90gYhpOiVIiYmgsFe\n2MQ/LG1tbC0UEbXuEqXszoWwjH9Kz4eM6VgmzZxbPJ0A6D/r21MTVjrtcTMuPNXi\nw/0QBIFcWvuQBJIJBBsTEGitwVdxewtMQDFF0QrtRrnmG33xfYv7xJkbKXkSKnow\nyUnQfM5EP2qcm8yIOxrkXhLzkwKBgQD6sR4S+XuqKnP6bGEkejuKX/xpcrEUPSYo\nGHV8qc9f2+MwgoCOlWk4DUJb+NgiDdidjikAxOCgl3OHJ/6oBVAU1bQf2Mg3KZor\nZv/zB1GXgLlfMQT0Bp13zBiALjzlpvCOUfQFliRd0txLfcyiD13V0or44EojdrYo\n0b9dwrtR5QKBgHq0xTgQpEwstSra/abfvogX71L+ABD6uuw8YbDI6sK+OW+uQoax\n7Gbd8d/9vp1IqlZYsqHfhx9xIWASEwjM3ROYSf2fEoy+WOc47+nYffK6TI7VAFI9\nmlR5SgIJtidzVQChREJT+fyyoRBSLr5VIXVEUOeXjO/nNgsKH+cVP643AoGATBBj\nrKQwJpCdAhXSX8wKttCq+J/JJPfs1Oue8kVf25kPVQ+zzA9/jndPdDKL+cEzwZJ5\n1HboJTHu5sp21SpPgxLYhXU0QrCHy7WD4YyN8Ccpl7164EQFkWzG3lWpOpEtmjE5\nllxZCnLJTsqLxXxeH1uzuRHszNffK4GAzAUi6xUCgYEAr6TF240I9dieg7lZwFXq\nI9nnpn/7KrMhKhn4ByTUyT1KGRjbdhzLcB/l0tUr9efGNmH37pI2kxVO5h2cL0qG\nY3xeaGYM3oFnN/wx46biWnE4Rph8HYEVS2+RBtnpXzIeO8Fn0y2Io8HPmQ3Ge9Hi\nSRod/rukPr4mIPlAr1TPQLw=\n-----END PRIVATE KEY-----\n",

  // AES-256-GCM Hardware Encryption Key
  BIOMETRICS_ENCRYPTION_KEY: '12226847868d13b0f2c0e133dc66f1104f531a74ac7e07ed99d2caa521c26fa1',
  BIOMETRICS_RATE_LIMIT_PER_MINUTE: '60'
};

// Populate missing environment variables with safe defaults
for (const [key, value] of Object.entries(DEFAULTS)) {
  if (!process.env[key] || !process.env[key].trim()) {
    process.env[key] = value;
  }
}

module.exports = {
  isLoaded: true
};
