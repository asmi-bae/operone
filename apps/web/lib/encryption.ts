import crypto from 'crypto';

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derives a key from the encryption key using PBKDF2
 */
function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
}

/**
 * Encrypts a string (typically an API key)
 * @param text The text to encrypt
 * @returns Encrypted string in base64 format
 */
export function encryptApiKey(text: string): string {
  if (!text) return '';

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + encrypted
  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts an encrypted string
 * @param encryptedText The encrypted text in base64 format
 * @returns Decrypted string
 */
export function decryptApiKey(encryptedText: string): string {
  if (!encryptedText) return '';

  try {
    const combined = Buffer.from(encryptedText, 'base64');

    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = combined.subarray(ENCRYPTED_POSITION);

    const key = getKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Masks an API key for display purposes
 * Shows only the first 4 and last 4 characters
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '••••••••';
  return `${apiKey.substring(0, 4)}${'•'.repeat(Math.max(8, apiKey.length - 8))}${apiKey.substring(apiKey.length - 4)}`;
}
