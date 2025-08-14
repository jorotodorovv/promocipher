import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import type { EncryptedPromoCode, UserKeySalt } from '../types/promoCode';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations for encrypted promo codes
export const promoCodeService = {
  // Fetch all encrypted promo codes for the current user
  async getAll(): Promise<EncryptedPromoCode[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch promo codes: ${error.message}`);
    }

    return data || [];
  },

  // Create a new encrypted promo code
  async create(encryptedCode: Omit<EncryptedPromoCode, 'created_at' | 'updated_at'>): Promise<EncryptedPromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert(encryptedCode)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create promo code: ${error.message}`);
    }

    return data;
  },

  // Update an existing encrypted promo code
  async update(id: string, updates: Partial<Pick<EncryptedPromoCode, 'encrypted_data' | 'nonce' | 'tag'>>): Promise<EncryptedPromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update promo code: ${error.message}`);
    }

    return data;
  },

  // Delete a promo code
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
      .single();

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