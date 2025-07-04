import React from 'react';
import { OptimizedImage } from './optimized-image';
import { cn } from '@/lib/utils';

interface BackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  className,
  children,
  overlay = true,
  overlayOpacity = 0.7,
}) => {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={false}
        quality={80}
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        fallbackSrc={src.replace('&fm=webp', '')}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] to-[#00B2E3] -z-10"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
};
