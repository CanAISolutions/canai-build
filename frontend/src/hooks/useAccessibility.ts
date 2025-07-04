import { useEffect, useRef } from 'react';
import { announceToScreenReader } from '@/lib/accessibility';

export const useAccessibility = () => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#36d1fe] focus:text-white focus:rounded-lg';

    document.body.insertBefore(skipLink, document.body.firstChild);
    skipLinkRef.current = skipLink;

    return () => {
      if (skipLinkRef.current && skipLinkRef.current.parentNode) {
        skipLinkRef.current.parentNode.removeChild(skipLinkRef.current);
      }
    };
  }, []);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    announceToScreenReader(message, priority);
  };

  const setPageTitle = (title: string) => {
    document.title = `${title} | CanAI Emotional Sovereignty Platform`;
    announce(`Page loaded: ${title}`, 'polite');
  };

  return { announce, setPageTitle };
};
