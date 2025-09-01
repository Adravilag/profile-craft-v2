import React, { useState, useEffect, useRef } from 'react';
import { certifications as certificationsApi } from '@/services/endpoints';
import BlurImage from '@/components/utils/BlurImage';
const { getCertifications, createCertification, updateCertification, deleteCertification } =
  certificationsApi;
import type { Certification } from '@/types/api';
import { useNotification } from '@/hooks/useNotification';
import ModalShell from '@/components/ui/Modal/ModalShell';
import { IssuerSelector, CredentialIdInput } from '@/ui/components/forms';
import type { CertificationIssuer } from '@/features/certifications';
import {
  CERTIFICATION_ISSUERS,
  generateVerifyUrl,
  generateCertificateImageUrl,
  getCredentialExample,
} from '@/features/certifications';
import styles from './CertificationsAdmin.module.css';

interface CertificationsAdminProps {
  onClose: () => void;
}

const CertificationsAdmin: React.FC<CertificationsAdminProps> = ({ onClose }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState({
    title: '',
    issuer: '',
    date: '',
    credential_id: '',
    image_url: '',
    order_index: 0,
    verify_url: '',
  });

  const [selectedIssuer, setSelectedIssuer] = useState<CertificationIssuer | null>(null);

  const emptyForm = { ...form };

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await getCertifications();
      setCertifications(data);
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudieron cargar las certificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'order_index' ? parseInt(value) || 0 : value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, date: e.target.value }));

  const handleIssuerChange = (issuer: CertificationIssuer) => {
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
    } else {
      setSelectedIssuer(null);
      setForm(prev => ({ ...prev, issuer: '', image_url: '', verify_url: '' }));
    }
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
      } as any;

      if (editingId) {
        await updateCertification(editingId, payload);
        showSuccess('¡Certificación actualizada!', 'Los cambios se han guardado correctamente');
      } else {
        await createCertification(payload);
        showSuccess('¡Certificación creada!', 'La nueva certificación se ha añadido correctamente');
      }

      await loadCertifications();
      handleCloseForm();
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudo guardar la certificación');
    } finally {
      setSaving(false);
    }
  };

  const convertDateToMonthFormat = (dateString: string) => {
    if (!dateString) return '';
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
    if (!monthString || !monthString.includes('-')) return monthString;
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

  const handleEdit = (c: Certification) => {
    const issuer = CERTIFICATION_ISSUERS.find(i => i.name === c.issuer) || null;
    setForm({
      title: c.title,
      issuer: c.issuer,
      date: convertDateToMonthFormat(c.date),
      credential_id: c.credential_id || '',
      image_url: c.image_url || '',
      order_index: c.order_index || 0,
      verify_url: c.verify_url || '',
    });
    setSelectedIssuer(issuer);
    setEditingId(c._id || c.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string, title: string) => {
    if (!confirm(`🗑️ ¿Eliminar "${title}"?`)) return;
    try {
      await deleteCertification(id.toString());
      showSuccess('¡Certificación eliminada!', 'La certificación se ha eliminado correctamente');
      await loadCertifications();
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudo eliminar la certificación');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setSelectedIssuer(null);
    setEditingId(null);
  };

  const handleNewCertification = () => {
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
    setForm({
      title: defaultIssuer
        ? `${defaultIssuer.name} - Certificación de ejemplo`
        : 'Certificación de ejemplo',
      issuer: defaultIssuer?.name || '',
      date: ym,
      credential_id: credentialExample,
      image_url: imageUrl || '',
      order_index: certifications.length,
      verify_url: verifyUrl || '',
    });
    setSelectedIssuer(defaultIssuer);
    setEditingId(null);
    setShowForm(true);
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <ModalShell
      title="Administración de Certificaciones"
      onClose={onClose}
      maxWidth={1200}
      formRef={formRef}
      actionButtons={
        showForm
          ? [
              {
                key: 'cancelForm',
                label: 'Cancelar',
                onClick: handleCloseForm,
                variant: 'ghost',
                disabled: saving,
              },
              {
                key: 'saveForm',
                label: editingId ? 'Guardar Cambios' : 'Crear Certificación',
                submit: true,
                variant: 'primary',
                disabled: saving,
              },
            ]
          : [
              {
                key: 'newCert',
                label: 'Nueva Certificación',
                onClick: handleNewCertification,
                variant: 'primary',
              },
            ]
      }
    >
      <div className="admin-content">
        {showForm ? (
          <div className={styles.formContainer} role="region" aria-labelledby="cert-form-title">
            <form ref={formRef} onSubmit={handleSubmit} className={styles.certificationForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">
                    <i className="fas fa-certificate"></i> Título *
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={styles.modernInput}
                    required
                    placeholder="Ej: AWS Solutions Architect"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="issuer">
                    <i className="fas fa-building"></i> Emisor *
                  </label>
                  <IssuerSelector
                    id="issuer"
                    name="issuer"
                    value={form.issuer}
                    onChange={handleIssuerChange}
                    required
                    placeholder="Buscar o seleccionar emisor..."
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">
                    <i className="fas fa-calendar-alt"></i> Fecha de emisión *
                  </label>
                  <input
                    type="month"
                    id="date"
                    name="date"
                    value={form.date}
                    onChange={handleDateChange}
                    className={styles.modernInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="credential_id">
                    <i className="fas fa-id-card"></i> ID de credencial
                  </label>
                  <CredentialIdInput
                    value={form.credential_id}
                    onChange={(v: string) => {
                      setForm(p => ({ ...p, credential_id: v }));
                      if (selectedIssuer && v.trim()) {
                        if (selectedIssuer.verifyBaseUrl) {
                          const vurl = generateVerifyUrl(selectedIssuer, v);
                          if (vurl) setForm(prev => ({ ...prev, verify_url: vurl }));
                        }
                        if (selectedIssuer.certificateImageUrl) {
                          const img = generateCertificateImageUrl(selectedIssuer, v);
                          if (img) setForm(prev => ({ ...prev, image_url: img }));
                        }
                      } else if (!v.trim()) {
                        setForm(prev => ({
                          ...prev,
                          verify_url: '',
                          image_url: selectedIssuer?.logoUrl || '',
                        }));
                      }
                    }}
                    issuer={selectedIssuer}
                    placeholder="ID de credencial"
                  />
                </div>
              </div>
              {selectedIssuer && (
                <div className={styles.issuerPreview}>
                  <div className={styles.previewHeader}>
                    <i className="fas fa-eye"></i>
                    <span>Vista previa del emisor seleccionado</span>
                  </div>
                  <div className={styles.previewContent}>
                    <div className={styles.previewLogo}>
                      <BlurImage
                        src={selectedIssuer.logoUrl}
                        alt={`${selectedIssuer.name} logo`}
                        onError={e => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.logo-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'logo-fallback';
                            fallback.innerHTML = '<i className="fas fa-certificate"></i>';
                            fallback.style.cssText = `display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--md-sys-color-on-surface-variant); font-size: 1.5rem; opacity: 0.7;`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                    <div className={styles.previewInfo}>
                      <div className={styles.previewName}>{selectedIssuer.name}</div>
                      {selectedIssuer.description && (
                        <div className={styles.previewDescription}>
                          {selectedIssuer.description}
                        </div>
                      )}
                      <div className={styles.previewDetails}>
                        <span className={styles.previewCategory}>
                          <i className="fas fa-tag"></i>
                          {selectedIssuer.category}
                        </span>
                        {selectedIssuer.verifyBaseUrl && (
                          <span className={styles.previewVerify}>
                            <i className="fas fa-check-circle"></i>Verificación automática
                            disponible
                          </span>
                        )}
                        {selectedIssuer.certificateImageUrl && (
                          <span
                            className={styles.previewVerify}
                            style={{
                              background: 'var(--md-sys-color-success-container)',
                              color: 'var(--md-sys-color-on-success-container)',
                            }}
                          >
                            <i className="fas fa-certificate"></i>
                            Imagen de certificado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="order_index">Orden</label>
                  <input
                    type="number"
                    id="order_index"
                    name="order_index"
                    value={form.order_index as any}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin" />
            <p>Cargando certificaciones...</p>
          </div>
        ) : certifications.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-certificate" />
            <h3>No hay certificaciones</h3>
            <p>Añade la primera certificación usando el botón de arriba.</p>
          </div>
        ) : (
          <div className={styles.certificationsList}>
            {certifications.map(c => (
              <div key={c._id || c.id} className={styles.adminCertificationCard}>
                <div className={styles.certificationHeader}>
                  <div className={styles.certificationImage}>
                    {c.image_url ? (
                      <BlurImage src={c.image_url} alt={c.title} />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <i className="fas fa-certificate" />
                      </div>
                    )}
                  </div>
                  <div className={styles.certificationInfo}>
                    <h3>{c.title}</h3>
                    <p className={styles.issuer}>{c.issuer}</p>
                    <div className={styles.certMetadata}>
                      <p className={styles.date}>
                        <i className="fas fa-calendar-alt" /> <span>{c.date}</span>
                      </p>
                      {c.credential_id && (
                        <p className={styles.credentialId}>
                          <i className="fas fa-id-badge" /> <span>ID: {c.credential_id}</span>
                        </p>
                      )}
                      {c.verify_url && (
                        <a
                          href={c.verify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.verifyLink}
                          title="Verificar certificación online"
                        >
                          <i className="fas fa-external-link-alt" /> Verificar online
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.certificationActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEdit(c)}
                    title="Editar certificación"
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(c._id || c.id || '', c.title)}
                    title="Eliminar certificación"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default CertificationsAdmin;
