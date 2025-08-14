import React from 'react';
import { Terminal, Code2, Shield } from 'lucide-react';
import TerminalCode from './TerminalCode';

const TerminalSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-8 shadow-light animate-pulse-glow">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="font-pixel text-h2 text-white mb-6 uppercase tracking-wide">
              Military-Grade Encryption
            </h2>
            
            <p className="font-sans text-body text-neutral-medium mb-8 leading-relaxed">
              Watch PromoCipher's encryption engine in action. Every promo code is protected 
              with XChaCha20-Poly1305 encryption and Argon2id key derivation - the same 
              cryptographic standards used by security professionals.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-success rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-sans font-medium text-white mb-1">Zero-Knowledge Architecture</h4>
                  <p className="font-sans text-small text-neutral-medium">
                    Your master password never leaves your device
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-success rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-sans font-medium text-white mb-1">Authenticated Encryption</h4>
                  <p className="font-sans text-small text-neutral-medium">
                    Each record includes integrity verification
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-success rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-sans font-medium text-white mb-1">Unique Nonces</h4>
                  <p className="font-sans text-small text-neutral-medium">
                    Every encryption operation uses a fresh 24-byte nonce
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary-bright/10 border border-primary-bright/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Code2 className="w-5 h-5 text-primary-bright" />
                <span className="font-pixel text-small text-primary-bright uppercase tracking-wide">
                  Open Source
                </span>
              </div>
              <p className="font-sans text-small text-neutral-medium">
                Our encryption implementation is open source and audited by security experts. 
                Transparency builds trust.
              </p>
            </div>
          </div>

          {/* Right Terminal */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <TerminalCode className="w-full" />
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="font-pixel text-small text-primary-bright mb-2 uppercase">
                  XChaCha20
                </div>
                <div className="font-sans text-small text-neutral-medium">
                  Stream Cipher
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="font-pixel text-small text-primary-bright mb-2 uppercase">
                  Poly1305
                </div>
                <div className="font-sans text-small text-neutral-medium">
                  MAC Algorithm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="font-pixel text-h3 text-white mb-4 uppercase tracking-wide">
              Technical Specifications
            </h3>
            <p className="font-sans text-body text-neutral-medium">
              Built with modern cryptographic primitives for maximum security
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <Shield className="w-8 h-8 text-primary-bright mx-auto mb-4" />
              <h4 className="font-pixel text-small text-white mb-2 uppercase">
                Key Derivation
              </h4>
              <code className="font-code text-small text-neutral-medium block">
                Argon2id(m=64MiB, t=3)
              </code>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <Code2 className="w-8 h-8 text-primary-bright mx-auto mb-4" />
              <h4 className="font-pixel text-small text-white mb-2 uppercase">
                Encryption
              </h4>
              <code className="font-code text-small text-neutral-medium block">
                XChaCha20-Poly1305
              </code>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <Terminal className="w-8 h-8 text-primary-bright mx-auto mb-4" />
              <h4 className="font-pixel text-small text-white mb-2 uppercase">
                Nonce Size
              </h4>
              <code className="font-code text-small text-neutral-medium block">
                24 bytes (192 bits)
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;