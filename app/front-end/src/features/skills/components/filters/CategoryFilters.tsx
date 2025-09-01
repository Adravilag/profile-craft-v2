// src/components/sections/skills/components/CategoryFilters.tsx

import React, { useState, useEffect } from 'react';
import useIsOnSkillsPage from '@/hooks/useIsOnSkillsPage';
import useScrollSectionDetection from '@/hooks/useScrollSectionDetection';
import type { CategoryFiltersProps } from '../../types/skills';
import { useResponsive } from '../../hooks/useResponsive';
import styles from './CategoryFilters.module.css';

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  skillsGrouped,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();
  const isOnSkillsPage = useIsOnSkillsPage();
  const { detectVisibleSection } = useScrollSectionDetection();
  const [detectedSection, setDetectedSection] = useState<string | null>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cerrar el sidebar cuando se navega fuera de la sección de skills
  useEffect(() => {
    if (!isOnSkillsPage && isOpen) {
      setIsOpen(false);
    }
  }, [isOnSkillsPage, isOpen]);

  // Detectar por scroll si la sección skills está realmente visible y ocultar el toggle si no lo está
  useEffect(() => {
    const check = () => {
      try {
        const sec = detectVisibleSection?.() ?? null;
        setDetectedSection(sec);
      } catch (e) {
        setDetectedSection(null);
      }
    };

    check();

    const handler = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => check(), 120);
    };

    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [detectVisibleSection]);

  // isOnSkillsPage proviene del hook useIsOnSkillsPage

  // Iconos por categoría
  const categoryIcons: Record<string, string> = {
    All: 'fas fa-th',
    Destacados: 'fas fa-star',
    Frontend: 'fas fa-paint-brush',
    Backend: 'fas fa-server',
    'DevOps & Tools': 'fas fa-tools',
    'Data Science': 'fas fa-chart-line',
    Mobile: 'fas fa-mobile-alt',
    Cloud: 'fas fa-cloud',
    Testing: 'fas fa-vial',
    'UI/UX': 'fas fa-pencil-ruler',
    Security: 'fas fa-shield-alt',
    AI: 'fas fa-robot',
    Other: 'fas fa-cogs',
  };

  // Cerrar el menú cuando se haga clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isOpen &&
        !target.closest(`.${styles.sidebar}`) &&
        !target.closest(`.${styles.toggleButton}`)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    if (isMobile) {
      setIsOpen(false); // Cerrar el menú en móvil después de seleccionar
    }
  };

  const getTotalSkillsCount = () => {
    // Contar habilidades únicas (evitar doble conteo cuando existen en 'Destacados' y su categoría)
    const seen = new Set<string | number>();
    Object.values(skillsGrouped).forEach(list => {
      list.forEach((s: any) => {
        const key = s?.id ?? s?.name ?? JSON.stringify(s);
        seen.add(key);
      });
    });
    return seen.size;
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') {
      return getTotalSkillsCount();
    }

    // Destacados ya es un grupo separado en skillsGrouped
    if (category === 'Destacados') {
      // Cuando se pasa getGroupedSkills(), no existe la key 'Destacados'.
      // Contar manualmente las skills que tienen featured === true.
      let featuredCount = 0;
      Object.values(skillsGrouped).forEach(list => {
        list.forEach((s: any) => {
          if (s?.featured) featuredCount += 1;
        });
      });
      return featuredCount;
    }

    return skillsGrouped[category]?.length || 0;
  };

  // Ocultar el toggle si la detección por scroll indica que no estamos en la sección
  const isDetectedSkills = detectedSection === null || detectedSection === 'skills';

  return (
    <>
      {/* Solo mostrar el botón y sidebar cuando estamos en la página de skills */}
      {isOnSkillsPage && isDetectedSkills && (
        <>
          {/* Botón toggle para abrir/cerrar el sidebar */}
          <button
            className={`${styles.toggleButton} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Filtros de categoría"
            title="Filtros de categoría"
          >
            <i className="fas fa-filter"></i>
            {!isMobile && <span>Filtros</span>}
          </button>

          {/* Overlay para móvil */}
          {isOpen && isMobile && (
            <div className={styles.overlay} onClick={() => setIsOpen(false)} aria-hidden="true" />
          )}

          {/* Sidebar flotante */}
          <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>
                <i className="fas fa-filter"></i>
                <span>Categorías</span>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar filtros"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.sidebarContent}>
              <div className={styles.categoryList}>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`${styles.categoryItem} ${selectedCategory === category ? styles.active : ''}`}
                    onClick={() => handleCategorySelect(category)}
                    title={`Filtrar por ${category}`}
                  >
                    <div className={styles.categoryIcon}>
                      <i className={categoryIcons[category] || 'fas fa-code'}></i>
                    </div>
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{category}</span>
                      <span className={styles.categoryCount}>
                        {getCategoryCount(category)} habilidades
                      </span>
                    </div>
                    {selectedCategory === category && (
                      <div className={styles.activeIndicator}>
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Información adicional */}
              <div className={styles.sidebarFooter}>
                <div className={styles.totalStats}>
                  <i className="fas fa-chart-bar"></i>
                  <span>Total: {getTotalSkillsCount()} habilidades</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CategoryFilters;
