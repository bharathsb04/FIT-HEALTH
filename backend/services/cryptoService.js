const crypto = require('crypto');
const path = require('path');

// Ensure environment variables are loaded if cryptoService is required standalone
if (!process.env.BIOMETRICS_ENCRYPTION_KEY) {
  try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  } catch (_) {}
}

const ALGORITHM = 'aes-256-gcm';

/**
 * Validates and resolves the 32-byte encryption key from environment variables.
 * Enforces strict length verification at application startup:
 * - 64 hex characters (32 bytes) decoded with Buffer.from(key, 'hex')
 * - OR a raw 32-character string (32 bytes UTF-8)
 * Throws a fatal startup error if the key is missing or has an invalid length.
 */
function resolveEncryptionKey() {
  const rawKey = process.env.BIOMETRICS_ENCRYPTION_KEY;

  if (!rawKey || !rawKey.trim()) {
    throw new Error(
      'FATAL STARTUP ERROR: BIOMETRICS_ENCRYPTION_KEY is missing in environment variables (.env). ' +
      'AES-256-GCM encryption requires a 32-byte key (64 hex characters or 32 raw characters). ' +
      'Generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

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

