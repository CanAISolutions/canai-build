import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';

const StandardModal = DialogPrimitive.Root;

const StandardModalTrigger = DialogPrimitive.Trigger;

const StandardModalPortal = DialogPrimitive.Portal;

const StandardModalClose = DialogPrimitive.Close;

const StandardModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
StandardModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface StandardModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'form';
}

const StandardModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  StandardModalContentProps
>(
  (
    { className, children, size = 'md', variant = 'default', ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] max-h-[95vh]',
    };

    const variantClasses = {
      default:
        'bg-gradient-to-br from-[#193c65] via-[#1e4a73] to-[#12294a] border-2 border-[#36d1fe] shadow-[0_0_60px_rgba(54,209,254,0.4)]',
      glass:
        'bg-[rgba(25,60,101,0.9)] backdrop-blur-xl border-2 border-[rgba(54,209,254,0.3)] shadow-[0_0_40px_rgba(54,209,254,0.3)]',
      form: 'bg-[rgba(25,60,101,0.95)] backdrop-blur-xl border-2 border-[rgba(54,209,254,0.4)] shadow-[0_0_50px_rgba(54,209,254,0.35)]',
    };

    return (
      <StandardModalPortal>
        <StandardModalOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-6 p-8 duration-300',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2',
            'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'rounded-3xl overflow-hidden',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-6 top-6 rounded-full p-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#36d1fe] focus:ring-opacity-50">
            <X className="h-5 w-5 text-white" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </StandardModalPortal>
    );
  }
);
StandardModalContent.displayName = DialogPrimitive.Content.displayName;

const StandardModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-3 text-center', className)}
    {...props}
  />
));
StandardModalHeader.displayName = 'StandardModalHeader';

const StandardModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-3',
      className
    )}
    {...props}
  />
));
StandardModalFooter.displayName = 'StandardModalFooter';

const StandardModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-2xl font-bold text-white font-manrope tracking-tight drop-shadow-lg',
      className
    )}
    {...props}
  />
));
StandardModalTitle.displayName = DialogPrimitive.Title.displayName;

const StandardModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[#cce7fa] font-manrope leading-relaxed', className)}
    {...props}
  />
));
StandardModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  StandardModal,
  StandardModalPortal,
  StandardModalOverlay,
  StandardModalTrigger,
  StandardModalClose,
  StandardModalContent,
  StandardModalHeader,
  StandardModalFooter,
  StandardModalTitle,
  StandardModalDescription,
};
