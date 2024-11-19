import React, { useEffect, useRef } from 'react';
import { trackClick } from '@/utils/enhanced-analytics';

export const withClickTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: string
) => {
  return function WithClickTrackingComponent(props: P) {
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!componentRef.current) return;

      const handleClick = (event: MouseEvent) => {
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
      };

      componentRef.current.addEventListener('click', handleClick);
      return () => {
        componentRef.current?.removeEventListener('click', handleClick);
      };
    }, []);

    return (
      <div ref={componentRef}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}; 