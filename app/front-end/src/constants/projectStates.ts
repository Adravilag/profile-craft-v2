// Constantes para estados de proyectos
// Valores estandarizados para toda la aplicación

export const PROJECT_STATES = {
  COMPLETED: 'Completado',
  IN_PROGRESS: 'En Desarrollo',
  PAUSED: 'Pausado',
  DRAFT: 'Borrador',
} as const;

export type ProjectState = (typeof PROJECT_STATES)[keyof typeof PROJECT_STATES];

// Array para usar en dropdowns y filtros
export const PROJECT_STATES_ARRAY: ProjectState[] = [
  PROJECT_STATES.COMPLETED,
  PROJECT_STATES.IN_PROGRESS,
  PROJECT_STATES.PAUSED,
  PROJECT_STATES.DRAFT,
];

// Mapping para convertir valores antiguos a nuevos (si es necesario)
export const STATE_MIGRATION_MAP: Record<string, ProjectState> = {
  // Valores de ProjectsAdmin
  Completado: PROJECT_STATES.COMPLETED,
  'En desarrollo': PROJECT_STATES.IN_PROGRESS,
  Borrador: PROJECT_STATES.DRAFT,

  // Valores de CreateProject
  'En progreso': PROJECT_STATES.IN_PROGRESS,
  Pausado: PROJECT_STATES.PAUSED,

  // Valores normalizados (por si acaso)
  COMPLETADO: PROJECT_STATES.COMPLETED,
  EN_DESARROLLO: PROJECT_STATES.IN_PROGRESS,
  EN_PROGRESO: PROJECT_STATES.IN_PROGRESS,
  PAUSADO: PROJECT_STATES.PAUSED,
  BORRADOR: PROJECT_STATES.DRAFT,
};

// Función para normalizar estados
export const normalizeState = (state: string): ProjectState => {
  return STATE_MIGRATION_MAP[state] || (state as ProjectState);
};

// Función para obtener clase CSS del estado
export const getStateClassName = (state: ProjectState): string => {
  switch (state) {
    case PROJECT_STATES.COMPLETED:
      return 'completed';
    case PROJECT_STATES.IN_PROGRESS:
      return 'in-progress';
    case PROJECT_STATES.PAUSED:
      return 'paused';
    case PROJECT_STATES.DRAFT:
      return 'draft';
    default:
      return 'default';
  }
};
