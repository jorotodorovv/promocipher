import React, { useState } from 'react';
import { Tag, TrendingUp, Users, BarChart3, Copy, Eye } from 'lucide-react';
import Card from './ui/Card';

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const personalFeatures = [
    { icon: Tag, title: 'Smart Categories', description: 'Automatically categorize codes by store, type, or custom tags' },
    { icon: Copy, title: 'Quick Copy', description: 'One-click copying with automatic clipboard management' },
    { icon: Eye, title: 'Expiry Tracking', description: 'Never miss a deal with smart expiration notifications' }
  ];

  const businessFeatures = [
    { icon: Users, title: 'Team Sharing', description: 'Securely share promo codes across your organization' },
    { icon: BarChart3, title: 'Usage Analytics', description: 'Track which codes save your business the most money' },
    { icon: TrendingUp, title: 'Bulk Import', description: 'Import hundreds of codes from spreadsheets instantly' }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(activeTab === 'personal' ? personalFeatures : businessFeatures).map((feature, index) => (
            <Card 
              key={`${activeTab}-${index}`}
              className="text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-102 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-primary-bright to-primary-deep text-white max-w-4xl mx-auto text-center">
            <h3 className="font-pixel text-h3 mb-6 uppercase tracking-wide">
              Never Lose Money Again
            </h3>
            <p className="font-sans text-body mb-8 leading-relaxed opacity-90">
              The average person loses $200+ per year in expired or forgotten promo codes. 
              PromoCipher users save an average of $847 annually by never missing a discount.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-pixel text-h2 mb-2">$847</div>
                <div className="font-sans text-small opacity-80">Average Annual Savings</div>
              </div>
              <div>
                <div className="font-pixel text-h2 mb-2">95%</div>
                <div className="font-sans text-small opacity-80">Code Success Rate</div>
              </div>
              <div>
                <div className="font-pixel text-h2 mb-2">2.3s</div>
                <div className="font-sans text-small opacity-80">Average Search Time</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;