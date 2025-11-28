import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Progress } from './ui/progress';

interface LoadingBarProps {
  className?: string;
  duration?: number; // Duration in milliseconds (default: 1500ms)
  stayVisible?: boolean; // Whether to keep the bar visible after loading (default: true)
}

export function LoadingBar({ 
  className = '', 
  duration = 1500, 
  stayVisible = true 
}: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Reset and start loading animation when route changes
    setProgress(0);
    setIsLoading(true);
    setIsVisible(true);

    // Simulate page loading with a smooth progress animation
    const startTime = Date.now();
    const targetProgress = 100;
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, targetProgress);
      
      // Smooth easing function for more natural progress
      const easedProgress = easeOutCubic(percentage / 100) * 100;
      
      setProgress(easedProgress);
      
      if (percentage < targetProgress) {
        requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        setIsLoading(false);
        
        // Hide the bar after completion if stayVisible is false
        if (!stayVisible) {
          setTimeout(() => {
            setIsVisible(false);
          }, 500); // Wait a bit before hiding
        }
      }
    };

    // Small delay to make the loading visible
    const initialDelay = setTimeout(() => {
      requestAnimationFrame(animateProgress);
    }, 50);

    return () => {
      clearTimeout(initialDelay);
    };
  }, [location.pathname, duration, stayVisible]);

  // Easing function for smooth animation
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Don't render on login/signup pages
  if (location.pathname.includes('login') || location.pathname.includes('signup')) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed top-16 left-0 right-0 z-40 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label={isLoading ? 'Page loading' : 'Page loaded'}
    >
      <Progress
        value={progress}
        className={`h-1 w-full rounded-none transition-opacity duration-300 ${
          stayVisible && !isLoading ? 'opacity-60' : 'opacity-100'
        }`}
      />
      
      {/* Loading pulse effect for better visual feedback */}
      {isLoading && (
        <div 
          className="absolute top-0 left-0 h-1 w-8 bg-primary/40 rounded-r-full animate-pulse"
          style={{
            transform: `translateX(${Math.max(0, progress - 8)}%)`,
            transition: 'transform 0.1s ease-out'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Screen reader announcements for accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading ? `Loading ${Math.round(progress)}%` : 'Page loaded successfully'}
      </div>
    </div>
  );
}
