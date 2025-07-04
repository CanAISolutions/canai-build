import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

// Page Title Component
export const PageTitle: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h1
    className={cn(
      'text-4xl md:text-5xl lg:text-6xl font-bold text-white font-playfair tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] mb-4',
      className
    )}
    style={style}
    id={id}
  >
    {children}
  </h1>
);

// Section Title Component
export const SectionTitle: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h2
    className={cn(
      'text-3xl md:text-4xl font-bold text-white font-playfair tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] mb-3',
      className
    )}
    style={style}
    id={id}
  >
    {children}
  </h2>
);

// Card Title Component
export const CardTitle: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h3
    className={cn(
      'text-xl md:text-2xl font-bold text-white font-playfair tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]',
      className
    )}
    style={style}
    id={id}
  >
    {children}
  </h3>
);

// Body Text Component
export const BodyText: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <p
    className={cn(
      'text-base md:text-lg text-[#E6F6FF] font-manrope leading-relaxed',
      className
    )}
    style={style}
    id={id}
  >
    {children}
  </p>
);

// Caption Text Component
export const CaptionText: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <p
    className={cn('text-sm text-[#cce7fa] font-manrope opacity-90', className)}
    style={style}
    id={id}
  >
    {children}
  </p>
);

// Accent Text Component (for highlights)
export const AccentText: React.FC<TypographyProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <span
    className={cn(
      'text-[#36d1fe] font-semibold font-manrope drop-shadow-[0_0_8px_rgba(54,209,254,0.6)]',
      className
    )}
    style={style}
    id={id}
  >
    {children}
  </span>
);
