import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'compact';
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'default',
  className,
}) => {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index <= currentStep
                  ? 'bg-[#36d1fe] shadow-[0_0_8px_rgba(54,209,254,0.6)]'
                  : 'bg-gray-600'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-[#cce7fa] font-manrope">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                index <= currentStep
                  ? 'bg-[#36d1fe] text-white shadow-[0_0_15px_rgba(54,209,254,0.5)]'
                  : 'bg-gray-600 text-gray-300'
              )}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 rounded-full transition-all duration-300',
                  index < currentStep ? 'bg-[#36d1fe]' : 'bg-gray-600'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm">
        {steps.map((step, index) => (
          <span
            key={index}
            className={cn(
              'font-manrope transition-colors duration-300',
              index <= currentStep ? 'text-white' : 'text-gray-400'
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
