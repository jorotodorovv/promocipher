import sodium from 'libsodium-wrappers-sumo';
import type { PromoCodeData } from '../types/promoCode';

// Initialize libsodium at module load time
await sodium.ready;

// Cryptographic constants based on the terminal output
export const CRYPTO_CONFIG = {
  // Argon2id parameters for key derivation
  ARGON2_MEMORY: 64 * 1024 * 1024, // 64 MiB
  ARGON2_ITERATIONS: 3,
  ARGON2_PARALLELISM: 1,
  SALT_LENGTH: 16, // 16 bytes
  NONCE_LENGTH: 24, // 24 bytes for XChaCha20
  TAG_LENGTH: 16,   // 16 bytes for Poly1305
} as const;

// Interfaces for the crypto key and encrypted result
export interface EncryptionResult {
  encryptedData: string; // Base64 encoded
  nonce: string;         // Base64 encoded
  tag: string;           // Base64 encoded
  aad: string;           // Base64 encoded
}

// Real implementation using Argon2id for key derivation
export async function deriveKey(
  masterPassword: string, 
  salt: Uint8Array
): Promise<Uint8Array> {
  // Use Argon2id for key derivation
  const key = sodium.crypto_pwhash(
    32, // 32 bytes = 256 bits
    masterPassword,
    salt,
    CRYPTO_CONFIG.ARGON2_ITERATIONS,
    CRYPTO_CONFIG.ARGON2_MEMORY,
    sodium.crypto_pwhash_ALG_ARGON2ID
  );
  
  return key;
}

// Real implementation using XChaCha20-Poly1305 for authenticated encryption
export async function encrypt(
  data: PromoCodeData,
  key: Uint8Array,
  userId: string
): Promise<EncryptionResult> {
  // Serialize the promo code data
  const jsonData = JSON.stringify(data);
  
  // Generate a random nonce (24 bytes for XChaCha20)
  const nonce = sodium.randombytes_buf(CRYPTO_CONFIG.NONCE_LENGTH);
  
  // Use user_id as Additional Authenticated Data (AAD)
  const aad = new TextEncoder().encode(userId);
  
  // Encrypt using XChaCha20-Poly1305
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    jsonData,
    aad,
    null, // nsec (not used)
    nonce,
    key
  );
  
  // XChaCha20-Poly1305 returns ciphertext + tag combined
  const encryptedData = ciphertext.slice(0, -CRYPTO_CONFIG.TAG_LENGTH);
  const tag = ciphertext.slice(-CRYPTO_CONFIG.TAG_LENGTH);
  
  return {
    encryptedData: arrayToBase64(encryptedData),
    nonce: arrayToBase64(nonce),
    tag: arrayToBase64(tag),
    aad: arrayToBase64(aad)
  };
}

// Real implementation using XChaCha20-Poly1305 for authenticated decryption
export async function decrypt(
  encryptedData: string,
  nonce: string,
  tag: string,
  aad: string,
  key: Uint8Array
): Promise<PromoCodeData> {
  try {
    // Decode Base64 strings
    const ciphertextArray = base64ToArray(encryptedData);
    const nonceArray = base64ToArray(nonce);
    const tagArray = base64ToArray(tag);
    const aadArray = base64ToArray(aad);
    
    // Combine ciphertext and tag for XChaCha20-Poly1305
    const ciphertextWithTag = new Uint8Array(ciphertextArray.length + tagArray.length);
    ciphertextWithTag.set(ciphertextArray);
    ciphertextWithTag.set(tagArray, ciphertextArray.length);
    
    // Decrypt using XChaCha20-Poly1305
    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // nsec (not used)
      ciphertextWithTag,
      aadArray,
      nonceArray,
      key,
      'text'
    );
    
    return JSON.parse(decrypted) as PromoCodeData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt promo code. Data may be corrupted or tampered with.');
  }
}

// Generate a cryptographically secure salt for key derivation
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH));
}

// Utility function to convert Uint8Array to Base64
export function arrayToBase64(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array));
}

// Utility function to convert Base64 to Uint8Array
export function base64ToArray(base64: string): Uint8Array {
  return new Uint8Array(atob(base64).split('').map(char => char.charCodeAt(0)));
}