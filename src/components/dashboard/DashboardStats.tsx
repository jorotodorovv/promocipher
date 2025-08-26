import React from 'react';
import Card from '../ui/Card';

interface DashboardStatsProps {
  totalCodes: number;
  activeCodes: number;
  expiringSoon: number;
  expiredCodes: number;
  onFilterChange: (filter: 'all' | 'active' | 'expiring' | 'expired') => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCodes,
  activeCodes,
  expiringSoon,
  expiredCodes,
  onFilterChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="text-center cursor-pointer hover:bg-neutral-light dark:hover:bg-neutral-dark " onClick={() => onFilterChange('all')}>
        <div className="font-pixel text-h3 text-primary-bright mb-2">
          {totalCodes}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Total Codes
        </p>
      </Card>
      <Card className="text-center cursor-pointer hover:bg-neutral-light dark:hover:bg-neutral-dark " onClick={() => onFilterChange('active')}>
        <div className="font-pixel text-h3 text-accent-success mb-2">
          {activeCodes}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Active Codes
        </p>
      </Card>
      <Card className="text-center cursor-pointer hover:bg-neutral-light dark:hover:bg-neutral-dark " onClick={() => onFilterChange('expiring')}>
        <div className="font-pixel text-h3 text-accent-warning mb-2">
          {expiringSoon}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Expiring Soon
        </p>
      </Card>
      <Card className="text-center cursor-pointer hover:bg-neutral-light dark:hover:bg-neutral-dark " onClick={() => onFilterChange('expired')}>
        <div className="font-pixel text-h3 text-accent-danger mb-2">
          {expiredCodes}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Expired Codes
        </p>
      </Card>
    </div>
  );
};

export default DashboardStats;