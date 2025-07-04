import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';

// Loading Indicator
interface StandardLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const StandardLoading = React.forwardRef<HTMLDivElement, StandardLoadingProps>(
  ({ className, size = 'md', text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-3', className)}
        role="status"
        aria-live="polite"
        {...props}
      >
        <Loader2
          className={cn('animate-spin text-[#36d1fe]', sizeClasses[size])}
        />
        {text && (
          <span className="text-white font-manrope text-sm">{text}</span>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);
StandardLoading.displayName = 'StandardLoading';

// Status Badge
interface StandardStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StandardStatusBadge = React.forwardRef<
  HTMLDivElement,
  StandardStatusBadgeProps
>(
  (
    {
      className,
      variant = 'info',
      size = 'md',
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      success: 'bg-green-500/20 border-green-400 text-green-300',
      error: 'bg-red-500/20 border-red-400 text-red-300',
      warning: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
      info: 'bg-blue-500/20 border-blue-400 text-blue-300',
      pending: 'bg-gray-500/20 border-gray-400 text-gray-300',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const icons = {
      success: CheckCircle2,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      pending: Loader2,
    };

    const IconComponent = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border-2 font-medium font-manrope',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        {showIcon && (
          <IconComponent
            size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
            className={variant === 'pending' ? 'animate-spin' : ''}
          />
        )}
        {children}
      </div>
    );
  }
);
StandardStatusBadge.displayName = 'StandardStatusBadge';

// Progress Indicator
interface StandardProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const StandardProgress = React.forwardRef<
  HTMLDivElement,
  StandardProgressProps
>(
  (
    {
      className,
      value,
      max = 100,
      showPercentage = false,
      variant = 'default',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantClasses = {
      default: 'bg-[#36d1fe]',
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      error: 'bg-red-400',
    };

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={cn(
            'w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden border border-[rgba(54,209,254,0.3)]',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(54,209,254,0.5)]',
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className="mt-2 text-center text-sm text-[#cce7fa] font-manrope">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);
StandardProgress.displayName = 'StandardProgress';

// Trust Score Indicator
interface StandardTrustScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  variant?: 'compact' | 'detailed';
}

const StandardTrustScore = React.forwardRef<
  HTMLDivElement,
  StandardTrustScoreProps
>(
  (
    {
      className,
      score,
      maxScore = 5,
      showLabel = true,
      variant = 'detailed',
      ...props
    },
    ref
  ) => {
    const percentage = (score / maxScore) * 100;
    const stars = Array.from({ length: maxScore }, (_, i) => i + 1);

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          <div className="flex">
            {stars.map(star => (
              <div
                key={star}
                className={cn(
                  'w-3 h-3 rounded-full',
                  star <= score
                    ? 'bg-[#36d1fe] shadow-[0_0_4px_#36d1fe]'
                    : 'bg-[rgba(255,255,255,0.2)]'
                )}
              />
            ))}
          </div>
          {showLabel && (
            <span className="text-sm text-[#cce7fa] font-manrope">
              {score.toFixed(1)}/{maxScore}
            </span>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium font-manrope">
            Trust Score
          </span>
          <span className="text-[#36d1fe] font-bold font-manrope">
            {score.toFixed(1)}/{maxScore}
          </span>
        </div>
        <StandardProgress value={percentage} variant="default" size="md" />
        <div className="flex justify-between text-xs text-[#cce7fa] font-manrope opacity-80">
          <span>Needs Work</span>
          <span>Excellent</span>
        </div>
      </div>
    );
  }
);
StandardTrustScore.displayName = 'StandardTrustScore';

export {
  StandardLoading,
  StandardStatusBadge,
  StandardProgress,
  StandardTrustScore,
};
