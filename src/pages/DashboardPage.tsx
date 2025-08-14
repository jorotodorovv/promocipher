import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DisplayPromoCode, PromoCodeData, NewPromoCodeForm } from '../types/promoCode';
import { encrypt, decrypt } from '../utils/crypto';
import { promoCodeService } from '../utils/supabase';
import Button from '../components/ui/Button';
import DashboardStats from '../components/dashboard/DashboardStats';
import ActionBar from '../components/dashboard/ActionBar';
import PromoCodeCard from '../components/dashboard/PromoCodeCard';
import AddCodeModal from '../components/dashboard/AddCodeModal';
import EmptyState from '../components/dashboard/EmptyState';
import SecurityNotice from '../components/dashboard/SecurityNotice';

const DashboardPage: React.FC = () => {
  const { user, signOut, derivedKey } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<DisplayPromoCode[]>([]);

  // Fetch promo codes from Supabase on component mount
  useEffect(() => {
    const fetchPromoCodes = async () => {
      if (!user || !derivedKey) return;
      
      setIsLoadingCodes(true);
      try {
        const codesWithMetadata = await promoCodeService.getAll();
        const displayCodes: DisplayPromoCode[] = codesWithMetadata.map(code => ({
          ...code,
          created_at: code.metadata_created_at,
          updated_at: code.metadata_updated_at,
          decryptedCode: null,
          isRevealed: false,
          isDecrypting: false,
          decryptionError: null
        }));
        setPromoCodes(displayCodes);
      } catch (error) {
        console.error('Failed to fetch promo codes:', error);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    fetchPromoCodes();
  }, [user, derivedKey]);

  // Auto-hide revealed codes after 15 seconds
  useEffect(() => {
    const revealedCodes = promoCodes.filter(code => code.isRevealed);
    
    const timers = revealedCodes.map(code => {
      return setTimeout(() => {
        setPromoCodes(prevCodes => 
          prevCodes.map(c => 
            c.id === code.id 
              ? { ...c, isRevealed: false }
              : c
          )
        );
      }, 15000); // 15 seconds
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [promoCodes.map(c => c.isRevealed).join(',')]);

  const handleAddPromoCode = async (newCode: NewPromoCodeForm) => {
    if (!user || !derivedKey) {
      setAddCodeError('Authentication required');
      return;
    }

    setIsAddingCode(true);
    setAddCodeError(null);

    try {
      // Create PromoCodeData object
      const promoCodeData: PromoCodeData = {
        id: crypto.randomUUID(),
        code: newCode.code.trim(),
        userId: user.id
      };

      // Encrypt the promo code data
      const encryptionResult = await encrypt(promoCodeData, derivedKey, user.id);

      // Prepare encrypted code data
      const encryptedCodeData = {
        id: promoCodeData.id,
        user_id: user.id,
        encrypted_data: encryptionResult.encryptedData,
        nonce: encryptionResult.nonce,
        tag: encryptionResult.tag
      };

      // Prepare metadata
      const metadataData = {
        id: promoCodeData.id,
        store: newCode.store.trim(),
        discount: newCode.discount.trim(),
        expires: newCode.expires,
        notes: newCode.notes.trim()
      };

      // Save to Supabase (both tables)
      const savedCode = await promoCodeService.create(encryptedCodeData, metadataData);

      // Add to local state
      const newDisplayCode: DisplayPromoCode = {
        id: savedCode.id,
        user_id: savedCode.user_id,
        encrypted_data: savedCode.encrypted_data,
        nonce: savedCode.nonce,
        tag: savedCode.tag,
        store: savedCode.store,
        discount: savedCode.discount,
        expires: savedCode.expires,
        notes: savedCode.notes,
        created_at: savedCode.metadata_created_at,
        updated_at: savedCode.metadata_updated_at,
        decryptedCode: null,
        isRevealed: false,
        isDecrypting: false,
        decryptionError: null
      };

      setPromoCodes(prevCodes => [newDisplayCode, ...prevCodes]);
      setShowAddCodeModal(false);
    } catch (error) {
      console.error('Failed to add promo code:', error);
      setAddCodeError(error instanceof Error ? error.message : 'Failed to add promo code');
    } finally {
      setIsAddingCode(false);
    }
  };

  const toggleReveal = async (codeId: string) => {
    const code = promoCodes.find(c => c.id === codeId);
    if (!code || !derivedKey) return;

    setPromoCodes(prevCodes => 
      prevCodes.map(code => {
        if (code.id === codeId) {
          if (code.isRevealed) {
            // Hide the code
            return {
              ...code,
              isRevealed: false,
              decryptedCode: null,
              decryptionError: null
            };
          } else {
            // Start revealing the code
            return {
              ...code,
              isDecrypting: true,
              decryptionError: null
            };
          }
        }
        return code;
      })
    );

    // Perform actual decryption
    if (!code.isRevealed) {
      try {
        const decryptedCode = await decrypt(
          code.encrypted_data,
          code.nonce,
          code.tag,
          user!.id,
          code.id,
          derivedKey
        );

        setPromoCodes(prevCodes => 
          prevCodes.map(code => {
            if (code.id === codeId) {
              return {
                ...code,
                isDecrypting: false,
                isRevealed: true,
                decryptedCode: decryptedCode,
                decryptionError: null
              };
            }
            return code;
          })
        );
      } catch (error) {
        setPromoCodes(prevCodes => 
          prevCodes.map(code => {
            if (code.id === codeId) {
              return {
                ...code,
                isDecrypting: false,
                isRevealed: false,
                decryptionError: error instanceof Error ? error.message : 'Decryption failed'
              };
            }
            return code;
          })
        );
      }
    }
  };

  const handleCopy = async (codeText: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAddCodeModalOpen = () => {
    setAddCodeError(null);
    setShowAddCodeModal(true);
  };

  const filteredCodes = promoCodes.filter(code => 
    code.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.discount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm === ''
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
                Your Secure Vault
              </h1>
              <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
                Welcome back, {user?.email?.split('@')[0]}! Your promo codes are encrypted and ready.
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button variant="secondary" size="medium">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="danger" size="medium" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <DashboardStats
            totalCodes={promoCodes.length}
            activeCodes={2}
            expiringSoon={1}
            estimatedSavings="$247"
          />
        </div>

        {/* Action Bar */}
        <ActionBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddCode={handleAddCodeModalOpen}
        />

        {/* Add Code Modal */}
        <AddCodeModal
          isOpen={showAddCodeModal}
          onClose={() => setShowAddCodeModal(false)}
          onSubmit={handleAddPromoCode}
          isLoading={isAddingCode}
          error={addCodeError}
        />

        {/* Loading State */}
        {isLoadingCodes ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-bright rounded-lg mb-6 animate-pulse-glow">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Loading Your Vault
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
              Fetching your encrypted promo codes...
            </p>
          </div>
        ) : (
          <>
            {/* Promo Codes Grid */}
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCodes.map((code, index) => (
                  <PromoCodeCard
                    key={code.id}
                    code={code}
                    index={index}
                    copiedCodeId={copiedCodeId}
                    onToggleReveal={toggleReveal}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onAddCode={handleAddCodeModalOpen} />
            )}
          </>
        )}

        {/* Security Notice */}
        <SecurityNotice />
      </div>
    </div>
  );
};

export default DashboardPage;