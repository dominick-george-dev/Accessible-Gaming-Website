import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  disabled = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSelect = (newValue: string, label: string) => {
    onValueChange(newValue);
    setSelectedLabel(label);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <SelectContext.Provider value={{ value, onValueChange: handleSelect, selectedLabel, setSelectedLabel }}>
        <SelectTriggerContext.Provider value={{ isOpen, setIsOpen, disabled, triggerRef }}>
          <SelectContentContext.Provider value={{ isOpen, contentRef }}>
            {children}
          </SelectContentContext.Provider>
        </SelectTriggerContext.Provider>
      </SelectContext.Provider>
    </div>
  );
};

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string, label: string) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
} | null>(null);

const SelectTriggerContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
} | null>(null);

const SelectContentContext = React.createContext<{
  isOpen: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
} | null>(null);

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  const triggerContext = React.useContext(SelectTriggerContext);
  
  if (!triggerContext) throw new Error('SelectTrigger must be used within Select');
  
  const { isOpen, setIsOpen, disabled, triggerRef } = triggerContext;

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={`
        flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-gray-600 dark:bg-gray-800
        ${className}
      `}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = 'Select...' }) => {
  const selectContext = React.useContext(SelectContext);
  
  if (!selectContext) throw new Error('SelectValue must be used within Select');
  
  const { selectedLabel } = selectContext;

  return <span>{selectedLabel || placeholder}</span>;
};

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const contentContext = React.useContext(SelectContentContext);
  
  if (!contentContext) throw new Error('SelectContent must be used within Select');
  
  const { isOpen, contentRef } = contentContext;

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
      role="listbox"
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, disabled = false }) => {
  const selectContext = React.useContext(SelectContext);
  
  if (!selectContext) throw new Error('SelectItem must be used within Select');
  
  const { value: selectedValue, onValueChange } = selectContext;
  const isSelected = value === selectedValue;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value, children?.toString() || '');
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={`
        cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default Select;
