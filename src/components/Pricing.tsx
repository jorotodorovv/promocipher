import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Personal',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for individual users who want to secure their promo codes',
      features: [
        'Store up to 25 promo codes',
        'AES-256 encryption',
        'Cross-device sync',
        'Basic search & categories',
        'Email support'
      ],
      cta: 'Get Started Free',
      variant: 'secondary' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: 'per month',
      description: 'For power users and small businesses who need advanced features',
      features: [
        'Unlimited promo codes',
        'Advanced search & filters',
        'Bulk import/export',
        'Expiry notifications',
        'Priority support',
        'API access',
        'Custom categories'
      ],
      cta: 'Start Pro Trial',
      variant: 'primary' as const,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact us',
      description: 'For large organizations with advanced security and compliance needs',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced analytics',
        'SSO integration',
        'Compliance reporting',
        'Dedicated support',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      variant: 'secondary' as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">
            Simple Pricing
          </h2>
          <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. All plans include our core security features 
            and 30-day money-back guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative text-center hover:shadow-hover-light dark:hover:shadow-hover-dark transform hover:scale-105 transition-all duration-300 animate-slide-up ${
                plan.popular ? 'ring-2 ring-primary-bright' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-bright text-white px-4 py-2 rounded-full shadow-light">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span className="font-sans text-small font-bold uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8">
                <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
                  {plan.name}
                </h3>
                
                <div className="mb-6">
                  <div className="font-pixel text-h2 text-primary-bright mb-2">
                    {plan.price}
                  </div>
                  <div className="font-sans text-small text-neutral-medium">
                    {plan.period}
                  </div>
                </div>

                <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-8 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-accent-success flex-shrink-0" />
                      <span className="font-sans text-body text-neutral-dark dark:text-neutral-medium text-left">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.variant} 
                  size="large" 
                  className="w-full"
                >
                  {plan.popular && <Zap className="w-5 h-5 mr-2" />}
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;