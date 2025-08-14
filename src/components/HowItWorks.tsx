import React, { useState } from 'react';
import { Smartphone, Monitor, Tablet, Copy, Check } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const HowItWorks: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sampleCodes = [
    { code: 'TECH25', store: 'TechMart', discount: '25% off electronics', expires: '2024-03-15' },
    { code: 'FREESHIP', store: 'QuickBuy', discount: 'Free shipping', expires: '2024-04-01' },
    { code: 'NEWUSER10', store: 'StyleHub', discount: '$10 off first order', expires: '2024-12-31' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            Your Codes, Everywhere
          </h2>
          <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium max-w-2xl mx-auto leading-relaxed">
            Access your encrypted promo codes seamlessly across all your devices. 
            Real-time sync keeps everything up to date.
          </p>
        </div>

        {/* Device Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Desktop
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
              Full-featured web app with keyboard shortcuts and bulk operations for power users.
            </p>
          </div>

          <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Mobile
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
              Native mobile apps with offline access and push notifications for expiring codes.
            </p>
          </div>

          <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <Tablet className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Tablet
            </h3>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
              Optimized tablet interface perfect for shopping sessions and code management.
            </p>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-deep to-primary-bright p-6 text-white">
              <h3 className="font-pixel text-h3 mb-2 uppercase tracking-wide">
                Live Demo
              </h3>
              <p className="font-sans text-body opacity-90">
                Try copying these sample promo codes
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {sampleCodes.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg border border-neutral-medium/20 hover:border-primary-bright/30 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <code className="font-code text-code bg-primary-bright text-white px-3 py-1 rounded font-bold">
                        {item.code}
                      </code>
                      <span className="font-sans text-small font-medium text-neutral-dark dark:text-white">
                        {item.store}
                      </span>
                    </div>
                    <p className="font-sans text-small text-neutral-medium">
                      {item.discount} • Expires {item.expires}
                    </p>
                  </div>
                  <Button
                    variant={copiedCode === item.code ? 'success' : 'secondary'}
                    size="small"
                    onClick={() => handleCopyCode(item.code)}
                    className="ml-4"
                  >
                    {copiedCode === item.code ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;