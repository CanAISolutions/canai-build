import { cva } from 'class-variance-authority';

export const formFieldVariants = cva(
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      error: {
        true: 'border-red-500',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export const formLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      error: {
        true: 'text-red-500',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export const formMessageVariants = cva('text-sm font-medium', {
  variants: {
    error: {
      true: 'text-red-500',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    error: false,
  },
});
