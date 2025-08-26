import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface NoMatchesStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const NoMatchesState: React.FC<NoMatchesStateProps> = ({ searchTerm, onClearSearch }) => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-light dark:bg-neutral-medium/20 rounded-lg mb-6">
        <MagnifyingGlassIcon className="w-11 h-11 text-neutral-medium" />
      </div>
      <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
        No Matches Found
      </h3>
      <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-8 max-w-md mx-auto">
        No promo codes match your search for <span className="font-semibold text-primary-bright">"{searchTerm}"</span>.
        Try adjusting your search terms or clear the search to see all codes.
      </p>
      <Button 
        variant="secondary" 
        size="medium"
        onClick={onClearSearch}
      >
        <XMarkIcon className="w-5 h-5 mr-2" />
        Clear Search
      </Button>
    </div>
  );
};

export default NoMatchesState;