import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PlusIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ActionBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCode: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDeleteAll: () => void;
  isExporting?: boolean;
  isImporting?: boolean;
  searchLoading?: boolean;
  isDeleting?: boolean;
  totalCount?: number;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddCode,
  onExport,
  onImport,
  onDeleteAll,
  isExporting = false,
  isImporting = false,
  searchLoading = false,
  isDeleting = false,
  totalCount = 0
}) => {
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={searchLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <MagnifyingGlassIcon className="w-6 h-6" />}
          />
        </div>
        {totalCount > 0 && (
          <Button
            variant="danger"
            size="medium"
            onClick={onDeleteAll}
            disabled={isDeleting}
            title="Delete all promo codes"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete All'}
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="medium">
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
          Filter
        </Button>
        <Button 
          variant="secondary" 
          size="medium" 
          onClick={handleImportClick}
          disabled={isImporting}
        >
          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
        <Button 
          variant="secondary" 
          size="medium" 
          onClick={onExport}
          disabled={isExporting}
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
        <Button 
          variant="primary" 
          size="medium"
          onClick={onAddCode}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Code
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;