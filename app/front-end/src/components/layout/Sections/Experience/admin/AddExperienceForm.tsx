// admin/AddExperienceForm.tsx

import React, { useState, useEffect } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';

interface AddExperienceFormProps {
  editingExperience?: Experience;
  onSave: () => void;
  onCancel: () => void;
}

const AddExperienceForm: React.FC<AddExperienceFormProps> = ({
  editingExperience,
  onSave,
  onCancel,
}) => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    position: editingExperience?.position || '',
    company: editingExperience?.company || '',
    start_date: editingExperience?.start_date || '',
    end_date: editingExperience?.end_date || '',
    description: editingExperience?.description || '',
    technologies: editingExperience?.technologies?.join(', ') || '',
    order_index: editingExperience?.order_index || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const experienceData = {
        position: formData.position,
        company: formData.company,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        technologies: formData.technologies
          ? formData.technologies
              .split(',')
              .map(tech => tech.trim())
              .filter(tech => tech)
          : [],
        is_current: formData.end_date === '' || formData.end_date === 'Presente',
        order_index: formData.order_index,
        user_id: '1', // Por ahora fijo
      };

      if (editingExperience?._id) {
        await experiencesApi.updateExperience(editingExperience._id, experienceData);
        showSuccess('Experiencia Actualizada', 'Se ha actualizado la experiencia correctamente');
      } else {
        await experiencesApi.createExperience(experienceData as any);
        showSuccess('Nueva Experiencia', 'Se ha creado la experiencia correctamente');
      }

      // Disparar evento para refrescar datos
      window.dispatchEvent(new CustomEvent('experience-changed'));
      onSave();
    } catch (error) {
      console.error('Error al guardar experiencia:', error);
      showError('Error', 'No se pudo guardar la experiencia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="position"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Cargo *
        </label>
        <input
          type="text"
          id="position"
          value={formData.position}
          onChange={e => setFormData({ ...formData, position: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="company"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Empresa *
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={e => setFormData({ ...formData, company: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label
            htmlFor="start_date"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Fecha de Inicio *
          </label>
          <input
            type="text"
            id="start_date"
            value={formData.start_date}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
            placeholder="Enero 2020"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="end_date"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Fecha de Fin
          </label>
          <input
            type="text"
            id="end_date"
            value={formData.end_date}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
            placeholder="Diciembre 2021 (o vacío para 'Presente')"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="technologies"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Tecnologías
        </label>
        <input
          type="text"
          id="technologies"
          value={formData.technologies}
          onChange={e => setFormData({ ...formData, technologies: e.target.value })}
          placeholder="React, TypeScript, Node.js"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <small style={{ color: '#666' }}>Separar con comas</small>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="description"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Descripción
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="order_index"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Orden
        </label>
        <input
          type="number"
          id="order_index"
          value={formData.order_index}
          onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Guardando...' : editingExperience ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default AddExperienceForm;
