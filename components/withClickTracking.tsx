import React, { useEffect, useRef } from 'react';
import { trackClick } from '@/utils/enhanced-analytics';

export const withClickTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: string
) => {
  return function WithClickTrackingComponent(props: P) {
    const componentRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const currentRef = componentRef.current;

      const handleClick = (event: MouseEvent) => {
        if (currentRef && currentRef.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          if (!target) return;

          // Find the closest clickable element
          const clickableElement = target.closest('button, a, [role="button"]');
          if (clickableElement) {
            trackClick(
              clickableElement as HTMLElement,
              category,
              clickableElement.getAttribute('data-tracking-label') || undefined
            );
          }
        }
      };

      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('click', handleClick);
      };
    }, []);

    return <WrappedComponent {...props} ref={componentRef} />;
  };
}; 