'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Check if at top (with threshold for better UX)
      setIsAtTop(scrollY < 10);

      // Determine scroll direction
      // Only update if scroll difference is significant (better for mobile)
      const scrollDifference = Math.abs(scrollY - lastScrollY.current);
      
      if (scrollDifference < 5) {
        ticking.current = false;
        return;
      }

      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      // Only update if direction actually changed
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Initial check
    lastScrollY.current = window.scrollY || window.pageYOffset;
    setIsAtTop(lastScrollY.current < 10);

    // Add scroll listener with passive for better performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Also check on resize (for mobile orientation changes)
    window.addEventListener('resize', () => {
      const currentScroll = window.scrollY || window.pageYOffset;
      setIsAtTop(currentScroll < 10);
    }, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', () => {});
    };
  }, [scrollDirection]);

  return { scrollDirection, isAtTop };
}

