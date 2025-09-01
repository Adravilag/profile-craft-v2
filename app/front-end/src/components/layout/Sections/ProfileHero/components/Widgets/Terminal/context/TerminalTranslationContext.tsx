import React, { createContext, useContext, useMemo } from 'react';
import { useLanguage } from '@/contexts/TranslationContext';

// Interfaz para las traducciones del terminal
export interface TerminalTranslations {
  commands: {
    [key: string]: {
      name: string;
      description: string;
      usage: string;
      output?: string[];
      [key: string]: any; // Permite propiedades adicionales específicas de cada comando
    };
  };
  responses: {
    // Mensajes generales
    commandNotFound: string;
    tryHelp: string;
    error: string;
    loading: string;
    current: string;

    // Respuestas del comando about
    about: {
      noProfile: string[];
      status: string;
    };

    // Respuestas del comando skills
    skills: {
      title: string;
      noSkills: string[];
      footer: string;
    };

    // Respuestas del comando projects
    projects: {
      title: string;
      noProjects: string[];
      techStack: string;
      footer: string;
    };

    // Respuestas del comando experience
    experience: {
      title: string;
      noExperience: string[];
      current: string;
      footer: string;
    };

    // Respuestas del comando education
    education: {
      title: string;
      noEducation: string[];
      current: string;
      footer: string;
    };

    // Respuestas del comando contact
    contact: {
      title: string;
      noContact: string[];
      email: string;
      phone: string;
      location: string;
      footer: string;
    };
  };

  // Textos de la interfaz de usuario
  ui: {
    title: string;
    welcome: string;
    description: string;
    tipsHeader: string;
    tipHelp: string;
    tipTab: string;
    tipClear: string;
    clearButton: string;
    tipExplore: string;
    tipEasterEggs: string;
    footer: string;
    processing: string;
    placeholder: string;
  };
}

// Traducciones en español
const esTerminalTranslations: TerminalTranslations = {
  commands: {
    help: {
      name: 'help',
      description: 'Muestra la lista de comandos disponibles',
      usage: 'help',
      output: [
        'Comandos disponibles:',
        '  help      - Muestra esta ayuda',
        '  about     - Información sobre mí (datos reales de BD)',
        '  skills    - Lista de tecnologías que manejo (datos reales de BD)',
        '  projects  - Proyectos destacados (datos reales de BD)',
        '  contact   - Información de contacto (datos reales de BD)',
        '  experience- Experiencia profesional (datos reales de BD)',
        '  education - Formación académica (datos reales de BD)',
        '  refresh   - Actualizar datos desde la base de datos',
        '  clear     - Limpia la pantalla',
        '  whoami    - Información básica (datos reales de BD)',
        '  ls        - Lista directorios disponibles',
        '  cat       - Muestra contenido de archivos',
        '',
        '🎮 Easter Eggs (¡Descúbrelos todos!):',
        '  hack      - Modo hacking Hollywood 🔥',
        '  undertale - Experiencia tipo Undertale ❤️',
        '  matrix    - Follow the white rabbit 💊',
        '  coffee    - Necesitas cafeína ☕',
        '  sudo      - Permisos de administrador 🔐',
        '  konami    - Código clásico de videojuegos 🎮',
        '  pokemon   - Centro Pokémon para desarrolladores 🔴',
        '  pizza     - Ordena pizza de código 🍕',
        '  vim       - Entra al editor (buena suerte saliendo) 📝',
        '  42        - La respuesta del universo 🤖',
        '  debug     - Sesión típica de debugging 🐛',
        '  emoji     - Festival de emojis 🎨',
        '',
        "💡 Tip: Escribe 'ls' para explorar o usa Tab para autocompletar",
        'Los comandos marcados con (datos reales de BD) cargan información de la base de datos',
      ],
    },
    about: {
      name: 'about',
      description: 'Muestra información personal',
      usage: 'about',
    },
    skills: {
      name: 'skills',
      description: 'Lista las habilidades técnicas',
      usage: 'skills',
    },
    projects: {
      name: 'projects',
      description: 'Muestra proyectos destacados',
      usage: 'projects',
    },
    experience: {
      name: 'experience',
      description: 'Muestra experiencia profesional',
      usage: 'experience',
    },
    education: {
      name: 'education',
      description: 'Muestra formación académica',
      usage: 'education',
    },
    contact: {
      name: 'contact',
      description: 'Muestra información de contacto',
      usage: 'contact',
    },
    refresh: {
      name: 'refresh',
      description: 'Actualiza datos desde la base de datos',
      usage: 'refresh',
      output: [
        '🔄 Datos actualizados desde la base de datos',
        '',
        '✅ Skills actualizadas',
        '✅ Proyectos actualizados',
        '✅ Experiencias actualizadas',
        '✅ Perfil actualizado',
        '✅ Educación actualizada',
        '',
        "Puedes usar los comandos 'skills', 'projects', 'experience', 'about', 'education' o 'contact' para ver los datos actualizados.",
      ],
    },
    clear: {
      name: 'clear',
      description: 'Limpia la pantalla del terminal',
      usage: 'clear',
    },
    ls: {
      name: 'ls',
      description: 'Lista el contenido del directorio',
      usage: 'ls [directorio]',
      directories: [
        'skills/',
        'projects/',
        'experience/',
        'education/',
        'achievements/',
        'contact/',
        'certifications/',
        'personal/',
      ],
      skills: [
        'frontend/',
        'backend/',
        'databases/',
        'devops/',
        'languages/',
        'frameworks/',
        'tools/',
      ],
      projects: [
        'portfolio.json',
        'ecommerce.json',
        'chat-app.json',
        'analytics-dashboard.json',
        'educational-system.json',
      ],
      error: "ls: no se puede acceder a '{dir}': No existe el fichero o directorio",
    },
    cat: {
      name: 'cat',
      description: 'Muestra el contenido de archivos',
      usage: 'cat [archivo]',
      noFile: ['cat: falta operando fichero', "Prueba 'cat --help' para más información."],
      notFound: 'cat: {file}: No existe el fichero o directorio',
      files: {
        'portfolio.json': [
          '{',
          '  "name": "Portfolio Personal Interactivo",',
          '  "tech": ["React", "TypeScript", "Vite", "CSS3"],',
          '  "features": [',
          '    "Terminal interactiva",',
          '    "Animaciones avanzadas",',
          '    "Responsive design",',
          '    "Modo oscuro/claro"',
          '  ],',
          '  "status": "En producción",',
          '  "url": "https://adrian-davila.dev"',
          '}',
        ],
      },
    },
    whoami: {
      name: 'whoami',
      description: 'Muestra información del usuario actual',
      usage: 'whoami',
      fallback: [
        'Desarrollador Full Stack',
        'Especializado en tecnologías web modernas',
        'Apasionado por la innovación y el código limpio',
        '',
        'Stack principal: React + TypeScript + Node.js + Spring Boot',
      ],
    },
    // Easter Eggs
    matrix: {
      name: 'matrix',
      description: 'Activa el efecto Matrix',
      usage: 'matrix',
      output: [
        'Wake up, Neo...',
        'The Matrix has you...',
        'Follow the white rabbit.',
        '',
        '💊 Tema Matrix activado. Reinicia para aplicar.',
      ],
    },
    undertale: {
      name: 'undertale',
      description: 'Activa el modo Undertale',
      usage: 'undertale',
      output: [
        "* You feel like you're going to have a good time.",
        '',
        '* UNDERTALE MODE ACTIVATED',
        '',
        "* Despite everything, it's still you.",
        '',
        '* You are filled with DETERMINATION.',
        '',
        '❤️ HP 20/20',
        '',
        '* You encounter a wild programmer!',
        '* The programmer shows you their portfolio.',
        '* Their code is filled with... DETERMINATION.',
        '',
        '* Will you:',
        '  ❤️ HIRE    ⚔️ RECRUIT    🛡️ COLLABORATE    💔 MERCY',
        '',
        '* (You chose to view their skills.)',
        "* It's super effective!",
        '',
        '🎵 bgm_determination.ogg is now playing...',
        '',
        '* Adrián Dávila gained +100 EXP in Full Stack Development!',
        '* Adrián Dávila learned REACT MASTERY!',
        '* Adrián Dávila learned TYPESCRIPT EXPERTISE!',
        '',
        '* Your FRIENDSHIP with this developer increased!',
        '',
        '* Thank you for playing UNDERTALE PORTFOLIO! ❤️',
      ],
    },
    coffee: {
      name: 'coffee',
      description: 'Prepara café virtual',
      usage: 'coffee',
      output: [
        '☕ Preparando café...',
        '░░░░░░░░░░░░░░░░░░░░ 0%',
        '█░░░░░░░░░░░░░░░░░░░ 5%',
        '██████░░░░░░░░░░░░░░ 30%',
        '███████████████░░░░ 75%',
        '████████████████████ 100%',
        '',
        '☕ ¡Café listo! Ahora puedo programar mejor 🚀',
      ],
    },
    sudo: {
      name: 'sudo',
      description: 'Intenta obtener permisos de administrador',
      usage: 'sudo [comando]',
      output: [
        '🔐 [sudo] password for user:',
        'Sorry, try again.',
        '🔐 [sudo] password for user:',
        'Sorry, try again.',
        '🔐 [sudo] password for user:',
        '',
        'sudo: 3 incorrect password attempts',
        '',
        '🤔 Pista: No necesitas permisos sudo aquí 😄',
      ],
    },
    hack: {
      name: 'hack',
      description: 'Inicia secuencia de hacking estilo Hollywood',
      usage: 'hack',
      output: [
        '🚨 INICIANDO SECUENCIA DE HACKING... 🚨',
        '',
        '[▓▓▓▓▓▓▓▓▓▓] 100% - Accediendo al mainframe...',
        '> Descifrando protocolos de seguridad...',
        '> Bypasseando firewall... ✅',
        '> Accediendo a la base de datos... ✅',
        '',
        '💀 SISTEMA COMPROMETIDO 💀',
        '',
        'Jk, esto es solo un portfolio 😄',
        'Pero puedes ver mis skills reales con el comando "skills"',
      ],
    },
    konami: {
      name: 'konami',
      description: 'Código clásico de videojuegos',
      usage: 'konami',
      output: [
        '🎮 KONAMI CODE ACTIVATED! 🎮',
        '',
        '↑ ↑ ↓ ↓ ← → ← → B A START',
        '',
        '🌟 +30 Vidas añadidas a tu carrera profesional!',
        '🌟 +Infinite Skills unlocked!',
        '🌟 +God Mode enabled para debugging!',
        '',
        '🎯 Achievement Unlocked: "Old School Gamer"',
      ],
    },
    pokemon: {
      name: 'pokemon',
      description: 'Centro Pokémon para desarrolladores',
      usage: 'pokemon',
      output: [
        '🔴⚪ Bienvenido al Centro Pokémon para Desarrolladores! ⚪🔴',
        '',
        '👩‍⚕️ Enfermera Joy: "¡Hola! ¿Quieres que cure tus bugs?"',
        '',
        '🎵 *Música del Centro Pokémon suena*',
        '',
        '✨ Curando bugs... ✨',
        '✨ Restaurando energía mental... ✨',
        '✨ Actualizando dependencias... ✨',
        '',
        '🎉 ¡Tus proyectos están completamente curados!',
        '',
        '👩‍⚕️ "¡Esperamos verte pronto! Y recuerda hacer commits frecuentes!"',
      ],
    },
    pizza: {
      name: 'pizza',
      description: 'Ordena pizza de código',
      usage: 'pizza',
      output: [
        '🍕 ¡Bienvenido a Pizza Code! 🍕',
        '',
        '👨‍🍳 "¿Qué tipo de pizza quieres?"',
        '',
        '🍕 Margherita (HTML/CSS básico)',
        '🍕 Pepperoni (JavaScript picante)',
        '🍕 Suprema (Full Stack completa)',
        '🍕 Hawaiana (Python + piña, controversial)',
        '🍕 Cuatro Quesos (4 frameworks diferentes)',
        '',
        '📦 Preparando tu Suprema Full Stack...',
        '⏰ Tiempo estimado: 25-30 sprints',
        '',
        '🚚 ¡Tu pizza de código está en camino!',
      ],
    },
    vim: {
      name: 'vim',
      description: 'Entra al editor (buena suerte saliendo)',
      usage: 'vim',
      output: [
        '📝 Entrando a VIM...',
        '',
        '~ VIM - Vi IMproved ~',
        '~                                    ~',
        '~                                    ~',
        '~     Presiona :q para salir         ~',
        '~     Presiona :wq para guardar      ~',
        '~     Presiona ESC si estás perdido  ~',
        '~                                    ~',
        '~                                    ~',
        '~                                    ~',
        '--INSERT--                            ',
        '',
        '💡 ¡Ya saliste! Era solo una broma 😄',
        '   Pero si necesitas ayuda real con VIM,',
        '   prueba vimtutor en tu terminal.',
      ],
    },
    '42': {
      name: '42',
      description: 'La respuesta del universo',
      usage: '42',
      output: [
        '🤖 Computando la respuesta a la vida, el universo y todo...',
        '',
        '⏳ Procesando por 7.5 millones de años...',
        '',
        '💫 ¡LA RESPUESTA ES... 42! 💫',
        '',
        '🧠 "Ahí tienes la respuesta que tanto buscabas"',
        '🧠 "Cuarenta y dos"',
        '',
        '❓ Pero... ¿cuál era la pregunta?',
        '',
        '📚 Referencias: "Guía del Autoestopista Galáctico"',
        '    por Douglas Adams',
      ],
    },
    debug: {
      name: 'debug',
      description: 'Sesión típica de debugging',
      usage: 'debug',
      output: [
        '🐛 SESIÓN DE DEBUGGING INICIADA 🐛',
        '',
        '15:30 - "Esto debería funcionar..."',
        '15:45 - "¿Por qué no funciona?"',
        '16:00 - "PERO SI FUNCIONABA AYER!"',
        '16:30 - *Googlea el error*',
        '16:45 - *Copia código de StackOverflow*',
        '17:00 - "Peor aún... 🤦‍♂️"',
        '17:30 - *Rubber duck debugging*',
        '17:45 - "¡EUREKA! Era un punto y coma"',
        '18:00 - *git commit -m "fix bug"*',
        '',
        '✅ Bug resuelto exitosamente!',
        '📈 Experiencia en debugging +1',
      ],
    },
    emoji: {
      name: 'emoji',
      description: 'Festival de emojis',
      usage: 'emoji',
      output: [
        '🎨 ¡FESTIVAL DE EMOJIS! 🎨',
        '',
        '💻 👨‍💻 🖥️ ⌨️ 🖱️ 💾 📱 🔧',
        '🚀 ⭐ 🌟 ✨ 💫 🎯 🏆 🥇',
        '❤️ 💙 💚 💛 🧡 💜 🖤 🤍',
        '😀 😃 😄 😁 😊 😂 🤣 😍',
        '🎉 🎊 🎈 🎁 🎂 🍕 ☕ 🍔',
        '🔥 💯 ⚡ 🌈 🦄 🐱‍💻 🤖 👾',
        '',
        '🎭 ¡Que comience la fiesta de código! 🎭',
      ],
    },
    rm: {
      name: 'rm',
      description: 'Intenta eliminar archivos (solo lectura)',
      usage: 'rm [archivo]',
      noOperand: ['rm: falta operando', "Prueba 'rm --help' para más información."],
      readOnly: ['rm: no se puede borrar: Este es un terminal de portfolio de solo lectura'],
    },
  },
  responses: {
    // Mensajes generales
    commandNotFound: 'Comando no encontrado',
    tryHelp: "Prueba <code>'help'</code> para ver comandos disponibles",
    error: 'Error al ejecutar comando',
    loading: 'Cargando...',
    current: 'Actual',

    // Respuestas del comando about
    about: {
      noProfile: [
        'No hay información de perfil disponible en la base de datos.',
        'Por favor, agrega tu perfil desde el panel de administración.',
      ],
      status: 'Estado',
    },

    // Respuestas del comando skills
    skills: {
      title: '🛠️ Habilidades Técnicas',
      noSkills: [
        'No hay habilidades registradas en la base de datos.',
        'Por favor, agrega tus habilidades desde el panel de administración.',
      ],
      footer: "💡 Usa 'cat skills/[categoria]' para ver detalles específicos",
    },

    // Respuestas del comando projects
    projects: {
      title: '🚀 Proyectos Destacados',
      noProjects: [
        'No hay proyectos registrados en la base de datos.',
        'Por favor, agrega tus proyectos desde el panel de administración.',
      ],
      techStack: 'Tecnologías',
      footer: "💡 Usa 'cat projects/[proyecto]' para ver detalles específicos",
    },

    // Respuestas del comando experience
    experience: {
      title: '💼 Experiencia Profesional',
      noExperience: [
        'No hay experiencias registradas en la base de datos.',
        'Por favor, agrega tu experiencia desde el panel de administración.',
      ],
      current: 'Actual',
      footer: '💡 Todos los datos provienen de la base de datos real',
    },

    // Respuestas del comando education
    education: {
      title: '🎓 Formación Académica',
      noEducation: [
        'No hay educación registrada en la base de datos.',
        'Por favor, agrega tu formación desde el panel de administración.',
      ],
      current: 'Actual',
      footer: '💡 Todos los datos provienen de la base de datos real',
    },

    // Respuestas del comando contact
    contact: {
      title: '📞 Información de Contacto',
      noContact: [
        'No hay información de contacto disponible.',
        'Por favor, agrega tu información desde el panel de administración.',
      ],
      email: 'Email',
      phone: 'Teléfono',
      location: 'Ubicación',
      footer: '💡 Todos los datos provienen de la base de datos real',
    },
  },

  // Textos de la interfaz
  ui: {
    title: '🖥️  Terminal Interactiva - CV Adrián Dávila',
    welcome: '¡Bienvenido! Esta es una terminal completamente funcional.',
    description: 'Puedes escribir comandos para explorar mi perfil profesional.',
    tipsHeader: '💡 Consejos:',
    tipHelp: "• Escribe 'help' para ver todos los comandos disponibles",
    tipTab: '• Usa Tab para autocompletar comandos',
    tipClear: "• Escribe 'clear' para limpiar la pantalla",
    clearButton: 'Limpiar terminal',
    tipExplore: '• Explora con ls, cat, y otros comandos UNIX',
    tipEasterEggs: '• ¡Hay Easter eggs escondidos! 🎮',
    footer: '¡Todos los datos vienen de mi base de datos real! 🚀',
    processing: 'Procesando...',
    placeholder: "Escribe un comando... (prueba 'help')",
  },
};

// Traducciones en inglés
const enTerminalTranslations: TerminalTranslations = {
  commands: {
    help: {
      name: 'help',
      description: 'Shows the list of available commands',
      usage: 'help',
      output: [
        'Available commands:',
        '  help      - Shows this help',
        '  about     - Information about me (real DB data)',
        '  skills    - List of technologies I handle (real DB data)',
        '  projects  - Featured projects (real DB data)',
        '  experience- Professional experience (real DB data)',
        '  education - Academic education (real DB data)',
        '  refresh   - Update data from database',
        '  clear     - Clears the screen',
        '  whoami    - Basic information (real DB data)',
        '  ls        - Lists available directories',
        '  cat       - Shows file contents',
        '',
        '🎮 Easter Eggs (Discover them all!):',
        '  hack      - Hollywood hacking mode 🔥',
        '  undertale - Undertale experience ❤️',
        '  matrix    - Follow the white rabbit 💊',
        '  coffee    - You need caffeine ☕',
        '  sudo      - Administrator permissions 🔐',
        '  konami    - Classic video game code 🎮',
        '  pokemon   - Pokémon Center for developers 🔴',
        '  pizza     - Order code pizza 🍕',
        '  vim       - Enter the editor (good luck exiting) 📝',
        '  42        - The answer to the universe 🤖',
        '  debug     - Typical debugging session 🐛',
        '  emoji     - Emoji festival 🎨',
        '',
        "💡 Tip: Type 'ls' to explore or use Tab to autocomplete",
        'Commands marked with (real DB data) load information from the database',
      ],
    },
    about: {
      name: 'about',
      description: 'Shows personal information',
      usage: 'about',
    },
    skills: {
      name: 'skills',
      description: 'Lists technical skills',
      usage: 'skills',
    },
    projects: {
      name: 'projects',
      description: 'Shows featured projects',
      usage: 'projects',
    },
    experience: {
      name: 'experience',
      description: 'Shows professional experience',
      usage: 'experience',
    },
    education: {
      name: 'education',
      description: 'Shows academic education',
      usage: 'education',
    },
    contact: {
      name: 'contact',
      description: 'Shows contact information',
      usage: 'contact',
    },
    refresh: {
      name: 'refresh',
      description: 'Updates data from database',
      usage: 'refresh',
      output: [
        '🔄 Data updated from database',
        '',
        '✅ Skills updated',
        '✅ Projects updated',
        '✅ Experiences updated',
        '✅ Profile updated',
        '✅ Education updated',
        '',
        "You can use 'skills', 'projects', 'experience', 'about', 'education' or 'contact' commands to see updated data.",
      ],
    },
    clear: {
      name: 'clear',
      description: 'Clears the terminal screen',
      usage: 'clear',
    },
    ls: {
      name: 'ls',
      description: 'Lists directory contents',
      usage: 'ls [directory]',
      directories: [
        'skills/',
        'projects/',
        'experience/',
        'education/',
        'achievements/',
        'contact/',
        'certifications/',
        'personal/',
      ],
      skills: [
        'frontend/',
        'backend/',
        'databases/',
        'devops/',
        'languages/',
        'frameworks/',
        'tools/',
      ],
      projects: [
        'portfolio.json',
        'ecommerce.json',
        'chat-app.json',
        'analytics-dashboard.json',
        'educational-system.json',
      ],
      error: "ls: cannot access '{dir}': No such file or directory",
    },
    cat: {
      name: 'cat',
      description: 'Shows file contents',
      usage: 'cat [file]',
      noFile: ['cat: missing file operand', "Try 'cat --help' for more information."],
      notFound: 'cat: {file}: No such file or directory',
      files: {
        'portfolio.json': [
          '{',
          '  "name": "Interactive Personal Portfolio",',
          '  "tech": ["React", "TypeScript", "Vite", "CSS3"],',
          '  "features": [',
          '    "Interactive terminal",',
          '    "Advanced animations",',
          '    "Responsive design",',
          '    "Dark/light mode"',
          '  ],',
          '  "status": "In production",',
          '  "url": "https://adrian-davila.dev"',
          '}',
        ],
      },
    },
    whoami: {
      name: 'whoami',
      description: 'Shows current user information',
      usage: 'whoami',
      fallback: [
        'Full Stack Developer',
        'Specialized in modern web technologies',
        'Passionate about innovation and clean code',
        '',
        'Main stack: React + TypeScript + Node.js + Spring Boot',
      ],
    },
    // Easter Eggs
    matrix: {
      name: 'matrix',
      description: 'Activates Matrix effect',
      usage: 'matrix',
      output: [
        'Wake up, Neo...',
        'The Matrix has you...',
        'Follow the white rabbit.',
        '',
        '💊 Matrix theme activated. Restart to apply.',
      ],
    },
    undertale: {
      name: 'undertale',
      description: 'Activates Undertale mode',
      usage: 'undertale',
      output: [
        "* You feel like you're going to have a good time.",
        '',
        '* UNDERTALE MODE ACTIVATED',
        '',
        "* Despite everything, it's still you.",
        '',
        '* You are filled with DETERMINATION.',
        '',
        '❤️ HP 20/20',
        '',
        '* You encounter a wild programmer!',
        '* The programmer shows you their portfolio.',
        '* Their code is filled with... DETERMINATION.',
        '',
        '* Will you:',
        '  ❤️ HIRE    ⚔️ RECRUIT    🛡️ COLLABORATE    💔 MERCY',
        '',
        '* (You chose to view their skills.)',
        "* It's super effective!",
        '',
        '🎵 bgm_determination.ogg is now playing...',
        '',
        '* Adrian Davila gained +100 EXP in Full Stack Development!',
        '* Adrian Davila learned REACT MASTERY!',
        '* Adrian Davila learned TYPESCRIPT EXPERTISE!',
        '',
        '* Your FRIENDSHIP with this developer increased!',
        '',
        '* Thank you for playing UNDERTALE PORTFOLIO! ❤️',
      ],
    },
    coffee: {
      name: 'coffee',
      description: 'Prepares virtual coffee',
      usage: 'coffee',
      output: [
        '☕ Preparing coffee...',
        '░░░░░░░░░░░░░░░░░░░░ 0%',
        '█░░░░░░░░░░░░░░░░░░░ 5%',
        '██████░░░░░░░░░░░░░░ 30%',
        '███████████████░░░░ 75%',
        '████████████████████ 100%',
        '',
        '☕ Coffee ready! Now I can code better 🚀',
      ],
    },
    sudo: {
      name: 'sudo',
      description: 'Tries to get administrator permissions',
      usage: 'sudo [command]',
      output: [
        '🔐 [sudo] password for user:',
        'Sorry, try again.',
        '🔐 [sudo] password for user:',
        'Sorry, try again.',
        '🔐 [sudo] password for user:',
        '',
        'sudo: 3 incorrect password attempts',
        '',
        "🤔 Hint: You don't need sudo permissions here 😄",
      ],
    },
    hack: {
      name: 'hack',
      description: 'Starts Hollywood-style hacking sequence',
      usage: 'hack',
      output: [
        '🚨 STARTING HACKING SEQUENCE... 🚨',
        '',
        '[▓▓▓▓▓▓▓▓▓▓] 100% - Accessing mainframe...',
        '> Decrypting security protocols...',
        '> Bypassing firewall... ✅',
        '> Accessing database... ✅',
        '',
        '💀 SYSTEM COMPROMISED 💀',
        '',
        'Jk, this is just a portfolio 😄',
        'But you can see my real skills with the "skills" command',
      ],
    },
    konami: {
      name: 'konami',
      description: 'Classic video game code',
      usage: 'konami',
      output: [
        '🎮 KONAMI CODE ACTIVATED! 🎮',
        '',
        '↑ ↑ ↓ ↓ ← → ← → B A START',
        '',
        '🌟 +30 Lives added to your professional career!',
        '🌟 +Infinite Skills unlocked!',
        '🌟 +God Mode enabled for debugging!',
        '',
        '🎯 Achievement Unlocked: "Old School Gamer"',
      ],
    },
    pokemon: {
      name: 'pokemon',
      description: 'Pokémon Center for developers',
      usage: 'pokemon',
      output: [
        '🔴⚪ Welcome to the Pokémon Center for Developers! ⚪🔴',
        '',
        '👩‍⚕️ Nurse Joy: "Hello! Would you like me to heal your bugs?"',
        '',
        '🎵 *Pokémon Center music plays*',
        '',
        '✨ Healing bugs... ✨',
        '✨ Restoring mental energy... ✨',
        '✨ Updating dependencies... ✨',
        '',
        '🎉 Your projects are fully healed!',
        '',
        '👩‍⚕️ "We hope to see you soon! And remember to commit frequently!"',
      ],
    },
    pizza: {
      name: 'pizza',
      description: 'Order code pizza',
      usage: 'pizza',
      output: [
        '🍕 Welcome to Pizza Code! 🍕',
        '',
        '👨‍🍳 "What kind of pizza do you want?"',
        '',
        '🍕 Margherita (Basic HTML/CSS)',
        '🍕 Pepperoni (Spicy JavaScript)',
        '🍕 Supreme (Complete Full Stack)',
        '🍕 Hawaiian (Python + pineapple, controversial)',
        '🍕 Four Cheese (4 different frameworks)',
        '',
        '📦 Preparing your Full Stack Supreme...',
        '⏰ Estimated time: 25-30 sprints',
        '',
        '🚚 Your code pizza is on the way!',
      ],
    },
    vim: {
      name: 'vim',
      description: 'Enter the editor (good luck exiting)',
      usage: 'vim',
      output: [
        '📝 Entering VIM...',
        '',
        '~ VIM - Vi IMproved ~',
        '~                                    ~',
        '~                                    ~',
        '~     Press :q to quit              ~',
        '~     Press :wq to save             ~',
        "~     Press ESC if you're lost      ~",
        '~                                    ~',
        '~                                    ~',
        '~                                    ~',
        '--INSERT--                            ',
        '',
        "💡 You're out! It was just a joke 😄",
        '   But if you need real VIM help,',
        '   try vimtutor in your terminal.',
      ],
    },
    '42': {
      name: '42',
      description: 'The answer to the universe',
      usage: '42',
      output: [
        '🤖 Computing the answer to life, the universe and everything...',
        '',
        '⏳ Processing for 7.5 million years...',
        '',
        '💫 THE ANSWER IS... 42! 💫',
        '',
        '🧠 "There you have the answer you were looking for"',
        '🧠 "Forty-two"',
        '',
        '❓ But... what was the question?',
        '',
        '📚 References: "The Hitchhiker\'s Guide to the Galaxy"',
        '    by Douglas Adams',
      ],
    },
    debug: {
      name: 'debug',
      description: 'Typical debugging session',
      usage: 'debug',
      output: [
        '🐛 DEBUGGING SESSION STARTED 🐛',
        '',
        '3:30 PM - "This should work..."',
        '3:45 PM - "Why doesn\'t it work?"',
        '4:00 PM - "BUT IT WORKED YESTERDAY!"',
        '4:30 PM - *Googles the error*',
        '4:45 PM - *Copies code from StackOverflow*',
        '5:00 PM - "Even worse... 🤦‍♂️"',
        '5:30 PM - *Rubber duck debugging*',
        '5:45 PM - "EUREKA! It was a semicolon"',
        '6:00 PM - *git commit -m "fix bug"*',
        '',
        '✅ Bug resolved successfully!',
        '📈 Debugging experience +1',
      ],
    },
    emoji: {
      name: 'emoji',
      description: 'Emoji festival',
      usage: 'emoji',
      output: [
        '🎨 EMOJI FESTIVAL! 🎨',
        '',
        '💻 👨‍💻 🖥️ ⌨️ 🖱️ 💾 📱 🔧',
        '🚀 ⭐ 🌟 ✨ 💫 🎯 🏆 🥇',
        '❤️ 💙 💚 💛 🧡 💜 🖤 🤍',
        '😀 😃 😄 😁 😊 😂 🤣 😍',
        '🎉 🎊 🎈 🎁 🎂 🍕 ☕ 🍔',
        '🔥 💯 ⚡ 🌈 🦄 🐱‍💻 🤖 👾',
        '',
        '🎭 Let the code party begin! 🎭',
      ],
    },
    rm: {
      name: 'rm',
      description: 'Tries to delete files (read-only)',
      usage: 'rm [file]',
      noOperand: ['rm: missing operand', "Try 'rm --help' for more information."],
      readOnly: ['rm: cannot remove: This is a read-only portfolio terminal'],
    },
  },
  responses: {
    // General messages
    commandNotFound: 'Command not found',
    tryHelp: "Try 'help' to see available commands",
    error: 'Error executing command',
    loading: 'Loading...',
    current: 'Current',

    // About command responses
    about: {
      noProfile: [
        'No profile information available in the database.',
        'Please add your profile from the admin panel.',
      ],
      status: 'Status',
    },

    // Skills command responses
    skills: {
      title: '🛠️ Technical Skills',
      noSkills: [
        'No skills registered in the database.',
        'Please add your skills from the admin panel.',
      ],
      footer: "💡 Use 'cat skills/[category]' to see specific details",
    },

    // Projects command responses
    projects: {
      title: '🚀 Featured Projects',
      noProjects: [
        'No projects registered in the database.',
        'Please add your projects from the admin panel.',
      ],
      techStack: 'Technologies',
      footer: "💡 Use 'cat projects/[project]' to see specific details",
    },

    // Experience command responses
    experience: {
      title: '💼 Professional Experience',
      noExperience: [
        'No experiences registered in the database.',
        'Please add your experience from the admin panel.',
      ],
      current: 'Current',
      footer: '💡 All data comes from the real database',
    },

    // Education command responses
    education: {
      title: '🎓 Academic Education',
      noEducation: [
        'No education registered in the database.',
        'Please add your education from the admin panel.',
      ],
      current: 'Current',
      footer: '💡 All data comes from the real database',
    },

    // Contact command responses
    contact: {
      title: '📞 Contact Information',
      noContact: [
        'No contact information available.',
        'Please add your information from the admin panel.',
      ],
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      footer: '💡 All data comes from the real database',
    },
  },

  // Interface texts
  ui: {
    title: '🖥️  Interactive Terminal - Adrián Dávila CV',
    welcome: 'Welcome! This is a fully functional terminal.',
    description: 'You can type commands to explore my professional profile.',
    tipsHeader: '💡 Tips:',
    tipHelp: "• Type 'help' to see all available commands",
    tipTab: '• Use Tab to autocomplete commands',
    tipClear: "• Type 'clear' to clean the screen",
    clearButton: 'Clear terminal',
    tipExplore: '• Explore with ls, cat, and other UNIX commands',
    tipEasterEggs: '• There are hidden Easter eggs! 🎮',
    footer: 'All data comes from my real database! 🚀',
    processing: 'Processing...',
    placeholder: "Type a command... (try 'help')",
  },
};

// Contexto del terminal
interface TerminalTranslationContextType {
  t: TerminalTranslations;
  currentLanguage: string;
}

const TerminalTranslationContext = createContext<TerminalTranslationContextType | undefined>(
  undefined
);

// Provider del contexto
interface TerminalTranslationProviderProps {
  children: React.ReactNode;
}

export const TerminalTranslationProvider: React.FC<TerminalTranslationProviderProps> = ({
  children,
}) => {
  const { language } = useLanguage();

  const translations = useMemo(() => {
    return language === 'es' ? esTerminalTranslations : enTerminalTranslations;
  }, [language]);

  const value = useMemo(
    () => ({
      t: translations,
      currentLanguage: language,
    }),
    [translations, language]
  );

  return (
    <TerminalTranslationContext.Provider value={value}>
      {children}
    </TerminalTranslationContext.Provider>
  );
};

// Hook para usar las traducciones del terminal
export const useTerminalTranslations = () => {
  const context = useContext(TerminalTranslationContext);
  if (context === undefined) {
    throw new Error('useTerminalTranslations must be used within a TerminalTranslationProvider');
  }
  return { t: context.t, currentLanguage: context.currentLanguage };
};

// Función utilitaria para obtener traducciones
export const getTerminalTranslations = (language: string): TerminalTranslations => {
  return language === 'es' ? esTerminalTranslations : enTerminalTranslations;
};
