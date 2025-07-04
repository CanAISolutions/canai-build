import * as React from 'react';
import { cn } from '@/lib/utils';

const MobileOptimizedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    pressable?: boolean;
    glowEffect?: boolean;
  }
>(({ className, pressable = false, glowEffect = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-[#36d1fe]/20 bg-gradient-to-br from-[#172b47]/90 to-[#1e314f]/90 backdrop-blur-sm',
      'transition-all duration-300 ease-out',
      // Mobile optimizations
      'touch-manipulation select-none',
      'min-h-[44px]', // Minimum touch target
      // Hover and press states
      pressable && [
        'cursor-pointer',
        'hover:border-[#36d1fe]/40 hover:shadow-lg hover:scale-[1.02]',
        'active:scale-[0.98] active:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36d1fe] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1C]',
      ],
      // Glow effect
      glowEffect && 'shadow-[0_0_20px_rgba(54,209,254,0.15)]',
      className
    )}
    {...props}
  />
));
MobileOptimizedCard.displayName = 'MobileOptimizedCard';

const MobileOptimizedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 p-4 sm:p-6', className)}
    {...props}
  />
));
MobileOptimizedCardHeader.displayName = 'MobileOptimizedCardHeader';

const MobileOptimizedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg sm:text-xl font-bold leading-tight tracking-tight text-white',
      'font-playfair',
      className
    )}
    {...props}
  />
));
MobileOptimizedCardTitle.displayName = 'MobileOptimizedCardTitle';

const MobileOptimizedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm sm:text-base text-[#cce7fa] leading-relaxed',
      'font-manrope',
      className
    )}
    {...props}
  />
));
MobileOptimizedCardDescription.displayName = 'MobileOptimizedCardDescription';

const MobileOptimizedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 sm:p-6 pt-0', className)} {...props} />
));
MobileOptimizedCardContent.displayName = 'MobileOptimizedCardContent';

const MobileOptimizedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-4 sm:p-6 pt-0', className)}
    {...props}
  />
));
MobileOptimizedCardFooter.displayName = 'MobileOptimizedCardFooter';

export {
  MobileOptimizedCard,
  MobileOptimizedCardHeader,
  MobileOptimizedCardFooter,
  MobileOptimizedCardTitle,
  MobileOptimizedCardDescription,
  MobileOptimizedCardContent,
};
