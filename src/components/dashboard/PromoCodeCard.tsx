import React from 'react';
import { Eye, EyeOff, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import type { DisplayPromoCode } from '../../types/promoCode';

interface PromoCodeCardProps {
  code: DisplayPromoCode;
  index: number;
  copiedCodeId: string | null;
  onToggleReveal: (codeId: string) => void;
  onCopy: (codeText: string, codeId: string) => void;
}

const PromoCodeCard: React.FC<PromoCodeCardProps> = ({
  code,
  index,
  copiedCodeId,
  onToggleReveal,
  onCopy
}) => {
  const isExpired = new Date(code.expires) <= new Date();

  return (
    <Card 
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
            isExpired ? 'bg-accent-error' : 'bg-accent-success'
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
                onClick={() => onToggleReveal(code.id)}
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
                onClick={() => onCopy(code.decryptedCode || '', code.id)}
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
  );
};

export default PromoCodeCard;