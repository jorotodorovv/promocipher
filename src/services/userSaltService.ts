import { supabase } from './supabase';

// Database operations for user salts
export const userSaltService = {
  // Get user salt by user ID
  async getByUserId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_salts')
      .select('salt')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user salt doesn't exist
        return null;
      }
      throw new Error(`Failed to fetch user salt: ${error.message}`);
    }

    return data.salt;
  },

  // Create a new user salt
  async create(userId: string, salt: string): Promise<void> {
    const { error } = await supabase
      .from('user_salts')
      .insert({ user_id: userId, salt });

    if (error) {
      throw new Error(`Failed to create user salt: ${error.message}`);
    }
  },

  // Update user salt
  async update(userId: string, salt: string): Promise<void> {
    const { error } = await supabase
      .from('user_salts')
      .update({ salt })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update user salt: ${error.message}`);
    }
  },

  // Delete user salt
  async delete(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_salts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete user salt: ${error.message}`);
    }
  }
};