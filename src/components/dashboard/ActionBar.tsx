import React from 'react';
import { Search, Filter, Download, Upload, Plus, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ActionBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCode: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isExporting?: boolean;
  isImporting?: boolean;
  searchLoading?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddCode,
  onExport,
  onImport,
  isExporting = false,
  isImporting = false,
  searchLoading = false
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
      <div className="flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Search promo codes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        />
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="medium">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button 
          variant="secondary" 
          size="medium" 
          onClick={handleImportClick}
          disabled={isImporting}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
        <Button 
          variant="secondary" 
          size="medium" 
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
        <Button 
          variant="primary" 
          size="medium"
          onClick={onAddCode}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Code
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;