// Core data structure for unencrypted promo code
export interface PromoCodeData {
  id: string;
  code: string;
  store: string;
  discount: string;
  expires: string;
  notes?: string;
  userId: string; // Used as AAD (Authenticated Associated Data)
}

// Structure for encrypted data as stored in Supabase
export interface EncryptedPromoCode {
  id: string;
  user_id: string;
  encrypted_data: string; // Base64 encoded ciphertext
  nonce: string;          // Base64 encoded 24-byte nonce
  tag: string;            // Base64 encoded 16-byte authentication tag
  created_at: string;
  updated_at: string;
}

// Client-side display model that combines encrypted storage with reveal state
export interface DisplayPromoCode extends EncryptedPromoCode {
  decryptedData: PromoCodeData | null; // Holds decrypted data when revealed
  isRevealed: boolean;                  // Controls visibility in UI
  isDecrypting: boolean;                // Loading state during decryption
  decryptionError: string | null;      // Error message if decryption fails
}

// User's encryption key salt (stored separately from promo codes)
export interface UserKeySalt {
  user_id: string;
  salt: string; // Base64 encoded salt for Argon2id key derivation
  created_at: string;
}