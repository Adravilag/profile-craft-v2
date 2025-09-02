// src/components/sections/experience/ExperienceAdmin.tsx

import React from 'react';
import type { Experience } from '@/types/api';
import ModalShell from '@/components/ui/Modal/ModalShell';
import { AddExperienceForm, AddEducationForm } from './admin';

interface Education {
  _id?: string; // ID de MongoDB
  id?: number | string; // Para compatibilidad con código antiguo
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

interface ExperienceAdminProps {
  type: 'experience' | 'education';
  editingExperience?: Experience | null;
  editingEducation?: Education | null;
  onClose: () => void;
}

const ExperienceAdmin: React.FC<ExperienceAdminProps> = ({
  type,
  editingExperience = null,
  editingEducation = null,
  onClose,
}) => {
  const isEditing = !!(editingExperience || editingEducation);
  const modalTitle = isEditing
    ? `Editar ${type === 'experience' ? 'Experiencia' : 'Educación'}`
    : `Nueva ${type === 'experience' ? 'Experiencia' : 'Educación'}`;

  // Botones de acción para el modal
  const actionButtons = [
    {
      key: 'cancel',
      label: 'Cancelar',
      onClick: onClose,
      variant: 'ghost' as const,
    },
    {
      key: 'save',
      label: isEditing ? 'Guardar Cambios' : 'Crear',
      submit: true,
      variant: 'primary' as const,
    },
  ];

  return (
    <ModalShell title={modalTitle} onClose={onClose} maxWidth={800} actionButtons={actionButtons}>
      {type === 'experience' ? (
        <AddExperienceForm
          editingExperience={editingExperience || undefined}
          onSave={onClose}
          onCancel={onClose}
        />
      ) : (
        <AddEducationForm
          editingEducation={editingEducation || undefined}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
    </ModalShell>
  );
};

export default ExperienceAdmin;
