import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, userSaltService } from '../utils/supabase';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray } from '../utils/crypto';
import { storeDerivedKey, getStoredDerivedKey, clearStoredDerivedKey } from '../utils/keyStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasCheckedStoredKey: boolean;
  derivedKey: Uint8Array | null;
  isKeyDeriving: boolean;
  keyDerivationError: string | null;
  signOut: () => Promise<void>;
  deriveEncryptionKey: (masterPassword: string, rememberMe?: boolean) => Promise<void>;
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
  const [hasCheckedStoredKey, setHasCheckedStoredKey] = useState(false);
  const [derivedKey, setDerivedKey] = useState<Uint8Array | null>(null);
  const [isKeyDeriving, setIsKeyDeriving] = useState(false);
  const [keyDerivationError, setKeyDerivationError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      
      // If user is authenticated, try to load stored key
      if (user) {
        try {
          const storedKey = await getStoredDerivedKey();
          if (storedKey) {
            setDerivedKey(storedKey);
          }
        } catch (error) {
          console.error('Failed to load stored key:', error);
          // Clear potentially corrupted stored key
          await clearStoredDerivedKey();
        } finally {
          // Mark that we've checked for stored key and finished loading
          setHasCheckedStoredKey(true);
          setLoading(false);
        }
      } else {
        setHasCheckedStoredKey(true);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        const previousUser = user;
        
        setUser(user);
        
        // Clear derived key when user changes
        if (!user) {
          setDerivedKey(null);
          setHasCheckedStoredKey(false);
          setKeyDerivationError(null);
          // Clear stored key on logout
          await clearStoredDerivedKey();
        } else if (user && (!previousUser || user.id !== previousUser.id)) {
          // New user logged in, try to load their stored key
          setHasCheckedStoredKey(false);
          try {
            const storedKey = await getStoredDerivedKey();
            if (storedKey) {
              setDerivedKey(storedKey);
            }
          } catch (error) {
            console.error('Failed to load stored key for new user:', error);
            await clearStoredDerivedKey();
          } finally {
            setHasCheckedStoredKey(true);
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear derived key before signing out
    setDerivedKey(null);
    setHasCheckedStoredKey(false);
    setKeyDerivationError(null);
    // Clear stored key on logout
    await clearStoredDerivedKey();
    await supabase.auth.signOut();
  };

  const deriveEncryptionKey = async (masterPassword: string, rememberMe: boolean = false) => {
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
      
      // Store key locally if user opted in
      if (rememberMe) {
        try {
          await storeDerivedKey(key);
        } catch (error) {
          console.error('Failed to store derived key:', error);
          // Don't fail the entire operation, just warn the user
          setKeyDerivationError('Key derived successfully but failed to store locally. You may need to re-enter your password next time.');
        }
      }
      
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
    hasCheckedStoredKey,
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