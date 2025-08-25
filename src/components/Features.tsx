import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, ArrowsPointingOutIcon, UserGroupIcon, ChartBarIcon, DocumentDuplicateIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from './ui/Card';

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const personalFeatures = [
    { icon: TagIcon, title: 'Smart Categories', description: 'Automatically categorize codes by store, type, or custom tags' },
    { icon: DocumentDuplicateIcon, title: 'Quick Copy', description: 'One-click copying with automatic clipboard management' },
    { icon: ClockIcon, title: 'Expiry Tracking', description: 'Never miss a deal with smart expiration notifications' }
  ];

  const businessFeatures = [
    { icon: UserGroupIcon, title: 'Team Sharing', description: 'Securely share promo codes across your organization' },
    { icon: ChartBarIcon, title: 'Usage Analytics', description: 'Track which codes save your business the most money' },
    { icon: ArrowsPointingOutIcon, title: 'Bulk Import', description: 'Import hundreds of codes from spreadsheets instantly' }
  ];

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
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            Features That Save Money
          </h2>
          <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium max-w-2xl mx-auto leading-relaxed">
            Whether you're an individual saver or managing codes for your entire business, 
            PromoCipher has the tools you need.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-2 shadow-light dark:shadow-dark">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 rounded font-sans font-medium transition-all duration-200 ${
                activeTab === 'personal'
                  ? 'bg-primary-bright text-white shadow-light'
                  : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-medium/20'
              }`}
            >
              Personal Use
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-6 py-3 rounded font-sans font-medium transition-all duration-200 ${
                activeTab === 'business'
                  ? 'bg-primary-bright text-white shadow-light'
                  : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-medium/20'
              }`}
            >
              Business
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(activeTab === 'personal' ? personalFeatures : businessFeatures).map((feature, index) => (
            <motion.div
              key={`${activeTab}-${index}`}
              variants={itemVariants}
            >
              <Card className="text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300 h-full">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;