// src/components/sections/skills/components/SkillsFilterFAB.tsx

import React, { useEffect, useState } from 'react';
import useIsOnSkillsPage from '@/hooks/useIsOnSkillsPage';
import { useFilterFAB } from '../../hooks/useFilterFAB';
import { useStickyFilter } from '../../hooks/useStickyFilter';
import styles from './SkillsFilterFAB.module.css';

interface SkillsFilterFABProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  skillsGrouped: Record<string, any[]>;
  debug?: boolean;
  selectedSort?: Record<string, string>;
  onSortToggle?: (category: string, sortType: string) => void;
}

const SkillsFilterFAB: React.FC<SkillsFilterFABProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  skillsGrouped,
  debug = false,
  selectedSort = {},
  onSortToggle,
}) => {
  const { isVisible, shouldShow, shouldShowByNavigation } = useFilterFAB({ debug });
  const { isSticky, containerRef, panelRef, styles: stickyStyles } = useStickyFilter({ debug });
  const [isSelecting, setIsSelecting] = useState(false);
  const isOnSkillsPage = useIsOnSkillsPage();

  useEffect(() => {
    if (debug) {
      console.log('[SKILLS_FILTER] Estado de visibilidad:', {
        isVisible,
        shouldShow,
        shouldShowByNavigation,
        debug,
        activeSection: document.body.getAttribute('data-active-section'),
      });
    }

    // Si no estamos en la sección de skills, asegurarnos de que el panel esté oculto
    if (!shouldShowByNavigation && !debug) {
      document.body.classList.remove('in-skills-section');
      return;
    }

    // Gestionar la clase del body para estilos adicionales y animar correctamente cuando estamos en la sección
    if (isVisible && shouldShowByNavigation) {
      document.body.classList.add('in-skills-section');
    } else if (!isVisible || !shouldShowByNavigation) {
      // Ocultamiento con retraso para permitir la animación
      const timer = setTimeout(() => {
        // Verificar nuevamente en este punto para evitar comportamientos inesperados
        if (!shouldShow || !shouldShowByNavigation) {
          document.body.classList.remove('in-skills-section');
        }
      }, 300); // Coincidir con la duración de la animación

      return () => clearTimeout(timer);
    }

    // Limpieza cuando se desmonta el componente
    return () => {
      if (!debug) {
        document.body.classList.remove('in-skills-section');
      }
    };
  }, [isVisible, shouldShow, shouldShowByNavigation, debug]);

  // Iconos por categoría con descripciones más detalladas
  const categoryData: Record<string, { icon: string; description: string }> = {
    All: { icon: 'fas fa-th', description: 'Todas las categorías' },
    Frontend: { icon: 'fas fa-paint-brush', description: 'Desarrollo Frontend' },
    Backend: { icon: 'fas fa-server', description: 'Desarrollo Backend' },
    'DevOps & Tools': { icon: 'fas fa-tools', description: 'DevOps y herramientas' },
    'Data Science': { icon: 'fas fa-chart-line', description: 'Ciencia de datos' },
    Mobile: { icon: 'fas fa-mobile-alt', description: 'Desarrollo móvil' },
    Cloud: { icon: 'fas fa-cloud', description: 'Servicios en la nube' },
    Testing: { icon: 'fas fa-vial', description: 'Pruebas y QA' },
    'UI/UX': { icon: 'fas fa-pencil-ruler', description: 'Diseño UI/UX' },
    Security: { icon: 'fas fa-shield-alt', description: 'Seguridad informática' },
    MCP: { icon: 'fas fa-robot', description: 'Inteligencia artificial' },
    Other: { icon: 'fas fa-cogs', description: 'Otras tecnologías' },
  };

  // Obtener el icono de una categoría
  const getCategoryIcon = (category: string): string => {
    return categoryData[category]?.icon || 'fas fa-question';
  };

  // Obtener la descripción de una categoría
  const getCategoryDescription = (category: string): string => {
    return categoryData[category]?.description || category;
  };

  const handleCategoryClick = (category: string) => {
    // Manejar el efecto visual de selección y la selección real
    if (category !== selectedCategory) {
      setIsSelecting(true);
      setTimeout(() => setIsSelecting(false), 400);
      onCategoryChange(category);
    }
  };

  const getSkillCount = (category: string) => {
    if (category === 'All') {
      const seen = new Set<string | number>();
      Object.values(skillsGrouped).forEach(list => {
        list.forEach((s: any) => {
          const key = s?.id ?? s?.name ?? JSON.stringify(s);
          seen.add(key);
        });
      });
      return seen.size;
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

  // Determinar si se muestra el panel
  // Comprobar también si la sección activa es 'skills' consultando el atributo data-active-section
  // (data-active-section ya no es requerido para la visibilidad)

  // Si salimos de la página de skills por ruta, forzar el ocultamiento
  useEffect(() => {
    if (!isOnSkillsPage && !debug) {
      document.body.classList.remove('in-skills-section');
      if (debug) {
        console.log('Removing skills section class');
      }
    }
  }, [isOnSkillsPage, debug]);

  // Mostrar el panel si es visible y estamos en la página de skills, sin requerir data-active-section
  const showPanel = (isVisible && isOnSkillsPage) || debug;

  // Manejar eventos de cambio de sección a nivel de documento
  useEffect(() => {
    const handleSectionChange = () => {
      if (
        (!shouldShowByNavigation ||
          document.body.getAttribute('data-active-section') !== 'skills') &&
        document.body.classList.contains('in-skills-section')
      ) {
        // Remover la clase de inmediato para garantizar que se oculte
        document.body.classList.remove('in-skills-section');
        if (debug) {
          console.log('Removing in-skills-section class');
        }
      }
    };

    // Evento personalizado para cuando se sale de la sección skills
    const handleSkillsExit = () => {
      document.body.classList.remove('in-skills-section');
      if (debug) {
        console.log('Skills exit event triggered');
      }
    };

    // Observar atributos del body para cambios en la sección activa
    const bodyObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'data-active-section') {
          const activeSection = document.body.getAttribute('data-active-section');
          if (activeSection !== 'skills' && document.body.classList.contains('in-skills-section')) {
            document.body.classList.remove('in-skills-section');
            if (debug) {
              console.log('Removing in-skills-section class due to section change');
            }
          }
        }
      });
    });

    bodyObserver.observe(document.body, { attributes: true });

    // Escuchar eventos de navegación propios de la aplicación
    document.addEventListener('sectionchange', handleSectionChange);
    document.addEventListener('skillsSectionExit', handleSkillsExit);
    window.addEventListener('popstate', handleSectionChange);

    return () => {
      document.removeEventListener('sectionchange', handleSectionChange);
      document.removeEventListener('skillsSectionExit', handleSkillsExit);
      window.removeEventListener('popstate', handleSectionChange);
      bodyObserver.disconnect();

      // Asegurar que la clase se elimina al desmontar el componente
      document.body.classList.remove('in-skills-section');
    };
  }, [shouldShowByNavigation, debug]);

  return (
    <>
      {/* Panel de filtros con comportamiento sticky */}
      <div
        ref={el => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={`${styles.floatingFilterPanel} ${showPanel ? styles.visible : ''} ${isSelecting ? styles.selecting : ''} skills-filter-panel ${isSticky ? styles.sticky : ''}`}
        id="skills-filter-panel"
        role="region"
        aria-label="Filtros de categorías de habilidades"
        aria-hidden={!showPanel}
        style={
          isSticky
            ? {
                ...stickyStyles.panel,
                '--container-width': containerRef.current
                  ? `${containerRef.current.offsetWidth}px`
                  : '300px',
              }
            : {
                '--container-width': containerRef.current
                  ? `${containerRef.current.offsetWidth}px`
                  : '300px',
              }
        }
      >
        <div className={styles.filterPanelContent}>
          <div className={styles.filterPanelHeader}>
            <i className="fas fa-filter" aria-hidden="true"></i>
            <span>Filtros</span>
            <div
              className={styles.selectedCategory}
              title={getCategoryDescription(selectedCategory)}
              aria-live="polite"
            >
              <i className={getCategoryIcon(selectedCategory)} aria-hidden="true"></i>
              <span>Categoría: {selectedCategory}</span>
            </div>
            {/* Controles de orden compactos siempre visibles */}
            <div className={styles.headerActions} role="toolbar" aria-label="Ordenar habilidades">
              <button
                className={`${styles.sortChip} ${
                  (selectedSort[selectedCategory] || 'alphabetical').startsWith('alphabetical')
                    ? styles.active
                    : ''
                }`}
                onClick={() => onSortToggle?.(selectedCategory, 'alphabetical')}
                title="Ordenar alfabéticamente"
              >
                <i className="fas fa-sort-alpha-down"></i>
                <span>Alfabético</span>
              </button>
              <button
                className={`${styles.sortChip} ${
                  (selectedSort[selectedCategory] || '').startsWith('difficulty')
                    ? styles.active
                    : ''
                }`}
                onClick={() => onSortToggle?.(selectedCategory, 'difficulty')}
                title="Ordenar por dificultad"
              >
                <i className="fas fa-star"></i>
                <span>Dificultad</span>
              </button>
              <button
                className={`${styles.sortChip} ${
                  (selectedSort[selectedCategory] || '').startsWith('level') ? styles.active : ''
                }`}
                onClick={() => onSortToggle?.(selectedCategory, 'level')}
                title="Ordenar por nivel"
              >
                <i className="fas fa-percentage"></i>
                <span>Nivel</span>
              </button>
            </div>
          </div>

          <div
            className={styles.filterButtons}
            role="radiogroup"
            aria-label="Categorías de habilidades"
          >
            {categories.map(category => {
              const isActive = selectedCategory === category;
              const count = getSkillCount(category);
              const description = getCategoryDescription(category);

              return (
                <button
                  key={category}
                  className={`${styles.filterBtn} ${isActive ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(category)}
                  title={`${description} (${count} habilidades)`}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`${category} - ${description} - ${count} habilidades`}
                >
                  <div className={styles.filterBtnContent}>
                    <i className={getCategoryIcon(category)} aria-hidden="true"></i>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.filterCount}>{count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillsFilterFAB;
