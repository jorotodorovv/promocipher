/*
  # Make expiry date optional for promo codes

  1. Changes
    - Alter `expires` column in `promo_code_metadata` table to allow NULL values
    - This enables "No Expiry" promo codes that never expire

  2. Notes
    - Existing data with expiry dates will remain unchanged
    - New promo codes can be created without expiry dates
    - UI will display "No Expiry" for codes with null expires values
*/

-- Make the expires column nullable
ALTER TABLE promo_code_metadata 
ALTER COLUMN expires DROP NOT NULL;