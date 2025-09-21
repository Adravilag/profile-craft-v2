import React, { useState, useEffect, useRef } from 'react';

// Layout primitives
import SmartNavigation from '@/components/layout/Navigation/SmartNavigation';
import Footer from '@/components/layout/Footer/Footer';

// UI primitives / components
import { Button } from '@/components/ui/Button/Button';
import FloatingActionButtonGroup from '@/components/ui/FloatingActionButtonGroup/FloatingActionButtonGroup';
import FloatingActionButton from '@/components/ui/FloatingActionButtonGroup/FloatingActionButton';
import { AccessibleToast as Toast } from '@/components/ui/Toast/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import ModalShell from '@/components/ui/Modal/ModalShell';
import TestimonialModal from '@/components/layout/Sections/Testimonials/modal/TestimonialModal';
import ImageCarouselComp from '@/components/ui/ImageCarousel/ImageCarousel';

// Lightweight stubs for pieces not yet implemented as shared exports
const Void: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children ?? null}</>;
export const AdminProtection: React.FC<any> = Void;
export const DiscreteAdminAccess: React.FC<any> = Void;
export const BackendStatusIndicator: React.FC<any> = Void;
export const ScrollToTopButton: React.FC<any> = Void;
export const NavigationOverlay: React.FC<any> = Void;
export const AdminModal: React.FC<any> = Void;
export const IssuerSelector: React.FC<any> = Void;
export const CredentialIdInput: React.FC<any> = Void;
export const Pagination: React.FC<any> = Void;
export const ImageUploadField: React.FC<any> = Void;
export const LexicalEditor: React.FC<any> = Void;
export const RelatedProjects: React.FC<any> = Void;
export const YouTubePlayer: React.FC<any> = Void;

// Re-export real implementations
export {
  SmartNavigation,
  Footer,
  Button,
  FloatingActionButtonGroup,
  FloatingActionButton,
  Toast,
  LoadingSpinner,
  ModalShell,
  TestimonialModal,
};

// Export real implementations with a different name if needed
export const ImageCarousel: React.FC<any> = ImageCarouselComp;
export const SmartFooter: React.FC<any> = Footer;

// Refined LazyImage implementation
export const LazyImage: React.FC<{
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
}> = ({
  src,
  alt = '',
  className,
  fallbackSrc = '/assets/images/foto-perfil.jpg',
  onError,
  onLoad,
  style,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setHasError(false);
    setCurrentSrc(null);

    const targetSrc = src || fallbackSrc;
    if (!targetSrc) return;

    const imgEl = imgRef.current;
    if (!imgEl) return;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setCurrentSrc(targetSrc);
              obs.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      observer.observe(imgEl);
      return () => observer.disconnect();
    } else {
      // Fallback: load immediately
      setCurrentSrc(targetSrc);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError();
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc ?? undefined}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={handleError}
      onLoad={onLoad}
    />
  );
};
