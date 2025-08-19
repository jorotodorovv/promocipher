import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-neutral-dark rounded-lg shadow-light dark:shadow-dark p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;