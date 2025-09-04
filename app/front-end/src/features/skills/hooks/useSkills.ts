// src/features/skills/hooks/useSkills.ts

import { useState, useEffect } from 'react';
import { skills as skillsEndpoints } from '@/services/endpoints';
const { getSkills, createSkill, updateSkill, deleteSkill } = skillsEndpoints;
import type { Skill } from '@/types/api';
import type { SkillFormData } from '../types/skills';
import { getSkillSvg, fetchLogoHubSvg, GENERIC_ICON_URL } from '../utils/skillUtils';

const defaultNewSkill: SkillFormData = {
  name: '',
  category: 'Frontend',
  icon_class: '',
  level: 50,
  featured: false,
};

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState<SkillFormData>(defaultNewSkill);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<number | string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar las habilidades.');
        setLoading(false);
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
    const { name, value } = e.target;

    console.log('🎯 useSkills handleFormChange llamado con:', { name, value });
    console.log('🎯 Estado actual de newSkill antes del cambio:', newSkill);

    // Si cambia la categoría, resetear campos relacionados
    if (name === 'category') {
      const updatedSkill = {
        ...newSkill,
        [name]: value,
        name: '', // Limpiar nombre
        level: 50, // Resetear nivel
      };
      console.log('🎯 Actualizando categoría, nuevo estado:', updatedSkill);
      setNewSkill(updatedSkill);
    } else if ((e.target as HTMLInputElement).type === 'checkbox' || name === 'featured') {
      const checked = (e.target as HTMLInputElement).checked;
      const updatedSkill = {
        ...newSkill,
        [name]: checked,
      } as SkillFormData;
      console.log('🎯 Actualizando checkbox', name, 'nuevo estado:', updatedSkill);
      setNewSkill(updatedSkill);
    } else {
      const updatedSkill = {
        ...newSkill,
        [name]: name === 'level' ? Number(value) : value,
      };
      console.log('🎯 Actualizando campo', name, 'nuevo estado:', updatedSkill);
      setNewSkill(updatedSkill);
    }
  };

  // Handler específico para manejar selecciones de LogoHub con icon_class
  const handleFormChangeWithIcon = (updates: Partial<SkillFormData & { icon_class?: string }>) => {
    console.log('🎯 useSkills handleFormChangeWithIcon llamado con:', updates);

    const updatedSkill = {
      ...newSkill,
      ...updates,
    } as SkillFormData & { icon_class?: string };

    console.log('🎯 Nuevo estado después de LogoHub:', updatedSkill);
    setNewSkill(updatedSkill as SkillFormData);
  };

  // Handler para añadir/editar skill
  const handleAddSkill = async (e: React.FormEvent, skillsIcons: any[]) => {
    e.preventDefault();

    console.log('🚀 handleAddSkill ejecutándose');
    console.log('🚀 Estado actual de newSkill:', newSkill);
    console.log('🚀 newSkill.name:', `"${newSkill.name}"`);
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

    console.log('✅ Guardando habilidad con datos validados:', newSkill);

    // Determinar SVG: priorizar icon_class si existe (posiblemente de LogoHub), luego usar utils
    let svg_path = (newSkill as any).icon_class || '';

    // Si no hay icon_class o es vacío, usar la función utilitaria
    if (!svg_path || svg_path.trim() === '') {
      svg_path = getSkillSvg(newSkill.name, (newSkill as any).icon_class || '', skillsIcons);
    }

    // Si aún no se encontró nada local y el resultado es el icono genérico, intentar LogoHub como último recurso
    if (!svg_path || svg_path === GENERIC_ICON_URL) {
      try {
        console.log('🔗 Buscando en LogoHub como fallback para:', newSkill.name);
        const lh = await fetchLogoHubSvg(newSkill.name);
        if (lh) {
          svg_path = lh;
          console.log('🔁 LogoHub fallback usado para', newSkill.name, svg_path);
        } else {
          console.log('⚠️ LogoHub no encontró resultados para:', newSkill.name);
        }
      } catch (e) {
        console.warn('❌ Error en LogoHub fallback:', e);
        // mantener svg_path como está (posiblemente genérico)
      }
    }

    console.log('🎨 SVG final determinado:', svg_path);

    try {
      if (editingId != null) {
        const updated = await updateSkill(editingId as any, {
          ...newSkill,
          icon_class: svg_path,
        });
        setSkills(prev =>
          prev.map(s =>
            s.id === editingId
              ? { ...updated, featured: (updated as any).featured ?? s.featured }
              : s
          )
        );
        console.log('✅ Skill actualizada exitosamente');
      } else {
        const created = await createSkill({
          ...newSkill,
          icon_class: svg_path,
          user_id: 1,
          order_index: skills.length + 1,
        });
        // If created doesn't contain featured flag, infer from newSkill or default false
        setSkills(prev => [
          ...prev,
          {
            ...created,
            featured: (created as any).featured ?? (newSkill as any).featured ?? false,
          } as any,
        ]);
        console.log('✅ Nueva skill creada exitosamente');
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
      icon_class: (skill as any).icon_class || '',
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

  // Funciones para agrupar y filtrar skills
  const getGroupedSkills = () => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  };

  const getFilteredGrouped = () => {
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
  };

  const getAllCategories = () => {
    const grouped = getGroupedSkills();
    const keys = Object.keys(grouped);
    // Insert 'Destacados' at top if any featured skills exist
    const hasFeatured = skills.some(s => s.featured);
    return hasFeatured ? ['All', 'Destacados', ...keys] : ['All', ...keys];
  };

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
