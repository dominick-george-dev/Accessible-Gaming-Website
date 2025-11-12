// Enhanced Standalone Toaster Component
import React from 'react';
import { toast as sonnerToast, Toaster as SonnerToaster, type ToasterProps } from 'sonner';

// Enhanced toast functions with more options
export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => 
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    }),
    
  error: (message: string, options?: { description?: string; duration?: number }) => 
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
    }),
    
  info: (message: string, options?: { description?: string; duration?: number }) => 
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    }),
    
  warning: (message: string, options?: { description?: string; duration?: number }) => 
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    }),
  custom: (jsx: (id: string | number) => React.ReactElement, options?: { duration?: number }) =>
    sonnerToast.custom(jsx, {
      duration: options?.duration || 4000,
    }),

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => sonnerToast.promise(promise, options),
};

// Enhanced Toaster component with theme detection
interface EnhancedToasterProps extends Omit<ToasterProps, 'theme'> {
  theme?: 'light' | 'dark' | 'system';
}

export const Toaster: React.FC<EnhancedToasterProps> = ({ 
  theme = 'system',
  position = 'bottom-right',
  closeButton = true,
  richColors = true,
  expand = true,
  ...props 
}) => {
  // Auto-detect theme from CSS variables or system preference
  const getTheme = () => {
    if (theme !== 'system') return theme;
    
    // Check if dark class is present on body/html
    if (document.documentElement.classList.contains('dark') || 
        document.documentElement.classList.contains('deep-space') ||
        document.body.classList.contains('dark') ||
        document.body.classList.contains('deep-space')) {
      return 'dark';
    }
    
    // Check CSS variable for background color
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();
    
    if (bgColor && (bgColor.includes('0.1') || bgColor.includes('black') || bgColor.includes('#0'))) {
      return 'dark';
    }
    
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [currentTheme, setCurrentTheme] = React.useState(getTheme());
  // Listen for theme changes
  React.useEffect(() => {
    const updateTheme = () => setCurrentTheme(getTheme());
    
    // Listen for class changes on document
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, [getTheme]);

  return (
    <SonnerToaster
      theme={currentTheme}
      position={position}
      closeButton={closeButton}
      richColors={richColors}
      expand={expand}
      toastOptions={{
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        },
        className: 'sonner-toast',
      }}
      {...props}
    />
  );
};

export default toast;
