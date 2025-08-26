import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium">
          {icon}
        </div>
      )}
      <input
        className={`w-full px-4 py-3 bg-white dark:bg-neutral-dark border border-neutral-medium dark:border-neutral-medium/30 rounded focus:outline-none focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20 font-sans text-body text-neutral-dark dark:text-white placeholder-neutral-medium ${icon ? 'pl-12' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;