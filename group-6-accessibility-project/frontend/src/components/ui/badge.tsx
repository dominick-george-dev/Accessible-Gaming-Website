import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variants = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 bg-transparent dark:border-gray-600'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
