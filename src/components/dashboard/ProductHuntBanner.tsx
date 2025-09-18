import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface ProductHuntBannerProps {
  userId: string;
}

const ProductHuntBanner: React.FC<ProductHuntBannerProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the banner has already been shown to this user
    const bannerKey = `product_hunt_banner_shown_${userId}`;
    const hasBeenShown = localStorage.getItem(bannerKey);
    
    if (!hasBeenShown) {
      // Show the banner after 30 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Mark as shown in localStorage
        localStorage.setItem(bannerKey, 'true');
      }, 30000); // 30 seconds delay

      return () => clearTimeout(timer);
    }
  }, [userId]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center">
        <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
          Enjoying PromoCipher?
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-6">
          We'd love your support on Product Hunt! Your vote helps us reach more users who need to securely manage their promo codes.
        </p>
        
        {/* Product Hunt Badges */}
        <div className="flex flex-col items-center justify-center gap-4">
          <a 
            href="https://www.producthunt.com/products/promocipher?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-promocipher" 
            target="_blank"
            className="block dark:hidden"
            rel="noopener noreferrer"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015026&theme=light&t=1758181842776" 
              alt="PromoCipher - Never lose another discount code again | Product Hunt" 
              style={{ width: '250px', height: '54px' }} 
              width="250" 
              height="54" 
            />
          </a>
          <a 
            href="https://www.producthunt.com/products/promocipher?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-promocipher" 
            target="_blank"
            className="hidden dark:block"
            rel="noopener noreferrer"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015026&theme=dark&t=1758181907663" 
              alt="PromoCipher - Never lose another discount code again | Product Hunt" 
              style={{ width: '250px', height: '54px' }} 
              width="250" 
              height="54" 
            />
          </a>
        </div>
        
        <button
          onClick={handleClose}
          className="mt-6 font-sans text-small text-neutral-medium hover:text-neutral-dark dark:hover:text-white underline"
        >
          Continue using PromoCipher
        </button>
      </div>
    </Modal>
  );
};

export default ProductHuntBanner;