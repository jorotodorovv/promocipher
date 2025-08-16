import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userSaltService } from '../services/userSaltService';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray, isValidBase64 } from '../utils/crypto';
import { storeDerivedKey, getStoredDerivedKey, clearStoredDerivedKey } from '../utils/keyStorage';

interface EncryptionContextType {
  hasCheckedStoredKey: boolean;
  derivedKey: Uint8Array | null;
  isKeyDeriving: boolean;
  keyDerivationError: string | null;
  deriveEncryptionKey: (masterPassword: string, rememberMe?: boolean) => Promise<void>;
  clearEncryptionKey: () => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
};

interface EncryptionProviderProps {
  children: React.ReactNode;
}

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [hasCheckedStoredKey, setHasCheckedStoredKey] = useState(false);
  const [derivedKey, setDerivedKey] = useState<Uint8Array | null>(null);
  const [isKeyDeriving, setIsKeyDeriving] = useState(false);
  const [keyDerivationError, setKeyDerivationError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredKey = async () => {
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
          setHasCheckedStoredKey(true);
        }
      } else {
        // Clear key data when user logs out
        setDerivedKey(null);
        setHasCheckedStoredKey(false);
        setKeyDerivationError(null);
        await clearStoredDerivedKey();
      }
    };

    loadStoredKey();
  }, [user]);

  const deriveEncryptionKey = async (masterPassword: string, rememberMe: boolean = false) => {
    setIsKeyDeriving(true);
    setKeyDerivationError(null);

    try {
      // Get or create user's salt
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      let userSalt = await userSaltService.getByUserId(user.id);
      
      if (!userSalt) {
        // Generate new salt for first-time user
        const newSalt = generateSalt();
        const saltBase64 = arrayToBase64(newSalt);
        await userSaltService.create(user.id, saltBase64);
        userSalt = saltBase64;
      }

      // Validate and convert salt from base64 back to Uint8Array
      let saltArray: Uint8Array;
      if (!isValidBase64(userSalt)) {
        console.warn('Invalid salt detected, regenerating');
        // Regenerate salt if the existing one is corrupted
        const newSalt = generateSalt();
        const saltBase64 = arrayToBase64(newSalt);
        await userSaltService.update(user.id, saltBase64);
        saltArray = newSalt;
      } else {
        saltArray = base64ToArray(userSalt);
      }

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

  const clearEncryptionKey = async () => {
    setDerivedKey(null);
    setHasCheckedStoredKey(false);
    setKeyDerivationError(null);
    await clearStoredDerivedKey();
  };
  
  const value = {
    hasCheckedStoredKey,
    derivedKey,
    isKeyDeriving,
    keyDerivationError,
    deriveEncryptionKey,
    clearEncryptionKey,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};