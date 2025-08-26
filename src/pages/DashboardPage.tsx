import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Cog6ToothIcon, ArrowLeftOnRectangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useEncryption } from '../contexts/EncryptionContext';
import { decrypt, encrypt } from '../utils/crypto';
import { calculateDashboardStats } from '../utils/dashboardStats';

import { useInfinitePromoCodes, usePromoCodesForStats, useCreatePromoCode, useUpdatePromoCode, useDeletePromoCode, useDeleteAllPromoCodes } from '../hooks/usePromoCodeQueries';
import type { NewPromoCodeForm, DisplayPromoCode } from '../types/promoCode';
import Button from '../components/ui/Button';
import DashboardStats from '../components/dashboard/DashboardStats';
import ActionBar from '../components/dashboard/ActionBar';
import PromoCodeCard from '../components/dashboard/PromoCodeCard';
import AddCodeModal from '../components/dashboard/AddCodeModal';
import EditCodeModal from '../components/dashboard/EditCodeModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';

import EmptyState from '../components/dashboard/EmptyState';
import NoMatchesState from '../components/dashboard/NoMatchesState';
import SecurityNotice from '../components/dashboard/SecurityNotice';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { derivedKey } = useEncryption();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, { decryptedCode: string; isDecrypting: boolean; decryptionError: string | null }>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // React Query hooks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingCodes,
  } = useInfinitePromoCodes(debouncedSearchTerm, statusFilter);

  // Separate query for stats calculation (search-only, no status filter)
  const {
    data: statsData,
    isLoading: isLoadingStats
  } = usePromoCodesForStats(debouncedSearchTerm);

  const createPromoCodeMutation = useCreatePromoCode();
  const updatePromoCodeMutation = useUpdatePromoCode();
  const deletePromoCodeMutation = useDeletePromoCode();
  const deleteAllPromoCodesMutation = useDeleteAllPromoCodes();

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setSearchLoading(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debouncedSearchTerm]);

  // Memoize the flattened promo codes to stabilize the reference
  const promoCodes = useMemo(() => 
    data?.pages.flatMap((page: { data: any[]; }) => page.data) || [], 
    [data]
  );

  const statsPromoCodes = useMemo(() => 
    statsData?.pages.flatMap((page: { data: any[]; }) => page.data) || [], 
    [statsData]
  );

  const totalCount = statsData?.pages[0]?.total || 0;

  // Calculate dashboard stats using utility function from search-only filtered data
  const dashboardStats = calculateDashboardStats(statsPromoCodes);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showEditCodeModal, setShowEditCodeModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<DisplayPromoCode | null>(null);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editCodeError, setEditCodeError] = useState<string | null>(null);
  const [isDeletingCode, setIsDeletingCode] = useState(false);


  const handleAddPromoCode = useCallback(async (newCode: NewPromoCodeForm) => {
    setIsAddingCode(true);
    setAddCodeError(null);

    const id = crypto.randomUUID();
    try {
      if (!derivedKey) {
        throw new Error('Encryption key not available');
      }

      const encryptedResult = await encrypt({
        id,
        code: newCode.code,
      }, derivedKey, user?.id || '');

      await createPromoCodeMutation.mutateAsync({
        encryptedCode: {
          id,
          user_id: user?.id || '',
          encrypted_data: encryptedResult.encryptedData,
          nonce: encryptedResult.nonce,
          tag: encryptedResult.tag
        },
        metadata: {
          id,
          store: newCode.store.trim(),
          discount: newCode.discount.trim(),
          expires: newCode.expires,
          notes: newCode.notes.trim()
        },
      });
      setShowAddCodeModal(false);
    } catch (error) {
      console.error('Failed to add promo code:', error);
      setAddCodeError('Failed to add promo code. Please try again.');
    } finally {
      setIsAddingCode(false);
    }
  }, [derivedKey, user, createPromoCodeMutation]);

  const handleEditPromoCode = useCallback((code: DisplayPromoCode) => {
    setSelectedPromoCode(code);
    setShowEditCodeModal(true);
    setEditCodeError(null);
  }, []);

  const handleUpdatePromoCode = useCallback(async (id: string, store: string, discount: string, expires: string | null, notes: string) => {
    setIsEditingCode(true);
    setEditCodeError(null);

    try {
      await updatePromoCodeMutation.mutateAsync({
        id,
        metadata: { store, discount, expires, notes }
      });
      setShowEditCodeModal(false);
      setSelectedPromoCode(null);
    } catch (error) {
      console.error('Failed to update promo code:', error);
      setEditCodeError('Failed to update promo code. Please try again.');
    } finally {
      setIsEditingCode(false);
    }
  }, [updatePromoCodeMutation]);

  const handleDeletePromoCode = useCallback((code: DisplayPromoCode) => {
    setSelectedPromoCode(code);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPromoCode) return;

    setIsDeletingCode(true);
    try {
      await deletePromoCodeMutation.mutateAsync(selectedPromoCode.id);
      setShowDeleteConfirmModal(false);
      setSelectedPromoCode(null);
    } catch (error) {
      console.error('Failed to delete promo code:', error);
    } finally {
      setIsDeletingCode(false);
    }
  }, [selectedPromoCode, deletePromoCodeMutation]);

  const handleCloseEditModal = () => {
    setShowEditCodeModal(false);
    setSelectedPromoCode(null);
    setEditCodeError(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setSelectedPromoCode(null);
  };

  const handleToggleReveal = useCallback(async (codeId: string) => {
    if (!user || !derivedKey) {
      console.error('User not authenticated or key not derived.');
      return;
    }

    setRevealedCodes(prev => {
      const currentRevealState = prev[codeId];

      // If currently revealed, hide it
      if (currentRevealState?.decryptedCode) {
        const newState = { ...prev };
        delete newState[codeId];
        return newState;
      }

      // If it's already being decrypted, do nothing
      if (currentRevealState?.isDecrypting) {
        return prev;
      }

      const codeToDecrypt = promoCodes.find(pc => pc.id === codeId);
      if (!codeToDecrypt) {
        console.error('Promo code not found.');
        return prev;
      }

      // Decrypt asynchronously and then update state
      decrypt(
        codeToDecrypt.encrypted_data,
        codeToDecrypt.nonce,
        codeToDecrypt.tag,
        codeToDecrypt.user_id,
        codeToDecrypt.id,
        derivedKey
      ).then(decryptedCode => {
        setRevealedCodes(current => ({
          ...current,
          [codeId]: { decryptedCode, isDecrypting: false, decryptionError: null }
        }));
      }).catch(decryptError => {
        console.error('Failed to decrypt promo code:', decryptError);
        const errorMessage = decryptError instanceof Error
          ? decryptError.message
          : 'Failed to decrypt promo code';
        setRevealedCodes(current => ({
          ...current,
          [codeId]: { decryptedCode: '', isDecrypting: false, decryptionError: errorMessage }
        }));
      });

      // Return the state with the 'isDecrypting' flag set immediately
      return {
        ...prev,
        [codeId]: { decryptedCode: '', isDecrypting: true, decryptionError: null }
      };
    });
  }, [user, derivedKey, promoCodes]);

  const handleCopy = useCallback(async (codeText: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, []);

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

  const handleDeleteAllModalOpen = () => {
    setShowDeleteAllModal(true);
  };

  const handleDeleteAllConfirm = useCallback(async () => {
    try {
      await deleteAllPromoCodesMutation.mutateAsync();
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error('Failed to delete all promo codes:', error);
    }
  }, [deleteAllPromoCodesMutation]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        promoCodes: promoCodes.map((code: any) => ({
          id: code.id,
          user_id: code.user_id,
          store: code.store,
          discount: code.discount,
          expires: code.expires,
          notes: code.notes,
          created_at: code.created_at,
          updated_at: code.updated_at,
          // Include encrypted data for complete backup
          encrypted_data: code.encrypted_data,
          nonce: code.nonce,
          tag: code.tag
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `promocipher-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [promoCodes]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.promoCodes || !Array.isArray(importData.promoCodes)) {
        throw new Error('Invalid file format. Please select a valid PromoCipher export file.');
      }

      let importedCount = 0;
      for (const code of importData.promoCodes as any[]) {
        if (!code.store || !code.discount) {
          continue; // Skip invalid entries
        }

        try {
          // Use createPromoCodeMutation for import (same as creation)
          await createPromoCodeMutation.mutateAsync({
            encryptedCode: {
              id: code.id,
              user_id: code.user_id,
              encrypted_data: code.encrypted_data,
              nonce: code.nonce,
              tag: code.tag
            },
            metadata: {
              id: code.id,
              store: code.store,
              discount: code.discount,
              expires: code.expires || null,
              notes: code.notes || ''
            }
          });
          importedCount++;
        } catch (error) {
          console.error('Failed to import code:', error);
        }
      }

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed. Please check your file format.');
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsImporting(false);
    }
  }, [createPromoCodeMutation]);

  // Infinite scroll observer
  const lastPromoCodeRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingCodes) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoadingCodes, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Settings
              </Button>
              <Button variant="danger" size="medium" onClick={handleSignOut}>
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <DashboardStats
            totalCodes={totalCount}
            activeCodes={dashboardStats.activeCodes}
            expiringSoon={dashboardStats.expiringSoon}
            expiredCodes={dashboardStats.expiredCodes}
            onFilterChange={setStatusFilter}
          />

          {/* Success/Error Messages */}
          {exportSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Export completed successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {importSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Import completed successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {importError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {importError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <ActionBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddCode={handleAddCodeModalOpen}
            onExport={handleExport}
            onImport={handleImport}
            onDeleteAll={handleDeleteAllModalOpen}
            isExporting={isExporting}
            isImporting={isImporting}
            searchLoading={searchLoading}
            isDeleting={deleteAllPromoCodesMutation.isPending}
            totalCount={totalCount}
          />

          {/* Loading State */}
          {isLoadingCodes || isLoadingStats || searchLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-bright rounded-lg mb-6 animate-pulse-glow">
                <ArrowPathIcon className="w-10 h-10 text-white animate-spin" />
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
              {promoCodes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promoCodes.map((code: any, index: number) => {
                      const isLast = index === promoCodes.length - 1;
                      const revealState = revealedCodes[code.id];

                      // Transform code to DisplayPromoCode format
                      const displayCode = {
                        ...code,
                        decryptedCode: revealState?.decryptedCode || null,
                        isRevealed: !!revealState?.decryptedCode,
                        isDecrypting: revealState?.isDecrypting || false,
                        decryptionError: revealState?.decryptionError || null
                      };

                      return (
                        <div
                          key={code.id}
                          ref={isLast ? lastPromoCodeRef : null}
                        >
                          <PromoCodeCard
                            code={displayCode}
                            index={index}
                            copiedCodeId={copiedCodeId}
                            onToggleReveal={handleToggleReveal}
                            onCopy={handleCopy}
                            onEdit={handleEditPromoCode}
                            onDelete={handleDeletePromoCode}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Loading more indicator */}
                  {isFetchingNextPage && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-primary-bright" />
                      <p className="mt-2 text-sm text-neutral-dark dark:text-neutral-medium">
                        Loading more codes...
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Show different empty states based on search context
                debouncedSearchTerm.trim() ? (
                  <NoMatchesState
                    searchTerm={debouncedSearchTerm}
                    onClearSearch={() => setSearchTerm('')}
                  />
                ) : (
                  <EmptyState onAddCode={handleAddCodeModalOpen} />
                )
              )}
            </>
          )}

          {/* Security Notice */}
          <SecurityNotice />
        </div>

        {/* Add Code Modal */}
        <AddCodeModal
          isOpen={showAddCodeModal}
          onClose={() => setShowAddCodeModal(false)}
          onSubmit={handleAddPromoCode}
          isLoading={isAddingCode}
          error={addCodeError}
        />

        {/* Edit Code Modal */}
        <EditCodeModal
          isOpen={showEditCodeModal}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdatePromoCode}
          isLoading={isEditingCode}
          error={editCodeError}
          promoCode={selectedPromoCode}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirmModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isLoading={isDeletingCode}
          promoCode={selectedPromoCode}
        />

        {/* Delete All Confirmation Modal */}
        <DeleteConfirmModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllConfirm}
        isLoading={deleteAllPromoCodesMutation.isPending}
        isDeleteAll={true}
        totalCount={totalCount}
      />
      </div>
    </div>
  );
};

export default DashboardPage;