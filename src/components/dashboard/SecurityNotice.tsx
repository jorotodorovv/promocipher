import React from 'react';
import { Shield } from 'lucide-react';
import Card from '../ui/Card';

const SecurityNotice: React.FC = () => {
  return (
    <div className="mt-16">
      <Card className="bg-primary-bright/10 border border-primary-bright/20 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-primary-bright" />
          <h3 className="font-pixel text-h3 text-primary-bright uppercase tracking-wide">
            Zero-Knowledge Security
          </h3>
        </div>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
          Your promo codes are encrypted on your device before being stored. 
          We cannot see your codes even if we wanted to - that's the power of zero-knowledge architecture.
        </p>
      </Card>
    </div>
  );
};

export default SecurityNotice;