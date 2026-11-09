/**
 * Fit Health - SMS Gateway & Mobile OTP Service
 * Dispatches genuine SMS OTP codes to mobile phone numbers.
 * Supports Twilio, Fast2SMS, and generic HTTP SMS APIs.
 * Enforces E.164 international phone number format (+[countryCode][number]).
 */

require('../config/envLoader');
const https = require('https');
const http = require('http');

/**
 * Validates and normalizes phone number to strict E.164 format.
 * Example: "+91 98765 43210" -> "+919876543210"
 * @param {string} phone
 * @param {string} defaultCountryCode
 * @returns {string|null} E.164 formatted string or null if invalid
 */
function normalizeE164(phone, defaultCountryCode = '+91') {
  if (!phone || typeof phone !== 'string') return null;
  let clean = phone.trim().replace(/[\s\-\(\)]/g, '');

  if (!clean.startsWith('+')) {
    // If user provided 10 digits without country code, prefix with defaultCountryCode
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 10) {
      clean = `${defaultCountryCode}${digits}`;
    } else {
      clean = `+${digits}`;
    }
  }

  // E.164 format: + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  if (!e164Regex.test(clean)) {
    return null;
  }

  return clean;
}

/**
 * Dispatches SMS using Twilio REST API without requiring external SDK dependency.
 */
function sendTwilioSMS(accountSid, authToken, fromNumber, toNumber, message) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      To: toNumber,
      From: fromNumber,
      Body: message
    }).toString();

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, messageId: parsed.sid, provider: 'twilio' });
          } else {
            resolve({ success: false, error: parsed.message || 'Twilio dispatch failed', provider: 'twilio' });
          }
        } catch (err) {
          resolve({ success: false, error: err.message, provider: 'twilio' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message, provider: 'twilio' }));
    req.write(postData);
    req.end();
  });
}

/**
 * Dispatches SMS using Fast2SMS API (popular in India).
 */
function sendFast2SMS(apiKey, toNumber, message) {
  return new Promise((resolve) => {
    const nationalNumber = toNumber.replace(/^\+91/, '').replace(/\D/g, '');
    const postData = JSON.stringify({
      route: 'otp',
      numbers: nationalNumber,
      variables_values: message
    });

    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.return === true || (res.statusCode >= 200 && res.statusCode < 300)) {
            resolve({ success: true, messageId: parsed.request_id, provider: 'fast2sms' });
          } else {
            resolve({ success: false, error: parsed.message || 'Fast2SMS dispatch failed', provider: 'fast2sms' });
          }
        } catch (err) {
          resolve({ success: false, error: err.message, provider: 'fast2sms' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message, provider: 'fast2sms' }));
    req.write(postData);
    req.end();
  });
}

/**
 * Dispatches a 6-digit OTP to a mobile phone number.
 * @param {string} phone E.164 formatted phone number
 * @param {string} otp 6-digit verification code
 * @param {string} purpose 'registration' | 'login' | 'admin_registration'
 * @returns {Promise<{success: boolean, delivered: boolean, error?: string, simulated?: boolean}>}
 */
async function sendMobileOtpSMS(phone, otp, purpose = 'registration') {
  const normalizedPhone = normalizeE164(phone);
  if (!normalizedPhone) {
    return {
      success: false,
      delivered: false,
      error: 'Invalid mobile phone number. Please enter a valid number with country code (E.164 format, e.g. +91 98765 43210).'
    };
  }

  const message = `Your Fit Health verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  // 1. Check Twilio Provider
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM;

  if (twilioSid && twilioToken && twilioFrom) {
    const res = await sendTwilioSMS(twilioSid, twilioToken, twilioFrom, normalizedPhone, message);
    if (res.success) {
      console.log(`[SMS Service] Successfully sent SMS OTP to ${normalizedPhone.slice(0, 4)}***${normalizedPhone.slice(-2)} via Twilio`);
      return { success: true, delivered: true, provider: 'twilio' };
    }
    console.warn(`[SMS Service] Twilio dispatch error: ${res.error}`);
  }

  // 2. Check Fast2SMS Provider
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    const res = await sendFast2SMS(fast2smsKey, normalizedPhone, otp);
    if (res.success) {
      console.log(`[SMS Service] Successfully sent SMS OTP to ${normalizedPhone.slice(0, 4)}***${normalizedPhone.slice(-2)} via Fast2SMS`);
      return { success: true, delivered: true, provider: 'fast2sms' };
    }
    console.warn(`[SMS Service] Fast2SMS dispatch error: ${res.error}`);
  }

  // 3. Fallback check for missing provider in Production vs Development
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDevSms = process.env.ALLOW_DEV_SMS === 'true' || !isProduction;

  if (!allowDevSms) {
    // In strict production, if no SMS provider is configured, fail with clear requirement message
    return {
      success: false,
      delivered: false,
      error: 'SMS service gateway is not configured. Please configure TWILIO or FAST2SMS provider credentials in backend environment.'
    };
  }

  // In non-production or when ALLOW_DEV_SMS is enabled: safe dev log (avoid leaking in real prod)
  if (!isProduction) {
    console.log(`[SMS Gateway Service (Dev/Test Mode)] Dispatched 6-digit SMS OTP to ${normalizedPhone}: ${otp}`);
  } else {
    console.log(`[SMS Gateway Service] Simulated SMS dispatch to ${normalizedPhone.slice(0, 4)}***${normalizedPhone.slice(-2)}`);
  }

  return {
    success: true,
    delivered: true,
    simulated: true,
    provider: 'dev_simulator'
  };
}

module.exports = {
  normalizeE164,
  sendMobileOtpSMS
};

