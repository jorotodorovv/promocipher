import React from 'react';
import { Shield, ArrowRight, Download, Globe,Smartphone } from 'lucide-react';
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="font-pixel text-h2 mb-6 uppercase tracking-wide">
              Ready to Secure Your Savings?
            </h2>
            
            <p className="font-sans text-body mb-8 leading-relaxed opacity-90 max-w-2xl mx-auto">
              Join thousands of smart shoppers who never miss a discount. Start your free account today 
              and experience the peace of mind that comes with secure promo code storage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button variant="secondary" size="large" className="w-full sm:w-auto bg-white text-primary-bright hover:bg-neutral-light border-white" onClick={onDashboardAccess}>
                <Shield className="w-5 h-5 mr-2" />
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="large" className="w-full sm:w-auto border-white/50 text-white hover:bg-white/10">
                <Download className="w-5 h-5 mr-2" />
                Download App
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-small opacity-80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="font-sans">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="font-sans">30-day money back</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="font-sans">Cancel anytime</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-dark rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Web App
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-6 leading-relaxed">
              Access PromoCipher from any browser. No downloads required.
            </p>
            <Button variant="primary" size="medium" className="w-full">
              Launch Web App
            </Button>
          </Card>

          <Card className="text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-dark rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Desktop App
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-6 leading-relaxed">
              Native desktop application for Windows, macOS, and Linux.
            </p>
            <Button variant="secondary" size="medium" className="w-full">
              Download Desktop
            </Button>
          </Card>

          <Card className="text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-dark rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Mobile Apps
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-6 leading-relaxed">
              iOS and Android apps with offline access and notifications.
            </p>
            <Button variant="secondary" size="medium" className="w-full">
              Get Mobile App
            </Button>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="font-sans text-small text-neutral-medium mb-8">
            Trusted by developers and businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="font-pixel text-small text-neutral-dark dark:text-neutral-medium uppercase">
              TechCorp
            </div>
            <div className="font-pixel text-small text-neutral-dark dark:text-neutral-medium uppercase">
              StartupXYZ
            </div>
            <div className="font-pixel text-small text-neutral-dark dark:text-neutral-medium uppercase">
              DevTeam Inc
            </div>
            <div className="font-pixel text-small text-neutral-dark dark:text-neutral-medium uppercase">
              CodeCraft
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;