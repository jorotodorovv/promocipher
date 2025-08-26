import React from 'react';
import { ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface EmptyStateProps {
  onAddCode: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddCode }) => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-light dark:bg-neutral-medium/20 rounded-lg mb-6">
        <ShieldCheckIcon className="w-11 h-11 text-neutral-medium" />
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
        onClick={onAddCode}
      >
        <PlusIcon className="w-6 h-6 mr-2" />
        Add Your First Code
      </Button>
    </div>
  );
};

export default EmptyState;