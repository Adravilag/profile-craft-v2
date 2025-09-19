// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

// Tipos para los idiomas soportados
export type Language = 'es' | 'en';

// Estructura de las traducciones
export interface Translations {
  // Navegación y UI general
  navigation: {
    home: string;
    about: string;
    skills: string;
    projects: string;
    experience: string;
    contact: string;
    services: string;
    certifications: string;
    testimonials: string;
    blog: string;
    portfolio: string;
    // Mensajes de navegación/overlay
    navigating: string;
    navigatingTo: string; // use {section} as placeholder
    headerNavItem: string;
  };

  // ProfileHero
  profileHero: {
    downloadCV: string;
    generating: string;
    toggleLanguage: string;
    available: string;
    openToRemote: string;
    exploreCV: string;
    terminal: string;
    videoCurriculum: string;
    projects: string;
    changeWidgets: string;
    logout: string;
    profilePhotoAlt: string;
    accountMenu: string;
    widgetsLabel: string;
    typingWords: string[];
    terminalHint: string;
    videoHint: string;
    projectsHint: string;
    yearsExperience: string;
    projectsCompleted: string;
    technologiesUsed: string;
    loadingProfile: string;
    errorLoadingProfile: string;
    locationAndAvailability: string;
  };

  // Terminal Interactiva
  terminal: {
    welcome: string;
    welcomeSubtitle: string;
    functionalTerminal: string;
    exploreProfile: string;
    tips: string;
    helpCommand: string;
    tabAutocomplete: string;
    arrowNavigation: string;
    clearScreen: string;
    startCommand: string;
    processing: string;
    clearButton: string;
    enterCommand: string;
    user: string;
    host: string;
  };

  // Comandos del Terminal
  terminalCommands: {
    help: string;
    about: string;
    skills: string;
    projects: string;
    contact: string;
    experience: string;
    education: string;
    clear: string;
    refresh: string;
    whoami: string;
    ls: string;
    cat: string;
    availableCommands: string;
    showsHelp: string;
    realDataFromDB: string;
    technologiesManaged: string;
    featuredProjects: string;
    contactInfo: string;
    professionalExperience: string;
    academicFormation: string;
    clearsScreen: string;
    updateFromDB: string;
    basicInfo: string;
    listDirectories: string;
    showFileContent: string;
    easterEggs: string;
    discoverAll: string;
    hackingMode: string;
    undertaleExperience: string;
    matrixMode: string;
    needCaffeine: string;
    adminPermissions: string;
    classicGameCode: string;
    pokemonCenter: string;
    codePizza: string;
    vimEditor: string;
    universeAnswer: string;
    debuggingSession: string;
    emojiFestival: string;
    tipMessage: string;
    exploreUse: string;
    realDataNote: string;
    commandNotFound: string;
    didYouMean: string;
    seeAllCommands: string;
    noDataInDB: string;
    addFromAdmin: string;
    myTechnicalSkills: string;
    noSkillsRegistered: string;
    addSkills: string;
    featuredProjectsTitle: string;
    noProjectsRegistered: string;
    addProjects: string;
    moreProjects: string;
    professionalExperienceTitle: string;
    noExperienceRegistered: string;
    addExperience: string;
    present: string;
    noProfileInfo: string;
    addProfile: string;
    status: string;
    contactInfoTitle: string;
    email: string;
    phone: string;
    location: string;
    responseTime: string;
    openToRemote: string;
    academicFormationTitle: string;
    noEducationRegistered: string;
    addEducation: string;
    dataUpdated: string;
    skillsUpdated: string;
    projectsUpdated: string;
    experienceUpdated: string;
    profileUpdated: string;
    educationUpdated: string;
    useCommandsNote: string;
  };

  // Definiciones para respuestas usadas por la terminal (respuestas preformateadas)
  responses: {
    // Mensajes generales
    commandNotFound: string;
    tryHelp: string;
    error: string;

    // About / profile
    about: {
      noProfile: string[];
      status: string;
      footer: string;
    };

    // Skills
    skills: {
      title: string;
      noSkills: string[];
      footer: string;
    };

    // Projects
    projects: {
      title: string;
      noProjects: string[];
      techStack: string;
      footer: string;
    };

    // Experience
    experience: {
      title: string;
      noExperience: string[];
      current: string;
      footer: string;
    };

    // Contact
    contact: {
      title: string;
      noContact: string[];
      email: string;
      phone: string;
      location: string;
      footer: string;
    };

    // Education
    education: {
      title: string;
      noEducation: string[];
      current: string;
      footer: string;
    };
  };

  // Definiciones para ayuda y comandos con salidas predefinidas
  commands: {
    help: { description: string; output?: string[] | string };
    about: { description: string } & { output?: string[] | string };
    skills: { description: string } & { output?: string[] | string };
    projects: { description: string } & { output?: string[] | string };
    contact: { description: string } & { output?: string[] | string };
    experience: { description: string } & { output?: string[] | string };
    education: { description: string } & { output?: string[] | string };
    refresh: { description: string; output?: string[] | string };
    clear: { description: string };
    whoami: { description: string; fallback?: string[] };
    ls: {
      description: string;
      directories?: string[];
      skills?: string[];
      projects?: string[];
      usage?: string;
    };
    cat: {
      description: string;
      noFile?: string[];
      files?: Record<string, string[]>;
      notFound?: string;
    };

    // Easter eggs and small commands
    hack: { description: string; output?: string[] };
    undertale: { description: string; output?: string[] };
    matrix: { description: string; output?: string[] };
    coffee: { description: string; output?: string[] };
    sudo: { description: string; output?: string[] };
    konami: { description: string; output?: string[] };
    pokemon: { description: string; output?: string[] };
    pizza: { description: string; output?: string[] };
    vim: { description: string; output?: string[] };
    '42': { description: string; output?: string[] };
    debug: { description: string; output?: string[] };
    emoji: { description: string; output?: string[] };
    refreshOutput?: string[];
    rm?: { noOperand?: string[]; readOnly?: string[] };
  };

  // Widget de Video
  videoWidget: {
    playVideo: string;
    copyLink: string;
    copied: string;
    openInYoutube: string;
    videoNotSupported: string;
    noVideoAvailable: string;
    loading: string;
  };

  // Carrusel de Proyectos
  projectsCarousel: {
    previous: string;
    next: string;
    loading: string;
    loadingProjects: string;
    errorLoading: string;
    retry: string;
    retryInline: string;
    noProjects: string;
    noProjectsDescription: string;
    createProject: string;
    checkFilters: string;
    contactSupport: string;
    live: string;
    article: string;
    completed: string;
    video: string;
    code: string;
    views: string;
    publishedOn: string;
    currentProject: string;
    projectOf: string;
    pagination: string;
    loadingProblem: string;
  };

  // Sección Sobre Mí
  about: {
    title: string;
    subtitle: string;
    description: string;
    downloadResume: string;
    myStory: string;
    passion: string;
    goals: string;
    philosophy: string;
    loadingInfo: string;
    errorLoading: string;
    collaborationTitle: string;
    collaborationDescription: string;
    navigateToContact: string;
    knowMyHistory: string;
    whatMotivatesMe: string;
  };

  // Sección de Habilidades
  skills: {
    title: string;
    subtitle?: string;
    technical: string;
    highlights: string;
    soft: string;
    languages: string;
    tools: string;
    frameworks: string;
    databases: string;
    level: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };

  // Sección de Proyectos
  projects: {
    // Título corto y subtítulo para cabeceras
    subtitle?: string;
    title: string;
    viewDetails: string;
    viewProject: string;
    viewCode: string;
    liveDemo: string;
    viewDemoAria: string;
    readArticleAria: string;
    viewVideoDemoAria: string;
    viewCodeOnGitHub: string;
    playDemoAria: string;
    videoDemoTitle: string;
    descriptionFallback: string;
    readMore: string;
    demo: string;
    technologies: string;
    description: string;
    features: string;
    challenges: string;
    learnings: string;
    duration: string;
    team: string;
    role: string;
    status: string;
    completed: string;
    inProgress: string;
    planned: string;
    // Badges / tipos legibles para UI
    type: {
      project: string;
      article: string;
    };
    statusLabels: {
      completed: string;
      inProgress: string;
      planned: string;
      paused: string;
      draft: string;
    };
  };

  // Sección específica de Proyectos (textos de cabecera)
  projectsSection: {
    subtitleAll: string;
    subtitleProjects: string;
  };

  // Sección de Certificaciones
  certifications: {
    title: string;
    subtitle?: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    verify: string;
    notAvailable: string;
    courseSite: string;
    editCertification: string;
    deleteCertification: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteError: string;
    loadError: string;
    saveError: string;
  };

  // Sección de Testimonios
  testimonials: {
    title: string;
    subtitle?: string;
    addCta: string;
    addModalTitle: string;
    editModalTitle: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    readMore: string;
    readLess: string;
    form: {
      placeholders: {
        name: string;
        position: string;
        text: string;
        email: string;
        company: string;
        website: string;
      };
      buttons: {
        save: string;
        add: string;
        cancel: string;
      };
    };
    validation: {
      nameRequired: string;
      nameTooLong: string;
      positionRequired: string;
      positionTooLong: string;
      textRequired: string;
      textTooShort: string;
      textTooLong: string;
      emailInvalid: string;
      websiteInvalid: string;
      ratingInvalid: string;
    };
    notifications: {
      submitSuccessTitle: string;
      submitSuccessMsg: string;
      updateSuccessTitle: string;
      updateSuccessMsg: string;
      submitErrorTitle: string;
      submitErrorMsg: string;
    };
    admin: {
      edit: string;
      delete: string;
    };
  };

  // Sección de Experiencia
  experience: {
    title: string;
    subtitle: string;
    loading: string;
    loadingDetails: string;
    errorRetry: string;
    retryLimitReached: string;
    viewCategories: string;
    viewChronological: string;
    workExperience: string;
    education: string;
    certifications: string;
    current: string;
    previous: string;
    company: string;
    position: string;
    duration: string;
    responsibilities: string;
    achievements: string;
    technologies: string;
    stats: {
      experiences: string;
      certifications: string;
      technologies: string;
    };
    admin: {
      title: string;
      noExperiences: string;
      noExperiencesDesc: string;
      noEducation: string;
      noEducationDesc: string;
      edit: string;
      delete: string;
      newExperience: string;
      newEducation: string;
      cancel: string;
      saveChanges: string;
      create: string;
    };
  };

  // Sección de Contacto
  contact: {
    title: string;
    getInTouch: string;
    sendMessage: string;
    email: string;
    phone: string;
    location: string;
    social: string;
    linkedin: string;
    github: string;
    twitter: string;
    instagram: string;
    website: string;
  };

  contactExtras: {
    subtitle: string;
    locationLabel: string;
    locationValue: string;
    responseTimeLabel: string;
    responseTimeValue: string;
    languagesLabel: string;
    languagesValue: string;
    privacyNote: string;
    sending: string;
  };

  // Términos técnicos comunes
  tech: {
    frontend: string;
    backend: string;
    fullstack: string;
    developer: string;
    designer: string;
    engineer: string;
    architect: string;
    analyst: string;
    consultant: string;
    manager: string;
  };

  // Formularios de experiencia
  forms: {
    experience: {
      title: string;
      education: string;
      editExperience: string;
      editEducation: string;
      newExperience: string;
      newEducation: string;
      basicInfo: string;
      position: string;
      positionPlaceholder: string;
      positionHelper: string;
      degree: string;
      degreePlaceholder: string;
      degreeHelper: string;
      company: string;
      institution: string;
      companyPlaceholder: string;
      institutionPlaceholder: string;
      companyHelper: string;
      institutionHelper: string;
      timePeriod: string;
      startDate: string;
      endDate: string;
      startDateHelper: string;
      endDateHelper: string;
      current: string;
      currentEducation: string;
      currentJob: string;
      currentStudies: string;
      technologies: string;
      technologiesUsed: string;
      technologiesPlaceholder: string;
      technologiesHelper: string;
      details: string;
      academicDetails: string;
      grade: string;
      gradePlaceholder: string;
      gradeHelper: string;
      displayOrder: string;
      displayOrderPlaceholder: string;
      displayOrderHelper: string;
      characterCount: string;
      description: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      descriptionEducationPlaceholder: string;
      descriptionHelper: string;
      cancel: string;
      save: string;
      saveChanges: string;
      create: string;
      createExperience: string;
      createEducation: string;
      saving: string;
      progressComplete: string;
      progressCompleted: string;
      progressHelp: string;
      completed: string;
      closeShortcut: string;
      saveShortcut: string;
      currentPlaceholder: string;
      removeTechnology: string;
    };
    validation: {
      required: string;
      titleRequired: string;
      titleMinLength: string;
      titleMustContainLetters: string;
      companyRequired: string;
      institutionRequired: string;
      minLength: string;
      mustContainLetters: string;
      startDateRequired: string;
      endDateRequired: string;
      invalidDateFormat: string;
      descriptionMaxLength: string;
      technologiesRequired: string;
      endDateMustBeAfterStart: string;
      validationErrors: string;
      pleaseFixErrors: string;
      companyMustContainLetters: string;
      institutionMustContainLetters: string;
    };
    notifications: {
      experienceUpdated: string;
      educationUpdated: string;
      experienceCreated: string;
      educationCreated: string;
      updated: string;
      created: string;
      correctly: string;
      updateSuccess: string;
      createSuccess: string;
      saveError: string;
      unknownError: string;
    };
  };

  // Estados y mensajes
  states: {
    loading: string;
    error: string;
    success: string;
    notFound: string;
    retry: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    close: string;
    open: string;
    submit: string;
    reset: string;
  };

  // Formularios de contacto
  contactForms: {
    email: string;
    name: string;
    message: string;
    subject: string;
    send: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    tooShort: string;
    tooLong: string;
    firstName: string;
    lastName: string;
    company: string;
    website: string;
  };

  // Tiempo y fechas
  time: {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
    ago: string;
    now: string;
    present: string;
    since: string;
    until: string;
    from: string;
    to: string;
  };

  // Acciones comunes
  actions: {
    viewMore: string;
    viewLess: string;
    showAll: string;
    hideAll: string;
    expand: string;
    collapse: string;
    next: string;
    previous: string;
    share: string;
    copy: string;
    download: string;
    upload: string;
    print: string;
  };

  // Sección Footer
  footer: {
    brandNameFallback: string; // fallback when profile name is not available
    brandTagline: string;
    followTitle: string;
    navigationTitle: string;
    contactTitle: string;
    contactFallback: string;
    availabilityDefault: string;
    emailSubject: string;
    emailBody: string;
    sendEmailAria: string;
    newsletterTitle: string;
    newsletterDescription: string;
    newsletterPlaceholder: string;
    subscribeAria: string;
    developedWithLabel: string;
    madeWithLoveAria: string;
  };
}

// Traducciones en español
const esTranslations: Translations = {
  navigation: {
    home: 'Inicio',
    about: 'Acerca de',
    skills: 'Habilidades',
    projects: 'Proyectos',
    experience: 'Experiencia',
    certifications: 'Certificaciones',
    contact: 'Contacto',
    services: 'Servicios',
    testimonials: 'Testimonios',
    blog: 'Blog',
    portfolio: 'Portafolio',
    navigating: 'Navegando...',
    navigatingTo: 'Navegando a {section}...',
    headerNavItem: 'Elemento de navegación',
  },

  // Respuestas usadas por el widget terminal y helpers
  responses: {
    commandNotFound: 'comando no encontrado',
    tryHelp: "Escribe 'help' para ver los comandos disponibles.",
    error: 'Error',

    about: {
      noProfile: ['No hay información de perfil disponible.'],
      status: 'Estado',
      footer: '— Fin del perfil —',
    },

    skills: {
      title: '🛠️  Mis habilidades técnicas:',
      noSkills: ['No hay habilidades registradas en la base de datos.'],
      footer: '— Fin de la lista de habilidades —',
    },

    projects: {
      title: '🚀 Proyectos destacados:',
      noProjects: ['No hay proyectos registrados en la base de datos.'],
      techStack: 'Tech stack',
      footer: '— Fin de la lista de proyectos —',
    },

    experience: {
      title: '💼 Experiencia profesional:',
      noExperience: ['No hay experiencias laborales registradas en la base de datos.'],
      current: 'Presente',
      footer: '— Fin de la lista de experiencias —',
    },

    contact: {
      title: '📞 Información de contacto:',
      noContact: ['No hay información de contacto.'],
      email: 'Correo electrónico',
      phone: 'Teléfono',
      location: 'Ubicación',
      footer: '— Fin de la información de contacto —',
    },

    education: {
      title: '🎓 Formación académica:',
      noEducation: ['No hay información de educación registrada en la base de datos.'],
      current: 'Actualidad',
      footer: '— Fin de la lista de educación —',
    },
  },

  // Definiciones de ayuda/comandos para la terminal (salidas y descripciones)
  commands: {
    help: { description: 'Muestra esta ayuda', output: [] },
    about: { description: 'Muestra información básica del perfil' },
    skills: { description: 'Lista mis habilidades' },
    projects: { description: 'Lista mis proyectos' },
    contact: { description: 'Muestra información de contacto' },
    experience: { description: 'Lista mi experiencia' },
    education: { description: 'Lista mi formación académica' },
    refresh: { description: 'Actualizar datos desde la base de datos', output: [] },
    clear: { description: 'Limpia la pantalla' },
    whoami: { description: 'Muestra mi rol', fallback: ['Sin información de perfil'] },
    ls: {
      description: 'Lista directorios disponibles',
      directories: ['skills', 'projects'],
      skills: [],
      projects: [],
      usage: '',
    },
    cat: {
      description: 'Muestra contenido de archivos',
      noFile: ['Especifica un archivo a mostrar'],
      files: {},
      notFound: 'Archivo no encontrado',
    },

    hack: { description: 'Modo hacking (easter egg)', output: [] },
    undertale: { description: 'Experiencia tipo Undertale', output: [] },
    matrix: { description: 'Modo matrix', output: [] },
    coffee: { description: 'Necesitas cafeína', output: [] },
    sudo: { description: 'Prueba permisos de administrador', output: [] },
    konami: { description: 'Código Konami', output: [] },
    pokemon: { description: 'Centro Pokémon', output: [] },
    pizza: { description: 'Ordena pizza de código', output: [] },
    vim: { description: 'Entra al editor (buena suerte saliendo)', output: [] },
    '42': { description: 'La respuesta del universo', output: [] },
    debug: { description: 'Sesión de debugging', output: [] },
    emoji: { description: 'Festival de emojis', output: [] },
    refreshOutput: [],
    rm: { noOperand: ['rm: falta operando'], readOnly: ['rm: sistema de solo lectura'] },
  },
  profileHero: {
    downloadCV: 'Descargar CV',
    generating: 'Generando...',
    toggleLanguage: 'Cambiar idioma',
    available: 'Disponible',
    openToRemote: 'Abierto a remoto / híbrido / freelance',
    exploreCV: 'Explora mi CV',
    terminal: 'Terminal',
    videoCurriculum: 'Videocurrículum',
    projects: 'Proyectos',
    changeWidgets: 'Cambia entre widgets',
    logout: 'Cerrar sesión',
    yearsExperience: 'años de experiencia',
    projectsCompleted: 'proyectos completados',
    technologiesUsed: 'tecnologías utilizadas',
    loadingProfile: 'Cargando perfil...',
    errorLoadingProfile: 'Error al cargar el perfil',
    locationAndAvailability: 'Ubicación y disponibilidad',
    terminalHint:
      "Terminal interactivo: escribe comandos para explorar el CV (prueba <code>'help'</code>)",
    videoHint: 'Videocurrículum: pulsa "play" para ver una presentación breve y usa los controles',
    projectsHint:
      'Proyectos: navega miniaturas y haz clic para abrir demos, capturas o repositorios',
    profilePhotoAlt: 'Foto de perfil de {name}',
    accountMenu: 'Menú de cuenta',
    widgetsLabel: 'widgets',
    typingWords: [
      'Desarrollador Software',
      'Creador de experiencias interactivas',
      'Diseñador de interfaces de usuario',
      'Desarrollador de soluciones accesibles',
    ],
  },

  // Terminal Interactiva
  terminal: {
    welcome: '🖥️  Terminal Interactiva - CV Adrián Dávila',
    welcomeSubtitle: '¡Bienvenido! Esta es una terminal completamente funcional.',
    functionalTerminal: 'Puedes escribir comandos para explorar mi perfil profesional.',
    exploreProfile: 'Puedes escribir comandos para explorar mi perfil profesional.',
    tips: '💡 Consejos:',
    helpCommand: "• Escribe 'help' para ver todos los comandos disponibles",
    tabAutocomplete: '• Usa Tab para autocompletar comandos',
    arrowNavigation: '• Usa ↑↓ para navegar por el historial de comandos',
    clearScreen: "• Escribe 'clear' para limpiar la pantalla",
    startCommand: "🚀 ¡Comienza escribiendo 'about' para conocer más sobre mí!",
    processing: 'Procesando...',
    clearButton: 'Limpiar terminal',
    enterCommand: "Escribe un comando... (prueba 'help')",
    user: 'adrian',
    host: 'dev',
  },

  // Comandos del Terminal
  terminalCommands: {
    help: 'help',
    about: 'about',
    skills: 'skills',
    projects: 'projects',
    contact: 'contact',
    experience: 'experience',
    education: 'education',
    clear: 'clear',
    refresh: 'refresh',
    whoami: 'whoami',
    ls: 'ls',
    cat: 'cat',
    availableCommands: 'Comandos disponibles:',
    showsHelp: 'Muestra esta ayuda',
    realDataFromDB: 'datos reales de BD',
    technologiesManaged: 'Lista de tecnologías que manejo',
    featuredProjects: 'Proyectos destacados',
    contactInfo: 'Información de contacto',
    professionalExperience: 'Experiencia profesional',
    academicFormation: 'Formación académica',
    clearsScreen: 'Limpia la pantalla',
    updateFromDB: 'Actualizar datos desde la base de datos',
    basicInfo: 'Información básica',
    listDirectories: 'Lista directorios disponibles',
    showFileContent: 'Muestra contenido de archivos',
    easterEggs: '🎮 Easter Eggs (¡Descúbrelos todos!):',
    discoverAll: '¡Descúbrelos todos!',
    hackingMode: 'Modo hacking Hollywood 🔥',
    undertaleExperience: 'Experiencia tipo Undertale ❤️',
    matrixMode: 'Follow the white rabbit 💊',
    needCaffeine: 'Necesitas cafeína ☕',
    adminPermissions: 'Permisos de administrador 🔐',
    classicGameCode: 'Código clásico de videojuegos 🎮',
    pokemonCenter: 'Centro Pokémon para desarrolladores 🔴',
    codePizza: 'Ordena pizza de código 🍕',
    vimEditor: 'Entra al editor (buena suerte saliendo) 📝',
    universeAnswer: 'La respuesta del universo 🤖',
    debuggingSession: 'Sesión típica de debugging 🐛',
    emojiFestival: 'Festival de emojis 🎨',
    tipMessage: "💡 Tip: Escribe 'ls' para explorar o usa Tab para autocompletar",
    exploreUse: "Escribe 'ls' para explorar o usa Tab para autocompletar",
    realDataNote:
      'Los comandos marcados con (datos reales de BD) cargan información de la base de datos',
    commandNotFound: 'comando no encontrado',
    didYouMean: '¿Quisiste decir?',
    seeAllCommands: "Escribe 'help' para ver todos los comandos disponibles.",
    noDataInDB: 'No hay {type} registrada{s} en la base de datos.',
    addFromAdmin: 'Para agregar {type}, visita el panel de administración.',
    myTechnicalSkills: '🛠️  Mis habilidades técnicas:',
    noSkillsRegistered: 'No hay habilidades registradas en la base de datos.',
    addSkills: 'Para agregar habilidades, visita el panel de administración.',
    featuredProjectsTitle: '🚀 Proyectos destacados:',
    noProjectsRegistered: 'No hay proyectos registrados en la base de datos.',
    addProjects: 'Para agregar proyectos, visita el panel de administración.',
    moreProjects: 'Y {count} proyectos más...',
    professionalExperienceTitle: '💼 Experiencia profesional:',
    noExperienceRegistered: 'No hay experiencias laborales registradas en la base de datos.',
    addExperience: 'Para agregar experiencia, visita el panel de administración.',
    present: 'Presente',
    noProfileInfo: 'No hay información de perfil disponible en la base de datos.',
    addProfile: 'Por favor, agrega tu perfil desde el panel de administración.',
    status: 'Estado',
    contactInfoTitle: '📞 Información de contacto:',
    email: '📧 Email',
    phone: '📱 Teléfono',
    location: '📍 Ubicación',
    responseTime: '⏰ Tiempo de respuesta: < 24 horas',
    openToRemote: '🤝 Abierto a colaboraciones remotas',
    academicFormationTitle: '🎓 Formación académica:',
    noEducationRegistered: 'No hay información de educación registrada en la base de datos.',
    addEducation: 'Para agregar educación, visita el panel de administración.',
    dataUpdated: '🔄 Datos actualizados desde la base de datos',
    skillsUpdated: '✅ Skills actualizadas',
    projectsUpdated: '✅ Proyectos actualizados',
    experienceUpdated: '✅ Experiencias actualizadas',
    profileUpdated: '✅ Perfil actualizado',
    educationUpdated: '✅ Educación actualizada',
    useCommandsNote:
      "Puedes usar los comandos 'skills', 'projects', 'experience', 'about', 'education' o 'contact' para ver los datos actualizados.",
  },

  // Widget de Video
  videoWidget: {
    playVideo: 'Reproducir videocurrículum',
    copyLink: 'Copiar enlace',
    copied: 'Copiado',
    openInYoutube: 'Ver en YouTube',
    videoNotSupported: 'Tu navegador no soporta reproducción de vídeo.',
    noVideoAvailable: 'No hay videocurrículum disponible.',
    loading: 'Cargando video...',
  },

  // Carrusel de Proyectos
  projectsCarousel: {
    previous: 'Anterior',
    next: 'Siguiente',
    loading: 'Cargando...',
    loadingProjects: 'Cargando proyectos',
    errorLoading: 'No pudimos cargar los proyectos',
    retry: 'Reintentar',
    retryInline: 'Reintentar',
    noProjects: 'No hay proyectos para mostrar',
    noProjectsDescription: 'Aún no hay proyectos públicos en este perfil.',
    createProject: 'Crear proyecto',
    checkFilters: 'Revisar filtros',
    contactSupport: 'Contactar soporte',
    live: 'EN VIVO',
    article: 'ARTÍCULO',
    completed: '✔ COMPLETADO',
    video: 'Vídeo',
    code: 'Código',
    views: 'Vistas',
    publishedOn: 'Publicado el',
    currentProject: 'Proyecto actual',
    projectOf: 'de',
    pagination: 'Paginación de proyectos',
    loadingProblem: 'Problema cargando proyectos:',
  },

  about: {
    title: 'Sobre Mí',
    subtitle: 'Conoce mi historia, filosofía y lo que me motiva como desarrollador',
    description: 'Descripción',
    downloadResume: 'Descargar Currículum',
    myStory: 'Mi Historia',
    passion: 'Mi Pasión',
    goals: 'Mis Objetivos',
    philosophy: 'Mi Filosofía',
    loadingInfo: 'Cargando información...',
    errorLoading: 'Error al cargar la información',
    collaborationTitle: '¿Tienes un proyecto desafiante?',
    collaborationDescription:
      'Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu próximo proyecto!',
    navigateToContact: 'Navegar a la sección de contacto para discutir proyectos',
    knowMyHistory: 'Conoce mi historia',
    whatMotivatesMe: 'Lo que me motiva',
  },

  skills: {
    title: 'Habilidades',
    subtitle: 'Competencias técnicas y conocimientos',
    technical: 'Técnicas',
    highlights: 'Destacados',
    soft: 'Blandas',
    languages: 'Idiomas',
    tools: 'Herramientas',
    frameworks: 'Frameworks',
    databases: 'Bases de Datos',
    level: 'Nivel',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
  },

  projects: {
    subtitle: 'Explora mis proyectos y desarrollos más destacados',
    title: 'Proyectos',
    viewProject: 'Ver Proyecto',
    viewDetails: 'Ver detalles',
    viewCode: 'Ver Código',
    liveDemo: 'Demo en Vivo',
    viewDemoAria: 'Ver demo de {title}',
    readArticleAria: 'Leer artículo de {title}',
    viewVideoDemoAria: 'Ver demo en vídeo de {title}',
    viewCodeOnGitHub: 'Ver código de {title} en GitHub',
    playDemoAria: 'Reproducir demo de {title}',
    videoDemoTitle: 'Ver demo en vídeo',
    descriptionFallback: 'Haz clic para ver más detalles del proyecto',
    readMore: 'Leer más →',
    demo: 'Demo',
    technologies: 'Tecnologías',
    description: 'Descripción',
    features: 'Características',
    challenges: 'Desafíos',
    learnings: 'Aprendizajes',
    duration: 'Duración',
    team: 'Equipo',
    role: 'Rol',
    status: 'Estado',
    completed: 'Completado',
    inProgress: 'En Progreso',
    planned: 'Planificado',
    // Badges / tipos legibles
    type: {
      project: 'Proyecto',
      article: 'Artículo',
    },
    statusLabels: {
      completed: 'Completado',
      inProgress: 'En Desarrollo',
      planned: 'Planificado',
      paused: 'Pausado',
      draft: 'Borrador',
    },
  },

  projectsSection: {
    subtitleAll:
      'Explora mi colección de proyectos técnicos. Cada uno cuenta una historia de innovación y aprendizaje.',
    subtitleProjects:
      'Explora mis proyectos más recientes y relevantes. Cada uno muestra tecnologías clave y demos.',
  },

  certifications: {
    title: 'Certificaciones',
    subtitle: 'Credenciales y certificaciones profesionales obtenidas',
    loading: 'Cargando certificaciones...',
    emptyTitle: 'No hay certificaciones disponibles',
    emptyDescription: 'Las certificaciones aparecerán aquí cuando estén disponibles.',
    verify: 'Verificar',
    notAvailable: 'No disponible',
    courseSite: 'Sitio del curso',
    editCertification: 'Editar certificación',
    deleteCertification: 'Eliminar certificación',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta certificación?',
    deleteSuccess: '¡Certificación eliminada!',
    deleteError: 'No se pudo eliminar la certificación',
    loadError: 'No se pudieron cargar las certificaciones',
    saveError: 'No se pudo guardar la certificación',
  },

  testimonials: {
    title: 'Testimonios',
    subtitle: 'Lo que dicen quienes han trabajado conmigo',
    addCta: 'Añadir mi testimonio',
    addModalTitle: 'Añadir Testimonio',
    editModalTitle: 'Editar Testimonio',
    loading: 'Cargando testimonios...',
    emptyTitle: 'No hay testimonios disponibles',
    emptyDescription: '¡Sé el primero en compartir tu experiencia!',
    readMore: 'Leer más',
    readLess: 'Leer menos',
    form: {
      placeholders: {
        name: 'Nombre',
        position: 'Puesto',
        text: 'Testimonio',
        email: 'Email (opcional)',
        company: 'Empresa (opcional)',
        website: 'Sitio web (opcional)',
      },
      buttons: {
        save: 'Guardar',
        add: 'Añadir Testimonio',
        cancel: 'Cancelar',
      },
    },
    validation: {
      nameRequired: 'El nombre es requerido',
      nameTooLong: 'El nombre es demasiado largo',
      positionRequired: 'El puesto es requerido',
      positionTooLong: 'El puesto es demasiado largo',
      textRequired: 'El testimonio es requerido',
      textTooShort: 'El testimonio es demasiado corto (mínimo 20 caracteres)',
      textTooLong: 'El testimonio es demasiado largo (máximo 1000 caracteres)',
      emailInvalid: 'Email inválido',
      websiteInvalid: 'URL inválida',
      ratingInvalid: 'La valoración debe estar entre 1 y 5',
    },
    notifications: {
      submitSuccessTitle: 'Testimonio enviado',
      submitSuccessMsg: 'Gracias por compartir tu experiencia. Tu testimonio será revisado.',
      updateSuccessTitle: 'Testimonio actualizado',
      updateSuccessMsg: 'Los cambios se han guardado correctamente',
      submitErrorTitle: 'Error',
      submitErrorMsg: 'No se pudo enviar el testimonio. Inténtalo de nuevo.',
    },
    admin: {
      edit: 'Editar',
      delete: 'Eliminar',
    },
  },

  // Formularios de experiencia
  forms: {
    experience: {
      title: 'Experiencia',
      education: 'Educación',
      editExperience: 'Editar Experiencia',
      editEducation: 'Editar Educación',
      newExperience: 'Nueva Experiencia',
      newEducation: 'Nueva Educación',
      basicInfo: 'Información Básica',
      position: 'Título del puesto',
      positionPlaceholder: 'Ej: Desarrollador Full Stack Senior',
      positionHelper: 'Especifica tu rol o cargo principal',
      degree: 'Título o grado',
      degreePlaceholder: 'Ej: Grado en Ingeniería Informática',
      degreeHelper: 'Indica el nombre completo del título',
      company: 'Empresa',
      institution: 'Institución',
      companyPlaceholder: 'Ej: TechCorp Solutions',
      institutionPlaceholder: 'Ej: Universidad Tecnológica',
      companyHelper: 'Nombre de la empresa u organización',
      institutionHelper: 'Nombre de la universidad o centro educativo',
      timePeriod: 'Período de Tiempo',
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de fin',
      startDateHelper: 'Formato: DD/MM/AAAA — también puedes escribir la fecha manualmente.',
      endDateHelper: 'Formato: DD/MM/AAAA',
      current: 'Trabajo actual',
      currentEducation: 'Estudios en curso',
      currentJob: 'Trabajo actual',
      currentStudies: 'Estudios en curso',
      technologies: 'Tecnologías y Herramientas',
      technologiesUsed: 'Tecnologías utilizadas',
      technologiesPlaceholder: 'Escribe y presiona Enter para agregar...',
      technologiesHelper: 'Agrega las tecnologías más relevantes de este puesto',
      details: 'Descripción y Detalles',
      description: 'Descripción',
      descriptionLabel: 'Descripción',
      descriptionPlaceholder: 'Describe tus responsabilidades, logros y proyectos destacados...',
      descriptionEducationPlaceholder: 'Describe la especialización, proyectos destacados, etc...',
      descriptionHelper: 'Máximo 500 caracteres. Enfócate en logros y responsabilidades clave',
      academicDetails: 'Detalles Académicos',
      grade: 'Calificación',
      gradePlaceholder: 'Ej: Sobresaliente, 8.5/10, Matrícula de Honor',
      gradeHelper: 'Nota media, mención o reconocimiento obtenido',
      displayOrder: 'Orden de visualización',
      displayOrderPlaceholder: '0',
      displayOrderHelper: 'Número para ordenar la visualización',
      characterCount: 'caracteres',
      cancel: 'Cancelar',
      save: 'Guardar',
      saveChanges: 'Guardar Cambios',
      create: 'Crear',
      createExperience: 'Crear Experiencia',
      createEducation: 'Crear Educación',
      saving: 'Guardando...',
      progressComplete: 'Completa este formulario para agregar tu experiencia',
      progressCompleted: 'Completado',
      progressHelp: 'Completa este formulario para agregar tu experiencia',
      completed: 'Completado',
      closeShortcut: 'Cerrar',
      saveShortcut: 'Guardar',
      currentPlaceholder: 'Actualidad',
      removeTechnology: 'Eliminar',
    },
    validation: {
      required: 'Campo requerido',
      titleRequired: 'El título es obligatorio',
      titleMinLength: 'El título debe tener al menos 3 caracteres',
      titleMustContainLetters: 'El título debe contener letras',
      companyRequired: 'La empresa es obligatoria',
      institutionRequired: 'La institución es obligatoria',
      minLength: 'Debe tener al menos 2 caracteres',
      mustContainLetters: 'debe contener letras',
      startDateRequired: 'La fecha de inicio es obligatoria',
      endDateRequired: 'La fecha de fin es obligatoria',
      invalidDateFormat: 'Formato de fecha inválido (MM-YYYY)',
      descriptionMaxLength: 'La descripción no puede exceder 500 caracteres',
      technologiesRequired: 'Agrega al menos una tecnología o herramienta',
      endDateMustBeAfterStart: 'La fecha de fin debe ser posterior a la de inicio',
      validationErrors: 'Errores de Validación',
      pleaseFixErrors: 'Por favor corrige los errores antes de continuar',
      companyMustContainLetters: 'La empresa debe contener letras',
      institutionMustContainLetters: 'La institución debe contener letras',
    },
    notifications: {
      experienceUpdated: 'Experiencia Actualizada',
      educationUpdated: 'Educación Actualizada',
      experienceCreated: 'Experiencia Creada',
      educationCreated: 'Educación Creada',
      updated: 'actualizado',
      created: 'creado',
      correctly: 'correctamente',
      updateSuccess: 'Se ha actualizado correctamente',
      createSuccess: 'Se ha creado correctamente',
      saveError: 'Error al Guardar',
      unknownError: 'Error desconocido',
    },
  },

  experience: {
    title: 'Trayectoria Profesional',
    subtitle:
      'Un recorrido por mi experiencia laboral y formación académica, mostrando las tecnologías y logros más relevantes.',
    loading: 'Cargando experiencia y formación...',
    loadingDetails: 'Obteniendo datos del servidor...',
    errorRetry: 'Reintentar',
    retryLimitReached: 'Límite de reintentos alcanzado',
    viewCategories: 'Vista por Categorías',
    viewChronological: 'Vista Cronológica',
    workExperience: 'Experiencia Laboral',
    education: 'Formación Académica',
    certifications: 'Certificaciones',
    current: 'Actual',
    previous: 'Anterior',
    company: 'Empresa',
    position: 'Puesto',
    duration: 'Duración',
    responsibilities: 'Responsabilidades',
    achievements: 'Logros',
    technologies: 'Tecnologías',
    stats: {
      experiences: 'Experiencias',
      certifications: 'Certificaciones',
      technologies: 'Tecnologías',
    },
    admin: {
      title: 'Administración de Trayectoria',
      noExperiences: 'No hay experiencias',
      noExperiencesDesc: 'Añade la primera experiencia laboral usando el botón flotante.',
      noEducation: 'No hay formación académica',
      noEducationDesc: 'Añade la primera formación académica usando el botón flotante.',
      edit: 'Editar',
      delete: 'Eliminar',
      newExperience: 'Nueva Experiencia',
      newEducation: 'Nueva Educación',
      cancel: 'Cancelar',
      saveChanges: 'Guardar Cambios',
      create: 'Crear',
    },
  },
  contact: {
    title: 'Contacto',
    getInTouch: 'Ponte en Contacto',
    sendMessage: 'Enviar Mensaje',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    location: 'Ubicación',
    social: 'Redes Sociales',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    instagram: 'Instagram',
    website: 'Sitio Web',
  },
  contactExtras: {
    subtitle: '¿Tienes un proyecto en mente? ¡Hablemos!',
    locationLabel: 'Ubicación',
    locationValue: 'España, remoto disponible',
    responseTimeLabel: 'Tiempo de respuesta',
    responseTimeValue: '24-48 horas',
    languagesLabel: 'Idiomas',
    languagesValue: 'Español, Inglés',
    privacyNote: 'Tu información está segura y nunca será compartida.',
    sending: 'Enviando...',
  },

  tech: {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    developer: 'Desarrollador',
    designer: 'Diseñador',
    engineer: 'Ingeniero',
    architect: 'Arquitecto',
    analyst: 'Analista',
    consultant: 'Consultor',
    manager: 'Gerente',
  },
  states: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    notFound: 'No encontrado',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    open: 'Abrir',
    submit: 'Enviar',
    reset: 'Restablecer',
  },
  contactForms: {
    email: 'Correo electrónico',
    name: 'Nombre',
    message: 'Mensaje',
    subject: 'Asunto',
    send: 'Enviar',
    required: 'Campo requerido',
    invalidEmail: 'Correo electrónico inválido',
    invalidPhone: 'Teléfono inválido',
    tooShort: 'Muy corto',
    tooLong: 'Muy largo',
    firstName: 'Nombre',
    lastName: 'Apellido',
    company: 'Empresa',
    website: 'Sitio Web',
  },
  time: {
    years: 'años',
    months: 'meses',
    days: 'días',
    hours: 'horas',
    minutes: 'minutos',
    ago: 'hace',
    now: 'ahora',
    present: 'presente',
    since: 'desde',
    until: 'hasta',
    from: 'desde',
    to: 'hasta',
  },
  actions: {
    viewMore: 'Ver más',
    viewLess: 'Ver menos',
    showAll: 'Mostrar todo',
    hideAll: 'Ocultar todo',
    expand: 'Expandir',
    collapse: 'Contraer',
    next: 'Siguiente',
    previous: 'Anterior',
    share: 'Compartir',
    copy: 'Copiar',
    download: 'Descargar',
    upload: 'Subir',
    print: 'Imprimir',
  },
  footer: {
    brandNameFallback: 'Portfolio',
    brandTagline: 'Creando experiencias digitales excepcionales',
    followTitle: 'Sígueme',
    navigationTitle: 'Navegación',
    contactTitle: 'Contacto',
    contactFallback: 'Información de contacto disponible en el CV',
    availabilityDefault: 'Disponible para nuevos proyectos',
    emailSubject: 'Contacto desde portafolio',
    emailBody:
      'Hola, me gustaría hablar sobre un proyecto. Mi nombre es {name} y encontré tu portafolio en {url}.',
    sendEmailAria: 'Enviar email a {email}',
    newsletterTitle: 'Mantente al día',
    newsletterDescription: 'Recibe actualizaciones sobre nuevos proyectos y tecnologías.',
    newsletterPlaceholder: 'tu@email.com',
    subscribeAria: 'Suscribirse al newsletter',
    developedWithLabel: 'Desarrollado con:',
    madeWithLoveAria: 'amor',
  },
};

// Traducciones en inglés
const enTranslations: Translations = {
  navigation: {
    home: 'Home',
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    contact: 'Contact',
    services: 'Services',
    certifications: 'Certifications',
    testimonials: 'Testimonials',
    blog: 'Blog',
    portfolio: 'Portfolio',
    navigating: 'Navigating...',
    navigatingTo: 'Navigating to {section}...',
    headerNavItem: 'Navigation item',
  },
  profileHero: {
    downloadCV: 'Download CV',
    generating: 'Generating...',
    toggleLanguage: 'Toggle language',
    available: 'Available',
    openToRemote: 'Open to remote / hybrid / freelance',
    exploreCV: 'Explore my CV',
    terminal: 'Terminal',
    videoCurriculum: 'Video CV',
    projects: 'Projects',
    changeWidgets: 'Switch between widgets',
    logout: 'Logout',
    yearsExperience: 'years of experience',
    projectsCompleted: 'projects completed',
    technologiesUsed: 'technologies used',
    loadingProfile: 'Loading profile...',
    errorLoadingProfile: 'Error loading profile',
    locationAndAvailability: 'Location and availability',
    terminalHint: "Interactive terminal: type commands to explore the CV (try <code>'help'</code>)",
    videoHint: 'Video CV: press "play" to watch a short presentation and use controls to',
    projectsHint: 'Projects: browse thumbnails and click to open demos, screenshots or repos',
    profilePhotoAlt: 'Profile photo of {name}',
    accountMenu: 'Account menu',
    widgetsLabel: 'widgets',
    typingWords: [
      'Software Developer',
      'Interactive Experience Creator',
      'User Interface Designer',
      'Accessible Solutions Developer',
    ],
  },

  // Interactive Terminal
  terminal: {
    welcome: '🖥️  Interactive Terminal - Adrian Davila CV',
    welcomeSubtitle: 'Welcome! This is a fully functional terminal.',
    functionalTerminal: 'You can type commands to explore my professional profile.',
    exploreProfile: 'You can type commands to explore my professional profile.',
    tips: '💡 Tips:',
    helpCommand: "• Type 'help' to see all available commands",
    tabAutocomplete: '• Use Tab to autocomplete commands',
    arrowNavigation: '• Use ↑↓ to navigate command history',
    clearScreen: "• Type 'clear' to clear the screen",
    startCommand: "🚀 Start by typing 'about' to learn more about me!",
    processing: 'Processing...',
    clearButton: 'Clear terminal',
    enterCommand: "Type a command... (try 'help')",
    user: 'adrian',
    host: 'dev',
  },

  // Terminal Commands
  terminalCommands: {
    help: 'help',
    about: 'about',
    skills: 'skills',
    projects: 'projects',
    contact: 'contact',
    experience: 'experience',
    education: 'education',
    clear: 'clear',
    refresh: 'refresh',
    whoami: 'whoami',
    ls: 'ls',
    cat: 'cat',
    availableCommands: 'Available commands:',
    showsHelp: 'Shows this help',
    realDataFromDB: 'real data from DB',
    technologiesManaged: 'List of technologies I handle',
    featuredProjects: 'Featured projects',
    contactInfo: 'Contact information',
    professionalExperience: 'Professional experience',
    academicFormation: 'Academic formation',
    clearsScreen: 'Clears the screen',
    updateFromDB: 'Update data from database',
    basicInfo: 'Basic information',
    listDirectories: 'List available directories',
    showFileContent: 'Shows file content',
    easterEggs: '🎮 Easter Eggs (Discover them all!):',
    discoverAll: 'Discover them all!',
    hackingMode: 'Hollywood hacking mode 🔥',
    undertaleExperience: 'Undertale-style experience ❤️',
    matrixMode: 'Follow the white rabbit 💊',
    needCaffeine: 'You need caffeine ☕',
    adminPermissions: 'Administrator permissions 🔐',
    classicGameCode: 'Classic video game code 🎮',
    pokemonCenter: 'Pokémon Center for developers 🔴',
    codePizza: 'Order code pizza 🍕',
    vimEditor: 'Enter the editor (good luck exiting) 📝',
    universeAnswer: 'The answer to the universe 🤖',
    debuggingSession: 'Typical debugging session 🐛',
    emojiFestival: 'Emoji festival 🎨',
    tipMessage: "💡 Tip: Type 'ls' to explore or use Tab to autocomplete",
    exploreUse: "Type 'ls' to explore or use Tab to autocomplete",
    realDataNote: 'Commands marked with (real data from DB) load information from the database',
    commandNotFound: 'command not found',
    didYouMean: 'Did you mean?',
    seeAllCommands: "Type 'help' to see all available commands.",
    noDataInDB: 'No {type} registered in the database.',
    addFromAdmin: 'To add {type}, visit the admin panel.',
    myTechnicalSkills: '🛠️  My technical skills:',
    noSkillsRegistered: 'No skills registered in the database.',
    addSkills: 'To add skills, visit the admin panel.',
    featuredProjectsTitle: '🚀 Featured projects:',
    noProjectsRegistered: 'No projects registered in the database.',
    addProjects: 'To add projects, visit the admin panel.',
    moreProjects: 'And {count} more projects...',
    professionalExperienceTitle: '💼 Professional experience:',
    noExperienceRegistered: 'No work experiences registered in the database.',
    addExperience: 'To add experience, visit the admin panel.',
    present: 'Present',
    noProfileInfo: 'No profile information available in the database.',
    addProfile: 'Please add your profile from the admin panel.',
    status: 'Status',
    contactInfoTitle: '📞 Contact information:',
    email: '📧 Email',
    phone: '📱 Phone',
    location: '📍 Location',
    responseTime: '⏰ Response time: < 24 hours',
    openToRemote: '🤝 Open to remote collaborations',
    academicFormationTitle: '🎓 Academic formation:',
    noEducationRegistered: 'No education information registered in the database.',
    addEducation: 'To add education, visit the admin panel.',
    dataUpdated: '🔄 Data updated from database',
    skillsUpdated: '✅ Skills updated',
    projectsUpdated: '✅ Projects updated',
    experienceUpdated: '✅ Experience updated',
    profileUpdated: '✅ Profile updated',
    educationUpdated: '✅ Education updated',
    useCommandsNote:
      "You can use the commands 'skills', 'projects', 'experience', 'about', 'education' or 'contact' to view the updated data.",
  },

  // Video Widget
  videoWidget: {
    playVideo: 'Play video curriculum',
    copyLink: 'Copy link',
    copied: 'Copied',
    openInYoutube: 'View on YouTube',
    videoNotSupported: 'Your browser does not support video playback.',
    noVideoAvailable: 'No video curriculum available.',
    loading: 'Loading video...',
  },

  // Projects Carousel
  projectsCarousel: {
    previous: 'Previous',
    next: 'Next',
    loading: 'Loading...',
    loadingProjects: 'Loading projects',
    errorLoading: 'Could not load projects',
    retry: 'Retry',
    retryInline: 'Retry',
    noProjects: 'No projects to show',
    noProjectsDescription:
      'There are no public projects in this profile yet. You can add projects from the admin panel or check your filters.',
    createProject: 'Create project',
    checkFilters: 'Review filters',
    contactSupport: 'Contact support',
    live: 'LIVE',
    article: 'ARTICLE',
    completed: '✔ COMPLETED',
    video: 'Video',
    code: 'Code',
    views: 'Views',
    publishedOn: 'Published on',
    currentProject: 'Current project',
    projectOf: 'of',
    pagination: 'Project pagination',
    loadingProblem: 'Problem loading projects:',
  },

  about: {
    title: 'About Me',
    subtitle: 'Know my history, philosophy and what motivates me as a developer',
    description: 'Description',
    downloadResume: 'Download Resume',
    myStory: 'My Story',
    passion: 'My Passion',
    goals: 'My Goals',
    philosophy: 'My Philosophy',
    loadingInfo: 'Loading information...',
    errorLoading: 'Error loading information',
    collaborationTitle: 'Do you have a challenging project?',
    collaborationDescription:
      "I specialize in transforming complex ideas into effective digital solutions. If you're looking for a developer committed to technical excellence, let's talk about your next project!",
    navigateToContact: 'Navigate to contact section to discuss projects',
    knowMyHistory: 'Know my history',
    whatMotivatesMe: 'What motivates me',
  },
  skills: {
    title: 'Skills',
    subtitle: 'Technical competencies and knowledge',
    highlights: 'Highlights',
    technical: 'Technical',
    soft: 'Soft',
    languages: 'Languages',
    tools: 'Tools',
    frameworks: 'Frameworks',
    databases: 'Databases',
    level: 'Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  },
  projects: {
    subtitle: 'Explore my projects and highlighted developments',
    title: 'Projects',
    viewProject: 'View Project',
    viewDetails: 'View details',
    viewCode: 'View Code',
    liveDemo: 'Live Demo',
    viewDemoAria: 'View demo of {title}',
    readArticleAria: 'Read article of {title}',
    viewVideoDemoAria: 'View video demo of {title}',
    viewCodeOnGitHub: 'View {title} code on GitHub',
    playDemoAria: 'Play demo of {title}',
    videoDemoTitle: 'View video demo',
    descriptionFallback: 'Click to view more project details',
    readMore: 'Read more →',
    demo: 'Demo',
    technologies: 'Technologies',
    description: 'Description',
    features: 'Features',
    challenges: 'Challenges',
    learnings: 'Learnings',
    duration: 'Duration',
    team: 'Team',
    role: 'Role',
    status: 'Status',
    completed: 'Completed',
    inProgress: 'In Progress',
    planned: 'Planned',
    // Readable badges / types
    type: {
      project: 'Project',
      article: 'Article',
    },
    statusLabels: {
      completed: 'Completed',
      inProgress: 'In Progress',
      planned: 'Planned',
      paused: 'Paused',
      draft: 'Draft',
    },
  },

  projectsSection: {
    subtitleAll:
      'Explore my collection of technical projects. Each one tells a story of innovation and learning.',
    subtitleProjects:
      'Explore my most recent and relevant projects. Each shows key technologies and demos.',
  },

  certifications: {
    title: 'Certifications',
    subtitle: 'Professional credentials and certifications obtained',
    loading: 'Loading certifications...',
    emptyTitle: 'No certifications available',
    emptyDescription: 'Certifications will appear here when available.',
    verify: 'Verify',
    notAvailable: 'Not available',
    courseSite: 'Course site',
    editCertification: 'Edit certification',
    deleteCertification: 'Delete certification',
    deleteConfirm: 'Are you sure you want to delete this certification?',
    deleteSuccess: 'Certification deleted!',
    deleteError: 'Could not delete certification',
    loadError: 'Could not load certifications',
    saveError: 'Could not save certification',
  },

  testimonials: {
    title: 'Testimonials',
    subtitle: 'What people who worked with me say',
    addCta: 'Add my testimonial',
    addModalTitle: 'Add Testimonial',
    editModalTitle: 'Edit Testimonial',
    loading: 'Loading testimonials...',
    emptyTitle: 'No testimonials available',
    emptyDescription: 'Be the first to share your experience!',
    readMore: 'Read more',
    readLess: 'Read less',
    form: {
      placeholders: {
        name: 'Name',
        position: 'Position',
        text: 'Testimonial',
        email: 'Email (optional)',
        company: 'Company (optional)',
        website: 'Website (optional)',
      },
      buttons: {
        save: 'Save',
        add: 'Add Testimonial',
        cancel: 'Cancel',
      },
    },
    validation: {
      nameRequired: 'Name is required',
      nameTooLong: 'Name is too long',
      positionRequired: 'Position is required',
      positionTooLong: 'Position is too long',
      textRequired: 'Testimonial is required',
      textTooShort: 'Testimonial is too short (min 20 chars)',
      textTooLong: 'Testimonial is too long (max 1000 chars)',
      emailInvalid: 'Invalid email',
      websiteInvalid: 'Invalid URL',
      ratingInvalid: 'Rating must be between 1 and 5',
    },
    notifications: {
      submitSuccessTitle: 'Testimonial submitted',
      submitSuccessMsg: 'Thanks for sharing your experience. Your testimonial will be reviewed.',
      updateSuccessTitle: 'Testimonial updated',
      updateSuccessMsg: 'Changes have been saved successfully',
      submitErrorTitle: 'Error',
      submitErrorMsg: 'Could not submit testimonial. Please try again.',
    },
    admin: {
      edit: 'Edit',
      delete: 'Delete',
    },
  },

  // Experience Forms
  forms: {
    experience: {
      title: 'Experience',
      education: 'Education',
      editExperience: 'Edit Experience',
      editEducation: 'Edit Education',
      newExperience: 'New Experience',
      newEducation: 'New Education',
      basicInfo: 'Basic Information',
      position: 'Job title',
      positionPlaceholder: 'e.g: Senior Full Stack Developer',
      positionHelper: 'Specify your main role or position',
      degree: 'Title or degree',
      degreePlaceholder: 'e.g: Bachelor in Computer Engineering',
      degreeHelper: 'Indicate the full title name',
      company: 'Company',
      institution: 'Institution',
      companyPlaceholder: 'e.g: TechCorp Solutions',
      institutionPlaceholder: 'e.g: Technology University',
      companyHelper: 'Company or organization name',
      institutionHelper: 'University or educational center name',
      timePeriod: 'Time Period',
      startDate: 'Start date',
      endDate: 'End date',
      startDateHelper: 'Format: DD/MM/YYYY — you can also type the date manually.',
      endDateHelper: 'Format: DD/MM/YYYY',
      current: 'Current job',
      currentEducation: 'Current studies',
      currentJob: 'Current job',
      currentStudies: 'Current studies',
      technologies: 'Technologies and Tools',
      technologiesUsed: 'Technologies used',
      technologiesPlaceholder: 'Type and press Enter to add...',
      technologiesHelper: 'Add the most relevant technologies for this position',
      details: 'Description and Details',
      description: 'Description',
      descriptionLabel: 'Description',
      descriptionPlaceholder:
        'Describe your responsibilities, achievements and outstanding projects...',
      descriptionEducationPlaceholder: 'Describe the specialization, outstanding projects, etc...',
      descriptionHelper: 'Maximum 500 characters. Focus on key achievements and responsibilities',
      academicDetails: 'Academic Details',
      grade: 'Grade',
      gradePlaceholder: 'e.g: Outstanding, 8.5/10, Honor Roll',
      gradeHelper: 'Average grade, mention or recognition obtained',
      displayOrder: 'Display order',
      displayOrderPlaceholder: '0',
      displayOrderHelper: 'Number to sort the display',
      characterCount: 'characters',
      cancel: 'Cancel',
      save: 'Save',
      saveChanges: 'Save Changes',
      create: 'Create',
      createExperience: 'Create Experience',
      createEducation: 'Create Education',
      saving: 'Saving...',
      progressComplete: 'Complete this form to add your experience',
      progressCompleted: 'Completed',
      progressHelp: 'Complete this form to add your experience',
      completed: 'Completed',
      closeShortcut: 'Close',
      saveShortcut: 'Save',
      currentPlaceholder: 'Current',
      removeTechnology: 'Remove',
    },
    validation: {
      required: 'Required field',
      titleRequired: 'Title is required',
      titleMinLength: 'Title must have at least 3 characters',
      titleMustContainLetters: 'Title must contain letters',
      companyRequired: 'Company is required',
      institutionRequired: 'Institution is required',
      minLength: 'Must have at least 2 characters',
      mustContainLetters: 'must contain letters',
      startDateRequired: 'Start date is required',
      endDateRequired: 'End date is required',
      invalidDateFormat: 'Invalid date format (DD-MM-YYYY)',
      descriptionMaxLength: 'Description cannot exceed 500 characters',
      technologiesRequired: 'Add at least one technology or tool',
      endDateMustBeAfterStart: 'End date must be after start date',
      validationErrors: 'Validation Errors',
      pleaseFixErrors: 'Please fix the errors before continuing',
      companyMustContainLetters: 'Company must contain letters',
      institutionMustContainLetters: 'Institution must contain letters',
    },
    notifications: {
      experienceUpdated: 'Experience Updated',
      educationUpdated: 'Education Updated',
      experienceCreated: 'Experience Created',
      educationCreated: 'Education Created',
      updated: 'updated',
      created: 'created',
      correctly: 'successfully',
      updateSuccess: 'has been updated successfully',
      createSuccess: 'has been created successfully',
      saveError: 'Error Saving',
      unknownError: 'Unknown error',
    },
  },

  experience: {
    title: 'Professional Journey',
    subtitle:
      'A journey through my work experience and academic background, showcasing the most relevant technologies and achievements.',
    loading: 'Loading experience and education...',
    loadingDetails: 'Getting data from server...',
    errorRetry: 'Retry',
    retryLimitReached: 'Retry limit reached',
    viewCategories: 'Category View',
    viewChronological: 'Chronological View',
    workExperience: 'Work Experience',
    education: 'Academic Background',
    certifications: 'Certifications',
    current: 'Current',
    previous: 'Previous',
    company: 'Company',
    position: 'Position',
    duration: 'Duration',
    responsibilities: 'Responsibilities',
    achievements: 'Achievements',
    technologies: 'Technologies',
    stats: {
      experiences: 'Experiences',
      certifications: 'Certifications',
      technologies: 'Technologies',
    },
    admin: {
      title: 'Journey Administration',
      noExperiences: 'No experiences',
      noExperiencesDesc: 'Add the first work experience using the floating button.',
      noEducation: 'No academic background',
      noEducationDesc: 'Add the first academic formation using the floating button.',
      edit: 'Edit',
      delete: 'Delete',
      newExperience: 'New Experience',
      newEducation: 'New Education',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      create: 'Create',
    },
  },
  contact: {
    title: 'Contact',
    getInTouch: 'Get In Touch',
    sendMessage: 'Send Message',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    social: 'Social Media',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    instagram: 'Instagram',
    website: 'Website',
  },
  contactExtras: {
    subtitle: "Have a project in mind? Let's talk!",
    locationLabel: 'Location',
    locationValue: 'Spain, remote available',
    responseTimeLabel: 'Response time',
    responseTimeValue: '24-48 hours',
    languagesLabel: 'Languages',
    languagesValue: 'Spanish, English',
    privacyNote: 'Your information is safe and will never be shared.',
    sending: 'Sending...',
  },
  tech: {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    developer: 'Developer',
    designer: 'Designer',
    engineer: 'Engineer',
    architect: 'Architect',
    analyst: 'Analyst',
    consultant: 'Consultant',
    manager: 'Manager',
  },
  states: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    notFound: 'Not found',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    open: 'Open',
    submit: 'Submit',
    reset: 'Reset',
  },
  contactForms: {
    email: 'Email',
    name: 'Name',
    message: 'Message',
    subject: 'Subject',
    send: 'Send',
    required: 'Required field',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone',
    tooShort: 'Too short',
    tooLong: 'Too long',
    firstName: 'First Name',
    lastName: 'Last Name',
    company: 'Company',
    website: 'Website',
  },
  time: {
    years: 'years',
    months: 'months',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    ago: 'ago',
    now: 'now',
    present: 'present',
    since: 'since',
    until: 'until',
    from: 'from',
    to: 'to',
  },
  actions: {
    viewMore: 'View More',
    viewLess: 'View Less',
    showAll: 'Show All',
    hideAll: 'Hide All',
    expand: 'Expand',
    collapse: 'Collapse',
    next: 'Next',
    previous: 'Previous',
    share: 'Share',
    copy: 'Copy',
    download: 'Download',
    upload: 'Upload',
    print: 'Print',
  },
  footer: {
    brandNameFallback: 'Portfolio',
    brandTagline: 'Creating exceptional digital experiences',
    followTitle: 'Follow me',
    navigationTitle: 'Navigation',
    contactTitle: 'Contact',
    contactFallback: 'Contact information available in the CV',
    availabilityDefault: 'Available for new projects',
    emailSubject: 'Contact from portfolio',
    emailBody:
      'Hi, I would like to talk about a project. My name is {name} and I found your portfolio at {url}.',
    sendEmailAria: 'Send email to {email}',
    newsletterTitle: 'Stay up to date',
    newsletterDescription: 'Receive updates about new projects and technologies.',
    newsletterPlaceholder: 'your@email.com',
    subscribeAria: 'Subscribe to newsletter',
    developedWithLabel: 'Developed with:',
    madeWithLoveAria: 'love',
  },
  // Terminal responses (used by interactive terminal)
  responses: {
    commandNotFound: 'command not found',
    tryHelp: "Type 'help' to see available commands.",
    error: 'Error',

    about: {
      noProfile: ['No profile information available.'],
      status: 'Status',
      footer: '-- End of profile --',
    },

    skills: {
      title: '🛠️  My technical skills:',
      noSkills: ['No skills registered in the database.'],
      footer: '-- End of skills list --',
    },

    projects: {
      title: '🚀 Featured projects:',
      noProjects: ['No projects registered in the database.'],
      techStack: 'Tech stack',
      footer: '-- End of projects list --',
    },

    experience: {
      title: '💼 Professional experience:',
      noExperience: ['No work experiences registered in the database.'],
      current: 'Present',
      footer: '-- End of experiences list --',
    },

    contact: {
      title: '📞 Contact information:',
      noContact: ['No contact information.'],
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      footer: '-- End of contact information --',
    },

    education: {
      title: '🎓 Academic formation:',
      noEducation: ['No education information registered in the database.'],
      current: 'Current',
      footer: '-- End of education list --',
    },
  },

  // Command metadata and canned outputs used by the terminal
  commands: {
    help: { description: 'Shows this help', output: [] },
    about: { description: 'Shows basic profile information' },
    skills: { description: 'Lists my skills' },
    projects: { description: 'Lists my projects' },
    contact: { description: 'Shows contact information' },
    experience: { description: 'Lists my experience' },
    education: { description: 'Lists my academic background' },
    refresh: { description: 'Update data from database', output: [] },
    clear: { description: 'Clear the screen' },
    whoami: { description: 'Show my role', fallback: ['No profile information'] },
    ls: {
      description: 'List available directories',
      directories: ['skills', 'projects'],
      skills: [],
      projects: [],
      usage: '',
    },
    cat: {
      description: 'Show file content',
      noFile: ['Specify a file to show'],
      files: {},
      notFound: 'File not found',
    },

    hack: { description: 'Hollywood hacking mode', output: [] },
    undertale: { description: 'Undertale-style experience', output: [] },
    matrix: { description: 'Matrix mode', output: [] },
    coffee: { description: 'You need caffeine', output: [] },
    sudo: { description: 'Test admin permissions', output: [] },
    konami: { description: 'Konami code', output: [] },
    pokemon: { description: 'Pokémon Center', output: [] },
    pizza: { description: 'Order code pizza', output: [] },
    vim: { description: 'Enter the editor (good luck exiting)', output: [] },
    '42': { description: 'The answer to the universe', output: [] },
    debug: { description: 'Debugging session', output: [] },
    emoji: { description: 'Emoji festival', output: [] },
    refreshOutput: [],
    rm: { noOperand: ['rm: missing operand'], readOnly: ['rm: read-only file system'] },
  },
};

// Objeto con todas las traducciones
const translations = {
  es: esTranslations,
  en: enTranslations,
};

// Tipo del contexto
interface TranslationContextType {
  language: Language;
  t: Translations;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  // Función helper para traducciones anidadas
  getText: (path: string, fallback?: string) => string;
}

// Función helper para obtener texto anidado usando notación de puntos
// Devuelve un string seguro; acepta un fallback opcional.
export const getNestedText = (obj: any, path: string, fallback?: string): string => {
  if (!path) return fallback ?? '';
  try {
    const parts = path.split('.');
    let current: any = obj;
    for (const key of parts) {
      if (current == null) {
        return fallback ?? path;
      }
      current = current[key];
    }
    if (current == null) return fallback ?? path;
    // Si el valor no es string, convertirlo a string legible
    if (typeof current === 'string') return current;
    if (typeof current === 'number' || typeof current === 'boolean') return String(current);
    // Para objetos/arrays, devolver JSON abreviado
    try {
      return JSON.stringify(current);
    } catch {
      return fallback ?? path;
    }
  } catch {
    return fallback ?? path;
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    // Fallback seguro: en entornos donde el provider no está presente
    // devolvemos una implementación mínima para evitar que la UI entera
    // caiga. Registramos un warning para fácil diagnóstico en desarrollo.
    // Nota: anteriormente esto lanzaba un Error para forzar el uso del Provider.
    // throw new Error('useTranslation must be used within a TranslationProvider');
    // Construir un fallback basado en el idioma del documento si está disponible
    try {
      console.warn(
        'useTranslation called outside TranslationProvider — returning fallback implementation'
      );
    } catch (e) {
      // ignore console failures
    }

    const docLang =
      typeof document !== 'undefined' ? (document.documentElement.lang as Language) || 'en' : 'en';
    const safeLang: Language = docLang === 'es' ? 'es' : 'en';
    const fallbackValue: TranslationContextType = {
      language: safeLang,
      t: translations[safeLang],
      setLanguage: (_: Language) => {},
      toggleLanguage: () => {},
      getText: (path: string, fallback?: string) =>
        getNestedText(translations[safeLang], path, fallback),
    };

    return fallbackValue;
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  // Obtener idioma inicial desde localStorage o navegador
  const [language, setLanguageState] = useState<Language>(() => {
    // En SSR no existe window/localStorage; en ese caso usar 'en' por defecto
    try {
      if (typeof window === 'undefined') return 'en';

      // Intentar obtener desde localStorage
      const savedLanguage = localStorage.getItem('cv-language');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        return savedLanguage as Language;
      }

      // Detectar idioma del navegador
      const browserLanguage = navigator?.language?.toLowerCase();
      if (browserLanguage && browserLanguage.startsWith('es')) {
        return 'es';
      }
    } catch {
      // caemos aquí si el acceso a window/localStorage falla
    }
    return 'en'; // Por defecto inglés
  });

  // Obtener traducciones actuales (memoizado)
  const currentTranslations = useMemo(() => translations[language], [language]);

  // Función para cambiar idioma
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cv-language', newLanguage);
      }
    } catch {
      // ignore write errors
    }

    // Actualizar atributo lang del documento (si está disponible)
    try {
      if (typeof document !== 'undefined' && document?.documentElement) {
        document.documentElement.lang = newLanguage;
      }
    } catch {
      // ignore
    }
  };

  // Función para alternar entre idiomas
  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
  };

  // Función helper para obtener texto anidado
  const getText = (path: string, fallback?: string): string => {
    return getNestedText(currentTranslations, path, fallback);
  };

  // Establecer idioma inicial en el documento
  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && document?.documentElement) {
        document.documentElement.lang = language;
      }
    } catch {
      // ignore
    }
  }, [language]);

  const value: TranslationContextType = {
    language,
    t: currentTranslations,
    setLanguage,
    toggleLanguage,
    getText,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

// Hook personalizado para casos específicos
export const useLanguage = () => {
  const { language, setLanguage, toggleLanguage } = useTranslation();
  return { language, setLanguage, toggleLanguage };
};

// Hook para obtener solo las traducciones
export const useT = () => {
  const { t } = useTranslation();
  return t;
};
