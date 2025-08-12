
import { useState, useRef, useEffect } from 'react';

export const useWeightChartScroll = (dataLength: number) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollButtons();

    // Attach listener
    container.addEventListener('scroll', handleScroll);

    // On mount/data change: jump to the far right so latest data is visible
    if (dataLength > 0) {
      // Defer to next frame to ensure layout/scrollWidth are correct
      requestAnimationFrame(() => {
        if (!container) return;
        container.scrollLeft = container.scrollWidth - container.clientWidth;
        checkScrollButtons();
      });
    } else {
      checkScrollButtons();
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [dataLength]);

  return {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight
  };
};
