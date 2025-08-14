import sodium from 'libsodium-wrappers-sumo';
import type { PromoCodeData } from '../types/promoCode';

// Initialize libsodium and export it
let isSodiumReady = false;

export async function initializeCrypto(): Promise<void> {
  if (isSodiumReady) {
    return;
  }
  await sodium.ready;
  isSodiumReady = true;
}

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

// Interface for the crypto encrypted result (now only for the code)
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
  // Ensure libsodium is fully initialized
  await sodium.ready;
  
  // Use Argon2id for key derivation
  const key = sodium.crypto_pwhash(
    32, // 32 bytes = 256 bits
    masterPassword,
    salt,
    CRYPTO_CONFIG.ARGON2_ITERATIONS,
    CRYPTO_CONFIG.ARGON2_MEMORY,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
  
  return key;
}

// Real implementation using XChaCha20-Poly1305 for authenticated encryption of promo code only
export async function encrypt(
  promoCodeData: PromoCodeData,
  key: Uint8Array,
  userId: string
): Promise<EncryptionResult> {
  // Only encrypt the sensitive code field
  const codeToEncrypt = promoCodeData.code;
  
  // Generate a random nonce (24 bytes for XChaCha20)
  const nonce = sodium.randombytes_buf(CRYPTO_CONFIG.NONCE_LENGTH);
  
  // Use user_id and promo_code_id as Additional Authenticated Data (AAD)
  const aadString = `${userId}:${promoCodeData.id}`;
  const aad = new TextEncoder().encode(aadString);
  
  // Encrypt using XChaCha20-Poly1305
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    codeToEncrypt,
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

// Real implementation using XChaCha20-Poly1305 for authenticated decryption of promo code only
export async function decrypt(
  encryptedData: string,
  nonce: string,
  tag: string,
  userId: string,
  promoCodeId: string,
  key: Uint8Array
): Promise<string> {
  try {
    // Decode Base64 strings
    const ciphertextArray = base64ToArray(encryptedData);
    const nonceArray = base64ToArray(nonce);
    const tagArray = base64ToArray(tag);
    
    // Reconstruct AAD from user_id and promo_code_id
    const aadString = `${userId}:${promoCodeId}`;
    const aadArray = new TextEncoder().encode(aadString);
    
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
    
    return decrypted; // Return the decrypted code string directly
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt promo code. Invalid password or corrupted data.');
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