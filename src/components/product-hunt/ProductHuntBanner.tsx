import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import ProductHuntBadge from "./ProductHuntBadge";

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
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Mark as shown in localStorage
        localStorage.setItem(bannerKey, "true");
      }, 120000); // 2 minutes delay

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
          We'd love your support on Product Hunt! Your vote helps us reach more
          users who need to securely manage their promo codes.
        </p>

        {/* Product Hunt Review Badge */}
        <ProductHuntBadge type="review" />

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
