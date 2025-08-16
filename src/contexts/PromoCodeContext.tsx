import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { promoCodeService } from '../services/promoCodeService';
import { useAuth } from './AuthContext';
import { useEncryption } from './EncryptionContext';
import { decrypt, encrypt } from '../utils/crypto';
import type { DisplayPromoCode } from '../types/promoCode';

interface PromoCodeContextType {
  promoCodes: DisplayPromoCode[];
  loading: boolean;
  error: string | null;
  addPromoCode: (code: string, store: string, discount: string, expires: string, notes: string) => Promise<void>;
  updatePromoCode: (id: string, code: string, store: string, discount: string, expires: string, notes: string) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  toggleCodeRevelation: (codeId: string) => Promise<void>;
}

const PromoCodeContext = createContext<PromoCodeContextType | undefined>(undefined);

export const usePromoCode = () => {
  const context = useContext(PromoCodeContext);
  if (context === undefined) {
    throw new Error('usePromoCode must be used within a PromoCodeProvider');
  }
  return context;
};

interface PromoCodeProviderProps {
  children: React.ReactNode;
}

export const PromoCodeProvider: React.FC<PromoCodeProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { derivedKey, hasCheckedStoredKey } = useEncryption();
  const [promoCodes, setPromoCodes] = useState<DisplayPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoCodes = useCallback(async () => {
    if (!user || !derivedKey) {
      setPromoCodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const encryptedPromoCodes = await promoCodeService.getAll();
      const decryptedPromoCodes: DisplayPromoCode[] = [];

      for (const encryptedCode of encryptedPromoCodes) {
        try {
          const decryptedCode = await decrypt(
            encryptedCode.encrypted_data,
            encryptedCode.nonce,
            encryptedCode.tag,
            encryptedCode.user_id,
            encryptedCode.id,
            derivedKey
          );
          decryptedPromoCodes.push({
            ...encryptedCode,
            created_at: encryptedCode.created_at,
            updated_at: encryptedCode.updated_at,
            decryptedCode,
            isRevealed: false,
            isDecrypting: false,
            decryptionError: null
          });
        } catch (decryptError) {
          console.error('Failed to decrypt promo code:', decryptError);
          // Optionally, handle individual decryption failures (e.g., skip or mark as corrupted)
        }
      }
      setPromoCodes(decryptedPromoCodes);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
      setError('Failed to fetch promo codes.');
    } finally {
      setLoading(false);
    }
  }, [user, derivedKey]);

  useEffect(() => {
    if (!authLoading && hasCheckedStoredKey) {
      fetchPromoCodes();
    }
  }, [user, derivedKey, authLoading, hasCheckedStoredKey, fetchPromoCodes]);

  const addPromoCode = async (code: string, store: string, discount: string, expires: string, notes: string) => {
    if (!user || !derivedKey) {
      setError('User not authenticated or key not derived.');
      return;
    }
    try {
      const encryptedData = await encrypt(
        { id: crypto.randomUUID(), code, userId: user.id },
        derivedKey,
        user.id
      );
      const promoCodeId = crypto.randomUUID();
      const newPromoCode = await promoCodeService.create(
        {
          id: promoCodeId,
          user_id: user.id,
          encrypted_data: encryptedData.encryptedData,
          nonce: encryptedData.nonce,
          tag: encryptedData.tag
        },
        {
          id: promoCodeId,
          store,
          discount,
          expires,
          notes
        }
      );
      setPromoCodes(prev => [...prev, {
        ...newPromoCode,
        created_at: newPromoCode.created_at,
        updated_at: newPromoCode.updated_at,
        decryptedCode: code,
        isRevealed: false,
        isDecrypting: false,
        decryptionError: null
      }]);
    } catch (err) {
      console.error('Error adding promo code:', err);
      setError('Failed to add promo code.');
    }
  };

  const updatePromoCode = async (id: string, code: string, store: string, discount: string, expires: string, notes: string) => {
    if (!user || !derivedKey) {
      setError('User not authenticated or key not derived.');
      return;
    }
    try {
      const encryptedData = await encrypt(
        { id, code, userId: user.id },
        derivedKey,
        user.id
      );
      await promoCodeService.updateCode(id, {
        encrypted_data: encryptedData.encryptedData,
        nonce: encryptedData.nonce,
        tag: encryptedData.tag
      });
      await promoCodeService.updateMetadata(id, {
        store,
        discount,
        expires,
        notes
      });
      setPromoCodes(prev =>
        prev.map(pc => (pc.id === id ? { ...pc, store, discount, expires, notes, decryptedCode: code } : pc))
      );
    } catch (err) {
      console.error('Error updating promo code:', err);
      setError('Failed to update promo code.');
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    try {
      await promoCodeService.delete(id);
      setPromoCodes(prev => prev.filter(pc => pc.id !== id));
    } catch (err) {
      console.error('Error deleting promo code:', err);
      setError('Failed to delete promo code.');
    }
  };

  const toggleCodeRevelation = async (codeId: string) => {
    if (!user || !derivedKey) {
      setError('User not authenticated or key not derived.');
      return;
    }

    const codeIndex = promoCodes.findIndex(pc => pc.id === codeId);
    if (codeIndex === -1) {
      setError('Promo code not found.');
      return;
    }

    const currentCode = promoCodes[codeIndex];
    
    // If currently revealed, hide it
    if (currentCode.isRevealed) {
      setPromoCodes(prev => prev.map(pc => 
        pc.id === codeId 
          ? { ...pc, isRevealed: false, decryptedCode: null, decryptionError: null }
          : pc
      ));
      return;
    }

    // If not revealed, decrypt and reveal it
    setPromoCodes(prev => prev.map(pc => 
      pc.id === codeId 
        ? { ...pc, isDecrypting: true, decryptionError: null }
        : pc
    ));

    try {
      const decryptedCode = await decrypt(
        currentCode.encrypted_data,
        currentCode.nonce,
        currentCode.tag,
        currentCode.user_id,
        currentCode.id,
        derivedKey
      );

      setPromoCodes(prev => prev.map(pc => 
        pc.id === codeId 
          ? { 
              ...pc, 
              decryptedCode, 
              isRevealed: true, 
              isDecrypting: false, 
              decryptionError: null 
            }
          : pc
      ));
    } catch (decryptError) {
      console.error('Failed to decrypt promo code:', decryptError);
      const errorMessage = decryptError instanceof Error 
        ? decryptError.message 
        : 'Failed to decrypt promo code';
      
      setPromoCodes(prev => prev.map(pc => 
        pc.id === codeId 
          ? { 
              ...pc, 
              isDecrypting: false, 
              decryptionError: errorMessage,
              isRevealed: false,
              decryptedCode: null
            }
          : pc
      ));
    }
  };
  const value = {
    promoCodes,
    loading,
    error,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleCodeRevelation,
  };

  return (
    <PromoCodeContext.Provider value={value}>
      {children}
    </PromoCodeContext.Provider>
  );
};