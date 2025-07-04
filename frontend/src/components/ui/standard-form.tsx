import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Form Container
interface StandardFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: 'default' | 'modal' | 'inline';
}

const StandardForm = React.forwardRef<HTMLFormElement, StandardFormProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default:
        'space-y-6 p-8 rounded-3xl bg-[rgba(25,60,101,0.7)] backdrop-blur-md border-2 border-[rgba(54,209,254,0.4)] shadow-[0_0_35px_rgba(54,209,254,0.25)]',
      modal: 'space-y-5',
      inline: 'space-y-4',
    };

    return (
      <form
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
StandardForm.displayName = 'StandardForm';

// Enhanced Form Group with validation states
interface StandardFormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  required?: boolean;
  error?: string;
  success?: boolean;
  validationState?: 'idle' | 'validating' | 'success' | 'error';
}

const StandardFormGroup = React.forwardRef<
  HTMLDivElement,
  StandardFormGroupProps
>(
  (
    {
      className,
      children,
      required: _required, // Renamed to indicate it's unused
      error,
      success,
      validationState = 'idle',
      ...props
    },
    ref
  ) => {
    const [hasBeenTouched, setHasBeenTouched] = React.useState(false);

    React.useEffect(() => {
      if (validationState !== 'idle') {
        setHasBeenTouched(true);
      }
    }, [validationState]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative space-y-2 transition-all duration-200',
          hasBeenTouched &&
            validationState === 'error' &&
            'animate-[shake_0.2s_ease-in-out]',
          className
        )}
        {...props}
      >
        {children}
        {error && hasBeenTouched && (
          <div
            className="flex items-center gap-2 text-[#ef4444] text-sm font-manrope animate-fade-in"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && hasBeenTouched && validationState === 'success' && (
          <div
            className="flex items-center gap-2 text-[#10b981] text-sm font-manrope animate-fade-in"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>Looks good!</span>
          </div>
        )}
      </div>
    );
  }
);
StandardFormGroup.displayName = 'StandardFormGroup';

// Form Label
interface StandardFormLabelProps
  extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean;
}

const StandardFormLabel: React.FC<StandardFormLabelProps> = ({
  children,
  required: _required,
  className = '',
  ...props
}) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

// Enhanced Form Input with validation states
interface StandardFormInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  error?: boolean;
  success?: boolean;
  validationState?: 'idle' | 'validating' | 'success' | 'error';
  onValidationChange?: (
    state: 'idle' | 'validating' | 'success' | 'error'
  ) => void;
}

const StandardFormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  StandardFormInputProps
>(
  (
    {
      className,
      error: _error,
      success: _success,
      validationState = 'idle',
      onValidationChange: _onValidationChange,
      ...props
    },
    ref
  ) => {
    const getValidationClasses = () => {
      switch (validationState) {
        case 'success':
          return 'border-[#10b981] focus-visible:border-[#10b981] focus-visible:ring-[#10b981]/20';
        case 'error':
          return 'border-[#ef4444] focus-visible:border-[#ef4444] focus-visible:ring-[#ef4444]/20';
        case 'validating':
          return 'border-[#36d1fe] focus-visible:border-[#36d1fe] focus-visible:ring-[#36d1fe]/20';
        default:
          return 'border-[rgba(54,209,254,0.3)] focus-visible:border-[#36d1fe] focus-visible:ring-[#36d1fe]/20';
      }
    };

    return (
      <Input
        ref={ref}
        className={cn(
          'bg-[rgba(255,255,255,0.05)] border-2 text-white placeholder:text-[rgba(255,255,255,0.5)]',
          'transition-all duration-200 font-manrope min-h-[44px]',
          'hover:border-[rgba(54,209,254,0.5)]',
          getValidationClasses(),
          className
        )}
        {...props}
      />
    );
  }
);
StandardFormInput.displayName = 'StandardFormInput';

// Enhanced Form Textarea with validation states
interface StandardFormTextareaProps
  extends React.ComponentPropsWithoutRef<typeof Textarea> {
  error?: boolean;
  success?: boolean;
  validationState?: 'idle' | 'validating' | 'success' | 'error';
}

const StandardFormTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  StandardFormTextareaProps
>(
  (
    {
      className,
      error: _error,
      success: _success,
      validationState = 'idle',
      ...props
    },
    ref
  ) => {
    const getValidationClasses = () => {
      switch (validationState) {
        case 'success':
          return 'border-[#10b981] focus-visible:border-[#10b981] focus-visible:ring-[#10b981]/20';
        case 'error':
          return 'border-[#ef4444] focus-visible:border-[#ef4444] focus-visible:ring-[#ef4444]/20';
        case 'validating':
          return 'border-[#36d1fe] focus-visible:border-[#36d1fe] focus-visible:ring-[#36d1fe]/20';
        default:
          return 'border-[rgba(54,209,254,0.3)] focus-visible:border-[#36d1fe] focus-visible:ring-[#36d1fe]/20';
      }
    };

    return (
      <Textarea
        ref={ref}
        className={cn(
          'bg-[rgba(255,255,255,0.05)] border-2 text-white placeholder:text-[rgba(255,255,255,0.5)]',
          'transition-all duration-200 font-manrope min-h-[120px] resize-none',
          'hover:border-[rgba(54,209,254,0.5)]',
          getValidationClasses(),
          className
        )}
        {...props}
      />
    );
  }
);
StandardFormTextarea.displayName = 'StandardFormTextarea';

// Form Helper Text
const StandardFormHelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[#cce7fa] opacity-80 font-manrope', className)}
    {...props}
  />
));
StandardFormHelperText.displayName = 'StandardFormHelperText';

export {
  StandardForm,
  StandardFormGroup,
  StandardFormLabel,
  StandardFormInput,
  StandardFormTextarea,
  StandardFormHelperText,
};
