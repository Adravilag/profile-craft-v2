import React from 'react';
// Layout primitives
import SmartNavigation from '@/components/layout/Navigation/SmartNavigation';
import Footer from '@/components/layout/Footer/Footer';

// UI primitives / components (real implementations when present)
import { Button } from '@/components/ui/Button/Button';
import FloatingActionButtonGroup from '@/components/ui/FloatingActionButtonGroup/FloatingActionButtonGroup';
import FloatingActionButton from '@/components/ui/FloatingActionButtonGroup/FloatingActionButton';
import { AccessibleToast as Toast } from '@/components/ui/Toast/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import ModalShell from '@/components/ui/Modal/ModalShell';
import TestimonialModal from '@/components/layout/Sections/Testimonials/modal/TestimonialModal';

// Keep lightweight stubs for pieces not yet implemented as shared exports
const Void: React.FC<any> = ({ children }) => <>{children ?? null}</>;
export const AdminProtection: React.FC<any> = Void;
export const DiscreteAdminAccess: React.FC<any> = Void;
export const BackendStatusIndicator: React.FC<any> = Void;
export const ScrollToTopButton: React.FC<any> = Void;
export const NavigationOverlay: React.FC<any> = Void;

// Re-export real implementations
export { SmartNavigation };
export { Footer };
export { Button };
export { FloatingActionButtonGroup };
export { FloatingActionButton };
export { Toast };
export { LoadingSpinner };
export { ModalShell };
export { TestimonialModal };

// Keep a few domain stubs so imports across the app don't break during refactor
export const AdminModal: React.FC<any> = Void;
export const IssuerSelector: React.FC<any> = Void;
export const CredentialIdInput: React.FC<any> = Void;
export const Pagination: React.FC<any> = Void;
export const ImageUploadField: React.FC<any> = Void;
export const LexicalEditor: React.FC<any> = Void;
export const ImageCarousel: React.FC<any> = Void;
export const RelatedProjects: React.FC<any> = Void;
export const YouTubePlayer: React.FC<any> = Void;

// Simple LazyImage fallback implementation kept for backward compatibility
export const LazyImage: React.FC<{
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}> = ({
  src,
  alt = '',
  className,
  fallbackSrc = '/assets/images/foto-perfil.jpg',
  onError,
  onLoad,
}) => {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [currentSrc, setCurrentSrc] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!src) return setCurrentSrc(fallbackSrc);

    let observer: IntersectionObserver | null = null;
    const imgEl = imgRef.current;

    const load = () => setCurrentSrc(src);

    if (imgEl && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              load();
              observer?.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      observer.observe(imgEl);
    } else {
      // Fallback: load immediately
      load();
    }

    return () => {
      observer?.disconnect();
    };
  }, [src, fallbackSrc]);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      ref={imgRef}
      src={currentSrc ?? fallbackSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        if (onError) onError();
      }}
      onLoad={onLoad}
    />
  );
};

export const SmartFooter: React.FC<any> = Footer;
