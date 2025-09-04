import React, { useState, useEffect } from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import * as endpoints from '@/services/endpoints';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AboutData {
  aboutText: string;
  collaborationNote: {
    title: string;
    description: string;
    icon: string;
  };
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [aboutData, setAboutData] = useState<AboutData>({
    aboutText: '',
    collaborationNote: {
      title: '',
      description: '',
      icon: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await endpoints.about.getAboutSection();
        if (response.success && response.data) {
          setAboutData({
            aboutText: response.data.aboutText || '',
            collaborationNote: response.data.collaborationNote || {
              title: '',
              description: '',
              icon: '',
            },
          });
        }
      } catch (err) {
        setError('Error al cargar datos');
        console.error('Error loading about data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await endpoints.about.updateAboutSection({
        aboutText: aboutData.aboutText,
        collaborationNote: aboutData.collaborationNote,
      });
      onClose();
    } catch (err) {
      setError('Error al guardar cambios');
      console.error('Error updating about:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAboutTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutData(prev => ({
      ...prev,
      aboutText: e.target.value,
    }));
  };

  if (!isOpen) return null;

  if (error) {
    return (
      <ModalShell
        title="Error"
        onClose={onClose}
        actionButtons={[
          {
            label: 'Cerrar',
            onClick: onClose,
            variant: 'secondary',
          },
        ]}
      >
        <div>{error}</div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Editar Sección About"
      onClose={onClose}
      actionButtons={[
        {
          label: 'Cancelar',
          onClick: onClose,
          variant: 'secondary',
        },
        {
          label: 'Guardar Cambios',
          onClick: () => {
            const form = document.querySelector('form');
            if (form) {
              form.requestSubmit();
            }
          },
          variant: 'primary',
          disabled: loading,
        },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="aboutText">Texto About:</label>
          <textarea
            id="aboutText"
            value={aboutData.aboutText}
            onChange={handleAboutTextChange}
            rows={6}
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          />
        </div>
      </form>
    </ModalShell>
  );
};
