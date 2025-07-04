# CanAI UI Components - shadcn/ui Library

<div align="center">

**🎨 Base UI Component Library**

![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-black.svg)
![Radix UI](https://img.shields.io/badge/radix--ui-primitives-blue.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-styling-cyan.svg)
![Accessible](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)

</div>

## 🌟 Overview

This directory contains the base UI component library built on shadcn/ui, providing accessible,
customizable, and consistent design system components for the CanAI Emotional Sovereignty Platform.
All components follow WCAG 2.2 AA accessibility standards and are optimized for the 9-stage user
journey experience.

## 📁 Component Library

### Form Components

- **`button.tsx`** - Versatile button component with multiple variants
- **`input.tsx`** - Text input with validation states
- **`textarea.tsx`** - Multi-line text input
- **`select.tsx`** - Dropdown selection component
- **`checkbox.tsx`** - Checkbox input with custom styling
- **`radio-group.tsx`** - Radio button group component
- **`form.tsx`** - Form wrapper with validation support
- **`label.tsx`** - Accessible form labels

### Layout Components

- **`card.tsx`** - Flexible card container
- **`separator.tsx`** - Visual content dividers
- **`sheet.tsx`** - Slide-out panel component
- **`tabs.tsx`** - Tabbed content organization
- **`accordion.tsx`** - Collapsible content sections

### Feedback Components

- **`alert.tsx`** - Alert messages and notifications
- **`toast.tsx`** - Toast notification system
- **`progress.tsx`** - Progress indicators
- **`skeleton.tsx`** - Loading state placeholders
- **`badge.tsx`** - Status and category badges

### Overlay Components

- **`dialog.tsx`** - Modal dialog windows
- **`popover.tsx`** - Contextual popup content
- **`tooltip.tsx`** - Helpful tooltips
- **`dropdown-menu.tsx`** - Context menus
- **`hover-card.tsx`** - Hover-triggered content

### Navigation Components

- **`navigation-menu.tsx`** - Main navigation menus
- **`breadcrumb.tsx`** - Breadcrumb navigation
- **`pagination.tsx`** - Page navigation controls

## 🎨 Design System Integration

### Color Palette

```typescript
// Tailwind CSS configuration
const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },

  // Emotional intelligence colors
  warm: '#f59e0b',
  bold: '#dc2626',
  optimistic: '#10b981',
  inspirational: '#8b5cf6',

  // UI system colors
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  destructive: 'hsl(var(--destructive))',
};
```

### Typography Scale

```typescript
const typography = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
};
```

## 🎯 Component Usage Examples

### Button Component

```typescript
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

### Card Component

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Trust Indicator</CardTitle>
    <CardDescription>Customer testimonial from verified user</CardDescription>
  </CardHeader>
  <CardContent>
    <p>"CanAI helped me secure $75,000 in funding!"</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">— Sarah Chen, Bakery Owner</p>
  </CardFooter>
</Card>;
```

### Form Components

```typescript
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="businessName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Business Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter your business name" {...field} />
          </FormControl>
          <FormDescription>This will be used in your personalized content.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Continue</Button>
  </form>
</Form>;
```

### Dialog Component

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">View Pricing</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Choose Your Plan</DialogTitle>
      <DialogDescription>Select the perfect plan for your business needs.</DialogDescription>
    </DialogHeader>
    {/* Pricing content */}
    <DialogFooter>
      <Button type="submit">Continue to Payment</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## ♿ Accessibility Features

### Keyboard Navigation

All components support comprehensive keyboard navigation:

- **Tab/Shift+Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and form controls
- **Arrow Keys**: Navigate within component groups
- **Escape**: Close overlays and modals

### Screen Reader Support

```typescript
// Example accessible button
<Button
  aria-label="Add new trust indicator"
  aria-describedby="button-help-text"
>
  <PlusIcon className="h-4 w-4" />
  <span className="sr-only">Add new trust indicator</span>
</Button>

// Example accessible form field
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email Address</FormLabel>
      <FormControl>
        <Input
          type="email"
          placeholder="Enter your email"
          aria-describedby="email-description email-error"
          aria-invalid={!!form.formState.errors.email}
          {...field}
        />
      </FormControl>
      <FormDescription id="email-description">
        We'll use this to send you updates about your content.
      </FormDescription>
      <FormMessage id="email-error" />
    </FormItem>
  )}
/>
```

### Focus Management

```typescript
import { useRef, useEffect } from 'react';

const DialogExample = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to continue?</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button ref={closeButtonRef} onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## 🎨 Customization

### Theme Customization

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Custom CanAI colors
        warm: 'hsl(var(--warm))',
        bold: 'hsl(var(--bold))',
        optimistic: 'hsl(var(--optimistic))',
        inspirational: 'hsl(var(--inspirational))',
      },
    },
  },
};
```

### Component Variants

```typescript
// lib/utils.ts - Variant utilities
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom button variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
        // Custom CanAI variants
        warm: 'bg-warm text-white hover:bg-warm/90',
        bold: 'bg-bold text-white hover:bg-bold/90',
        optimistic: 'bg-optimistic text-white hover:bg-optimistic/90',
        inspirational: 'bg-inspirational text-white hover:bg-inspirational/90',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

## 🧪 Testing Components

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Visual Testing

```typescript
// Storybook stories for visual testing
export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    children: 'Button',
  },
};

export const AllVariants = () => (
  <div className="flex gap-4">
    <Button variant="default">Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button variant="bold">Bold</Button>
    <Button variant="optimistic">Optimistic</Button>
    <Button variant="inspirational">Inspirational</Button>
  </div>
);
```

## 📚 Documentation

### Component API Documentation

Each component includes comprehensive TypeScript interfaces:

```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}
```

### Usage Guidelines

1. **Consistency**: Use the same component variants across similar use cases
2. **Accessibility**: Always include proper ARIA labels and descriptions
3. **Performance**: Lazy load heavy components when possible
4. **Testing**: Include accessibility tests for all interactive components
5. **Customization**: Use CSS custom properties for theme customization

## 🤝 Contributing

### Adding New Components

1. Create component file in this directory
2. Follow the shadcn/ui pattern and conventions
3. Include comprehensive TypeScript interfaces
4. Add accessibility features (ARIA labels, keyboard navigation)
5. Write comprehensive tests
6. Add Storybook stories for visual testing
7. Update this README with usage examples

### Component Guidelines

- Use `forwardRef` for components that need ref forwarding
- Include `displayName` for better debugging
- Support `asChild` prop when appropriate for composition
- Use consistent naming conventions
- Include comprehensive JSDoc comments

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Frontend Home](../../README.md) | [🎨 Components](../README.md) |
[📚 Storybook](https://storybook.canai-build.com)

</div>
