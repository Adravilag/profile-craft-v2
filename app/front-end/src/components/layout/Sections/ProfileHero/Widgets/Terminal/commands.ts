// src/components/terminal/commands.ts

import {
  getSkills,
  getProjects,
  getExperiences,
  getUserProfile,
  getEducation,
} from '@services/api';
import type { Skill, Project, Experience, UserProfile, Education } from '@services/api';

export interface CommandResult {
  output: string[]; // Cada línea separada
  clearScreen?: boolean; // Si queremos limpiar el terminal antes de escribir
}

type CommandFn = (args: string[]) => CommandResult | Promise<CommandResult>;

// Cache para datos obtenidos de la API
let cachedSkills: Skill[] | null = null;
let cachedProjects: Project[] | null = null;
let cachedExperiences: Experience[] | null = null;
let cachedProfile: UserProfile | null = null;
let cachedEducation: Education[] | null = null;

// Función helper para obtener datos reales desde la base de datos
const fetchRealData = async (): Promise<void> => {
  try {
    if (!cachedSkills) {
      cachedSkills = await getSkills();
    }
    if (!cachedProjects) {
      cachedProjects = await getProjects();
    }
    if (!cachedExperiences) {
      cachedExperiences = await getExperiences();
    }
    if (!cachedProfile) {
      cachedProfile = await getUserProfile();
    }
    if (!cachedEducation) {
      cachedEducation = await getEducation();
    }
  } catch (error) {
    console.warn('Terminal: Error cargando datos desde la base de datos:', error);
    // Reset cache en caso de error para permitir reintento
    cachedSkills = null;
    cachedProjects = null;
    cachedExperiences = null;
    cachedProfile = null;
    cachedEducation = null;
  }
};

// Función helper para generar resumen de skills
const generateSkillsSummary = (skills: Skill[]): string[] => {
  if (!skills.length) {
    return [
      '🛠️  Mis habilidades técnicas:',
      '',
      'No hay habilidades registradas en la base de datos.',
      'Para agregar habilidades, visita el panel de administración.',
    ];
  }

  const output = ['🛠️  Mis habilidades técnicas:', ''];
  const grouped = skills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([category, categorySkills]) => {
    output.push(`${category}:`);
    categorySkills.forEach((skill: Skill) => {
      const stars = '⭐'.repeat(Math.floor((skill.level || 50) / 20));
      output.push(`  • ${skill.name.padEnd(20)} ${stars}`);
    });
    output.push('');
  });

  return output;
};

// Función helper para generar resumen de proyectos
const generateProjectsSummary = (projects: Project[]): string[] => {
  if (!projects.length) {
    return [
      '🚀 Proyectos destacados:',
      '',
      'No hay proyectos registrados en la base de datos.',
      'Para agregar proyectos, visita el panel de administración.',
    ];
  }

  const output = ['🚀 Proyectos destacados:', ''];

  projects.slice(0, 5).forEach((project, index) => {
    output.push(`${index + 1}. ${project.title}`);
    output.push(`   📁 ${project.technologies?.slice(0, 3).join(' + ') || 'Tecnologías varias'}`);
    if (project.description) {
      const shortDesc =
        project.description.length > 60
          ? project.description.substring(0, 60) + '...'
          : project.description;
      output.push(`   🎯 ${shortDesc}`);
    }
    if (project.github_url) {
      output.push(`   🔗 ${project.github_url}`);
    }
    if (project.live_url) {
      output.push(`   🌐 ${project.live_url}`);
    }
    output.push('');
  });

  if (projects.length > 5) {
    output.push(`Y ${projects.length - 5} proyectos más...`);
  }

  return output;
};

// Función helper para generar resumen de experiencia
const generateExperienceSummary = (experiences: Experience[]): string[] => {
  if (!experiences.length) {
    return [
      '💼 Experiencia profesional:',
      '',
      'No hay experiencias laborales registradas en la base de datos.',
      'Para agregar experiencia, visita el panel de administración.',
    ];
  }

  const output = ['💼 Experiencia profesional:', ''];

  // Ordenar experiencias por fecha de inicio (más reciente primero)
  const sortedExperiences = experiences.sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  sortedExperiences.forEach(exp => {
    const startYear = new Date(exp.start_date).getFullYear();
    const endYear = exp.is_current ? 'Presente' : new Date(exp.end_date).getFullYear();
    const period = `${startYear} - ${endYear}`;

    output.push(`🏢 ${exp.position} | ${exp.company} (${period})`);

    if (exp.location) {
      output.push(`   📍 ${exp.location}`);
    }

    if (exp.description) {
      // Dividir la descripción en líneas para mejor legibilidad
      const lines = exp.description.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        output.push(`   • ${line.trim()}`);
      });
    }

    if (exp.technologies && exp.technologies.length > 0) {
      output.push(`   🛠️ ${exp.technologies.join(', ')}`);
    }

    output.push('');
  });

  // Eliminar última línea vacía si existe
  if (output[output.length - 1] === '') {
    output.pop();
  }

  return output;
};

// Función helper para generar resumen del perfil
const generateProfileSummary = (profile: UserProfile | null): string[] => {
  if (!profile) {
    return [
      'No hay información de perfil disponible en la base de datos.',
      'Por favor, agrega tu perfil desde el panel de administración.',
    ];
  }

  const output = [];
  if (profile.name) {
    output.push(`🧑‍💻 ${profile.name}`);
    output.push('');
  }
  if (profile.role_title) {
    output.push(`💼 ${profile.role_title}`);
  }
  if (profile.role_subtitle) {
    output.push(profile.role_subtitle);
  }
  if (profile.about_me) {
    output.push('');
    output.push(profile.about_me);
  }
  if (profile.status) {
    output.push('');
    output.push(`Estado: ${profile.status}`);
  }
  return output;
};

// Función helper para generar información de contacto
const generateContactInfo = (profile: UserProfile | null): string[] => {
  if (!profile) {
    return [
      '📞 Información de contacto:',
      '',
      '📧 Email: adrian.davila@example.com',
      '💼 LinkedIn: linkedin.com/in/adrian-davila',
      '🐙 GitHub: github.com/adrian-davila',
      '🌐 Portfolio: www.adrian-davila.dev',
      '📱 Teléfono: +34 123 456 789',
      '📍 Ubicación: Madrid, España',
      '',
      '💡 Estado: Disponible para nuevos proyectos',
      '⏰ Tiempo de respuesta: < 24 horas',
      '🤝 Abierto a colaboraciones remotas',
    ];
  }

  const output = ['📞 Información de contacto:', ''];

  if (profile.email) {
    output.push(`📧 Email: ${profile.email}`);
  }

  if (profile.linkedin_url) {
    output.push(`💼 LinkedIn: ${profile.linkedin_url}`);
  }

  if (profile.github_url) {
    output.push(`🐙 GitHub: ${profile.github_url}`);
  }

  if (profile.phone) {
    output.push(`📱 Teléfono: ${profile.phone}`);
  }

  if (profile.location) {
    output.push(`📍 Ubicación: ${profile.location}`);
  }

  output.push('');

  if (profile.status) {
    output.push(`💡 Estado: ${profile.status}`);
  }

  // Información adicional por defecto
  output.push('⏰ Tiempo de respuesta: < 24 horas');
  output.push('🤝 Abierto a colaboraciones remotas');

  return output;
};

// Función helper para generar resumen de educación
const generateEducationSummary = (education: Education[]): string[] => {
  if (!education.length) {
    return [
      '🎓 Formación académica:',
      '',
      'No hay información de educación registrada en la base de datos.',
      'Para agregar educación, visita el panel de administración.',
    ];
  }

  const output = ['🎓 Formación académica:', ''];

  // Ordenar por fecha de inicio (más reciente primero)
  const sortedEducation = education.sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  sortedEducation.forEach(edu => {
    const startYear = new Date(edu.start_date).getFullYear();
    const endYear = new Date(edu.end_date).getFullYear();
    const period = `${startYear} - ${endYear}`;

    output.push(`🏛️  ${edu.title}`);
    output.push(`   📍 ${edu.institution}`);
    output.push(`   📅 ${period}`);

    if (edu.grade) {
      output.push(`   🏆 ${edu.grade}`);
    }

    if (edu.description) {
      const lines = edu.description.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        output.push(`   📝 ${line.trim()}`);
      });
    }

    output.push('');
  });

  // Eliminar última línea vacía si existe
  if (output[output.length - 1] === '') {
    output.pop();
  }

  return output;
};

// Aquí definimos la "base de datos" de respuestas:
const COMMANDS: Record<string, CommandFn> = {
  help: () => ({
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
  }),

  about: async () => {
    await fetchRealData();
    return {
      output: generateProfileSummary(cachedProfile),
    };
  },

  whoami: async () => {
    await fetchRealData();
    const profile = cachedProfile;

    if (!profile) {
      return {
        output: [
          'Desarrollador Full Stack',
          'Especializado en tecnologías web modernas',
          'Apasionado por la innovación y el código limpio',
          '',
          'Stack principal: React + TypeScript + Node.js + Spring Boot',
        ],
      };
    }

    const output = [];

    if (profile.role_title) {
      output.push(profile.role_title);
    }

    if (profile.role_subtitle) {
      output.push(profile.role_subtitle);
    }

    if (profile.about_me) {
      output.push('');
      // Tomar solo la primera línea o frase del about_me para whoami
      const firstLine = profile.about_me.split('\n')[0] || profile.about_me;
      if (firstLine.length > 80) {
        output.push(firstLine.substring(0, 80) + '...');
      } else {
        output.push(firstLine);
      }
    }

    return { output };
  },

  skills: async () => {
    await fetchRealData();
    return {
      output: generateSkillsSummary(cachedSkills || []),
    };
  },

  projects: async () => {
    await fetchRealData();
    return {
      output: generateProjectsSummary(cachedProjects || []),
    };
  },

  contact: async () => {
    await fetchRealData();
    return {
      output: generateContactInfo(cachedProfile),
    };
  },

  experience: async () => {
    await fetchRealData();
    return {
      output: generateExperienceSummary(cachedExperiences || []),
    };
  },

  education: async () => {
    await fetchRealData();
    return {
      output: generateEducationSummary(cachedEducation || []),
    };
  },

  ls: args => {
    const directories = [
      'skills/',
      'projects/',
      'experience/',
      'education/',
      'achievements/',
      'contact/',
      'certifications/',
      'personal/',
    ];

    if (args.length > 0) {
      const dir = args[0];
      switch (dir) {
        case 'skills':
        case 'skills/':
          return {
            output: [
              'frontend/',
              'backend/',
              'databases/',
              'devops/',
              'languages/',
              'frameworks/',
              'tools/',
            ],
          };
        case 'projects':
        case 'projects/':
          return {
            output: [
              'portfolio.json',
              'ecommerce.json',
              'chat-app.json',
              'analytics-dashboard.json',
              'educational-system.json',
            ],
          };
        default:
          return {
            output: [`ls: cannot access '${dir}': No such file or directory`],
          };
      }
    }

    return {
      output: directories,
    };
  },

  cat: args => {
    if (args.length === 0) {
      return {
        output: ['cat: missing file operand', "Try 'cat --help' for more information."],
      };
    }

    const file = args[0];
    switch (file) {
      case 'portfolio.json':
        return {
          output: [
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
        };
      case 'skills/frontend':
      case 'skills/frontend.txt':
        return {
          output: [
            'React ⭐⭐⭐⭐⭐',
            'TypeScript ⭐⭐⭐⭐⭐',
            'Vue.js ⭐⭐⭐⭐',
            'Angular ⭐⭐⭐',
            'HTML5/CSS3 ⭐⭐⭐⭐⭐',
            'SCSS/Sass ⭐⭐⭐⭐',
            'Material Design ⭐⭐⭐⭐',
          ],
        };
      default:
        return {
          output: [`cat: ${file}: No such file or directory`],
        };
    }
  },

  clear: () => ({
    output: [],
    clearScreen: true,
  }),

  // Comando para refrescar datos desde la base de datos
  refresh: async () => {
    // Limpiar cache
    cachedSkills = null;
    cachedProjects = null;
    cachedExperiences = null;
    cachedProfile = null;
    cachedEducation = null;

    // Cargar datos frescos
    await fetchRealData();

    return {
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
    };
  },

  // Comandos de Easter Eggs
  matrix: () => ({
    output: [
      'Wake up, Neo...',
      'The Matrix has you...',
      'Follow the white rabbit.',
      '',
      '💊 Tema Matrix activado. Reinicia para aplicar.',
    ],
  }),

  undertale: () => ({
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
  }),

  coffee: () => ({
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
  }),
  sudo: _args => ({
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
  }),
  hack: () => ({
    output: [
      '🎬 HOLLYWOOD HACKING MODE ACTIVATED',
      '',
      '🔍 Scanning network topology...',
      '└── Found 127 vulnerable endpoints',
      '',
      '⚡ Initializing quantum encryption bypass...',
      '01001000 01100001 01100011 01101011 01101001 01101110 01100111',
      '11000010 10100000 11000010 10100000 11000010 10100000',
      '',
      '🔥 BREACHING MAINFRAME FIREWALL...',
      '▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%',
      '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%',
      '',
      '🚨 ACCESS GRANTED - LEVEL ALPHA',
      '├── Root privileges obtained',
      '├── Bypassing biometric scanners',
      '└── Disabling security cameras',
      '',
      '📡 DOWNLOADING CLASSIFIED FILES...',
      'secret_files.zip ████████████████████ 100%',
      'adrian_resume.pdf ███████████████████ 100%',
      'skills_matrix.json ██████████████████ 100%',
      '',
      '💾 Files successfully extracted to /tmp/loot/',
      '',
      '🏆 MISSION ACCOMPLISHED',
      'Time elapsed: 3.7 seconds',
      'Files obtained: 3',
      'Security alerts triggered: 0',
      '',
      '😄 Por supuesto, esto es solo una simulación...',
      '¡No hay hacking real aquí, solo diversión! 🎮',
    ],
  }),

  rm: args => {
    const fullCommand = args.join(' ');

    // Detectar variaciones del comando peligroso
    if (fullCommand.includes('-rf') && (fullCommand.includes('/') || fullCommand.includes('*'))) {
      return {
        output: [
          '🚨 ¡ALERTA DE SEGURIDAD! 🚨',
          '',
          'rm -rf /: ¿En serio? 😱',
          '',
          'Por suerte, esto es solo un portfolio...',
          'Si fuera un sistema real, acabas de:',
          '  • Borrar todo el sistema de archivos',
          '  • Destruir tu carrera profesional',
          '  • Convertirte en una leyenda urbana',
          '',
          '💡 Consejo profesional:',
          "   Nunca ejecutes 'rm -rf /' en un sistema real",
          '   A menos que quieras explicar a tu jefe',
          '   por qué el servidor desapareció... 🔥',
          '',
          '😄 Portfolio status: Intacto y a salvo!',
        ],
      };
    }

    // Para otros usos de rm
    if (args.length === 0) {
      return {
        output: ['rm: missing operand', "Try 'rm --help' for more information."],
      };
    }

    return {
      output: [`rm: cannot remove '${fullCommand}': This is a read-only portfolio terminal`],
    };
  },

  // Más Easter Eggs divertidos

  konami: () => ({
    output: [
      '🎮 ↑ ↑ ↓ ↓ ← → ← → B A',
      '',
      '🎊 ¡CÓDIGO KONAMI ACTIVADO! 🎊',
      '',
      '🌟 Has desbloqueado el modo DESARROLLADOR LEGENDARIO',
      '',
      'Bonificaciones activadas:',
      '  • +30 vidas extra en debugging',
      '  • Café infinito ☕',
      '  • Modo God (sin bugs) 🐛❌',
      '  • Stack Overflow respuestas instantáneas 📚',
      '  • Git commits siempre funcionan ✨',
      '',
      "🏆 Logro desbloqueado: 'Old School Gamer'",
    ],
  }),

  pokemon: () => ({
    output: [
      '🎵 *Música de Pokémon Center*',
      '',
      '👩‍⚕️ Enfermera Joy: ¡Bienvenido al Centro Pokémon!',
      '',
      '¿Te gustaría que cure a tus Pokémon?',
      '',
      '🔄 Curando...',
      '💖 ¡Tus habilidades han sido restauradas!',
      '',
      '📋 Estado del equipo:',
      '  🔥 JavaScript Lv.85    ████████████████████ HP: 100%',
      '  ⚡ TypeScript Lv.82    ████████████████████ HP: 100%',
      '  🌿 React Lv.90        ████████████████████ HP: 100%',
      '  💧 Node.js Lv.78      ████████████████████ HP: 100%',
      '  🌙 MongoDB Lv.75      ████████████████████ HP: 100%',
      '  ⭐ Git Lv.88          ████████████████████ HP: 100%',
      '',
      '¡Que tengas un buen viaje programando! 🎒',
    ],
  }),

  pizza: () => ({
    output: [
      '🍕 Ordenando pizza...',
      '',
      '📞 *Ring ring*',
      "🍕 Pizzería Código: '¡Hola! ¿En qué podemos ayudarte?'",
      '',
      "🧑‍💻 Yo: 'Hola, quisiera una pizza grande...'",
      "🍕 '¿Qué ingredientes?'",
      "🧑‍💻 'JavaScript, un poco de CSS, mucho HTML...'",
      "🍕 '¿Python también?'",
      "🧑‍💻 '¡Sí! Y extra de React'",
      '',
      '💰 Total: 42€ (el número perfecto)',
      '⏰ Tiempo estimado: 30 minutos',
      '',
      '🚚 Tu pizza de código está en camino...',
      '🍕 ¡Buen provecho programando!',
    ],
  }),

  stackoverflow: () => ({
    output: [
      '🌐 Conectando a Stack Overflow...',
      '',
      "❓ Tu pregunta: '¿Cómo arreglar undefined?'",
      '',
      '💬 Respuestas de la comunidad:',
      '',
      "👤 Usuario1337 (⭐ 50,234): 'Marcado como duplicado'",
      '🔗 Link a pregunta de 2009 que no resuelve nada',
      '',
      "👤 NoobDestroyer (⭐ 1): 'Usa jQuery'",
      '👇 -47 votos',
      '',
      "👤 CodeGuru (⭐ 85,432): 'RTFM'",
      '👇 +156 votos',
      '',
      '👤 HelpfulDev (⭐ 12,890):',
      "'Aquí tienes una solución completa de 200 líneas",
      " que resuelve tu problema específico...'",
      '👇 +3,429 votos, 🏆 Mejor respuesta',
      '',
      '😅 Moral: Stack Overflow simula la vida real',
    ],
  }),

  windows: () => ({
    output: [
      '🪟 Microsoft Windows [Versión 10.0.19041.1234]',
      '(c) Microsoft Corporation. Todos los derechos reservados.',
      '',
      'C:\\Users\\Developer> npm install life',
      "⚠️  Warning: 'happiness' peer dependency missing",
      '',
      'C:\\Users\\Developer> npm install happiness',
      "💸 That'll be your entire salary, please",
      '',
      'C:\\Users\\Developer> npm install coffee',
      '☕ Successfully installed coffee@unlimited.version',
      '',
      'C:\\Users\\Developer> git push origin life',
      "fatal: remote 'reality' does not exist",
      '',
      'C:\\Users\\Developer> exit',
      '😅 Returning to Linux-style sanity...',
    ],
  }),

  linux: () => ({
    output: [
      '🐧 Welcome to Ubuntu 22.04.3 LTS',
      '',
      'Last login: Never (I use Arch, btw)',
      '',
      'developer@portfolio:~$ sudo apt update',
      '📦 Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease',
      '📦 Reading package lists... Done',
      '',
      'developer@portfolio:~$ sudo apt install skills',
      '📋 The following NEW packages will be installed:',
      '  react typescript nodejs git coffee-addiction',
      '☕ After this operation, 3.14 GB of wisdom will be used.',
      '📥 Do you want to continue? [Y/n] Y',
      '',
      '✅ Setting up react (18.x.x) ...',
      '✅ Setting up typescript (5.x.x) ...',
      '✅ Setting up nodejs (20.x.x) ...',
      '✅ Processing triggers for brain (1.0) ...',
      '',
      '🎉 Skills successfully installed!',
    ],
  }),

  '42': () => ({
    output: [
      '🤖 Deep Thought computing...',
      '',
      '⏳ This may take 7.5 million years...',
      '',
      '🔢 The Answer to the Ultimate Question of',
      '   Life, the Universe, and Everything:',
      '',
      '✨ 42 ✨',
      '',
      '🤔 Now we just need to figure out',
      '   what the question actually was...',
      '',
      '🧑‍💻 (Pero en programación, 42 significa',
      "    'número perfecto de líneas de código')",
    ],
  }),

  google: () => ({
    output: [
      "🔍 Google Search: 'how to center a div'",
      '',
      '📊 About 47,392,847 results (0.42 seconds)',
      '',
      "🔗 CSS-Tricks: 'Centering in CSS: A Complete Guide'",
      '   The definitive guide to centering in CSS...',
      '',
      "🔗 Stack Overflow: 'How do I center a div?'",
      '   Asked 847 times, viewed 2.3M times...',
      '',
      "🔗 W3Schools: 'CSS Layout - Horizontal & Vertical Align'",
      '   Learn how to center elements horizontally...',
      '',
      '💡 Related searches:',
      "   • 'why is css so hard'",
      "   • 'flexbox vs grid 2024'",
      "   • 'career change to farming'",
      '',
      '😅 Algunos problemas nunca cambian...',
    ],
  }),

  npm: () => ({
    output: [
      '📦 npm install motivation',
      '',
      "⚠️  Warning: deprecated 'sleep' package",
      '💸 Found 42,000 vulnerabilities (41,999 critical)',
      '',
      '📦 npm audit fix',
      '💥 Fixed 0 vulnerabilities, created 15,000 new ones',
      '',
      '📦 npm install --force',
      '🔥 Your node_modules is now 2.3GB',
      '🤖 Your computer fan sounds like a jet engine',
      '',
      '📦 npm start',
      '✨ It works! (somehow)',
      '',
      '💭 Classic npm experience completed successfully',
    ],
  }),

  vim: () => ({
    output: [
      '📝 Entering vim...',
      '',
      '~ VIM - Vi IMproved ~',
      '~',
      '~ version 8.2.3458 ~',
      '~ by Bram Moolenaar et al. ~',
      '~',
      '~ Vim is open source and freely distributable ~',
      '~',
      '~ Help poor children in Uganda! ~',
      '~ type :help iccf<Enter> for information ~',
      '~',
      '~ type :q<Enter> to exit ~',
      '~ type :help<Enter> or <F1> for on-line help ~',
      '',
      '😰 Oh no... ¿Cómo salgo de aquí?',
      '',
      "💡 Pista: ':q' para salir",
      "🔥 Pista PRO: ':wq' para guardar y salir",
      "🚨 EMERGENCIA: 'ESC :q!' para salir sin guardar",
    ],
  }),

  debug: () => ({
    output: [
      '🐛 Iniciando sesión de debugging...',
      '',
      "🔍 console.log('¿Por qué no funciona?')",
      "🔍 console.log('AQUÍ 1')",
      "🔍 console.log('AQUÍ 2')",
      "🔍 console.log('VARIABLE:', variable)",
      "🔍 console.log('LLEGUÉ HASTA AQUÍ')",
      "🔍 console.log('😭😭😭')",
      '',
      '2 horas después...',
      '',
      '🎯 Problema encontrado: Un punto y coma faltante',
      '📍 Línea: 247',
      '🤦‍♂️ Tiempo perdido: 2.5 horas',
      '',
      "💭 'Me dedico a esto por amor al arte...'",
      '',
      '🏆 Debugging skills: +1 (nivel actual: ∞)',
    ],
  }),

  emoji: () => ({
    output: [
      '🎨 ¡Festival de Emojis! 🎉',
      '',
      '👨‍💻 Desarrollador trabajando duro',
      '☕ + 🧠 = 💡',
      '🐛 ➡️ 🔨 ➡️ ✅',
      '💻 + ❤️ = 🚀',
      '',
      '🔥 Combo de programador:',
      '🌙 + ☕ + 🎵 + 💻 = 🎯',
      '',
      '📊 Mood actual:',
      '😴 |▓▓▓▓▓▓▓▓░░| 80% (Necesita café)',
      '☕ |▓▓░░░░░░░░| 20% (Nivel crítico)',
      '🧠 |▓▓▓▓▓▓▓▓▓▓| 100% (Modo genio)',
      '',
      '🎮 Achievement unlocked: Emoji Master! 🏆',
    ],
  }),
};

// Si el usuario escribe un comando que no existe:
const defaultCommand: CommandFn = args => {
  const cmd = args.join(' ');
  const suggestions = Object.keys(COMMANDS)
    .filter(command => command.startsWith(cmd.charAt(0)))
    .slice(0, 3);

  const output = [`bash: ${cmd}: comando no encontrado`];

  if (suggestions.length > 0) {
    output.push('', '¿Quisiste decir?');
    suggestions.forEach(suggestion => {
      output.push(`  ${suggestion}`);
    });
  }

  output.push('', "Escribe 'help' para ver todos los comandos disponibles.");

  return { output };
};

export async function runCommand(input: string): Promise<CommandResult> {
  // Separamos en tokens: comando + argumentos
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  if (cmd === '') {
    return { output: [''] }; // Enter sin nada, devolvemos línea en blanco
  }

  const fn = COMMANDS[cmd] || (() => defaultCommand([cmd, ...args]));
  const result = fn(args);

  // Verificar si es una promesa
  if (result instanceof Promise) {
    return await result;
  }

  return result;
}

// Función para autocompletar comandos
export function getAutocompleteSuggestions(input: string): string[] {
  const availableCommands = Object.keys(COMMANDS);
  return availableCommands.filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()));
}
