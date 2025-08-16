import React, { useState } from 'react';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePromoCode } from '../contexts/PromoCodeContext';
import type { NewPromoCodeForm } from '../types/promoCode';
import Button from '../components/ui/Button';
import DashboardStats from '../components/dashboard/DashboardStats';
import ActionBar from '../components/dashboard/ActionBar';
import PromoCodeCard from '../components/dashboard/PromoCodeCard';
import AddCodeModal from '../components/dashboard/AddCodeModal';
import EmptyState from '../components/dashboard/EmptyState';
import SecurityNotice from '../components/dashboard/SecurityNotice';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { promoCodes, loading: isLoadingCodes, addPromoCode, toggleCodeRevelation } = usePromoCode();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);


  const handleAddPromoCode = async (newCode: NewPromoCodeForm) => {
    setIsAddingCode(true);
    setAddCodeError(null);

    try {
      await addPromoCode(
        newCode.code.trim(),
        newCode.store.trim(),
        newCode.discount.trim(),
        newCode.expires,
        newCode.notes.trim()
      );
      setShowAddCodeModal(false);
    } catch (error) {
      console.error('Failed to add promo code:', error);
      setAddCodeError(error instanceof Error ? error.message : 'Failed to add promo code');
    } finally {
      setIsAddingCode(false);
    }
  };

  const handleToggleReveal = async (codeId: string) => {
    try {
      await toggleCodeRevelation(codeId);
    } catch (error) {
      console.error('Failed to toggle code revelation:', error);
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
                    onToggleReveal={handleToggleReveal}
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