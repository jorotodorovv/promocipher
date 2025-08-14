import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Filter, Download, Upload, Settings, LogOut, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DisplayPromoCode } from '../types/promoCode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Placeholder data for now - will be replaced with real encrypted promo codes
  const [promoCodes, setPromoCodes] = useState<DisplayPromoCode[]>([
    {
      id: '1',
      user_id: user?.id || '',
      encrypted_data: 'mock_encrypted_data_1',
      nonce: 'mock_nonce_1',
      tag: 'mock_tag_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      decryptedData: null,
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    },
    {
      id: '2',
      user_id: user?.id || '',
      encrypted_data: 'mock_encrypted_data_2',
      nonce: 'mock_nonce_2',
      tag: 'mock_tag_2',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      decryptedData: null,
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    },
    {
      id: '3',
      user_id: user?.id || '',
      encrypted_data: 'mock_encrypted_data_3',
      nonce: 'mock_nonce_3',
      tag: 'mock_tag_3',
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z',
      decryptedData: null,
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    }
  ]);

  // Mock data for demonstration - will be replaced with actual decryption
  const mockDecryptedData = {
    '1': { id: '1', code: 'TECH25OFF', store: 'TechMart', discount: '25% off electronics', expires: '2024-03-15', notes: '', userId: user?.id || '' },
    '2': { id: '2', code: 'FREESHIP2024', store: 'QuickBuy', discount: 'Free shipping', expires: '2024-04-01', notes: '', userId: user?.id || '' },
    '3': { id: '3', code: 'NEWUSER10', store: 'StyleHub', discount: '$10 off first order', expires: '2024-12-31', notes: '', userId: user?.id || '' }
  };

  const toggleReveal = async (codeId: string) => {
    setPromoCodes(prevCodes => 
      prevCodes.map(code => {
        if (code.id === codeId) {
          if (code.isRevealed) {
            // Hide the code
            return {
              ...code,
              isRevealed: false,
              decryptedData: null,
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

    // Simulate decryption process (will be replaced with actual decryption)
    if (!promoCodes.find(c => c.id === codeId)?.isRevealed) {
      setTimeout(() => {
        setPromoCodes(prevCodes => 
          prevCodes.map(code => {
            if (code.id === codeId) {
              return {
                ...code,
                isDecrypting: false,
                isRevealed: true,
                decryptedData: mockDecryptedData[codeId as keyof typeof mockDecryptedData]
              };
            }
            return code;
          })
        );
      }, 800); // Simulate decryption delay
    }
  };

  const handleCopy = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
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
            <Button variant="primary" size="medium">
              <Plus className="w-4 h-4 mr-2" />
              Add Code
            </Button>
          </div>
        </div>

        {/* Promo Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoCodes
            .filter(code => 
              (code.decryptedData?.store.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (code.decryptedData?.discount.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (!code.isRevealed && searchTerm === '')
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
                      {code.decryptedData?.store || 'Encrypted Store'}
                    </h3>
                    <p className="font-sans text-small text-neutral-medium">
                      {code.decryptedData?.discount || 'Hidden discount details'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      code.decryptedData && new Date(code.decryptedData.expires) > new Date() 
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
                        {code.isRevealed && code.decryptedData ? code.decryptedData.code : '••••••••'}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {code.isDecrypting ? (
                        <Shield className="w-4 h-4 text-primary-bright animate-pulse" />
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
                      {code.isRevealed && code.decryptedData && (
                        <button
                          onClick={() => handleCopy(code.decryptedData!.code, code.id)}
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

                <div className="flex items-center justify-between text-small">
                  <span className="font-sans text-neutral-medium">
                    Expires: {code.decryptedData?.expires || 'Hidden'}
                  </span>
                </div>
              </Card>
            ))}
        </div>

        {/* Empty State */}
        {promoCodes.length === 0 && (
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
            <Button variant="primary" size="large">
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