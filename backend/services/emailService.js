// Ensure all essential environment configurations are loaded
require('../config/envLoader');

const nodemailer = require('nodemailer');
const { getOtpEmailTemplate } = require('../templates/otpEmailTemplate');

let transporter = null;
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Fictional, mock, or internal test domains that do not possess public MX records
const UNROUTABLE_TEST_DOMAINS = [
  'fithealth.io',
  'example.com',
  'test.com',
  'invalid.com',
  'sample.com',
  'localhost',
  'mailinator.com'
];

/**
 * Returns or initializes a singleton Nodemailer SMTP transporter.
 * Supports Gmail App Passwords, Brevo SMTP Relay, and standard custom SMTP servers.
 */
const getTransporter = (forcePort = null, forceSecure = null) => {
  if (transporter && !forcePort) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = forcePort || (Number(process.env.SMTP_PORT) || 465);
  const secure = forceSecure !== null ? forceSecure : (rawPort === 465 ? true : (process.env.SMTP_SECURE === 'true' && rawPort !== 587));
  const user = process.env.SMTP_USER;
  // Gmail 16-character app passwords frequently include spaces that must be stripped
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (host && user && pass) {
    try {
      const createdTransporter = nodemailer.createTransport({
        host,
        port: rawPort,
        secure,
        auth: { user, pass },
        pool: !isServerless,
        maxConnections: isServerless ? 1 : 5,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[Email Service] Configured SMTP Transport via ${host}:${rawPort} (secure: ${secure}, serverless: ${isServerless}) (${user})`);
      if (!forcePort) transporter = createdTransporter;
      return createdTransporter;
    } catch (err) {
      console.warn('[Email Service] Failed to create SMTP transporter:', err.message);
    }
  } else {
    console.warn('[Email Service] Incomplete SMTP configuration in environment. Waiting for valid credentials.');
  }

  return null;
};

/**
 * Verifies SMTP server handshake and credentials without dispatching an email.
 */
const verifySmtpConnection = async () => {
  const mailTransporter = getTransporter();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || '465';
  const user = process.env.SMTP_USER;

  if (!mailTransporter) {
    return {
      configured: false,
      verified: false,
      host,
      port,
      user,
      message: 'SMTP credentials missing or incomplete. Please set SMTP_USER and SMTP_PASS in backend/.env'
    };
  }

  try {
    await mailTransporter.verify();
    return {
      configured: true,
      verified: true,
      host,
      port,
      user,
      message: `SMTP connection established and authenticated successfully with ${host}:${port} (${user})`
    };
  } catch (err) {
    return {
      configured: true,
      verified: false,
      host,
      port,
      user,
      error: err.message,
      message: `SMTP verification failed for ${host}:${port}: ${err.message}`
    };
  }
};

/**
 * Validates email address syntax strictly.
 */
const isValidEmailAddress = (email) => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim());
};

/**
 * Formats and dispatches a 6-digit OTP verification email via SMTP.
 * Never routes unroutable test domains to public MX servers.
 */
const sendOTPEmail = async (email, otp, purpose = 'registration', role = 'member') => {
  if (!email || !isValidEmailAddress(email)) {
    throw new Error('Please provide a valid recipient email address.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const domain = cleanEmail.split('@')[1];

  // Safeguard: Protect against sending test/mock domain emails to real SMTP (prevents NXDOMAIN bounces)
  if (UNROUTABLE_TEST_DOMAINS.includes(domain)) {
    console.log(`[Email Service] Safe Test Simulation: Recipient domain '@${domain}' is an unroutable test domain. Simulating delivery locally without dispatching to SMTP servers.`);
    return {
      success: true,
      delivered: false,
      simulated: true,
      notice: 'Test domain processed safely without public SMTP dispatch.'
    };
  }

  const mailTransporter = getTransporter();
  const smtpUser = process.env.SMTP_USER;
  const from = process.env.SMTP_FROM || `"Fit Health Security" <${smtpUser || 'no-reply@fithealth.io'}>`;

  const { subject, html, text } = getOtpEmailTemplate({
    email: cleanEmail,
    otp,
    purpose,
    role
  });

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        html,
        text
      });
      console.log(`[Email Service] Sent OTP email to ${cleanEmail} (Message ID: ${info.messageId})`);
      return { success: true, delivered: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Service] Primary SMTP port attempt failed for ${cleanEmail}: ${err.message}. Retrying via alternate port 587 (TLS)...`);
      try {
        const fallbackTransporter = getTransporter(587, false);
        if (fallbackTransporter) {
          const fallbackInfo = await fallbackTransporter.sendMail({
            from,
            to: cleanEmail,
            subject,
            html,
            text
          });
          console.log(`[Email Service] Sent OTP email via port 587 to ${cleanEmail} (Message ID: ${fallbackInfo.messageId})`);
          return { success: true, delivered: true, messageId: fallbackInfo.messageId };
        }
      } catch (fallbackErr) {
        console.error(`[Email Service] Fallback SMTP port 587 also failed:`, fallbackErr.message);
      }
      console.error(`[Email Service] SMTP Transmission Error for ${cleanEmail}:`, err.message);
      return { success: false, delivered: false, error: err.message };
    }
  } else {
    console.warn(`[Email Service] Transporter unavailable. Cannot deliver to ${cleanEmail}.`);
    return { success: false, delivered: false, error: 'SMTP transporter is not configured.' };
  }
};

module.exports = {
  getTransporter,
  verifySmtpConnection,
  isValidEmailAddress,
  sendOTPEmail
};
