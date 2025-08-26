import React, { useState, useEffect, useCallback } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, CheckIcon, ArrowPathIcon, ExclamationCircleIcon, PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import type { DisplayPromoCode } from '../../types/promoCode';

interface PromoCodeCardProps {
  code: DisplayPromoCode;
  index: number;
  copiedCodeId: string | null;
  onToggleReveal: (codeId: string) => void;
  onCopy: (codeText: string, codeId: string) => void;
  onEdit: (code: DisplayPromoCode) => void;
  onDelete: (code: DisplayPromoCode) => void;
}

const PromoCodeCard: React.FC<PromoCodeCardProps> = ({
  code,
  index,
  copiedCodeId,
  onToggleReveal,
  onCopy,
  onEdit,
  onDelete
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const isExpired = code.expires ? new Date(code.expires) <= new Date() : false;

  // Auto-hide timer effect
  useEffect(() => {
    if (code.isRevealed && !code.isDecrypting) {
      setCountdown(15);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            onToggleReveal(code.id); // Auto-hide the code
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setCountdown(null);
      };
    } else {
      setCountdown(null);
    }
  }, [code.isRevealed, code.isDecrypting, code.id, onToggleReveal]);

  const handleToggleReveal = useCallback(() => {
    onToggleReveal(code.id);
  }, [code.id, onToggleReveal]);

  return (
    <Card 
      className="hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 animate-slide-up"
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
            isExpired ? 'bg-accent-error' : 'bg-accent-success'
          }`} />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-small text-neutral-dark/80 dark:text-neutral-medium">Promo Code</span>
          {code.isRevealed && countdown !== null && (
            <div className="flex items-center space-x-1 text-xs text-neutral-dark/80 dark:text-neutral-medium">
              <ClockIcon className="w-4 h-4" />
              <span>Auto-hide in {countdown}s</span>
            </div>
          )}
        </div>
        <div className="bg-neutral-light dark:bg-neutral-medium/20 rounded p-3 flex items-center justify-between">
          <div className="flex-1">
            <code className="font-code text-code text-neutral-dark dark:text-white font-bold">
              {code.isRevealed ? code.decryptedCode : '••••••••••••'}
            </code>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            {code.isDecrypting ? (
              <ArrowPathIcon className="w-5 h-5 text-primary-bright animate-spin" />
            ) : (
              <button
                onClick={handleToggleReveal}
                className="p-1 hover:bg-neutral-medium/20 rounded "
                title={code.isRevealed ? 'Hide code' : 'Reveal code'}
              >
                {code.isRevealed ? (
                  <EyeSlashIcon className="w-5 h-5 text-neutral-dark dark:text-neutral-medium" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-primary-bright" />
                )}
              </button>
            )}
            {code.isRevealed && (
              <button
                onClick={() => onCopy(code.decryptedCode || '', code.id)}
                className="p-1 hover:bg-neutral-medium/20 rounded "
                title="Copy code"
              >
                {copiedCodeId === code.id ? (
                  <CheckIcon className="w-5 h-5 text-accent-success" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5 text-primary-bright" />
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
            <ExclamationCircleIcon className="w-5 h-5 text-accent-error" />
            <span className="font-sans text-small text-accent-error">{code.decryptionError}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-small">
          <span className="font-sans text-neutral-dark/80 dark:text-neutral-medium">
            Expires: {code.expires || 'No Expiry'}
          </span>
          {code.notes && (
            <span className="font-sans text-neutral-dark/80 dark:text-neutral-medium italic">
              {code.notes.length > 20 ? `${code.notes.substring(0, 20)}...` : code.notes}
            </span>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-light dark:border-neutral-medium/20">
          <button
            onClick={() => onEdit(code)}
            className="p-2 hover:bg-neutral-medium/20 rounded  group"
            title="Edit promo code"
          >
            <PencilSquareIcon className="w-5 h-5 text-neutral-dark/80 dark:text-neutral-medium group-hover:text-primary-bright" />
          </button>
          <button
            onClick={() => onDelete(code)}
            className="p-2 hover:bg-accent-error/10 rounded  group"
            title="Delete promo code"
          >
            <TrashIcon className="w-5 h-5 text-neutral-dark/80 dark:text-neutral-medium group-hover:text-accent-error" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PromoCodeCard;