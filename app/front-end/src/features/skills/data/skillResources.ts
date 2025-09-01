// src/data/skillResources.ts
// Base de datos de recursos para todas las tecnologías del portafolio

export interface SkillResource {
  id: string;
  title: string;
  url: string;
  description: string;
  category:
    | 'documentation'
    | 'tutorial'
    | 'course'
    | 'cheatsheet'
    | 'tool'
    | 'book'
    | 'video'
    | 'github'
    | 'project';
  level: 'basico' | 'intermedio' | 'avanzado' | 'todos';
  language: 'es' | 'en';
  isPremium: boolean;
  rating?: number; // 1-5 estrellas
  author?: string;
  duration?: string; // Para videos/cursos
  lastUpdated?: string;
}

export interface SkillResourcesData {
  [skillName: string]: SkillResource[];
}

export const skillResources: SkillResourcesData = {
  // === FRONTEND TECHNOLOGIES ===
  CSS3: [
    {
      id: 'css3-mdn-1',
      title: 'MDN Web Docs - CSS',
      url: 'https://developer.mozilla.org/es/docs/Web/CSS',
      description:
        'Documentación oficial de CSS con ejemplos prácticos y compatibilidad de navegadores',
      category: 'documentation',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'Mozilla',
    },
    {
      id: 'css3-grid-guide',
      title: 'CSS Grid: Guía Completa',
      url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      description: 'Guía visual completa de CSS Grid con ejemplos interactivos',
      category: 'tutorial',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'CSS-Tricks',
    },
    {
      id: 'css3-flexbox-guide',
      title: 'Flexbox: Guía Completa',
      url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
      description: 'Todo lo que necesitas saber sobre Flexbox con ejemplos visuales',
      category: 'tutorial',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'CSS-Tricks',
    },
    {
      id: 'css3-animations',
      title: 'CSS Animations y Keyframes',
      url: 'https://developer.mozilla.org/es/docs/Web/CSS/CSS_Animations',
      description: 'Aprende a crear animaciones fluidas con CSS3',
      category: 'tutorial',
      level: 'avanzado',
      language: 'es',
      isPremium: false,
      rating: 4,
      author: 'Mozilla',
    },
    {
      id: 'css3-cheatsheet',
      title: 'CSS3 Cheat Sheet',
      url: 'https://htmlcheatsheet.com/css/',
      description: 'Referencia rápida de todas las propiedades CSS3',
      category: 'cheatsheet',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 4,
    },
    {
      id: 'css3-codepen',
      title: 'CodePen - CSS Examples',
      url: 'https://codepen.io/topics/css',
      description: 'Ejemplos interactivos y experimentos con CSS3',
      category: 'tool',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 4,
    },
  ],

  JavaScript: [
    {
      id: 'js-mdn',
      title: 'MDN JavaScript Guide',
      url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Guide',
      description: 'Guía completa de JavaScript desde básico hasta avanzado',
      category: 'documentation',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'Mozilla',
    },
    {
      id: 'js-modern',
      title: 'JavaScript Moderno',
      url: 'https://es.javascript.info/',
      description: 'Tutorial completo de JavaScript moderno con ejemplos prácticos',
      category: 'tutorial',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'Ilya Kantor',
    },
    {
      id: 'js-es6-features',
      title: 'ES6 Features Overview',
      url: 'https://github.com/lukehoban/es6features',
      description: 'Resumen completo de las características de ES6+',
      category: 'github',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Luke Hoban',
    },
    {
      id: 'js-you-dont-know',
      title: "You Don't Know JS (book series)",
      url: 'https://github.com/getify/You-Dont-Know-JS',
      description: 'Serie de libros gratuitos para dominar JavaScript profundamente',
      category: 'book',
      level: 'avanzado',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Kyle Simpson',
    },
  ],

  React: [
    {
      id: 'react-docs',
      title: 'Documentación Oficial de React',
      url: 'https://es.react.dev/',
      description: 'Documentación oficial con guías paso a paso y referencias de API',
      category: 'documentation',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'React Team',
    },
    {
      id: 'react-hooks-guide',
      title: 'Guía Completa de React Hooks',
      url: 'https://es.react.dev/reference/react',
      description: 'Todo sobre useState, useEffect y hooks personalizados',
      category: 'tutorial',
      level: 'intermedio',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'React Team',
    },
    {
      id: 'react-patterns',
      title: 'React Patterns',
      url: 'https://reactpatterns.com/',
      description: 'Patrones de diseño y mejores prácticas en React',
      category: 'tutorial',
      level: 'avanzado',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Michael Chan',
    },
    {
      id: 'react-testing-library',
      title: 'React Testing Library',
      url: 'https://testing-library.com/docs/react-testing-library/intro/',
      description: 'Guía para testing de componentes React',
      category: 'documentation',
      level: 'avanzado',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Kent C. Dodds',
    },
  ],

  TypeScript: [
    {
      id: 'ts-handbook',
      title: 'TypeScript Handbook',
      url: 'https://www.typescriptlang.org/docs/',
      description: 'Documentación oficial completa de TypeScript',
      category: 'documentation',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Microsoft',
    },
    {
      id: 'ts-spanish-guide',
      title: 'TypeScript en Español',
      url: 'https://typescript-es.github.io/',
      description: 'Guía completa de TypeScript traducida al español',
      category: 'tutorial',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 4,
      author: 'Comunidad TypeScript ES',
    },
    {
      id: 'ts-cheatsheet',
      title: 'TypeScript Cheat Sheet',
      url: 'https://rmolinamir.github.io/typescript-cheatsheet/',
      description: 'Referencia rápida de sintaxis y tipos de TypeScript',
      category: 'cheatsheet',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 4,
    },
  ],

  'Node.js': [
    {
      id: 'nodejs-docs',
      title: 'Documentación Oficial Node.js',
      url: 'https://nodejs.org/es/docs/',
      description: 'Documentación completa de la API de Node.js',
      category: 'documentation',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'Node.js Foundation',
    },
    {
      id: 'nodejs-best-practices',
      title: 'Node.js Best Practices',
      url: 'https://github.com/goldbergyoni/nodebestpractices',
      description: 'Mejores prácticas para desarrollo en Node.js',
      category: 'github',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Yoni Goldberg',
    },
    {
      id: 'express-guide',
      title: 'Express.js Guide',
      url: 'https://expressjs.com/es/guide/routing.html',
      description: 'Guía oficial de Express.js para APIs REST',
      category: 'documentation',
      level: 'intermedio',
      language: 'es',
      isPremium: false,
      rating: 4,
      author: 'Express Team',
    },
  ],

  Python: [
    {
      id: 'python-docs',
      title: 'Documentación Oficial Python',
      url: 'https://docs.python.org/es/3/',
      description: 'Tutorial oficial y referencia completa de Python',
      category: 'documentation',
      level: 'todos',
      language: 'es',
      isPremium: false,
      rating: 5,
      author: 'Python Software Foundation',
    },
    {
      id: 'python-real',
      title: 'Real Python',
      url: 'https://realpython.com/',
      description: 'Tutoriales prácticos y proyectos reales en Python',
      category: 'tutorial',
      level: 'todos',
      language: 'en',
      isPremium: true,
      rating: 5,
      author: 'Real Python Team',
    },
    {
      id: 'python-automate',
      title: 'Automate the Boring Stuff',
      url: 'https://automatetheboringstuff.com/',
      description: 'Libro gratuito para automatizar tareas con Python',
      category: 'book',
      level: 'basico',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Al Sweigart',
    },
  ],

  SQL: [
    {
      id: 'sql-w3schools',
      title: 'W3Schools SQL Tutorial',
      url: 'https://www.w3schools.com/sql/',
      description: 'Tutorial interactivo de SQL con ejemplos prácticos',
      category: 'tutorial',
      level: 'basico',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'W3Schools',
    },
    {
      id: 'sql-cheatsheet',
      title: 'SQL Cheat Sheet',
      url: 'https://www.sqltutorial.org/sql-cheat-sheet/',
      description: 'Referencia rápida de comandos SQL más utilizados',
      category: 'cheatsheet',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 4,
    },
  ],

  Git: [
    {
      id: 'git-docs',
      title: 'Documentación Oficial Git',
      url: 'https://git-scm.com/doc',
      description: 'Documentación completa y referencia de comandos Git',
      category: 'documentation',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Git Team',
    },
    {
      id: 'git-atlassian',
      title: 'Atlassian Git Tutorials',
      url: 'https://www.atlassian.com/git/tutorials',
      description: 'Tutoriales visuales de Git desde básico hasta avanzado',
      category: 'tutorial',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Atlassian',
    },
    {
      id: 'git-cheatsheet',
      title: 'Git Cheat Sheet',
      url: 'https://education.github.com/git-cheat-sheet-education.pdf',
      description: 'Comandos Git más utilizados en formato PDF',
      category: 'cheatsheet',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'GitHub',
    },
  ],

  Docker: [
    {
      id: 'docker-docs',
      title: 'Documentación Oficial Docker',
      url: 'https://docs.docker.com/',
      description: 'Guías oficiales y referencia completa de Docker',
      category: 'documentation',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Docker Inc.',
    },
    {
      id: 'docker-curriculum',
      title: 'Docker Curriculum',
      url: 'https://docker-curriculum.com/',
      description: 'Tutorial paso a paso para aprender Docker desde cero',
      category: 'tutorial',
      level: 'basico',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Prakhar Srivastav',
    },
  ],

  MongoDB: [
    {
      id: 'mongodb-docs',
      title: 'Documentación MongoDB',
      url: 'https://docs.mongodb.com/',
      description: 'Documentación oficial y guías de MongoDB',
      category: 'documentation',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'MongoDB Inc.',
    },
    {
      id: 'mongodb-university',
      title: 'MongoDB University',
      url: 'https://university.mongodb.com/',
      description: 'Cursos gratuitos oficiales de MongoDB',
      category: 'course',
      level: 'todos',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'MongoDB Inc.',
    },
  ],

  // === HERRAMIENTAS Y FRAMEWORKS ===
  Vite: [
    {
      id: 'vite-docs',
      title: 'Documentación Vite',
      url: 'https://vitejs.dev/',
      description: 'Guía oficial de Vite para desarrollo frontend rápido',
      category: 'documentation',
      level: 'intermedio',
      language: 'en',
      isPremium: false,
      rating: 5,
      author: 'Evan You',
    },
  ],

  Webpack: [
    {
      id: 'webpack-docs',
      title: 'Webpack Documentation',
      url: 'https://webpack.js.org/',
      description: 'Guías y configuración completa de Webpack',
      category: 'documentation',
      level: 'avanzado',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Webpack Team',
    },
  ],

  Bootstrap: [
    {
      id: 'bootstrap-docs',
      title: 'Bootstrap Documentation',
      url: 'https://getbootstrap.com/docs/',
      description: 'Documentación oficial de Bootstrap con ejemplos',
      category: 'documentation',
      level: 'basico',
      language: 'en',
      isPremium: false,
      rating: 4,
      author: 'Bootstrap Team',
    },
  ],
};

// Función helper para obtener recursos por tecnología
export const getResourcesForSkill = (skillName: string): SkillResource[] => {
  // Usar normalización consistente
  const normalizedSkillName = skillName.trim();

  // Buscar coincidencia exacta primero
  if (skillResources[normalizedSkillName]) {
    return skillResources[normalizedSkillName];
  }

  // Buscar coincidencias parciales (ej: "CSS" para "CSS3")
  const partialMatch = Object.keys(skillResources).find(
    key =>
      key.toLowerCase().includes(normalizedSkillName.toLowerCase()) ||
      normalizedSkillName.toLowerCase().includes(key.toLowerCase())
  );

  if (partialMatch) {
    return skillResources[partialMatch];
  }

  return [];
};

// Función para filtrar recursos por nivel
export const filterResourcesByLevel = (
  resources: SkillResource[],
  level: string
): SkillResource[] => {
  if (level === 'todos') return resources;
  return resources.filter(resource => resource.level === level || resource.level === 'todos');
};

// Función para agrupar recursos por categoría
export const groupResourcesByCategory = (resources: SkillResource[]) => {
  return resources.reduce(
    (acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    },
    {} as Record<string, SkillResource[]>
  );
};

// Configuración de categorías para recursos de habilidades
export const categoryConfig = {
  documentation: { label: 'Documentación', icon: 'fa-book', color: '#4F46E5' },
  tutorial: { label: 'Tutorial', icon: 'fa-graduation-cap', color: '#06b6d4' },
  course: { label: 'Curso', icon: 'fa-chalkboard-teacher', color: '#059669' },
  cheatsheet: { label: 'Cheat Sheet', icon: 'fa-scroll', color: '#f59e42' },
  tool: { label: 'Herramienta', icon: 'fa-wrench', color: '#e11d48' },
  book: { label: 'Libro', icon: 'fa-book-open', color: '#a855f7' },
  video: { label: 'Video', icon: 'fa-video', color: '#f43f5e' },
  github: { label: 'GitHub', icon: 'fa-github', color: '#18181b' },
  project: { label: 'Artículo', icon: 'fa-newspaper', color: '#f59e42' },
  programming: { label: 'Programación', icon: 'fa-code', color: '#4F46E5' },
  cloud: { label: 'Cloud', icon: 'fa-cloud', color: '#06b6d4' },
  database: { label: 'Base de datos', icon: 'fa-database', color: '#059669' },
  security: { label: 'Seguridad', icon: 'fa-shield-alt', color: '#f59e42' },
  design: { label: 'Diseño', icon: 'fa-paint-brush', color: '#e11d48' },
  other: { label: 'Otro', icon: 'fa-asterisk', color: '#6b7280' },
};
