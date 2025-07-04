// Constants for badge variants
export const badgeVariants = {
  default: 'bg-primary hover:bg-primary/80 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  destructive:
    'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
  outline: 'text-foreground',
};

// Constants for button variants
export const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

// Constants for enhanced button variants
export const enhancedButtonVariants = {
  ...buttonVariants,
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
};

// Constants for standard button variants
export const standardButtonVariants = {
  ...buttonVariants,
  neutral: 'bg-gray-600 text-white hover:bg-gray-700',
  info: 'bg-cyan-600 text-white hover:bg-cyan-700',
  error: 'bg-red-600 text-white hover:bg-red-700',
};

// Constants for toggle variants
export const toggleVariants = {
  default: 'bg-transparent hover:bg-muted',
  outline:
    'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
};
