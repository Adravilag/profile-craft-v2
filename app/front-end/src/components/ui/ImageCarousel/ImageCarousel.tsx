import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LazyImage } from '@/ui';
import clsx from 'clsx';
import styles from './ImageCarousel.module.css';

interface Props {
  images?: string[] | null;
  title?: string;
  className?: string;
}

const ImageCarousel: React.FC<Props> = ({ images = [], title, className }) => {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;

  const handlePrev = useCallback(() => {
    setIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') handlePrev();
    if (event.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    const mainImage = carouselRef.current?.querySelector(
      `.${styles.mainImage}`
    ) as HTMLImageElement | null;

    mainImage?.focus();
  }, [index]);

  const stripStyle = {
    width: `${images.length * 100}%`,
    transform: `translateX(-${index * 100}%)`,
    transition: 'transform 0.5s ease-in-out',
  };

  return (
    <div
      ref={carouselRef}
      className={clsx(styles.carousel, className)}
      aria-label={title || 'Image carousel'}
      role="region"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.main} aria-live="polite">
        <button
          className={clsx(styles.navButton, styles.prev)}
          onClick={handlePrev}
          aria-label="Imagen anterior"
          disabled={images.length <= 1}
        >
          &lt;
        </button>

        <div className={styles.mainImageContainer}>
          <div className={styles.mainImageStrip} style={stripStyle}>
            {images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={title ? `${title} - Imagen ${i + 1}` : `Imagen ${i + 1}`}
                className={styles.mainImage}
                style={{
                  flex: `0 0 100%`,
                  width: `100%`,
                  height: '100%',
                }}
              />
            ))}
          </div>
        </div>

        <button
          className={clsx(styles.navButton, styles.next)}
          onClick={handleNext}
          aria-label="Imagen siguiente"
          disabled={images.length <= 1}
        >
          &gt;
        </button>
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="Miniaturas de imágenes">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={clsx(styles.thumbBtn, i === index && styles.active)}
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={`Mostrar imagen ${i + 1}`}
              role="tab"
              aria-selected={i === index}
              aria-controls={`image-${i + 1}`}
            >
              <LazyImage
                src={src}
                alt={title ? `${title} - Miniatura ${i + 1}` : `Miniatura ${i + 1}`}
                className={styles.thumbImage}
                aria-hidden={i !== index}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
