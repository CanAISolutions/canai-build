import React from 'react';
import { cn } from '@/lib/utils';

interface StandardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'product' | 'content' | 'form';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
}

const StandardCard: React.FC<StandardCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  padding = 'lg',
  style,
}) => {
  const baseClasses =
    'rounded-3xl border-2 transition-all duration-300 overflow-hidden relative';

  const variantClasses = {
    default:
      'bg-gradient-to-br from-[#193c65]/95 via-[#1e4a73]/95 to-[#12294a]/95 border-[#36d1fe] shadow-[0_0_40px_rgba(54,209,254,0.3)] backdrop-blur-sm text-white',
    glass:
      'bg-[rgba(25,60,101,0.85)] border-[rgba(54,209,254,0.4)] backdrop-blur-md shadow-[0_0_30px_rgba(54,209,254,0.2)] text-white',
    product:
      'bg-gradient-to-br from-[#193c65]/95 via-[#1e4a73]/95 to-[#12294a]/95 border-[#36d1fe] shadow-[0_0_40px_rgba(54,209,254,0.3)] backdrop-blur-sm text-white',
    content:
      'bg-[rgba(25,60,101,0.9)] border-[rgba(54,209,254,0.4)] backdrop-blur-md shadow-[0_0_30px_rgba(54,209,254,0.2)] text-white',
    form: 'bg-[rgba(25,60,101,0.9)] border-[rgba(54,209,254,0.5)] backdrop-blur-md shadow-[0_0_35px_rgba(54,209,254,0.25)] text-white',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverClasses = hover
    ? 'hover:shadow-[0_0_60px_rgba(54,209,254,0.5)] hover:scale-[1.02] hover:border-[#36d1fe]'
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      style={style}
    >
      <div className="w-full h-full break-words overflow-hidden word-wrap text-white">
        {children}
      </div>
    </div>
  );
};

export default StandardCard;
