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

// Cryptographic constants (static values to avoid initialization issues)
export const CRYPTO_CONFIG = {
  // Argon2id parameters for key derivation
  ARGON2_MEMORY: 64 * 1024 * 1024, // 64 MiB
  ARGON2_ITERATIONS: 3,
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
  
  // Generate a random nonce using libsodium
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  
  // Use user_id and promo_code_id as Additional Authenticated Data (AAD)
  const aadString = `${userId}:${promoCodeData.id}`;
  const aad = new TextEncoder().encode(aadString);
  
  // Encrypt using XChaCha20-Poly1305 (returns ciphertext + tag combined)
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    codeToEncrypt,
    aad,
    null, // nsec (not used)
    nonce,
    key
  );
  
  // Split ciphertext and tag
  const tagLength = sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;
  const encryptedData = ciphertext.slice(0, -tagLength);
  const tag = ciphertext.slice(-tagLength);
  
  return {
    encryptedData: sodium.to_base64(encryptedData),
    nonce: sodium.to_base64(nonce),
    tag: sodium.to_base64(tag),
    aad: sodium.to_base64(aad)
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
    // Decode Base64 strings using libsodium
    const ciphertextArray = sodium.from_base64(encryptedData);
    const nonceArray = sodium.from_base64(nonce);
    const tagArray = sodium.from_base64(tag);
    
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

// Generate a cryptographically secure salt for key derivation using libsodium
export function generateSalt(): Uint8Array {
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
}

// Utility functions using libsodium's built-in Base64 conversion
export function arrayToBase64(array: Uint8Array): string {
  return sodium.to_base64(array);
}

export function base64ToArray(base64: string): Uint8Array {
  return sodium.from_base64(base64);
}