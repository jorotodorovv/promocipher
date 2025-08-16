import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';

// Authentication service
export const authService = {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { user: data.user, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  // Update password
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  }
};