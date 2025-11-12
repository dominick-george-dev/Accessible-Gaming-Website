// Enhanced Magnifier Component with Canvas Rendering and Color Compatibility
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MagnifierProps {
  enabled: boolean;
  zoom?: number;
  size?: number;
}

export const Magnifier: React.FC<MagnifierProps> = ({ 
  enabled, 
  zoom = 2, 
  size = 200
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Create a source canvas for capturing page content
  useEffect(() => {
    if (!sourceCanvasRef.current) {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.style.position = 'absolute';
      sourceCanvas.style.top = '-9999px';
      sourceCanvas.style.pointerEvents = 'none';
      document.body.appendChild(sourceCanvas);
      sourceCanvasRef.current = sourceCanvas;
    }

    return () => {
      if (sourceCanvasRef.current && sourceCanvasRef.current.parentNode) {
        sourceCanvasRef.current.parentNode.removeChild(sourceCanvasRef.current);
      }
    };
  }, []);

  // Optimized mouse move handler with throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 16) return; // Throttle to ~60fps
    
    lastUpdateRef.current = now;
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  // Enhanced magnifier drawing function
  const drawMagnifier = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasSize = size * devicePixelRatio;
    
    // Set canvas size
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Scale context for high DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);

    try {      // Note: For future implementation, we would calculate source coordinates
      // const sourceSize = size / zoom;
      // const sourceX = Math.max(0, position.x - sourceSize / 2);
      // const sourceY = Math.max(0, position.y - sourceSize / 2);
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, size, size);
      
      // Create circular clipping mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
      ctx.clip();

      // Try to capture and draw the magnified content
      try {
        // Use html2canvas-like approach for better content capture
        const elements = document.elementsFromPoint(position.x, position.y);
        const targetElement = elements.find(el => 
          el !== canvas && 
          !el.closest('.magnifier-container') &&
          el.tagName !== 'HTML' && 
          el.tagName !== 'BODY'
        ) || document.body;

        // Draw background color
        const computedStyle = getComputedStyle(targetElement);
        const bgColor = computedStyle.backgroundColor || 'rgba(255, 255, 255, 0.9)';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Draw text content if available
        if (targetElement.textContent) {
          const fontSize = parseInt(computedStyle.fontSize) || 16;
          const scaledFontSize = (fontSize * zoom);
          
          ctx.fillStyle = computedStyle.color || '#000000';
          ctx.font = `${scaledFontSize}px ${computedStyle.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const text = targetElement.textContent.slice(0, 50); // Limit text length
          ctx.fillText(text, size / 2, size / 2);
        }      } catch (error) {
        // Fallback: Draw a placeholder with zoom info
        console.warn('Content capture failed:', error);
        const gradient = ctx.createRadialGradient(
          size / 2, size / 2, 0,
          size / 2, size / 2, size / 2
        );
        
        // Use CSS variables if available
        const rootStyles = getComputedStyle(document.documentElement);
        const primaryColor = rootStyles.getPropertyValue('--primary').trim() || '#3b82f6';
        const backgroundColor = rootStyles.getPropertyValue('--background').trim() || '#ffffff';
        
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, primaryColor + '20');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Draw zoom indicator
        ctx.fillStyle = primaryColor;
        ctx.font = `bold ${Math.min(24, size / 8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${zoom}x`, size / 2, size / 2);
      }

      ctx.restore();

      // Draw border and crosshair
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ring').trim() || '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Draw crosshair
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(size / 2 - 15, size / 2);
      ctx.lineTo(size / 2 + 15, size / 2);
      ctx.moveTo(size / 2, size / 2 - 15);
      ctx.lineTo(size / 2, size / 2 + 15);
      ctx.stroke();
      ctx.setLineDash([]);

    } catch (error) {
      console.warn('Magnifier rendering error:', error);
      
      // Final fallback: Simple circular magnifier
      ctx.clearRect(0, 0, size, size);
      
      // Draw background circle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw crosshair
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size / 2 - 10, size / 2);
      ctx.lineTo(size / 2 + 10, size / 2);
      ctx.moveTo(size / 2, size / 2 - 10);
      ctx.lineTo(size / 2, size / 2 + 10);
      ctx.stroke();
      
      // Draw zoom text
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${zoom}x`, size / 2, size / 2 + 25);
    }

  }, [enabled, position, zoom, size]);

  // Animation loop
  useEffect(() => {
    if (!enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsVisible(false);
      return;
    }

    const animate = () => {
      drawMagnifier();
      animationRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, drawMagnifier, handleMouseMove]);

  // Hide magnifier when mouse leaves window
  useEffect(() => {
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!enabled || !isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full border-4 border-white shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    </div>
  );
};

export default Magnifier;
