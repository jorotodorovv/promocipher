import React from 'react';
import { Shield, ArrowRight, Play, ShieldEllipsis } from 'lucide-react';
import Button from './ui/Button';

interface LandingHeroProps {
  onDashboardAccess: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onDashboardAccess }) => {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233096F3' fill-opacity='1'%3E%3Crect width='4' height='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-bright rounded-lg mb-8 shadow-light dark:shadow-dark animate-pulse-glow">
            <ShieldEllipsis className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="font-pixel text-h1 md:text-5xl text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            PROMOCIPHER
          </h1>
          
          <p className="font-pixel text-h3 text-primary-bright mb-8 uppercase tracking-wider">
            Never lose another discount code again.
          </p>
          
          <p className="font-sans text-body md:text-xl text-neutral-dark dark:text-neutral-medium max-w-3xl mx-auto leading-relaxed mb-12">
            We encrypt and organize your promo codes 
            with military-grade security, making them accessible whenever you need them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="primary" size="large" className="w-full sm:w-auto" onClick={onDashboardAccess}>
              <Shield className="w-5 h-5 mr-2" />
              Start Securing Codes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="font-pixel text-h2 text-primary-bright mb-2 uppercase">
              256-BIT
            </div>
            <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
              Military-grade encryption
            </p>
          </div>
          
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="font-pixel text-h2 text-primary-bright mb-2 uppercase">
              10,000+
            </div>
            <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
              Codes safely stored
            </p>
          </div>
          
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="font-pixel text-h2 text-primary-bright mb-2 uppercase">
              99.9%
            </div>
            <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
              Uptime guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;