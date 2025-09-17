// src/components/sections/skills/components/CategoryFilters.tsx

import React, { useState, useEffect, useMemo } from 'react';
import useIsOnSkillsPage from '@/hooks/useIsOnSkillsPage';
import useScrollSectionDetection from '@/hooks/useScrollSectionDetection';
import { useNavigation } from '@/hooks/useNavigation';
import type { CategoryFiltersProps } from '../../types/skills';
import { useResponsive } from '../../hooks/useResponsive';
import { useSkillsFilter } from '../../contexts/SkillsFilterContext';
import styles from './CategoryFilters.module.css';

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories: propCategories,
  selectedCategory: propSelectedCategory,
  onCategoryChange: propOnCategoryChange,
  skillsGrouped: propSkillsGrouped,
  forceVisible = false, // Para testing
}) => {
  // Usar contexto o props (para retrocompatibilidad en tests)
  const context = useSkillsFilter();
  const categories = propCategories || context.categories;
  const selectedCategory = propSelectedCategory || context.selectedCategory;
  const onCategoryChange = propOnCategoryChange || context.setSelectedCategory;
  const skillsGrouped = propSkillsGrouped || context.skillsGrouped;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useResponsive();
  const isOnSkillsPage = useIsOnSkillsPage();
  const { detectVisibleSection } = useScrollSectionDetection();
  const { currentSection } = useNavigation();
  const [detectedSection, setDetectedSection] = useState<string | null>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Lógica de visibilidad con scroll inteligente
  const isSkillsSectionActive = currentSection === 'skills' || isOnSkillsPage;
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  // Detectar cuando el usuario hace scroll en la sección de skills
  useEffect(() => {
    // Guard para tests
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setIsScrollVisible(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      }
    );

    const skillsSection =
      document.getElementById('skills') || document.querySelector('section[id="skills"]');
    if (skillsSection && isSkillsSectionActive) {
      observer.observe(skillsSection);
    }

    return () => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    };
  }, [isSkillsSectionActive]);

  // Cerrar el panel cuando se navega fuera de la sección de skills
  useEffect(() => {
    if (!isSkillsSectionActive && isOpen) {
      setIsOpen(false);
    }
  }, [isSkillsSectionActive, isOpen]);

  // Cargar filtro persistido desde localStorage
  useEffect(() => {
    const savedCategory = localStorage.getItem('skills-selected-category');
    if (savedCategory && categories.includes(savedCategory)) {
      onCategoryChange(savedCategory);
    }
  }, [categories, onCategoryChange]);

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

  // Cerrar el menú cuando se haga clic fuera de él (solo en móvil)
  useEffect(() => {
    if (!isMobile) return;
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
  }, [isOpen, isMobile]);

  // Cerrar con Escape (solo en móvil)
  useEffect(() => {
    if (!isMobile) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isMobile]);

  const handleCategorySelect = (category: string) => {
    setIsLoading(true);

    // Persistir en localStorage
    localStorage.setItem('skills-selected-category', category);

    onCategoryChange(category);

    // Cerrar panel después de seleccionar
    setTimeout(() => {
      setIsOpen(false);
      setIsLoading(false);
    }, 200);
  };

  const getTotalSkillsCount = () => {
    // Use a combined key of id+name to avoid collisions when test fixtures
    // generate per-category numeric ids (e.g. 1,2 repeated per category).
    const seen = new Set<string>();
    Object.values(skillsGrouped).forEach(list => {
      list.forEach((s: any) => {
        const idPart = s?.id !== undefined && s?.id !== null ? String(s.id) : '';
        const namePart = s?.name ?? JSON.stringify(s);
        const key = `${idPart}::${namePart}`;
        seen.add(key);
      });
    });
    return seen.size;
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') {
      return getTotalSkillsCount();
    }
    if (category === 'Destacados') {
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

  // Filtrar categorías basado en búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(category => category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  // Calcular estadísticas para barra de progreso
  const getCategoryStats = (category: string) => {
    const totalSkills = getTotalSkillsCount();
    const categoryCount = getCategoryCount(category);
    const percentage = totalSkills > 0 ? (categoryCount / totalSkills) * 100 : 0;
    return { count: categoryCount, percentage };
  };

  // Determinar si se muestra el FAB y el panel
  const showFAB = forceVisible || isSkillsSectionActive;
  const showPanel = showFAB && isOpen;

  // Contenido del panel flotante
  const panelContent = (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <i className="fas fa-filter"></i>
          <span>Filtros de Categorías</span>
        </div>
        <div className={styles.selectedCategoryInfo}>
          <i className={categoryIcons[selectedCategory] || 'fas fa-code'}></i>
          <span>{selectedCategory}</span>
        </div>
        <button
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar filtros"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className={styles.panelContent}>
        {/* Campo de búsqueda */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={styles.clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Lista de categorías */}
        <div className={styles.categoryList}>
          {filteredCategories.map(category => {
            const stats = getCategoryStats(category);
            return (
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
                  <span className={styles.categoryCount}>{stats.count} habilidades</span>
                  {/* Barra de progreso visual */}
                  <div className={styles.categoryProgress}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${stats.percentage}%` }}
                      data-testid={`category-progress-${category}`}
                    />
                  </div>
                </div>
                {selectedCategory === category && (
                  <div className={styles.activeIndicator}>
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div
            className={`${styles.loadingIndicator} ${styles.fadeIn}`}
            data-testid="filter-loading"
          >
            <i className="fas fa-spinner fa-spin"></i>
            <span>Aplicando filtro...</span>
          </div>
        )}

        <div className={styles.panelFooter}>
          <div className={styles.totalStats}>
            <i className="fas fa-chart-bar"></i>
            <span>Total: {getTotalSkillsCount()} habilidades</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Botón flotante */}
      {showFAB && (
        <button
          className={`${styles.floatingButton} ${isOpen ? styles.active : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Filtros de categoría"
          title="Filtros de categoría"
        >
          <i className="fas fa-filter"></i>
          <span className={styles.buttonText}>Filtros</span>
        </button>
      )}

      {/* Panel flotante */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div
            className={`${styles.overlay} ${styles.visible}`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel principal */}
          <div
            className={`${styles.floatingPanel} ${styles.visible}`}
            role="region"
            aria-label="Filtros de categorías de habilidades"
          >
            {panelContent}
          </div>
        </>
      )}
    </>
  );
};

export default CategoryFilters;
