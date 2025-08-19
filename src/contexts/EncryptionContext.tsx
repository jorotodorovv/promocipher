import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userSaltService } from '../services/userSaltService';
import { promoCodeService } from '../services/promoCodeService';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray, isValidBase64, decrypt } from '../utils/crypto';
import { storeDerivedKey, getStoredDerivedKey, clearStoredDerivedKey } from '../utils/keyStorage';

interface EncryptionContextType {
  hasCheckedStoredKey: boolean;
  hasExistingSalt: boolean;
  isLoadingSalt: boolean;
  derivedKey: Uint8Array | null;
  isKeyDeriving: boolean;
  keyDerivationError: string | null;
  deriveEncryptionKey: (masterPassword: string, rememberMe?: boolean) => Promise<void>;
  clearEncryptionKey: () => Promise<void>;
  validateMasterPassword: (derivedKey: Uint8Array) => Promise<boolean>;
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
  const [hasExistingSalt, setHasExistingSalt] = useState(false);
  const [isLoadingSalt, setIsLoadingSalt] = useState(true);
  const [derivedKey, setDerivedKey] = useState<Uint8Array | null>(null);
  const [isKeyDeriving, setIsKeyDeriving] = useState(false);
  const [keyDerivationError, setKeyDerivationError] = useState<string | null>(null);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  // Initial key loading on component mount
  useEffect(() => {
    const loadInitialStoredKey = async () => {
      try {
        const storedKey = await getStoredDerivedKey();
        if (storedKey) {
          setDerivedKey(storedKey);
        }
      } catch (error) {
        console.error('Failed to load initial stored key:', error);
        // Clear potentially corrupted stored key
        await clearStoredDerivedKey();
      } finally {
        setHasCheckedStoredKey(true);
      }
    };

    loadInitialStoredKey();
  }, []);

  // Handle user authentication state changes
  useEffect(() => {
    const handleUserStateChange = async () => {
      if (user) {
        // Check if user.id is available
        if (!user.id) {
          console.warn('User object exists but user.id is missing. Setting default state for new user flow.');
          setHasExistingSalt(false);
          setIsLoadingSalt(false);
          return;
        }
        
        // Check if this is a different user than before
        if (previousUserId && previousUserId !== user.id) {
          // Different user - clear the stored key and reset state
          await clearStoredDerivedKey();
          setDerivedKey(null);
        }
        
        setPreviousUserId(user.id);
        setIsLoadingSalt(true);
        
        try {
          // Check if user has an existing salt
          const userSalt = await userSaltService.getByUserId(user.id);
          setHasExistingSalt(!!userSalt);
        } catch (error) {
          console.error('Failed to check user salt:', error);
          setHasExistingSalt(false);
        } finally {
          setIsLoadingSalt(false);
        }
      } else {
        // User logged out - clear everything including stored key
        if (previousUserId) {
          await clearStoredDerivedKey();
          setDerivedKey(null);
          setPreviousUserId(null);
        }
        setHasExistingSalt(false);
        setIsLoadingSalt(false);
        setKeyDerivationError(null);
      }
    };

    handleUserStateChange();
  }, [user, previousUserId]);

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
      if (!isValidBase64(userSalt)) {
        throw new Error('Encryption salt is corrupted. Cannot decrypt existing data. Please contact support.');
      }
      const saltArray = base64ToArray(userSalt);

      // Derive encryption key using Argon2id
      const key = await deriveKey(masterPassword, saltArray);
      
      // For existing users, validate the password by attempting to decrypt existing data
      if (hasExistingSalt) {
        const isPasswordValid = await validateMasterPassword(key);
        if (!isPasswordValid) {
          throw new Error('INVALID_PASSWORD');
        }
      }
      
      // Store key locally if user opted in
      if (rememberMe) {
        try {
          await storeDerivedKey(key);
        } catch (error) {
          console.error('Failed to store derived key:', error);
          // Don't fail the entire operation, just warn the user
          setKeyDerivationError('Key derived successfully but failed to store locally. You may need to re-enter your password next time.');
        }
      } else {
        // If user didn't check remember me, clear any existing stored key
        await clearStoredDerivedKey();
      }
      
      setDerivedKey(key);
    } catch (error) {
      console.error('Key derivation failed:', error);
      if (error instanceof Error && error.message === 'INVALID_PASSWORD') {
        setKeyDerivationError('INVALID_PASSWORD');
      } else {
        setKeyDerivationError(
          error instanceof Error 
            ? error.message 
            : 'Failed to derive encryption key. Please try again.'
        );
      }
    } finally {
      setIsKeyDeriving(false);
    }
  };

  const validateMasterPassword = async (derivedKey: Uint8Array): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      // Get existing promo codes to test decryption
      const encryptedPromoCodes = await promoCodeService.getAll();
      
      // If no promo codes exist, we can't validate but assume password is correct
      if (encryptedPromoCodes.length === 0) {
        return true;
      }

      // Try to decrypt the first promo code as a validation test
      const firstCode = encryptedPromoCodes[0];
      await decrypt(
        firstCode.encrypted_data,
        firstCode.nonce,
        firstCode.tag,
        firstCode.user_id,
        firstCode.id,
        derivedKey
      );

      // If decryption succeeds, password is correct
      return true;
    } catch (error) {
      // If decryption fails, password is incorrect
      console.error('Password validation failed:', error);
      return false;
    }
  };

  const clearEncryptionKey = async () => {
    if (!user?.id) {
      return;
    }

    try {
      // Delete all user's promo codes and metadata
      await promoCodeService.deleteAll();
      
      // Delete user's salt from database
      await userSaltService.delete(user.id);
      
      // Clear local state and storage
      setDerivedKey(null);
      setHasExistingSalt(false);
      setKeyDerivationError(null);
      await clearStoredDerivedKey();
      
      // Keep hasCheckedStoredKey as true so we show the create password modal
      // instead of loading state
    } catch (error) {
      console.error('Failed to reset password:', error);
      setKeyDerivationError('Failed to reset password. Please try again.');
    }
  };
  
  const value = {
    hasCheckedStoredKey,
    hasExistingSalt,
    isLoadingSalt,
    derivedKey,
    isKeyDeriving,
    keyDerivationError,
    deriveEncryptionKey,
    clearEncryptionKey,
    validateMasterPassword,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};