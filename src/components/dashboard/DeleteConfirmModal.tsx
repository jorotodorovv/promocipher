import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { DisplayPromoCode } from '../../types/promoCode';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  promoCode: DisplayPromoCode | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  promoCode
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-error rounded-lg mb-4 shadow-light dark:shadow-dark">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          Delete Promo Code
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-4">
          Are you sure you want to delete this promo code?
        </p>
        {promoCode && (
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
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;