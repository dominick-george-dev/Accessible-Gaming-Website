import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full 
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export default Switch;
