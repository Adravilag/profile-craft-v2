import React, { useRef, useState } from 'react';
import styles from './ImageUploader.module.css';

type ImageUploaderProps = {
  value?: string;
  onChange?: (url: string) => void;
  /** Optional upload handler: receives File and returns Promise<string> with uploaded URL */
  uploadHandler?: (file: File) => Promise<string>;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ value = '', onChange, uploadHandler }) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (f?: File) => {
    const selected = f || (inputRef.current && inputRef.current.files && inputRef.current.files[0]);
    if (!selected) return;
    setFile(selected as File);
    const url = URL.createObjectURL(selected as File);
    setPreview(url);
    // If user just wants to use local preview as value, we do not call onChange yet.
  };

  const handleUpload = async () => {
    if (!file || !uploadHandler) return;
    try {
      setUploading(true);
      const uploadedUrl = await uploadHandler(file);
      setPreview(uploadedUrl);
      if (onChange) onChange(uploadedUrl);
    } catch (err) {
      // In a real app, surface error to user
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview('');
    if (onChange) onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={styles.uploader}>
      <div className={styles.previewArea}>
        {preview ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={preview} alt="Imagen seleccionada" className={styles.previewImage} />
        ) : (
          <div className={styles.placeholder}>No image selected</div>
        )}
      </div>

      <div className={styles.controls}>
        <input
          ref={inputRef}
          id="image-file-input"
          type="file"
          accept="image/*"
          onChange={e => handleSelect(e.target.files ? e.target.files[0] : undefined)}
        />
        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.selectButton}
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            Seleccionar imagen
          </button>

          <button
            type="button"
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={!file || !uploadHandler || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir a Cloudinary'}
          </button>

          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemove}
            disabled={!preview && !file}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
