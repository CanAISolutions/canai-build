import React from 'react';
import { OptimizedImage } from './optimized-image';
import { cn } from '@/lib/utils';

interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  priority?: boolean;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  className,
  overlay = false,
  priority = true,
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="w-full h-full object-cover"
        fallbackSrc={src.replace('&fm=webp', '')}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/80 via-[#0A0F1C]/40 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
