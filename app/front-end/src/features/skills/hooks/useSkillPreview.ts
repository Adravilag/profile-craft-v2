// src/components/sections/skills/hooks/useSkillPreview.ts

import { useState } from 'react';
import type { Skill } from '@/types/api';

export const useSkillPreview = (
  enrichSkillWithExternalData: (skillName: string) => Promise<void>
) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);

  // Funciones para manejar el modal de vista previa
  const handlePreviewSkill = async (skill: Skill) => {
    setPreviewSkill(skill);
    setShowPreviewModal(true);
    // Cargar datos externos si no están disponibles
    await enrichSkillWithExternalData(skill.name);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewSkill(null);
  };

  return {
    showPreviewModal,
    previewSkill,
    handlePreviewSkill,
    handleClosePreviewModal,
  };
};
