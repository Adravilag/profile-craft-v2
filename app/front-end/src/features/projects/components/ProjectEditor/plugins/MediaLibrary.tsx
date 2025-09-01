// Componente para la gestión de imágenes del artículo
import React, { useState, useRef, useEffect } from 'react';
import Modal from '@components/layout/Modal/Modal';
import styles from './MediaLibrary.module.css';
import { media as mediaApi } from '@/services/endpoints';
import type { MediaItem as APIMediaItem } from '@/types/api';
import BlurImage from '@/components/utils/BlurImage';

export interface MediaItem {
  id?: number;
  url: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size?: number;
  thumbnail?: string;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estado para los archivos de media
  const [mediaItems, setMediaItems] = useState<APIMediaItem[]>([]);

  // Cargar archivos de media al abrir el componente
  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await mediaApi.getMediaFiles();
      setMediaItems(files);
    } catch (error) {
      console.error('Error cargando archivos de media:', error);
      setError('Error al cargar los archivos. Verifica tu conexión.');
      // Fallback a archivos de ejemplo si hay error
      setMediaItems([
        {
          id: 1,
          url: '/assets/images/foto-perfil.jpg',
          name: 'Foto de perfil',
          type: 'image',
          thumbnail: '/assets/images/foto-perfil.jpg',
        },
        {
          id: 2,
          url: '/assets/images/pixihama.png',
          name: 'Pixihama',
          type: 'image',
          thumbnail: '/assets/images/pixihama.png',
        },
        {
          id: 3,
          url: '/assets/images/airpixel_logo.png',
          name: 'AirPixel Logo',
          type: 'image',
          thumbnail: '/assets/images/airpixel_logo.png',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtra los elementos según la búsqueda
  const filteredItems = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };
  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadFile(file);
      } else {
        setError('Solo se permiten archivos de imagen');
      }
    });
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simular progreso mientras sube
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Subir archivo real
      const response = await mediaApi.uploadImage(file, 'project');

      // Completar progreso
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Agregar archivo a la lista
      setMediaItems(prev => [response.file, ...prev]);

      // Cambiar a la pestaña de biblioteca para mostrar el archivo subido
      setTimeout(() => {
        setActiveTab('library');
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      setError(error.response?.data?.error || 'Error al subir el archivo');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Limpiar el input para permitir subir el mismo archivo otra vez si es necesario
    e.target.value = '';
  };

  const handleDeleteFile = async (item: APIMediaItem) => {
    if (!item.filename) return;

    try {
      await mediaApi.deleteMediaFile(item.filename);
      setMediaItems(prev => prev.filter(file => file.id !== item.id));
    } catch (error: any) {
      console.error('Error eliminando archivo:', error);
      setError(error.response?.data?.error || 'Error al eliminar el archivo');
    }
  };
  return (
    <Modal>
      <div className={styles.mediaLibraryOverlay}>
        <div className={styles.mediaLibraryModal}>
          <div className={styles.mediaLibraryHeader}>
            <h2>Biblioteca de Medios</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.mediaLibraryTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.active : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <i className="fas fa-upload"></i> Subir nuevo
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'library' ? styles.active : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <i className="fas fa-photo-video"></i> Biblioteca
            </button>
          </div>
          <div className={styles.mediaLibraryContent}>
            {/* Mostrar errores si los hay */}
            {error && (
              <div className={styles.errorMessage}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
                <button onClick={() => setError(null)} className={styles.closeError}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            {activeTab === 'upload' && (
              <div className="upload-section">
                <div
                  className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className={styles.dropzoneContent}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Arrastra y suelta archivos aquí o</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                    <button className={styles.selectFilesBtn} onClick={triggerFileInput}>
                      Seleccionar archivos
                    </button>
                    <p className={styles.supportedFormats}>JPG, PNG, GIF, SVG, WEBP • Max 10MB</p>
                  </div>
                </div>

                {uploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>{uploadProgress}% Completado</span>
                  </div>
                )}
              </div>
            )}{' '}
            {activeTab === 'library' && (
              <div className="library-section">
                <div className={styles.searchBar}>
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar medios..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button
                    className={styles.refreshBtn}
                    onClick={loadMediaFiles}
                    disabled={loading}
                    title="Actualizar lista"
                  >
                    <i className={`fas fa-sync-alt ${loading ? styles.spinning : ''}`}></i>
                  </button>
                </div>

                {loading ? (
                  <div className={styles.loadingSpinner}>
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando archivos...</p>
                  </div>
                ) : (
                  <div className={styles.mediaGrid}>
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div key={item.id} className={styles.mediaItem}>
                          <div className={styles.mediaThumbnail}>
                            <BlurImage src={item.thumbnail} alt={item.name} />
                            {item.filename && (
                              <button
                                className={styles.deleteBtn}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteFile(item);
                                }}
                                title="Eliminar archivo"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <div className={styles.mediaInfo} onClick={() => onSelect(item.url)}>
                            <span className={styles.mediaName}>{item.name}</span>
                            <span className={styles.mediaType}>
                              {item.type === 'image' && <i className="fas fa-image"></i>}
                              {item.type === 'video' && <i className="fas fa-video"></i>}
                              {item.type === 'document' && <i className="fas fa-file"></i>}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noResults}>
                        <i className="fas fa-search"></i>
                        <p>No se encontraron resultados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaLibrary;
