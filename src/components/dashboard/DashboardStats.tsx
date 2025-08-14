import React from 'react';
import { Shield } from 'lucide-react';
import Card from '../ui/Card';

interface DashboardStatsProps {
  totalCodes: number;
  activeCodes: number;
  expiringSoon: number;
  estimatedSavings: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCodes,
  activeCodes,
  expiringSoon,
  estimatedSavings
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="text-center">
        <div className="font-pixel text-h3 text-primary-bright mb-2">
          {totalCodes}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Total Codes
        </p>
      </Card>
      <Card className="text-center">
        <div className="font-pixel text-h3 text-accent-success mb-2">
          {activeCodes}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Active Codes
        </p>
      </Card>
      <Card className="text-center">
        <div className="font-pixel text-h3 text-accent-warning mb-2">
          {expiringSoon}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Expiring Soon
        </p>
      </Card>
      <Card className="text-center">
        <div className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2">
          {estimatedSavings}
        </div>
        <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
          Est. Savings
        </p>
      </Card>
    </div>
  );
};

export default DashboardStats;