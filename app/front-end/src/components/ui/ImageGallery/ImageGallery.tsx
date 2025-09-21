import React, { useRef, useState, useCallback, useMemo } from 'react';
import styles from './ImageGallery.module.css';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  uploaded: boolean;
}

interface ImageGalleryProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  coverUrl?: string | null;
  onSetCover?: (url: string | null) => void;
  uploadHandler?: (file: File) => Promise<string>;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageGallery: React.FC<ImageGalleryProps> = ({
  value = [],
  onChange,
  uploadHandler,
  coverUrl,
  onSetCover,
  maxImages = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  disabled = false,
  loading = false,
  className,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize images from value prop
  React.useEffect(() => {
    if (value && value.length > 0) {
      const newImages = value.map((url, index) => ({
        id: `existing-${index}-${url}`,
        url,
        uploaded: true,
      }));
      setImages(newImages);
    } else {
      setImages([]);
    }
  }, [value]);

  // Validation functions
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Tipo de archivo no válido. Se aceptan: ${acceptedTypes.join(', ')}`;
      }
      if (file.size > maxFileSize) {
        return `El archivo es demasiado grande. Máximo: ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`;
      }
      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  const validateImageCount = useCallback(
    (newCount: number): string | null => {
      if (newCount > maxImages) {
        return `Máximo ${maxImages} imágenes permitidas`;
      }
      return null;
    },
    [maxImages]
  );

  // File selection handler
  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || disabled) return;

      setError(null);
      const newFiles = Array.from(selectedFiles);

      // Validate total count
      const totalCount = images.length + newFiles.length;
      const countError = validateImageCount(totalCount);
      if (countError) {
        setError(countError);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of newFiles) {
        const fileError = validateFile(file);
        if (fileError) {
          errors.push(`${file.name}: ${fileError}`);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setError(errors.join('. '));
        return;
      }

      // Create preview URLs and add to images
      const newImages: ImageItem[] = validFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file,
        uploaded: false,
      }));

      setImages(prev => [...prev, ...newImages]);
    },
    [images.length, disabled, validateFile, validateImageCount]
  );

  // Remove image handler
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      if (disabled) return;

      setImages(prev => {
        const imageToRemove = prev.find(img => img.id === imageId);
        if (!imageToRemove) return prev;

        // Only revoke blob URLs, not real URLs
        if (imageToRemove.url.startsWith('blob:') && imageToRemove.file) {
          URL.revokeObjectURL(imageToRemove.url);
        }

        // If removing cover image, clear cover
        if (coverUrl === imageToRemove.url) {
          // defer parent update to avoid setState during render
          Promise.resolve().then(() => onSetCover?.(null));
        }

        const newImages = prev.filter(img => img.id !== imageId);

        // Update parent component with uploaded URLs only
        const uploadedUrls = newImages.filter(img => img.uploaded).map(img => img.url);
        // defer parent callback to avoid updating parent while rendering this component
        Promise.resolve().then(() => onChange?.(uploadedUrls));

        return newImages;
      });
    },
    [disabled, coverUrl, onSetCover, onChange]
  );

  // Cover toggle handler
  const handleToggleCover = useCallback(
    (imageUrl: string) => {
      if (disabled) return;

      const newCover = coverUrl === imageUrl ? null : imageUrl;
      // defer parent update to avoid React render-phase update warnings
      Promise.resolve().then(() => onSetCover?.(newCover));
    },
    [disabled, coverUrl, onSetCover]
  );

  // Upload all pending files
  const handleUploadAll = useCallback(async () => {
    if (!uploadHandler || disabled || uploading) return;

    const pendingImages = images.filter(img => !img.uploaded && img.file);
    if (pendingImages.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = pendingImages.map(async image => {
        if (!image.file) return image;

        try {
          const uploadedUrl = await uploadHandler(image.file);

          // Only revoke blob URLs, not real URLs
          if (image.url.startsWith('blob:') && image.file) {
            URL.revokeObjectURL(image.url);
          }

          return {
            ...image,
            url: uploadedUrl,
            uploaded: true,
            file: undefined,
          };
        } catch (err) {
          console.error(`Failed to upload ${image.file.name}:`, err);
          throw new Error(`Error al subir ${image.file.name}`);
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Update images state with uploaded URLs
      setImages(prev => {
        return prev.map(img => {
          const uploaded = uploadedImages.find(up => up.id === img.id);
          return uploaded || img;
        });
      });

      // Get all uploaded URLs (both existing and newly uploaded)
      const updatedImages = images.map(img => {
        const uploaded = uploadedImages.find(up => up.id === img.id);
        return uploaded || img;
      });

      const allUploadedUrls = updatedImages
        .filter(img => img.uploaded || uploadedImages.some(up => up.id === img.id))
        .map(img => {
          const uploaded = uploadedImages.find(up => up.id === img.id);
          return uploaded ? uploaded.url : img.url;
        });

      // Set first image as cover if no cover is set
      if (!coverUrl && allUploadedUrls.length > 0) {
        onSetCover?.(allUploadedUrls[0]);
      }

      // Notify parent component with all uploaded URLs
      onChange?.(allUploadedUrls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir las imágenes';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [uploadHandler, disabled, uploading, images, coverUrl, onSetCover, onChange]);

  // Computed values
  const pendingCount = useMemo(() => images.filter(img => !img.uploaded).length, [images]);

  const canAddMore = useMemo(() => images.length < maxImages, [images.length, maxImages]);

  const acceptString = useMemo(() => acceptedTypes.join(','), [acceptedTypes]);

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      // Cleanup blob URLs on unmount (only blob URLs, not real URLs)
      images.forEach(image => {
        if (image.url.startsWith('blob:') && image.file) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  return (
    <div className={`${styles.gallery} ${className || ''}`}>
      {/* Error display */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
            aria-label="Cerrar error"
          >
            ×
          </button>
        </div>
      )}

      {/* Image grid */}
      <div className={styles.previewGrid}>
        {images.length > 0 ? (
          images.map(image => {
            const isCover = coverUrl === image.url;
            const isPending = !image.uploaded;

            return (
              <div key={image.id} className={`${styles.thumb} ${isPending ? styles.pending : ''}`}>
                <img src={image.url} alt={`Imagen ${image.id}`} loading="lazy" />

                {/* Overlay controls */}
                <div className={styles.thumbOverlay}>
                  {isCover && (
                    <span className={styles.coverBadge} aria-hidden="true">
                      Portada
                    </span>
                  )}

                  {isPending && (
                    <span className={styles.pendingBadge} aria-hidden="true">
                      Pendiente
                    </span>
                  )}

                  <div className={styles.thumbActions}>
                    <button
                      type="button"
                      className={`${styles.coverBtn} ${isCover ? styles.coverActive : ''}`}
                      onClick={() => handleToggleCover(image.url)}
                      disabled={disabled || isPending}
                      aria-pressed={isCover}
                      title={isCover ? 'Quitar como portada' : 'Marcar como portada'}
                    >
                      {isCover ? '★' : '☆'}
                    </button>

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={disabled}
                      aria-label={`Eliminar imagen ${image.id}`}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📸</div>
            <p>No hay imágenes en la galería</p>
            <p className={styles.emptyHint}>Selecciona hasta {maxImages} imágenes para comenzar</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple
          onChange={e => handleFileSelect(e.target.files)}
          disabled={disabled || !canAddMore}
          aria-describedby="file-constraints"
        />

        <div id="file-constraints" className={styles.constraints}>
          Máximo {maxImages} imágenes • {(maxFileSize / (1024 * 1024)).toFixed(1)}MB por archivo
        </div>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.selectButton}
            onClick={() => inputRef.current?.click()}
            disabled={disabled || !canAddMore || loading}
            aria-describedby="select-button-status"
          >
            {loading ? 'Cargando...' : 'Seleccionar imágenes'}
          </button>

          <span id="select-button-status" className={styles.visuallyHidden}>
            {images.length} de {maxImages} imágenes seleccionadas
          </span>

          {pendingCount > 0 && (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={handleUploadAll}
              disabled={!uploadHandler || uploading || disabled}
            >
              {uploading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Subiendo...
                </>
              ) : (
                `Subir ${pendingCount} imagen${pendingCount !== 1 ? 'es' : ''}`
              )}
            </button>
          )}
        </div>

        {/* Status info */}
        {images.length > 0 && (
          <div className={styles.status}>
            <span className={styles.statusText}>
              {images.filter(img => img.uploaded).length} subidas • {pendingCount} pendientes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
