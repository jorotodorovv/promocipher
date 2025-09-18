import React from 'react';

interface ProductHuntBadgeProps {
  type: 'review' | 'follow';
  size?: 'small' | 'normal';
}

const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({ 
  type,
  size = 'normal' 
}) => {
  const width = size === 'small' ? 200 : 250;
  const height = size === 'small' ? 43 : 54;
  
  // Define badge properties based on type
  const badgeProps = type === 'review' 
    ? {
        href: 'https://www.producthunt.com/products/promocipher/reviews?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-promocipher',
        lightImgSrc: 'https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1106857&theme=light',
        darkImgSrc: 'https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1106857&theme=dark',
        alt: 'Promocipher - Never lose another discount code again | Product Hunt'
      }
    : {
        href: 'https://www.producthunt.com/products/promocipher?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-promocipher',
        lightImgSrc: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015026&theme=light&t=1758181842776',
        darkImgSrc: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015026&theme=dark&t=1758181907663',
        alt: 'PromoCipher - Never lose another discount code again | Product Hunt'
      };

  return (
    <div className="flex flex-col items-center">
      <a 
        href={badgeProps.href} 
        target="_blank"
        className="block dark:hidden"
        rel="noopener noreferrer"
      >
        <img 
          src={badgeProps.lightImgSrc} 
          alt={badgeProps.alt} 
          style={{ width: `${width}px`, height: `${height}px` }} 
          width={width} 
          height={height} 
        />
      </a>
      <a 
        href={badgeProps.href} 
        target="_blank"
        className="hidden dark:block"
        rel="noopener noreferrer"
      >
        <img 
          src={badgeProps.darkImgSrc} 
          alt={badgeProps.alt} 
          style={{ width: `${width}px`, height: `${height}px` }} 
          width={width} 
          height={height} 
        />
      </a>
    </div>
  );
};

export default ProductHuntBadge;