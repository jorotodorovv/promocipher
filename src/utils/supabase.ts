import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import type { EncryptedPromoCode, PromoMetadata, PromoCodeWithMetadata, UserKeySalt } from '../types/promoCode';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations for encrypted promo codes
export const promoCodeService = {
  // Fetch all promo codes with metadata for the current user
  async getAll(): Promise<PromoCodeWithMetadata[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select(`
        id,
        user_id,
        encrypted_data,
        nonce,
        tag,
        created_at:code_created_at,
        updated_at:code_updated_at,
        promo_code_metadata (
          store,
          discount,
          expires,
          notes,
          created_at:metadata_created_at,
          updated_at:metadata_updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch promo codes: ${error.message}`);
    }

    // Transform the joined data into the expected format
    const transformedData: PromoCodeWithMetadata[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      encrypted_data: item.encrypted_data,
      nonce: item.nonce,
      tag: item.tag,
      code_created_at: item.code_created_at,
      code_updated_at: item.code_updated_at,
      store: item.promo_code_metadata?.store || '',
      discount: item.promo_code_metadata?.discount || '',
      expires: item.promo_code_metadata?.expires || '',
      notes: item.promo_code_metadata?.notes || '',
      metadata_created_at: item.promo_code_metadata?.metadata_created_at || '',
      metadata_updated_at: item.promo_code_metadata?.metadata_updated_at || ''
    }));

    return transformedData;
  },

  // Create a new promo code with encrypted code and unencrypted metadata
  async create(
    encryptedCode: Omit<EncryptedPromoCode, 'created_at' | 'updated_at'>,
    metadata: Omit<PromoMetadata, 'created_at' | 'updated_at'>
  ): Promise<PromoCodeWithMetadata> {
    // Start a transaction-like operation by inserting both records
    const { data: codeData, error: codeError } = await supabase
      .from('promo_codes')
      .insert(encryptedCode)
      .select()
      .single();

    if (codeError) {
      throw new Error(`Failed to create promo code: ${codeError.message}`);
    }

    // Insert metadata
    const { data: metadataData, error: metadataError } = await supabase
      .from('promo_code_metadata')
      .insert(metadata)
      .select()
      .single();

    if (metadataError) {
      // If metadata insert fails, clean up the promo code
      await supabase.from('promo_codes').delete().eq('id', encryptedCode.id);
      throw new Error(`Failed to create promo metadata: ${metadataError.message}`);
    }

    // Return combined data
    return {
      id: codeData.id,
      user_id: codeData.user_id,
      encrypted_data: codeData.encrypted_data,
      nonce: codeData.nonce,
      tag: codeData.tag,
      code_created_at: codeData.created_at,
      code_updated_at: codeData.updated_at,
      store: metadataData.store,
      discount: metadataData.discount,
      expires: metadataData.expires,
      notes: metadataData.notes,
      metadata_created_at: metadataData.created_at,
      metadata_updated_at: metadataData.updated_at
    };
  },

  // Update an existing promo code (code or metadata)
  async updateCode(id: string, updates: Partial<Pick<EncryptedPromoCode, 'encrypted_data' | 'nonce' | 'tag'>>): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update encrypted promo code: ${error.message}`);
    }
  },

  // Update promo code metadata
  async updateMetadata(id: string, updates: Partial<Pick<PromoMetadata, 'store' | 'discount' | 'expires' | 'notes'>>): Promise<void> {
    const { error } = await supabase
      .from('promo_code_metadata')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update promo metadata: ${error.message}`);
    }
  },

  // Delete a promo code (metadata will be cascade deleted)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete promo code: ${error.message}`);
    }
  }
};

// Database operations for user key salts
export const userSaltService = {
  // Get the salt for the current user
  async getSalt(): Promise<UserKeySalt | null> {
    const { data, error } = await supabase
      .from('user_key_salts')
      .select('*')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch user salt: ${error.message}`);
    }

    return data;
  },

  // Create a salt for the current user
  async createSalt(salt: string): Promise<UserKeySalt> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_key_salts')
      .insert({
        user_id: user.id,
        salt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user salt: ${error.message}`);
    }

    return data;
  }
};

// Authentication helpers
export const authService = {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }
    return user;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }
};