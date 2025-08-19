import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userSaltService } from '../services/userSaltService';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray, isValidBase64 } from '../utils/crypto';
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
    setHasExistingSalt(false);
    setKeyDerivationError(null);
    setPreviousUserId(null);
    await clearStoredDerivedKey();
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
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};