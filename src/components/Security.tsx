import React from 'react';
import { Shield, Lock, Key, Server, Eye, CheckCircle } from 'lucide-react';
import Card from './ui/Card';

const Security: React.FC = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'AES-256 Encryption',
      description: 'Military-grade encryption protects your data both in transit and at rest',
      technical: 'Advanced Encryption Standard with 256-bit keys'
    },
    {
      icon: Key,
      title: 'Zero-Knowledge Architecture',
      description: 'Your master password never leaves your device - we cannot see your data',
      technical: 'Client-side encryption with PBKDF2 key derivation'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Hosted on enterprise-grade servers with 99.9% uptime guarantee',
      technical: 'AWS infrastructure with SOC 2 Type II compliance'
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'No tracking, no ads, no data mining - your privacy is our priority',
      technical: 'GDPR compliant with minimal data collection'
    }
  ];

  const certifications = [
    'SOC 2 Type II Certified',
    'GDPR Compliant',
    'ISO 27001 Standards',
    'PCI DSS Level 1',
    'HIPAA Ready',
    'Zero Trust Architecture'
  ];

  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-bright rounded-lg mb-8 shadow-light dark:shadow-dark animate-pulse-glow">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            Enterprise Security
          </h2>
          <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium max-w-2xl mx-auto leading-relaxed">
            Your promo codes are protected by the same security standards used by banks and government agencies.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-bright rounded-lg shadow-light dark:shadow-dark">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-3 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <code className="font-code text-small text-primary-bright bg-primary-bright/10 px-2 py-1 rounded">
                    {feature.technical}
                  </code>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Security Certifications */}
        <div className="text-center">
          <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-8 uppercase tracking-wide">
            Certifications & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 p-4 bg-accent-success/10 border border-accent-success/20 rounded-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CheckCircle className="w-5 h-5 text-accent-success flex-shrink-0" />
                <span className="font-sans text-small text-accent-success font-medium">
                  {cert}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Guarantee */}
        <div className="mt-16">
          <Card className="bg-neutral-dark text-white max-w-3xl mx-auto text-center">
            <h3 className="font-pixel text-h3 mb-6 uppercase tracking-wide text-primary-bright">
              Security Guarantee
            </h3>
            <p className="font-sans text-body mb-6 leading-relaxed">
              We're so confident in our security that we offer a <strong>$10,000 bug bounty</strong> for 
              anyone who can compromise our encryption. Your data has never been safer.
            </p>
            <div className="bg-primary-bright/10 border border-primary-bright/20 rounded-lg p-4">
              <code className="font-code text-small text-primary-bright">
                Security Audit: Last performed December 2024 ✓
              </code>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Security;