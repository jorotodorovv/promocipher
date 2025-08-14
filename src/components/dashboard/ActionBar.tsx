import React from 'react';
import { Search, Filter, Download, Upload, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ActionBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCode: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddCode
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Search promo codes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="medium">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="secondary" size="medium">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button variant="secondary" size="medium">
          <Download className="w-4 h-4 mr-2" />
          Export
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