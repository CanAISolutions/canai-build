import { trackPerformance } from '@/utils/analytics';
import { useEffect, useRef } from 'react';

// Remove unused interface
// interface PerformanceMetrics {
//   loadTime: number;
//   renderTime: number;
//   interactionTime?: number;
// }

export const usePerformanceMonitor = (
  pageName: string,
  targetLoadTime: number = 2000
) => {
  const startTimeRef = useRef<number>(performance.now());
  const renderTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Mark render complete
    renderTimeRef.current = performance.now();

    const loadTime = renderTimeRef.current - startTimeRef.current;

    // Track performance metrics
    trackPerformance(`${pageName}_load`, loadTime, {
      action: 'page_load',
      success: loadTime < targetLoadTime,
    });

    // Log performance in development
    if (process.env['NODE_ENV'] === 'development') {
      console.log(
        `[Performance] ${pageName} loaded in ${loadTime.toFixed(2)}ms`
      );

      if (loadTime > targetLoadTime) {
        console.warn(
          `[Performance] ${pageName} exceeded ${targetLoadTime}ms target`
        );
      }
    }

    // Copy the start time to avoid stale closure
    const startTime = startTimeRef.current;

    return () => {
      if (startTime) {
        const timeOnPage = performance.now() - startTime;
        trackPerformance(`${pageName}_engagement`, timeOnPage, {
          action: 'page_engagement',
          success: timeOnPage > 3000,
        });
      }
    };
  }, [pageName, targetLoadTime]);

  const trackInteraction = (interactionName: string) => {
    const interactionTime =
      performance.now() - (renderTimeRef.current || startTimeRef.current);

    trackPerformance(`${pageName}_interaction`, interactionTime, {
      action: interactionName,
      success: true,
    });
  };

  return { trackInteraction };
};
