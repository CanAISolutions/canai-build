import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ResponsiveModal = DialogPrimitive.Root;

const ResponsiveModalTrigger = DialogPrimitive.Trigger;

const ResponsiveModalPortal = DialogPrimitive.Portal;

const ResponsiveModalClose = DialogPrimitive.Close;

const ResponsiveModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ResponsiveModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ResponsiveModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <ResponsiveModalPortal>
      <ResponsiveModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-gradient-to-br from-[#172b47f6] to-[#1e314f] backdrop-blur-md',
          'border-2 border-[#36d1fe]/40 shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          // Mobile-first responsive design
          isMobile
            ? [
                'left-2 right-2 top-4 bottom-4 rounded-2xl p-4',
                'data-[state=closed]:slide-out-to-bottom-[8px]',
                'data-[state=open]:slide-in-from-bottom-[8px]',
                'max-h-[calc(100vh-2rem)] overflow-y-auto',
              ]
            : [
                'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
                'rounded-2xl p-6 w-full max-w-lg',
                'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                'max-h-[85vh] overflow-y-auto',
              ],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#36d1fe] focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ResponsiveModalPortal>
  );
});
ResponsiveModalContent.displayName = DialogPrimitive.Content.displayName;

const ResponsiveModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left mb-4',
      className
    )}
    {...props}
  />
);
ResponsiveModalHeader.displayName = 'ResponsiveModalHeader';

const ResponsiveModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6',
      className
    )}
    {...props}
  />
);
ResponsiveModalFooter.displayName = 'ResponsiveModalFooter';

const ResponsiveModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl sm:text-2xl font-bold leading-none tracking-tight text-white font-playfair',
      className
    )}
    {...props}
  />
));
ResponsiveModalTitle.displayName = DialogPrimitive.Title.displayName;

const ResponsiveModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      'text-sm sm:text-base text-[#cce7fa] font-manrope',
      className
    )}
    {...props}
  />
));
ResponsiveModalDescription.displayName =
  DialogPrimitive.Description.displayName;

export {
  ResponsiveModal,
  ResponsiveModalPortal,
  ResponsiveModalOverlay,
  ResponsiveModalClose,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
};
