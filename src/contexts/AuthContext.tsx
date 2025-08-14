import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, userSaltService } from '../utils/supabase';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray } from '../utils/crypto';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  derivedKey: Uint8Array | null;
  isKeyDeriving: boolean;
  keyDerivationError: string | null;
  signOut: () => Promise<void>;
  deriveEncryptionKey: (masterPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [derivedKey, setDerivedKey] = useState<Uint8Array | null>(null);
  const [isKeyDeriving, setIsKeyDeriving] = useState(false);
  const [keyDerivationError, setKeyDerivationError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        // Clear derived key when user changes
        if (!session?.user) {
          setDerivedKey(null);
          setKeyDerivationError(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear derived key before signing out
    setDerivedKey(null);
    setKeyDerivationError(null);
    await supabase.auth.signOut();
  };

  const deriveEncryptionKey = async (masterPassword: string) => {
    setIsKeyDeriving(true);
    setKeyDerivationError(null);

    try {
      // Get or create user's salt
      let userSalt = await userSaltService.getSalt();
      
      if (!userSalt) {
        // Generate new salt for first-time user
        const newSalt = generateSalt();
        const saltBase64 = arrayToBase64(newSalt);
        userSalt = await userSaltService.createSalt(saltBase64);
      }

      // Convert salt from base64 back to Uint8Array
      const saltArray = base64ToArray(userSalt.salt);

      // Derive encryption key using Argon2id
      const key = await deriveKey(masterPassword, saltArray);
      
      setDerivedKey(key);
    } catch (error) {
      console.error('Key derivation failed:', error);
      setKeyDerivationError(
        error instanceof Error 
          ? error.message 
          : 'Failed to derive encryption key. Please try again.'
      );
    } finally {
      setIsKeyDeriving(false);
    }
  };
  const value = {
    user,
    loading,
    derivedKey,
    isKeyDeriving,
    keyDerivationError,
    signOut,
    deriveEncryptionKey,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};