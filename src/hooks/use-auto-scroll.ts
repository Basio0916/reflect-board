import { useCallback, useRef, useEffect } from 'react';

interface AutoScrollOptions {
  scrollThreshold?: number;
  scrollSpeed?: number;
}

export function useAutoScroll(options: AutoScrollOptions = {}) {
  const { scrollThreshold = 120, scrollSpeed = 12 } = options;
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const checkAndScroll = useCallback((clientY: number) => {
    if (!isDraggingRef.current) return;

    const viewport = {
      top: 0,
      bottom: window.innerHeight
    };

    let scrollDirection = 0;
    let intensity = 0;
    
    // Check if near top of viewport
    if (clientY < scrollThreshold) {
      scrollDirection = -1; // Scroll up
      intensity = Math.max(0.2, (scrollThreshold - clientY) / scrollThreshold);
    }
    // Check if near bottom of viewport
    else if (clientY > viewport.bottom - scrollThreshold) {
      scrollDirection = 1; // Scroll down
      intensity = Math.max(0.2, (clientY - (viewport.bottom - scrollThreshold)) / scrollThreshold);
    }

    // Stop any existing scroll if direction changed or no scroll needed
    if (scrollIntervalRef.current && (scrollDirection === 0 || isScrollingRef.current)) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
      isScrollingRef.current = false;
    }

    // Start scrolling if needed
    if (scrollDirection !== 0 && !isScrollingRef.current) {
      isScrollingRef.current = true;
      
      scrollIntervalRef.current = setInterval(() => {
        if (!isDraggingRef.current) {
          if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
          isScrollingRef.current = false;
          return;
        }
        
        const scrollAmount = scrollDirection * scrollSpeed * intensity;
        window.scrollBy(0, scrollAmount);
      }, 16); // ~60fps
    }
  }, [scrollThreshold, scrollSpeed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    checkAndScroll(e.clientY);
  }, [checkAndScroll]);

  const startAutoScroll = useCallback((clientY: number) => {
    isDraggingRef.current = true;
    checkAndScroll(clientY);
    
    // Add global mouse move listener for more responsive scrolling
    document.addEventListener('mousemove', handleMouseMove);
  }, [checkAndScroll, handleMouseMove]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    isScrollingRef.current = false;
    
    // Remove global mouse move listener
    document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return {
    startAutoScroll,
    stopAutoScroll
  };
}