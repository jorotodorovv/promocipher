import React from 'react';
import { Shield } from 'lucide-react';
import { LockClosedIcon, ArrowRightIcon, CloudArrowDownIcon, GlobeAltIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import Button from './ui/Button';
import Card from './ui/Card';

interface CTAProps {
  onDashboardAccess: () => void;
}

const CTA: React.FC<CTAProps> = ({ onDashboardAccess }) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <Card className="bg-gradient-to-r from-primary-bright to-primary-deep text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-lg mb-8">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>

            <h2 className="font-pixel text-h2 mb-6 uppercase tracking-wide">
              Ready to Secure Your Savings?
            </h2>

            <p className="font-sans text-body mb-8 leading-relaxed opacity-90 max-w-2xl mx-auto">
              Join the other smart shoppers who never miss a discount. Start your free account today
              and experience the peace of mind that comes with secure promo code storage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button variant="secondary" size="large" className="w-full sm:w-auto bg-white text-primary-bright hover:bg-neutral-light border-white" onClick={onDashboardAccess}>
                <Shield className="w-5 h-5 mr-2" />
                Create Free Account
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTA;