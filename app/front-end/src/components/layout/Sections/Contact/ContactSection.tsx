// src/components/sections/contact/ContactSection.tsx

import React, { useState } from 'react';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './ContactSection.module.css';

interface ContactSectionProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.subject.trim()) newErrors.subject = 'El asunto es requerido';
    if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Crear un FormEvent simulado con los datos del estado
    const formElement = e.currentTarget;
    const fakeFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      fakeFormData.append(key, value);
    });

    // Simular el FormData en el target
    Object.defineProperty(formElement, 'formData', {
      value: fakeFormData,
      configurable: true,
    });

    try {
      await onSubmit(e);
      // Reset form on success
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-cv" id="contact">
      <HeaderSection
        icon="fas fa-envelope"
        title="Contacto"
        subtitle="¿Tienes un proyecto en mente? ¡Hablemos!"
        className="contact"
      />
      <div className="section-container">
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <i className="fas fa-map-marker-alt"></i>
            <div>
              <h4>Ubicación</h4>
              <p>España, remoto disponible</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <i className="fas fa-clock"></i>
            <div>
              <h4>Tiempo de respuesta</h4>
              <p>24-48 horas</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <i className="fas fa-language"></i>
            <div>
              <h4>Idiomas</h4>
              <p>Español, Inglés</p>
            </div>
          </div>
        </div>{' '}
        {/* Formulario moderno */}
        <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="contact-name" className={errors.name ? 'error' : ''}>
                Nombre *
              </label>
              <div className={`${styles.inputWrapper} ${errors.name ? 'error' : ''}`}>
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  className={errors.name ? 'error' : ''}
                  required
                />
              </div>
              {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-email" className={errors.email ? 'error' : ''}>
                Email *
              </label>
              <div className={`${styles.inputWrapper} ${errors.email ? 'error' : ''}`}>
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className={errors.email ? 'error' : ''}
                  required
                />
              </div>
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact-subject" className={errors.subject ? 'error' : ''}>
              Asunto *
            </label>
            <div className={`${styles.inputWrapper} ${errors.subject ? 'error' : ''}`}>
              <i className="fas fa-tag"></i>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿En qué puedo ayudarte?"
                className={errors.subject ? 'error' : ''}
                required
              />
            </div>
            {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact-message" className={errors.message ? 'error' : ''}>
              Mensaje *
            </label>
            <div className={`${styles.textareaWrapper} ${errors.message ? 'error' : ''}`}>
              <i className="fas fa-comment-alt"></i>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="Cuéntame sobre tu proyecto, ideas o cualquier consulta que tengas..."
                className={errors.message ? 'error' : ''}
                required
              />
            </div>
            <div className={styles.textareaFooter}>
              <span className={styles.charCounter}>{formData.message.length}/1000</span>
            </div>
            {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={`${styles.btnSubmit} ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Enviar Mensaje
                </>
              )}
            </button>
            <div className={styles.formNote}>
              <i className="fas fa-shield-alt"></i>
              Tu información está segura y nunca será compartida.
            </div>{' '}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactSection;
