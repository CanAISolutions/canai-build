import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Section – provides consistent vertical rhythm (`py-8 sm:py-12`) and centers children
 */
const Section: React.FC<SectionProps> = ({ className, ...props }) => {
  return <section className={cn('py-8 sm:py-12', className)} {...props} />;
};

export default Section;
