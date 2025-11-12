import React from 'react';

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className = '', children }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default Avatar;
