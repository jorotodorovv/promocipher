import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-sans font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-102 active:scale-98 inline-flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary-bright hover:bg-primary-deep text-white focus:ring-primary-bright shadow-light dark:shadow-dark hover:shadow-hover-light dark:hover:shadow-hover-dark',
    secondary: 'border-2 border-primary-bright text-primary-bright hover:bg-primary-bright hover:text-white focus:ring-primary-bright',
    success: 'bg-accent-success hover:bg-accent-success/90 text-white focus:ring-accent-success shadow-light dark:shadow-dark',
    danger: 'bg-accent-error hover:bg-accent-error/90 text-white focus:ring-accent-error shadow-light dark:shadow-dark',
    warning: 'bg-accent-warning hover:bg-accent-warning/90 text-neutral-dark focus:ring-accent-warning shadow-light dark:shadow-dark'
  };
  
  const sizeClasses = {
    small: 'px-3 py-2 text-small',
    medium: 'px-4 py-3 text-body',
    large: 'px-6 py-4 text-body'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export default Button;