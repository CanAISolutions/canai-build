import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  fallbackSrc?: string;
}

export const OptimizedImage = React.forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(
  (
    {
      src,
      alt,
      width,
      height,
      priority = false,
      quality = 80,
      sizes = '100vw',
      className,
      fallbackSrc,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Generate WebP URL from Unsplash source
    const generateWebPUrl = (originalSrc: string, targetWidth: number) => {
      if (originalSrc.includes('unsplash.com')) {
        return `${originalSrc}?auto=format&fit=crop&w=${targetWidth}&q=${quality}&fm=webp`;
      }
      return originalSrc;
    };

    // Generate responsive srcSet for WebP
    const generateSrcSet = (originalSrc: string) => {
      if (originalSrc.includes('unsplash.com')) {
        const widths = [480, 768, 1024, 1200, 1600];
        return widths
          .map(w => `${generateWebPUrl(originalSrc, w)} ${w}w`)
          .join(', ');
      }
      return undefined;
    };

    const webpSrc = generateWebPUrl(src, 1200);
    const srcSet = generateSrcSet(src);

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
    };

    return (
      <picture className={cn('block', className)}>
        {/* WebP source with responsive srcset */}
        {srcSet && !hasError && (
          <source srcSet={srcSet} sizes={sizes} type="image/webp" />
        )}

        {/* Fallback image */}
        <img
          ref={ref}
          src={hasError && fallbackSrc ? fallbackSrc : webpSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />

        {/* Loading placeholder */}
        {!isLoaded && !hasError && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-[rgba(25,60,101,0.3)] to-[rgba(30,73,115,0.3)] animate-pulse rounded',
              className
            )}
            style={{ width, height }}
            aria-hidden="true"
          />
        )}
      </picture>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
