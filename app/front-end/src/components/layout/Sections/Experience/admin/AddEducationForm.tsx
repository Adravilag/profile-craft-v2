// admin/AddEducationForm.tsx

import React, { useState } from 'react';
import { education as educationApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';

interface Education {
  _id?: string;
  id?: number | string;
  title: string;
  institution: string;
  header_image?: string;
  logo_image?: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
  order_index?: number;
}

interface AddEducationFormProps {
  editingEducation?: Education;
  onSave: () => void;
  onCancel: () => void;
}

const AddEducationForm: React.FC<AddEducationFormProps> = ({
  editingEducation,
  onSave,
  onCancel,
}) => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: editingEducation?.title || '',
    institution: editingEducation?.institution || '',
    start_date: editingEducation?.start_date || '',
    end_date: editingEducation?.end_date || '',
    description: editingEducation?.description || '',
    grade: editingEducation?.grade || '',
    order_index: editingEducation?.order_index || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const educationData = {
        title: formData.title,
        institution: formData.institution,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        grade: formData.grade,
        order_index: formData.order_index,
        user_id: 1, // Por ahora fijo
      };

      if (editingEducation?._id) {
        const id = editingEducation._id || editingEducation.id;
        await educationApi.updateEducation(parseInt(id?.toString() || '0'), educationData);
        showSuccess('Educación Actualizada', 'Se ha actualizado la educación correctamente');
      } else {
        await educationApi.createEducation(educationData);
        showSuccess('Nueva Educación', 'Se ha creado la educación correctamente');
      }

      // Disparar evento para refrescar datos
      window.dispatchEvent(new CustomEvent('education-changed'));
      onSave();
    } catch (error) {
      console.error('Error al guardar educación:', error);
      showError('Error', 'No se pudo guardar la educación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Título/Grado *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
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
          htmlFor="institution"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Institución *
        </label>
        <input
          type="text"
          id="institution"
          value={formData.institution}
          onChange={e => setFormData({ ...formData, institution: e.target.value })}
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
            placeholder="Enero 2018"
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
            Fecha de Fin *
          </label>
          <input
            type="text"
            id="end_date"
            value={formData.end_date}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
            placeholder="Diciembre 2022"
            required
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
          htmlFor="grade"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Calificación/Mención
        </label>
        <input
          type="text"
          id="grade"
          value={formData.grade}
          onChange={e => setFormData({ ...formData, grade: e.target.value })}
          placeholder="Magna Cum Laude, Sobresaliente, etc."
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
          placeholder="Descripción del programa, logros destacados, etc."
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
          {isLoading ? 'Guardando...' : editingEducation ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default AddEducationForm;
