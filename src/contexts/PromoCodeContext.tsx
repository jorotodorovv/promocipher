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
            created_at: encryptedCode.code_created_at,
            updated_at: encryptedCode.code_updated_at,
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
      const newPromoCode = await promoCodeService.create(
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          encrypted_data: encryptedData.encryptedData,
          nonce: encryptedData.nonce,
          tag: encryptedData.tag
        },
        {
          id: crypto.randomUUID(),
          store,
          discount,
          expires,
          notes
        }
      );
      setPromoCodes(prev => [...prev, {
        ...newPromoCode,
        created_at: newPromoCode.code_created_at,
        updated_at: newPromoCode.code_updated_at,
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

  const value = {
    promoCodes,
    loading,
    error,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
  };

  return (
    <PromoCodeContext.Provider value={value}>
      {children}
    </PromoCodeContext.Provider>
  );
};