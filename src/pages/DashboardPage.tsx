import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Filter, Download, Upload, Settings, LogOut, Eye, EyeOff, Copy, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DisplayPromoCode, PromoCodeData, NewPromoCodeForm } from '../types/promoCode';
import { encrypt, decrypt } from '../utils/crypto';
import { promoCodeService } from '../utils/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const DashboardPage: React.FC = () => {
  const { user, signOut, derivedKey } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);
  
  // Form state for adding new promo codes
  const [newCode, setNewCode] = useState<NewPromoCodeForm>({
    code: '',
    store: '',
    discount: '',
    expires: '',
    notes: ''
  });

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

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      // Reset form and close modal
      setNewCode({ code: '', store: '', discount: '', expires: '', notes: '' });
      setShowAddCodeModal(false);
    } catch (error) {
      console.error('Failed to add promo code:', error);
      setAddCodeError(error instanceof Error ? error.message : 'Failed to add promo code');
    } finally {
      setIsAddingCode(false);
    }
  };

  const resetAddCodeForm = () => {
    setNewCode({ code: '', store: '', discount: '', expires: '', notes: '' });
    setAddCodeError(null);
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
                isRevealed: true
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <div className="font-pixel text-h3 text-primary-bright mb-2">
                {promoCodes.length}
              </div>
              <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                Total Codes
              </p>
            </Card>
            <Card className="text-center">
              <div className="font-pixel text-h3 text-accent-success mb-2">
                2
              </div>
              <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                Active Codes
              </p>
            </Card>
            <Card className="text-center">
              <div className="font-pixel text-h3 text-accent-warning mb-2">
                1
              </div>
              <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                Expiring Soon
              </p>
            </Card>
            <Card className="text-center">
              <div className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2">
                $247
              </div>
              <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                Est. Savings
              </p>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search promo codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="medium">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="secondary" size="medium">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="secondary" size="medium">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="primary" 
              size="medium"
              onClick={() => {
                resetAddCodeForm();
                setShowAddCodeModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Code
            </Button>
          </div>
        </div>

        {/* Add Code Modal */}
        <Modal isOpen={showAddCodeModal} onClose={() => setShowAddCodeModal(false)}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 shadow-light dark:shadow-dark">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
              Add Promo Code
            </h2>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
              Your code will be encrypted before being stored
            </p>
          </div>

          {addCodeError && (
            <div className="mb-6 p-4 bg-accent-error/10 border border-accent-error/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-accent-error" />
                <span className="font-sans text-small text-accent-error">{addCodeError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAddPromoCode} className="space-y-4">
            <Input
              type="text"
              placeholder="Store name (e.g., Amazon, Target)"
              value={newCode.store}
              onChange={(e) => setNewCode(prev => ({ ...prev, store: e.target.value }))}
              required
            />
            
            <Input
              type="text"
              placeholder="Promo code (e.g., SAVE20)"
              value={newCode.code}
              onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
              required
            />
            
            <Input
              type="text"
              placeholder="Discount description (e.g., 20% off, Free shipping)"
              value={newCode.discount}
              onChange={(e) => setNewCode(prev => ({ ...prev, discount: e.target.value }))}
              required
            />
            
            <Input
              type="date"
              placeholder="Expiration date"
              value={newCode.expires}
              onChange={(e) => setNewCode(prev => ({ ...prev, expires: e.target.value }))}
              required
            />
            
            <Input
              type="text"
              placeholder="Notes (optional)"
              value={newCode.notes}
              onChange={(e) => setNewCode(prev => ({ ...prev, notes: e.target.value }))}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                size="large"
                className="flex-1"
                type="button"
                onClick={() => setShowAddCodeModal(false)}
                disabled={isAddingCode}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="large"
                className="flex-1"
                type="submit"
                disabled={isAddingCode || !newCode.code.trim() || !newCode.store.trim()}
              >
                {isAddingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Add & Encrypt
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-primary-bright/10 border border-primary-bright/20 rounded-lg text-left">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary-bright mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-sans font-medium text-primary-bright mb-2">
                  Zero-Knowledge Encryption
                </h4>
                <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                  Your promo code will be encrypted on this device before being sent to our servers. 
                  We cannot see your codes even if we wanted to.
                </p>
              </div>
            </div>
          </div>
        </Modal>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoCodes
            .filter(code => 
              code.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
              code.discount.toLowerCase().includes(searchTerm.toLowerCase()) ||
              searchTerm === ''
            )
            .map((code, index) => (
              <Card 
                key={code.id}
                className="hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
                      {code.store}
                    </h3>
                    <p className="font-sans text-small text-neutral-medium">
                      {code.discount}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      new Date(code.expires) > new Date() 
                        ? 'bg-accent-success' 
                        : 'bg-accent-error'
                    }`} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-small text-neutral-medium">Promo Code</span>
                  </div>
                  <div className="bg-neutral-light dark:bg-neutral-medium/20 rounded p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <code className="font-code text-code text-neutral-dark dark:text-white font-bold">
                        {code.isRevealed ? code.decryptedCode : '••••••••••••'}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {code.isDecrypting ? (
                        <Loader2 className="w-4 h-4 text-primary-bright animate-spin" />
                      ) : (
                        <button
                          onClick={() => toggleReveal(code.id)}
                          className="p-1 hover:bg-neutral-medium/20 rounded transition-colors duration-200"
                          title={code.isRevealed ? 'Hide code' : 'Reveal code'}
                        >
                          {code.isRevealed ? (
                            <EyeOff className="w-4 h-4 text-neutral-dark dark:text-neutral-medium" />
                          ) : (
                            <Eye className="w-4 h-4 text-primary-bright" />
                          )}
                        </button>
                      )}
                      {code.isRevealed && (
                        <button
                          onClick={() => handleCopy(code.decryptedCode || '', code.id)}
                          className="p-1 hover:bg-neutral-medium/20 rounded transition-colors duration-200"
                          title="Copy code"
                        >
                          {copiedCodeId === code.id ? (
                            <Check className="w-4 h-4 text-accent-success" />
                          ) : (
                            <Copy className="w-4 h-4 text-primary-bright" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show decryption error if any */}
                {code.decryptionError && (
                  <div className="mb-4 p-3 bg-accent-error/10 border border-accent-error/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-accent-error" />
                      <span className="font-sans text-small text-accent-error">{code.decryptionError}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-small">
                  <span className="font-sans text-neutral-medium">
                    Expires: {code.expires}
                  </span>
                  {code.notes && (
                    <span className="font-sans text-neutral-medium italic">
                      {code.notes.length > 20 ? `${code.notes.substring(0, 20)}...` : code.notes}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingCodes && promoCodes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-light dark:bg-neutral-medium/20 rounded-lg mb-6">
              <Shield className="w-10 h-10 text-neutral-medium" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              No Promo Codes Yet
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-8 max-w-md mx-auto">
              Start building your secure vault by adding your first promo code. 
              All codes are encrypted with military-grade security.
            </p>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => setShowAddCodeModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Code
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-16">
          <Card className="bg-primary-bright/10 border border-primary-bright/20 max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-primary-bright" />
              <h3 className="font-pixel text-h3 text-primary-bright uppercase tracking-wide">
                Zero-Knowledge Security
              </h3>
            </div>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
              Your promo codes are encrypted on your device before being stored. 
              We cannot see your codes even if we wanted to - that's the power of zero-knowledge architecture.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;