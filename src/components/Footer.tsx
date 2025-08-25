import React from 'react';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-deep py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <h3 className="font-pixel text-small text-white uppercase tracking-wider">
                PromoCipher
              </h3>
            </div>
            <p className="font-sans text-small text-neutral-light/80 max-w-md">
              Secure promo code storage with enterprise-grade encryption. 
              Built for developers, designed for everyone.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-small font-bold text-white mb-4 uppercase tracking-wider">
              Product
            </h4>
            <div className="space-y-2">
              <a href="#features" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#security" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Security
              </a>
              <a href="#pricing" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Pricing
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-sans text-small font-bold text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <div className="space-y-2">
              <a href="#about" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                About Us
              </a>
              <a href="#blog" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Blog
              </a>
              <a href="#careers" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Careers
              </a>
              <a href="#contact" className="block font-sans text-small text-neutral-light/80 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="font-sans text-small text-neutral-light/60 mb-4 md:mb-0">
            © 2025 PromoCipher. Securing your savings, one code at a time.
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-4 h-4 text-neutral-light/60" />
              <span className="font-code text-small text-neutral-light/60">256-bit Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-neutral-light/60" />
              <span className="font-code text-small text-neutral-light/60">SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;