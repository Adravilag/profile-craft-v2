// src/features/skills/hooks/useSkills.ts

import { useState, useEffect, useCallback } from 'react';
import { skills as skillsEndpoints } from '@/services/endpoints';
const { getSkills, createSkill, updateSkill, deleteSkill } = skillsEndpoints;
import type { Skill } from '@/types/api';
import type { SkillFormData } from '../types/skills';
import { getSkillSvg, GENERIC_ICON_URL } from '../utils/skillUtils';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';

const defaultNewSkill: SkillFormData = {
  name: '',
  category: 'Frontend',
  svg_path: undefined,
  level: 50,
  featured: false,
};

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState<SkillFormData>(defaultNewSkill);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<number | string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // ✅ SISTEMA CENTRALIZADO DE LOADING
  const { isLoading: centralLoading, setLoading } = useSectionsLoadingContext();
  const loading = centralLoading('skills');

  // Cargar skills iniciales
  useEffect(() => {
    getSkills()
      .then((data: Skill[]) => {
        // Marcar por defecto las skills destacadas según lista conocida
        const defaultFeatured = new Set(
          [
            'react',
            'css3',
            'node.js',
            'python',
            'java',
            'sql',
            'express',
            'git',
            'github actions',
            'postman',
          ].map(s => s.toLowerCase())
        );

        const normalized = data.map(d => ({
          ...d,
          featured:
            typeof d.featured === 'boolean'
              ? d.featured
              : defaultFeatured.has((d.name || '').toLowerCase()),
          category: d.category || 'General',
          order_index: d.order_index ?? undefined,
        }));

        setSkills(normalized);
        setLoading('skills', false);
      })
      .catch(() => {
        setError('No se pudieron cargar las habilidades.');
        setLoading('skills', false);
      });
  }, []);

  // Handlers para el modal
  const handleOpenModal = () => {
    setNewSkill(defaultNewSkill);
    setEditingId(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // Handlers para formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // Si cambia la categoría, resetear campos relacionados
    if (name === 'category') {
      const updatedSkill = {
        ...newSkill,
        [name]: value,
        name: '', // Limpiar nombre
        level: 50, // Resetear nivel
      };
      setNewSkill(updatedSkill);
    } else if ((e.target as HTMLInputElement).type === 'checkbox' || name === 'featured') {
      const checked = (e.target as HTMLInputElement).checked;
      const updatedSkill = {
        ...newSkill,
        [name]: checked,
      } as SkillFormData;
      setNewSkill(updatedSkill);
    } else {
      const updatedSkill = {
        ...newSkill,
        [name]: name === 'level' ? Number(value) : value,
      };
      setNewSkill(updatedSkill);
    }
  };

  // Handler específico para manejar selecciones de LogoHub con svg_path (acepta legacy icon_class por compat)
  const handleFormChangeWithIcon = (updates: Partial<SkillFormData & { svg_path?: string }>) => {
    const updatedSkill = {
      ...newSkill,
      ...updates,
    } as SkillFormData & { svg_path?: string };
    setNewSkill(updatedSkill as SkillFormData);
  };

  // Handler para añadir/editar skill
  const handleAddSkill = async (e: React.FormEvent, skillsIcons: any[]) => {
    e.preventDefault();
    console.log('🚀 newSkill.name.trim():', `"${newSkill.name?.trim()}"`);

    // Validación para asegurar que los campos requeridos estén presentes
    if (!newSkill.name || newSkill.name.trim() === '') {
      console.error('❌ Error: No se puede guardar una habilidad sin nombre');
      console.error('❌ newSkill.name es:', newSkill.name);
      alert('Error: Debe proporcionar un nombre para la habilidad');
      return;
    }

    if (!newSkill.category || newSkill.category.trim() === '') {
      console.error('❌ Error: No se puede guardar una habilidad sin categoría');
      alert('Error: Debe seleccionar una categoría para la habilidad');
      return;
    }
    // Determinar SVG para uso local/UI: priorizar svg_path del form, luego utilitario
    let svg_path = (newSkill as any).svg_path || '';

    // Si no hay svg_path en el formulario, intentar utilitario
    if (!svg_path || String(svg_path).trim() === '') {
      svg_path = getSkillSvg(newSkill.name, undefined, skillsIcons);
    }

    // If no local svg_path found, keep the generic icon. External fallbacks are disabled.

    try {
      // Nota: El backend ya no almacena icon_class/svg_path. Enviar sólo campos de dominio.
      if (editingId != null) {
        const payload = {
          ...newSkill,
        } as any;
        // eliminar campos locales antes de enviar (backend no almacena iconos)
        delete payload.svg_path;

        const updated = await updateSkill(editingId as any, payload);
        setSkills(prev =>
          prev.map(s =>
            s.id === editingId
              ? { ...updated, featured: (updated as any).featured ?? s.featured }
              : s
          )
        );
      } else {
        const payload = {
          ...newSkill,
          user_id: 1,
          order_index: skills.length + 1,
        } as any;
        delete payload.svg_path;

        const created = await createSkill(payload);
        // If created doesn't contain featured flag, infer from newSkill or default false
        setSkills(prev => [
          ...prev,
          {
            // store created as-is; UI will compute svg_path locally when rendering
            ...created,
            featured: (created as any).featured ?? (newSkill as any).featured ?? false,
          } as any,
        ]);
      }
      setShowModal(false);
      setEditingId(null);
    } catch (error) {
      console.error('❌ Error al guardar la habilidad:', error);
      alert('Error al guardar la habilidad');
    }
  };

  // Handler para editar skill
  const handleEditSkill = (skill: Skill) => {
    setNewSkill({
      name: skill.name,
      category: skill.category || 'General',
      svg_path: (skill as any).svg_path || '',
      level: skill.level ?? 50,
      featured: (skill as any).featured ?? false,
    });
    setEditingId(skill.id as any);
    setShowModal(true);
  };

  // Handler para eliminar skill
  const handleDeleteSkill = async (id: number) => {
    if (window.confirm('¿Seguro que quieres eliminar esta habilidad?')) {
      try {
        await deleteSkill(id);
        setSkills(prev => prev.filter(s => s.id !== id));
      } catch {
        alert('Error al eliminar la habilidad');
      }
    }
  };

  // Funciones drag & drop
  const handleDragStart = (id: number | string) => setDraggedSkillId(id as any);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = async (targetId: number) => {
    if (draggedSkillId === null || draggedSkillId === targetId) return;

    const draggedIdx = skills.findIndex(s => String(s.id) === String(draggedSkillId));
    const targetIdx = skills.findIndex(s => String(s.id) === String(targetId));

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Reordenar array localmente
    const reordered = [...skills];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    // Actualizar order_index en backend
    for (let i = 0; i < reordered.length; i++) {
      if ((reordered[i].order_index ?? i + 1) !== i + 1) {
        await updateSkill(
          reordered[i].id as any,
          {
            ...reordered[i],
            order_index: i + 1,
          } as any
        );
      }
    }

    setSkills(reordered);
    setDraggedSkillId(null);
  };

  // Funciones para agrupar y filtrar skills - MEMOIZADAS para reactividad
  const getGroupedSkills = useCallback(() => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]); // [IMPLEMENTACION] Memoizar con dependencia de skills

  const getFilteredGrouped = useCallback(() => {
    const grouped = getGroupedSkills();
    const result: Record<string, Skill[]> = {};

    // Crear sección de Destacados con skills.featured === true (ordenadas por level desc)
    const featuredList = skills
      .filter(s => s.featured)
      .slice()
      .sort((a, b) => (b.level || 0) - (a.level || 0));
    if (featuredList.length > 0) {
      result['Destacados'] = featuredList;
    }

    // Añadir el resto de categorías (manteniendo las skills featured también en su categoría)
    Object.keys(grouped).forEach(category => {
      if (selectedCategory === 'All' || selectedCategory === category) {
        result[category] = grouped[category];
      }
    });

    // Si se ha seleccionado una categoría específica, devolver sólo esa (incluye Destacados si es el caso)
    if (selectedCategory !== 'All') {
      return { [selectedCategory]: result[selectedCategory] || [] };
    }

    return result;
  }, [skills, selectedCategory, getGroupedSkills]); // [IMPLEMENTACION] Memoizar con dependencias de skills y selectedCategory

  const getAllCategories = useCallback(() => {
    const grouped = getGroupedSkills();
    const keys = Object.keys(grouped);
    // Insert 'Destacados' at top if any featured skills exist
    const hasFeatured = skills.some(s => s.featured);
    return hasFeatured ? ['All', 'Destacados', ...keys] : ['All', ...keys];
  }, [skills, getGroupedSkills]); // [IMPLEMENTACION] Memoizar getAllCategories

  return {
    // State
    skills,
    loading,
    error,
    showModal,
    newSkill,
    editingId,
    draggedSkillId,
    selectedCategory,

    // Setters
    setSelectedCategory,
    setSkills,

    // Handlers
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleFormChangeWithIcon,
    handleAddSkill,
    handleEditSkill,
    handleDeleteSkill,
    handleDragStart,
    handleDragOver,
    handleDrop,

    // Computed values
    getGroupedSkills,
    getFilteredGrouped,
    getAllCategories,
  };
};
