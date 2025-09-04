import React, { useState, useRef } from 'react';
import { ModalShell } from '@/components/ui';
import { useNotification } from '@/hooks/useNotification';
import type { CertificationIssuer } from '@/features/certifications';
import {
  CERTIFICATION_ISSUERS,
  generateVerifyUrl,
  generateCertificateImageUrl,
  getCredentialExample,
} from '@/features/certifications';
import type { Certification } from '@/types/api';
import styles from './CertificationModal.module.css';

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (certificationData: Omit<Certification, 'id'>) => Promise<void>;
  initialData?: Certification;
  isEditing?: boolean;
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}) => {
  const { showSuccess, showError } = useNotification();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [saving, setSaving] = useState(false);

  // Utility functions - definidas antes de usar
  const convertDateToMonthFormat = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') return '';
    if (/^\d{4}-\d{2}$/.test(dateString)) return dateString;
    if (/^\d{4}$/.test(dateString)) return `${dateString}-01`;
    const lower = dateString.toLowerCase();
    const months: Record<string, string> = {
      enero: '01',
      febrero: '02',
      marzo: '03',
      abril: '04',
      mayo: '05',
      junio: '06',
      julio: '07',
      agosto: '08',
      septiembre: '09',
      octubre: '10',
      noviembre: '11',
      diciembre: '12',
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
    };
    const y = (dateString.match(/(\d{4})/) || [])[0] || '';
    for (const k of Object.keys(months)) if (lower.includes(k)) return `${y}-${months[k]}`;
    return y ? `${y}-01` : '';
  };

  const convertMonthFormatToReadable = (monthString: string) => {
    if (!monthString || typeof monthString !== 'string' || !monthString.includes('-'))
      return monthString;
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const m = parseInt(month, 10) - 1;
    return monthNames[m] ? `${monthNames[m]} ${year}` : monthString;
  };

  // Inicializar el formulario
  const initForm = () => {
    if (initialData) {
      return {
        title: initialData.title || '',
        issuer: initialData.issuer || '',
        date: convertDateToMonthFormat(initialData.date || ''),
        credential_id: initialData.credential_id || '',
        image_url: initialData.image_url || '',
        order_index: initialData.order_index || 0,
        verify_url: initialData.verify_url || '',
      };
    } else {
      // Nuevo formulario con datos por defecto
      const defaultIssuer = CERTIFICATION_ISSUERS[0] || null;
      const credentialExample = defaultIssuer ? getCredentialExample(defaultIssuer) : '';
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const imageUrl =
        defaultIssuer && defaultIssuer.certificateImageUrl && credentialExample
          ? generateCertificateImageUrl(defaultIssuer, credentialExample)
          : defaultIssuer?.logoUrl || '';
      const verifyUrl =
        defaultIssuer && credentialExample && defaultIssuer.verifyBaseUrl
          ? generateVerifyUrl(defaultIssuer, credentialExample)
          : '';

      return {
        title: defaultIssuer
          ? `${defaultIssuer.name} - Certificación de ejemplo`
          : 'Certificación de ejemplo',
        issuer: defaultIssuer?.name || '',
        date: ym,
        credential_id: credentialExample,
        image_url: imageUrl || '',
        order_index: 0,
        verify_url: verifyUrl || '',
      };
    }
  };

  const [form, setForm] = useState(initForm);
  const [selectedIssuer, setSelectedIssuer] = useState<CertificationIssuer | null>(() => {
    if (initialData) {
      return CERTIFICATION_ISSUERS.find(i => i.name === initialData.issuer) || null;
    }
    return CERTIFICATION_ISSUERS[0] || null;
  });
  const [imageSource, setImageSource] = useState<'auto' | 'logo' | 'custom'>(() => 'auto');
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (initialData && initialData.image_url) return initialData.image_url;
    const def = CERTIFICATION_ISSUERS[0];
    return def?.logoUrl || '';
  });
  const placeholderDataUri =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160"><rect width="100%" height="100%" fill="#0f1720"/><text x="50%" y="50%" fill="#93a4b5" font-size="14" font-family="Arial, sans-serif" dominant-baseline="middle" text-anchor="middle">Sin imagen</text></svg>`
    );
  const [imgError, setImgError] = useState(false);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'order_index' ? parseInt(value) || 0 : value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, date: e.target.value }));

  const handleImageError = () => {
    setImgError(true);
  };

  const handleIssuerChange = (issuer: CertificationIssuer | null) => {
    if (issuer && issuer.name) {
      setSelectedIssuer(issuer);
      setForm(prev => ({
        ...prev,
        issuer: issuer.name,
        image_url: issuer.logoUrl || prev.image_url,
      }));
      if (form.credential_id && form.credential_id.trim()) {
        if (issuer.verifyBaseUrl) {
          const v = generateVerifyUrl(issuer, form.credential_id);
          if (v) setForm(prev => ({ ...prev, verify_url: v }));
        }
        if (issuer.certificateImageUrl) {
          const img = generateCertificateImageUrl(issuer, form.credential_id);
          if (img) setForm(prev => ({ ...prev, image_url: img }));
        }
      }
      // update preview according to imageSource
      setTimeout(() => {
        refreshPreview(issuer, form.credential_id, form.image_url, imageSource);
      }, 0);
    } else {
      setSelectedIssuer(null);
      setForm(prev => ({ ...prev, issuer: '', image_url: '', verify_url: '' }));
    }
  };

  const refreshPreview = (
    issuer: CertificationIssuer | null,
    credentialId: string,
    manualUrl: string,
    src: typeof imageSource
  ) => {
    setImgError(false); // Reset error state on refresh
    if (src === 'custom' && manualUrl && manualUrl.trim()) {
      setPreviewUrl(manualUrl);
      return;
    }
    if ((src === 'auto' || src === 'logo') && issuer) {
      if (src === 'auto' && credentialId && issuer.certificateImageUrl) {
        const gen = generateCertificateImageUrl(issuer, credentialId);
        if (gen) {
          setPreviewUrl(gen);
          return;
        }
      }
      setPreviewUrl(issuer.logoUrl || manualUrl || '');
      return;
    }
    setPreviewUrl(manualUrl || issuer?.logoUrl || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.issuer.trim() || !form.date.trim()) {
      showError('Error de validación', 'Título, emisor y fecha son obligatorios');
      return;
    }

    try {
      setSaving(true);
      let imageUrl = form.image_url;
      let verifyUrl = '';
      if (selectedIssuer && form.credential_id.trim()) {
        const v = generateVerifyUrl(selectedIssuer, form.credential_id);
        if (v) verifyUrl = v;
        const img = generateCertificateImageUrl(selectedIssuer, form.credential_id);
        if (img) imageUrl = img;
      } else if (selectedIssuer && !form.credential_id.trim()) {
        imageUrl = selectedIssuer.logoUrl || form.image_url;
      }

      const payload = {
        ...form,
        date: convertMonthFormatToReadable(form.date),
        image_url: imageUrl,
        verify_url: verifyUrl || undefined,
        user_id: 1,
      } as Omit<Certification, 'id'>;

      await onSave(payload);
      showSuccess(
        isEditing ? '¡Certificación actualizada!' : '¡Certificación creada!',
        isEditing
          ? 'Los cambios se han guardado correctamente'
          : 'La nueva certificación se ha añadido correctamente'
      );
      onClose();
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudo guardar la certificación');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell
      title={isEditing ? 'Editar Certificación' : 'Nueva Certificación'}
      onClose={onClose}
      maxWidth={800}
      formRef={formRef}
      actionButtons={[
        {
          key: 'cancel',
          label: 'Cancelar',
          onClick: onClose,
          variant: 'ghost',
          disabled: saving,
        },
        {
          key: 'save',
          label: isEditing ? 'Guardar Cambios' : 'Crear Certificación',
          submit: true,
          variant: 'primary',
          disabled: saving,
        },
      ]}
    >
      <div className={styles.certificationModalContent} data-testid="certification-modal">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`${styles.certificationModalForm} ${saving ? styles.certificationModalFormSubmitting : ''}`}
        >
          <div className={styles.formFields}>
            <div className={styles.certificationModalRow}>
              <div className={styles.certificationModalGroup}>
                <label className={styles.certificationModalLabel} htmlFor="title">
                  <i className={`fas fa-certificate ${styles.certificationModalIcon}`}></i> Título *
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={styles.certificationModalInput}
                  required
                  placeholder="Ej: AWS Solutions Architect"
                />
              </div>
              <div className={styles.certificationModalGroup}>
                <label className={styles.certificationModalLabel} htmlFor="issuer">
                  <i className={`fas fa-building ${styles.certificationModalIcon}`}></i> Emisor *
                </label>
                <select
                  id="issuer"
                  name="issuer"
                  value={form.issuer}
                  onChange={e => {
                    const issuer = CERTIFICATION_ISSUERS.find(i => i.name === e.target.value);
                    handleIssuerChange(issuer || null);
                  }}
                  className={styles.certificationModalSelect}
                  required
                >
                  <option value="">Seleccionar emisor...</option>
                  {CERTIFICATION_ISSUERS.map(issuer => (
                    <option key={issuer.id} value={issuer.name}>
                      {issuer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.certificationModalRow}>
              <div className={styles.certificationModalGroup}>
                <label className={styles.certificationModalLabel} htmlFor="date">
                  <i className={`fas fa-calendar-alt ${styles.certificationModalIcon}`}></i> Fecha
                  de emisión *
                </label>
                <input
                  type="month"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleDateChange}
                  className={styles.certificationModalInput}
                  required
                />
              </div>
              <div className={styles.certificationModalGroup}>
                <label className={styles.certificationModalLabel} htmlFor="credential_id">
                  <i className={`fas fa-id-card ${styles.certificationModalIcon}`}></i> ID de
                  credencial
                </label>
                <input
                  id="credential_id"
                  name="credential_id"
                  value={form.credential_id}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(p => ({ ...p, credential_id: v }));
                    if (selectedIssuer && v.trim()) {
                      if (selectedIssuer.verifyBaseUrl) {
                        const verifyUrl = generateVerifyUrl(selectedIssuer, v);
                        if (verifyUrl) setForm(p => ({ ...p, verify_url: verifyUrl }));
                      }
                      if (selectedIssuer.certificateImageUrl) {
                        const imageUrl = generateCertificateImageUrl(selectedIssuer, v);
                        if (imageUrl) {
                          setForm(p => ({ ...p, image_url: imageUrl }));
                          refreshPreview(selectedIssuer, v, imageUrl, imageSource);
                        }
                      }
                    }
                  }}
                  className={styles.certificationModalInput}
                  placeholder={
                    selectedIssuer
                      ? `Ej: ${getCredentialExample(selectedIssuer)}`
                      : 'ID de la certificación'
                  }
                />
              </div>
            </div>

            <div className={styles.certificationModalGroup}>
              <label className={styles.certificationModalLabel} htmlFor="image_source">
                Fuente de imagen
              </label>
              <select
                id="image_source"
                value={imageSource}
                onChange={e => {
                  const v = e.target.value as any;
                  setImageSource(v);
                  refreshPreview(selectedIssuer, form.credential_id, form.image_url, v);
                }}
                className={styles.certificationModalSelect}
              >
                <option value="auto">Auto (generado)</option>
                <option value="logo">Logo del emisor</option>
                <option value="custom">Personalizada (URL)</option>
              </select>
            </div>

            {imageSource === 'custom' && (
              <div className={styles.certificationModalGroup}>
                <label className={styles.certificationModalLabel} htmlFor="image_url">
                  <i className={`fas fa-image ${styles.certificationModalIcon}`}></i> URL de imagen
                  personalizada
                </label>
                <div className={styles.inputWithAction}>
                  <input
                    id="image_url"
                    name="image_url"
                    value={form.image_url}
                    onChange={e => {
                      handleChange(e);
                      refreshPreview(selectedIssuer, form.credential_id, e.target.value, 'custom');
                    }}
                    className={styles.certificationModalInput}
                    placeholder="URL de la imagen de la certificación"
                    disabled={imageSource !== 'custom'}
                  />
                  {form.image_url && imageSource === 'custom' && (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className={`${styles.actionIcon} ${styles.imagePreviewIcon}`}
                      onError={e => (e.currentTarget.style.display = 'none')}
                      onLoad={e => (e.currentTarget.style.display = 'block')}
                    />
                  )}
                </div>
              </div>
            )}

            <div className={styles.certificationModalGroup}>
              <label className={styles.certificationModalLabel} htmlFor="verify_url">
                <i className={`fas fa-link ${styles.certificationModalIcon}`}></i> URL de
                verificación
              </label>
              <div className={styles.inputWithAction}>
                <input
                  id="verify_url"
                  name="verify_url"
                  value={form.verify_url}
                  onChange={handleChange}
                  className={styles.certificationModalInput}
                  placeholder="Se genera automáticamente"
                  disabled
                />
                {form.verify_url && (
                  <a
                    href={form.verify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionIcon}
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                )}
              </div>
            </div>

            <div className={styles.certificationModalGroup}>
              <label className={styles.certificationModalLabel} htmlFor="order_index">
                <i className={`fas fa-sort-numeric-up ${styles.certificationModalIcon}`}></i> Orden
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={form.order_index}
                onChange={handleChange}
                className={styles.certificationModalInput}
                min="0"
                placeholder="Orden de visualización"
              />
            </div>
          </div>

          <div className={styles.previewContainer}>
            <div
              className={`${styles.certificationModalPreview} ${imgError ? styles.previewError : ''}`}
            >
              {imgError ? (
                <>
                  <i
                    className="fas fa-exclamation-triangle fa-2x"
                    style={{ color: 'var(--color-error)' }}
                  ></i>
                  <span style={{ color: 'var(--text-muted)' }}>No se pudo cargar la imagen</span>
                </>
              ) : (
                <img
                  src={previewUrl || placeholderDataUri}
                  alt="Preview certificación"
                  onError={handleImageError}
                />
              )}
              <div className={styles.certificationModalPreview__meta}>
                <strong className={styles.previewTitle}>{form.title || 'Título de ejemplo'}</strong>
                <span className={styles.previewIssuer}>
                  {selectedIssuer?.name || form.issuer || 'Emisor de ejemplo'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default CertificationModal;
