import React from 'react';
import { TrashIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { DisplayPromoCode } from '../../types/promoCode';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  promoCode?: DisplayPromoCode | null;
  isDeleteAll?: boolean;
  totalCount?: number;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  promoCode = null,
  isDeleteAll = false,
  totalCount = 0
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-error rounded-lg mb-4 shadow-light dark:shadow-dark">
          <ExclamationTriangleIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          {isDeleteAll ? 'Delete All Promo Codes' : 'Delete Promo Code'}
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-4">
          {isDeleteAll 
            ? `Are you sure you want to delete all ${totalCount} promo codes?`
            : 'Are you sure you want to delete this promo code?'
          }
        </p>
        {isDeleteAll ? (
          <div className="bg-neutral-light dark:bg-neutral-medium/20 rounded-lg p-4 mb-6">
            <div className="text-left">
              <h3 className="font-pixel text-small text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
                Warning: Complete Data Loss
              </h3>
              <ul className="font-sans text-small text-neutral-medium space-y-1">
                <li>• All encrypted data will be removed permanently</li>
                <li>• Your dashboard will be cleared completely</li>
              </ul>
            </div>
          </div>
        ) : (
          promoCode && (
            <div className="bg-neutral-light dark:bg-neutral-medium/20 rounded-lg p-4 mb-6">
              <div className="text-left">
                <h3 className="font-pixel text-small text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
                  {promoCode.store}
                </h3>
                <p className="font-sans text-small text-neutral-medium mb-1">
                  {promoCode.discount}
                </p>
                <p className="font-sans text-small text-neutral-medium">
                  Expires: {promoCode.expires}
                </p>
              </div>
            </div>
          )
        )}
        <p className="font-sans text-small text-accent-error">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="secondary"
          size="large"
          className="flex-1"
          type="button"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="large"
          className="flex-1"
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <TrashIcon className="w-4 h-4 mr-2" />
              {isDeleteAll ? 'Delete All' : 'Delete'}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;