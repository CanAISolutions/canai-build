import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'sparkles' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'sparkles') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 p-8',
          className
        )}
      >
        <Sparkles
          className={cn(sizeClasses[size], 'text-[#36d1fe] animate-spin')}
        />
        <p
          className={cn(
            textSizeClasses[size],
            'text-white font-manrope animate-pulse'
          )}
        >
          {message}
        </p>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Loader2
          className={cn(sizeClasses[size], 'animate-spin text-[#36d1fe]')}
        />
        <span className={cn(textSizeClasses[size], 'text-white font-manrope')}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8',
        'bg-gradient-to-br from-[#172b47]/50 to-[#1e314f]/50 rounded-2xl',
        'border border-[#36d1fe]/20 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative">
        <Loader2
          className={cn(sizeClasses[size], 'animate-spin text-[#36d1fe]')}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-[#36d1fe]/20 animate-ping',
            sizeClasses[size]
          )}
        />
      </div>
      <p
        className={cn(
          textSizeClasses[size],
          'text-white font-manrope text-center max-w-sm'
        )}
      >
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
