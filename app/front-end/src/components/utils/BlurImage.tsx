import React from 'react';

export interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // kept for compatibility
  placeholder?: string;
  rootMargin?: string;
}

const BlurImage: React.FC<BlurImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  rootMargin,
  loading,
  decoding,
  style,
  ...rest
}) => {
  // Default to native lazy loading and async decoding; callers can override via props
  const loadingAttr = (loading as HTMLImageElement['loading']) || 'lazy';
  const decodingAttr = (decoding as HTMLImageElement['decoding']) || 'async';

  return (
    // render a plain img; keep className/style passed through
    <img
      src={src as string}
      alt={alt}
      className={className}
      loading={loadingAttr}
      decoding={decodingAttr}
      style={style}
      {...rest}
    />
  );
};

export default BlurImage;
