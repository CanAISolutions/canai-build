import { useEffect, useRef } from 'react';

// Focus management utilities
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive]);

  return containerRef;
};

// Announce messages to screen readers
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Generate unique IDs for form labels and descriptions
export const generateId = (prefix = 'canai') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// ARIA attributes helpers
export const createAriaAttributes = (
  id: string,
  labelledBy?: string,
  describedBy?: string,
  expanded?: boolean,
  controls?: string
) => ({
  id,
  ...(labelledBy && { 'aria-labelledby': labelledBy }),
  ...(describedBy && { 'aria-describedby': describedBy }),
  ...(expanded !== undefined && { 'aria-expanded': expanded }),
  ...(controls && { 'aria-controls': controls }),
});

// Keyboard navigation helpers
export const handleKeyboardNavigation = (
  e: React.KeyboardEvent,
  actions: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
) => {
  const { key } = e;

  switch (key) {
    case 'Enter':
      actions.onEnter?.();
      break;
    case ' ':
      actions.onSpace?.();
      e.preventDefault(); // Prevent scrolling
      break;
    case 'Escape':
      actions.onEscape?.();
      break;
    case 'ArrowUp':
      actions.onArrowUp?.();
      e.preventDefault();
      break;
    case 'ArrowDown':
      actions.onArrowDown?.();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      actions.onArrowLeft?.();
      break;
    case 'ArrowRight':
      actions.onArrowRight?.();
      break;
  }
};

// Color contrast utilities
export const ensureContrast = {
  // Primary text on dark background
  primaryOnDark: 'text-white',
  // Secondary text on dark background
  secondaryOnDark: 'text-[#cce7fa]',
  // Accent text with high contrast
  accentHighContrast: 'text-[#36d1fe]',
  // Error text with high contrast
  errorHighContrast: 'text-red-300',
  // Success text with high contrast
  successHighContrast: 'text-green-300',
  // Warning text with high contrast
  warningHighContrast: 'text-yellow-300',
};

// Screen reader only content
export const srOnly = 'sr-only';

// Focus visible classes for better accessibility
export const focusVisible = {
  default:
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50 focus-visible:ring-offset-0',
  button:
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50 focus-visible:ring-offset-0 focus-visible:scale-105',
  input:
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#36d1fe]/20 focus-visible:border-[#36d1fe]',
};
