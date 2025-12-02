import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface MagnifierProps {
  isActive: boolean;
  magnification?: number;
  size?: number;
}

export function Magnifier({ isActive, magnification = 2, size = 200 }: MagnifierProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled refresh function to prevent too many updates
  const throttledRefresh = () => {
    if (refreshTimeoutRef.current) return;
    
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      refreshTimeoutRef.current = null;
    }, 50); // Throttle to max 20 updates per second
  };

  useEffect(() => {
    if (!isActive) {
      setShowMagnifier(false);
      document.body.classList.remove('magnifier-active');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      return;
    }

    document.body.classList.add('magnifier-active');

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setShowMagnifier(true);
    };

    const handleMouseLeave = () => {
      setShowMagnifier(false);
    };

    // Handle scroll events to refresh the magnifier
    const handleScroll = () => {
      throttledRefresh();
    };

    // Handle resize events to refresh the magnifier
    const handleResize = () => {
      throttledRefresh();
    };

    // Observe DOM changes to refresh the magnifier (for page changes, dynamic content, etc.)
    const observer = new MutationObserver(() => {
      throttledRefresh();
    });

    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'], // Only watch for class and style changes
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('scroll', handleScroll, true); // Use capture phase to catch all scrolls
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isActive]);

  // Capture the screen content under the cursor
  useEffect(() => {
    if (!isActive || !showMagnifier || !canvasRef.current) return;

    const captureContent = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        // Use html2canvas or similar library would be ideal, but for now
        // we'll capture using a different approach
        
        // Clear the canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw a copy of the body content at the magnified position
        // This is a simplified version - in production, you'd use html2canvas
        
        // For now, we'll use a different approach: rendering text and basic content
        const element = document.elementFromPoint(position.x, position.y);
        if (element && element !== canvas && !element.closest('.magnifier-lens')) {
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          
          // Set background
          ctx.fillStyle = computedStyle.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, size, size);
          
          // Set text style
          ctx.fillStyle = computedStyle.color || '#000000';
          ctx.font = `${parseFloat(computedStyle.fontSize) * magnification}px ${computedStyle.fontFamily}`;
          ctx.textBaseline = 'top';
          
          // Calculate the offset within the magnified view
          const offsetX = (size / 2) - ((position.x - rect.left) * magnification);
          const offsetY = (size / 2) - ((position.y - rect.top) * magnification);
          
          // Draw text content
          const text = element.textContent?.trim() || '';
          if (text) {
            const lines = text.split('\n').slice(0, 10); // Limit lines
            lines.forEach((line, i) => {
              ctx.fillText(
                line.substring(0, 50), 
                offsetX, 
                offsetY + (i * parseFloat(computedStyle.fontSize) * magnification * 1.2)
              );
            });
          }
        }
      } catch (error) {
        console.debug('Canvas capture:', error);
      }

      animationFrameRef.current = requestAnimationFrame(captureContent);
    };

    animationFrameRef.current = requestAnimationFrame(captureContent);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, showMagnifier, position, size, magnification]);

  if (!isActive || !showMagnifier) {
    return null;
  }

  // Calculate position to keep magnifier on screen
  const magnifierX = Math.min(
    Math.max(position.x - size / 2, 10),
    window.innerWidth - size - 10
  );
  const magnifierY = Math.min(
    Math.max(position.y - size - 30, 10),
    window.innerHeight - size - 10
  );

  return (
    <>
      {/* Highlight circle at cursor position */}
      <div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size / magnification}px`,
          height: `${size / magnification}px`,
          transform: 'translate(-50%, -50%)',
          border: '3px solid rgba(59, 130, 246, 0.8)',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
        aria-hidden="true"
      />
      
      {/* Magnified view - Using CSS Transform approach */}
      <MagnifiedView
        x={position.x}
        y={position.y}
        magnification={magnification}
        size={size}
        magnifierX={magnifierX}
        magnifierY={magnifierY}
        refreshKey={refreshKey}
      />

      {/* Magnification level indicator */}
      <div 
        className="fixed pointer-events-none z-[10001]"
        style={{
          left: `${magnifierX + size / 2}px`,
          top: `${magnifierY + size - 20}px`,
          transform: 'translate(-50%, 0)',
        }}
      >
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg text-sm">
          {magnification}x
        </div>
      </div>
    </>
  );
}

// Component that shows magnified view using CSS transforms
function MagnifiedView({ 
  x, 
  y, 
  magnification, 
  size, 
  magnifierX, 
  magnifierY,
  refreshKey 
}: { 
  x: number; 
  y: number; 
  magnification: number; 
  size: number;
  magnifierX: number;
  magnifierY: number;
  refreshKey: number;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    // Debounce the update slightly to avoid too many re-renders during fast scrolling
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (!overlayRef.current) return;

      // Get current scroll position
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      // Clone the entire body content
      const bodyClone = document.body.cloneNode(true) as HTMLElement;
      
      // Remove the magnifier itself from the clone
      const magnifierElements = bodyClone.querySelectorAll('[class*="magnifier-lens"], [class*="z-[9998]"], [class*="z-[9999]"], [class*="z-[10000]"], [class*="z-[10001]"]');
      magnifierElements.forEach(el => el.remove());

      // Clear previous content
      overlayRef.current.innerHTML = '';
      
      // Calculate the document position (viewport position + scroll offset)
      const documentX = x + scrollX;
      const documentY = y + scrollY;
      
      // Apply the same styles
      const cloneWrapper = document.createElement('div');
      cloneWrapper.style.position = 'absolute';
      cloneWrapper.style.transformOrigin = 'top left';
      cloneWrapper.style.transform = `scale(${magnification})`;
      // Position the clone so that the point under the cursor appears in the center of the magnifier
      cloneWrapper.style.left = `${-documentX * magnification + size / 2}px`;
      cloneWrapper.style.top = `${-documentY * magnification + size / 2}px`;
      cloneWrapper.style.width = `${document.documentElement.scrollWidth}px`;
      cloneWrapper.style.height = `${document.documentElement.scrollHeight}px`;
      cloneWrapper.style.pointerEvents = 'none';
      
      // Copy all body styles
      const bodyStyles = window.getComputedStyle(document.body);
      bodyClone.style.margin = '0';
      bodyClone.style.padding = '0';
      bodyClone.style.position = 'absolute';
      bodyClone.style.top = '0';
      bodyClone.style.left = '0';
      bodyClone.style.width = '100%';
      bodyClone.style.height = '100%';
      bodyClone.style.overflow = 'visible';
      
      cloneWrapper.appendChild(bodyClone);
      overlayRef.current.appendChild(cloneWrapper);

      // Copy all stylesheets to ensure proper rendering
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        if (style instanceof HTMLStyleElement) {
          const clonedStyle = style.cloneNode(true);
          overlayRef.current?.appendChild(clonedStyle);
        }
      });
    }, 10); // Small debounce delay

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [x, y, magnification, size, refreshKey]);

  return (
    <div
      className="magnifier-lens fixed pointer-events-none z-[10000] rounded-full overflow-hidden"
      style={{
        left: `${magnifierX}px`,
        top: `${magnifierY}px`,
        width: `${size}px`,
        height: `${size}px`,
        border: '4px solid #3b82f6',
        boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 20px 50px rgba(0, 0, 0, 0.5)',
        background: '#ffffff',
      }}
      role="img"
      aria-label={`Screen magnifier showing ${magnification}x magnification of content under cursor`}
    >
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      />
      
      {/* Crosshair overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, transparent 49%, rgba(59, 130, 246, 0.4) 49%, rgba(59, 130, 246, 0.4) 51%, transparent 51%),
            linear-gradient(to bottom, transparent 49%, rgba(59, 130, 246, 0.4) 49%, rgba(59, 130, 246, 0.4) 51%, transparent 51%)
          `,
        }}
      />
    </div>
  );
}
