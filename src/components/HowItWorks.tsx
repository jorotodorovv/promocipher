import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon } from '@heroicons/react/24/solid';
import Card from './ui/Card';
import PromoCodeCard from './dashboard/PromoCodeCard';

const HowItWorks: React.FC = () => {
  // Sample promo codes that match the DisplayPromoCode interface
  const sampleCodes = [
    {
      id: '1',
      user_id: 'user1',
      encrypted_data: 'encrypted1',
      nonce: 'nonce1',
      tag: 'tag1',
      store: 'TechMart',
      discount: '25% off electronics',
      expires: '2024-03-15',
      notes: 'Valid on all electronics',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      decryptedCode: 'TECH25',
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    },
    {
      id: '2',
      user_id: 'user1',
      encrypted_data: 'encrypted2',
      nonce: 'nonce2',
      tag: 'tag2',
      store: 'QuickBuy',
      discount: 'Free shipping',
      expires: '2024-04-01',
      notes: 'Minimum order $50',
      created_at: '2023-01-02',
      updated_at: '2023-01-02',
      decryptedCode: 'FREESHIP',
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    },
    {
      id: '3',
      user_id: 'user1',
      encrypted_data: 'encrypted3',
      nonce: 'nonce3',
      tag: 'tag3',
      store: 'StyleHub',
      discount: '$10 off first order',
      expires: '2024-12-31',
      notes: 'New customers only',
      created_at: '2023-01-03',
      updated_at: '2023-01-03',
      decryptedCode: 'NEWUSER10',
      isRevealed: false,
      isDecrypting: false,
      decryptionError: null
    }
  ];

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});

  const handleToggleReveal = (codeId: string) => {
    setRevealedCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };

  const handleCopy = async (codeText: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleEdit = () => {
    // No-op for demo
  };

  const handleDelete = () => {
    // No-op for demo
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            Your Codes, Everywhere
          </h2>
          <p className="font-sans text-body text-neutral-dark/90 dark:text-neutral-medium max-w-2xl mx-auto leading-relaxed">
            Access your encrypted promo codes seamlessly across all your devices. 
            Real-time sync keeps everything up to date.
          </p>
        </div>

        {/* Device Showcase */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <ComputerDesktopIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Desktop
            </h3>
            <p className="font-sans text-body text-neutral-dark/80 dark:text-neutral-medium leading-relaxed">
              Full-featured web app with keyboard shortcuts and bulk operations for power users.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Mobile
            </h3>
            <p className="font-sans text-body text-neutral-dark/80 dark:text-neutral-medium leading-relaxed">
              Native mobile apps with offline access and push notifications for expiring codes.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
              <DeviceTabletIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
              Tablet
            </h3>
            <p className="font-sans text-body text-neutral-dark/80 dark:text-neutral-medium leading-relaxed">
              Optimized tablet interface perfect for shopping sessions and code management.
            </p>
          </motion.div>
        </motion.div>

        {/* Interactive Demo */}
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-deep to-primary-bright p-6 text-white">
              <h3 className="font-pixel text-h3 mb-2 uppercase tracking-wide">
                Live Demo
              </h3>
              <p className="font-sans text-body opacity-90">
                Try interacting with these sample promo codes
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleCodes.map((code, index) => (
                <PromoCodeCard
                  key={code.id}
                  code={{
                    ...code,
                    isRevealed: revealedCodes[code.id] || false,
                    decryptedCode: revealedCodes[code.id] ? code.decryptedCode : null
                  }}
                  index={index}
                  copiedCodeId={copiedCodeId}
                  onToggleReveal={handleToggleReveal}
                  onCopy={handleCopy}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;