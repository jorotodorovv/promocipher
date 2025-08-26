import React, { useState } from 'react';
import { PlusIcon, ShieldCheckIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { NewPromoCodeForm } from '../../types/promoCode';

interface AddCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewPromoCodeForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AddCodeModal: React.FC<AddCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error
}) => {
  const [formData, setFormData] = useState<NewPromoCodeForm>({
    code: '',
    store: '',
    discount: '',
    expires: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      expires: formData.expires?.trim() === '' ? null : formData.expires
    };
    await onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      code: '',
      store: '',
      discount: '',
      expires: '',
      notes: ''
    });
    onClose();
  };

  const updateField = (field: keyof NewPromoCodeForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 shadow-light dark:shadow-dark">
          <PlusIcon className="w-9 h-9 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          Add Promo Code
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
          Your code will be encrypted before being stored
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-error/10 border border-accent-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="w-6 h-6 text-accent-error" />
            <span className="font-sans text-small text-accent-error">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Store name (e.g., Amazon, Target)"
          value={formData.store}
          onChange={(e) => updateField('store', e.target.value)}
          required
        />
        
        <Input
          type="text"
          placeholder="Promo code (e.g., SAVE20)"
          value={formData.code}
          onChange={(e) => updateField('code', e.target.value)}
          required
        />
        
        <Input
          type="text"
          placeholder="Discount description (e.g., 20% off, Free shipping)"
          value={formData.discount}
          onChange={(e) => updateField('discount', e.target.value)}
          required
        />
        
        <Input
          type="date"
          placeholder="Expiration date (optional - leave empty for no expiry)"
          value={formData?.expires || ''}
          onChange={(e) => updateField('expires', e.target.value)}
        />
        
        <Input
          type="text"
          placeholder="Notes (optional)"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            size="large"
            className="flex-1"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            className="flex-1"
            type="submit"
            disabled={isLoading || !formData.code.trim() || !formData.store.trim()}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Encrypting...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Add & Encrypt
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCodeModal;