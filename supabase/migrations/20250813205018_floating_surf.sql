/*
  # Create Promo Codes Table with Encryption Support

  1. New Tables
    - `promo_codes`
      - `id` (uuid, primary key) - Unique identifier for each promo code
      - `user_id` (uuid, foreign key) - References auth.users, used for RLS and AAD
      - `encrypted_data` (text) - Base64 encoded ciphertext of the promo code data
      - `nonce` (text) - Base64 encoded 24-byte nonce for XChaCha20
      - `tag` (text) - Base64 encoded 16-byte authentication tag from Poly1305
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

    - `user_key_salts`
      - `user_id` (uuid, primary key) - References auth.users
      - `salt` (text) - Base64 encoded 16-byte salt for Argon2id key derivation
      - `created_at` (timestamptz) - Salt creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access only their own data
    - Foreign key constraints ensure data integrity
    - Cascade delete removes user data when user account is deleted

  3. Notes
    - All cryptographic operations happen client-side
    - Server only stores encrypted data and cannot decrypt it
    - Each promo code uses a unique nonce for encryption
    - AAD (Additional Authenticated Data) includes user_id for binding
*/

-- Create promo_codes table for storing encrypted promo code data
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_data text NOT NULL,
  nonce text NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_key_salts table for storing user-specific salts
CREATE TABLE IF NOT EXISTS public.user_key_salts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security on promo_codes table
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on user_key_salts table
ALTER TABLE public.user_key_salts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes table
CREATE POLICY "Users can view their own promo codes"
  ON public.promo_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create promo codes for themselves"
  ON public.promo_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own promo codes"
  ON public.promo_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own promo codes"
  ON public.promo_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_key_salts table
CREATE POLICY "Users can view their own salt"
  ON public.user_key_salts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own salt"
  ON public.user_key_salts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_user_id ON public.promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_created_at ON public.promo_codes(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on promo_codes
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();