/*
  # Split promo code data into encrypted codes and unencrypted metadata

  1. New Tables
    - `promo_code_metadata`
      - `id` (uuid, primary key, references promo_codes.id)
      - `store` (text, store name)
      - `discount` (text, discount description)
      - `expires` (date, expiration date)
      - `notes` (text, optional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - The `promo_codes` table now only stores the encrypted promo code itself
    - Metadata is stored separately for better query performance and partial visibility

  3. Security
    - Enable RLS on `promo_code_metadata` table
    - Add policies for authenticated users to manage their own metadata
    - Foreign key constraint ensures data integrity
*/

-- Create the promo code metadata table
CREATE TABLE IF NOT EXISTS promo_code_metadata (
  id uuid PRIMARY KEY,
  store text NOT NULL,
  discount text NOT NULL,
  expires date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_promo_metadata_code 
    FOREIGN KEY (id) REFERENCES promo_codes(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_promo_metadata_store ON promo_code_metadata(store);
CREATE INDEX IF NOT EXISTS idx_promo_metadata_expires ON promo_code_metadata(expires);
CREATE INDEX IF NOT EXISTS idx_promo_metadata_created_at ON promo_code_metadata(created_at);

-- Enable Row Level Security
ALTER TABLE promo_code_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_code_metadata
CREATE POLICY "Users can view their own promo metadata"
  ON promo_code_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE promo_codes.id = promo_code_metadata.id 
      AND promo_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create promo metadata for their own codes"
  ON promo_code_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE promo_codes.id = promo_code_metadata.id 
      AND promo_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own promo metadata"
  ON promo_code_metadata
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE promo_codes.id = promo_code_metadata.id 
      AND promo_codes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE promo_codes.id = promo_code_metadata.id 
      AND promo_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own promo metadata"
  ON promo_code_metadata
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE promo_codes.id = promo_code_metadata.id 
      AND promo_codes.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_promo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promo_metadata_updated_at
  BEFORE UPDATE ON promo_code_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_metadata_updated_at();