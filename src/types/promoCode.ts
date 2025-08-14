// Core data structure for encrypted promo code (only sensitive data)
export interface PromoCodeData {
  id: string;
  code: string;    // This is the only field that gets encrypted
  userId: string;  // Used as AAD (Authenticated Associated Data)
}

// Structure for unencrypted metadata
export interface PromoMetadata {
  id: string;
  store: string;
  discount: string;
  expires: string; // ISO date string
  notes: string;
  created_at: string;
  updated_at: string;
}

// Structure for encrypted data as stored in Supabase promo_codes table
export interface EncryptedPromoCode {
  id: string;
  user_id: string;
  encrypted_data: string; // Base64 encoded encrypted code
  nonce: string;          // Base64 encoded 24-byte nonce
  tag: string;            // Base64 encoded 16-byte authentication tag
  created_at: string;
  updated_at: string;
}

// Combined structure from database join
export interface PromoCodeWithMetadata {
  // From promo_codes table
  id: string;
  user_id: string;
  encrypted_data: string;
  nonce: string;
  tag: string;
  code_created_at: string;
  code_updated_at: string;
  // From promo_code_metadata table
  store: string;
  discount: string;
  expires: string;
  notes: string;
  metadata_created_at: string;
  metadata_updated_at: string;
}

// Client-side display model that combines encrypted storage with reveal state
export interface DisplayPromoCode {
  // Encrypted code fields
  id: string;
  user_id: string;
  encrypted_data: string;
  nonce: string;
  tag: string;
  // Metadata fields (always visible)
  store: string;
  discount: string;
  expires: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Reveal state
  decryptedCode: string | null;     // Only the decrypted code string
  isRevealed: boolean;              // Controls code visibility in UI
  isDecrypting: boolean;            // Loading state during decryption
  decryptionError: string | null;   // Error message if decryption fails
}

// User's encryption key salt (stored separately from promo codes)
export interface UserKeySalt {
  user_id: string;
  salt: string; // Base64 encoded salt for Argon2id key derivation
  created_at: string;
}

// Form data for creating new promo codes
export interface NewPromoCodeForm {
  code: string;
  store: string;
  discount: string;
  expires: string;
  notes: string;
}