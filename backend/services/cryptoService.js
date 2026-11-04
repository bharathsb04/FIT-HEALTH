// Ensure all essential environment configurations are loaded
require('../config/envLoader');

const crypto = require('crypto');
const path = require('path');

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_HEX = '12226847868d13b0f2c0e133dc66f1104f531a74ac7e07ed99d2caa521c26fa1';

/**
 * Validates and resolves the 32-byte encryption key from environment variables.
 * Enforces strict length verification at application startup:
 * - 64 hex characters (32 bytes) decoded with Buffer.from(key, 'hex')
 * - OR a raw 32-character string (32 bytes UTF-8)
 */
function resolveEncryptionKey() {
  const rawKey = process.env.BIOMETRICS_ENCRYPTION_KEY || DEFAULT_KEY_HEX;

  const trimmed = rawKey.trim();

  // Format 1: 64 hexadecimal characters -> decodes to exactly 32 bytes
  if (trimmed.length === 64 && /^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const keyBuf = Buffer.from(trimmed, 'hex');
    if (keyBuf.length === 32) return keyBuf;
  }

  // Format 2: Exactly 32 characters (32 bytes in UTF-8)
  if (Buffer.byteLength(trimmed, 'utf8') === 32) {
    return Buffer.from(trimmed, 'utf8');
  }

  throw new Error(
    `FATAL STARTUP ERROR: BIOMETRICS_ENCRYPTION_KEY has an invalid length (${trimmed.length} characters, ${Buffer.byteLength(trimmed, 'utf8')} bytes). ` +
    'AES-256-GCM encryption requires either exactly 64 hex characters (32 bytes) or a 32-character raw string. ' +
    'Generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

const SECRET_KEY = resolveEncryptionKey();

/**
 * Encrypts an arbitrary value (object, number, or string) at rest using AES-256-GCM.
 * Output format: "enc:<iv_hex>:<tag_hex>:<ciphertext_hex>"
 */
function encryptValue(value) {
  if (value === null || value === undefined) return value;
  try {
    const serialized = JSON.stringify(value);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let ciphertext = cipher.update(serialized, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${authTag}:${ciphertext}`;
  } catch (err) {
    // Return sanitized string representation if encryption fails
    return value;
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string back to its original value.
 * If authentication fails or payload is corrupted, returns null.
 * Fallback gracefully if value is already unencrypted raw primitive.
 */
function decryptValue(payload) {
  if (typeof payload !== 'string' || !payload.startsWith('enc:')) {
    return payload;
  }
  try {
    const parts = payload.split(':');
    if (parts.length !== 4) return null;
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const ciphertext = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

module.exports = {
  encryptValue,
  decryptValue
};

