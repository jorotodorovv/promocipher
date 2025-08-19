import React, { useState, useEffect } from 'react';
import { Edit, Shield, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { DisplayPromoCode } from '../../types/promoCode';

interface EditCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, code: string, store: string, discount: string, expires: string, notes: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  promoCode: DisplayPromoCode | null;
}

const EditCodeModal: React.FC<EditCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  promoCode
}) => {
  const [formData, setFormData] = useState({
    code: '',
    store: '',
    discount: '',
    expires: '',
    notes: ''
  });

  // Populate form when promoCode changes
  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.decryptedCode || '',
        store: promoCode.store,
        discount: promoCode.discount,
        expires: promoCode.expires,
        notes: promoCode.notes
      });
    }
  }, [promoCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode) {
      await onSubmit(
        promoCode.id,
        formData.code,
        formData.store,
        formData.discount,
        formData.expires,
        formData.notes
      );
    }
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

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 shadow-light dark:shadow-dark">
          <Edit className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          Edit Promo Code
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
          Your changes will be encrypted before being stored
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-error/10 border border-accent-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-accent-error" />
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
          placeholder="Expiration date"
          value={formData.expires}
          onChange={(e) => updateField('expires', e.target.value)}
          required
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Update & Encrypt
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCodeModal;