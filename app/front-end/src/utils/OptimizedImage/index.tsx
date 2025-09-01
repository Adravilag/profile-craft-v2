import React, { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

export interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallback,
  alt,
  onError,
  loading, // allow override
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setErrored(true);
    onError?.(e as any);
  };

  const srcToUse = !errored && src ? src : (fallback ?? src);

  return (
    <img
      src={srcToUse}
      alt={alt ?? ''}
      onError={handleError}
      loading={loading ?? 'lazy'}
      decoding={rest.decoding ?? 'async'}
      {...rest}
    />
  );
};

export default OptimizedImage;
