import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-neutral-dark rounded-lg shadow-light dark:shadow-dark p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;