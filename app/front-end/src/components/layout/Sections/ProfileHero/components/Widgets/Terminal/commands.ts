// src/components/terminal/commands.ts

import {
  getSkills,
  getProjects,
  getExperiences,
  getUserProfile,
  getEducation,
} from '@services/api';
import type { Project, Experience, Education, UserProfile, Skill } from '@/types/api';
import { getTerminalTranslations } from './context/TerminalTranslationContext';

// Función para obtener el idioma actual desde localStorage o por defecto.
// Usar la misma clave que usa TranslationContext ('cv-language') y
// fallback a document.documentElement.lang si está disponible.
const getCurrentLanguage = (): string => {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem('cv-language');
    if (saved && (saved === 'es' || saved === 'en')) return saved;
  } catch (e) {
    // ignore
  }
  try {
    const docLang = document?.documentElement?.lang;
    if (docLang && (docLang === 'es' || docLang === 'en')) return docLang;
  } catch (e) {
    // ignore
  }
  return 'es';
};

export interface CommandResult {
  output: string[]; // Cada línea separada
  clearScreen?: boolean; // Si queremos limpiar el terminal antes de escribir
}

type CommandFn = (
  args: string[],
  t: any,
  currentLanguage: string
) => CommandResult | Promise<CommandResult>;

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
    console.error('Error fetching real data:', error);
  }
};

// Función helper para generar resumen de skills
const generateSkillsSummary = (skills: Skill[], t: any): string[] => {
  if (skills.length === 0) {
    return t.responses.skills.noSkills;
  }

  const output = [t.responses.skills.title, ''];

  const categories = skills.reduce((acc: Record<string, Skill[]>, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  Object.entries(categories).forEach(([category, categorySkills]) => {
    output.push(`📂 ${category}:`);
    categorySkills.forEach(skill => {
      const stars = '⭐'.repeat(skill.level || 1);
      output.push(`  ${skill.name} ${stars}`);
    });
    output.push('');
  });

  output.push(t.responses.skills.footer);
  return output;
};

// Función helper para generar resumen de proyectos
const generateProjectsSummary = (projects: Project[], t: any): string[] => {
  if (projects.length === 0) {
    return t.responses.projects.noProjects;
  }

  const output = [t.responses.projects.title, ''];

  projects.forEach((project, index) => {
    output.push(`📋 ${project.title}`);
    if (project.description) {
      output.push(`   ${project.description}`);
    }
    if (project.technologies && project.technologies.length > 0) {
      output.push(`   ${t.responses.projects.techStack}: ${project.technologies.join(', ')}`);
    }
    if (project.live_url || project.github_url) {
      if (project.live_url) {
        output.push(`   🔗 ${project.live_url}`);
      }
      if (project.github_url) {
        output.push(`   🐙 ${project.github_url}`);
      }
    }
    if (index < projects.length - 1) {
      output.push('');
    }
  });

  output.push('', t.responses.projects.footer);
  return output;
};

// Función helper para generar resumen de experiencias
const generateExperienceSummary = (experiences: Experience[], t: any): string[] => {
  if (experiences.length === 0) {
    return t.responses.experience.noExperience;
  }

  const output = [t.responses.experience.title, ''];

  experiences.forEach((exp, index) => {
    output.push(`🏢 ${exp.company}`);
    output.push(`   ${exp.position}`);

    const startDate = new Date(exp.start_date).toLocaleDateString();
    const endDate = exp.end_date
      ? new Date(exp.end_date).toLocaleDateString()
      : t.responses.experience.current;
    output.push(`   📅 ${startDate} - ${endDate}`);

    if (exp.description) {
      const desc = exp.description || '';
      const lines = desc.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        output.push(`   • ${line.trim()}`);
      });
    }

    if (index < experiences.length - 1) {
      output.push('');
    }
  });

  output.push('', t.responses.experience.footer);
  return output;
};

// Función helper para generar resumen de perfil
const generateProfileSummary = (profile: UserProfile | null, t: any): string[] => {
  if (!profile) {
    return t.responses.about.noProfile;
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
    output.push(`${t.responses.about.status}: ${profile.status}`);
  }
  return output;
};

// Función helper para generar información de contacto
const generateContactInfo = (profile: UserProfile | null, t: any): string[] => {
  if (!profile) {
    return t.responses.contact.noContact;
  }

  const output = [t.responses.contact.title, ''];

  if (profile.email) {
    output.push(`📧 ${t.responses.contact.email}: ${profile.email}`);
  }
  if (profile.phone) {
    output.push(`📱 ${t.responses.contact.phone}: ${profile.phone}`);
  }
  if (profile.location) {
    output.push(`📍 ${t.responses.contact.location}: ${profile.location}`);
  }
  if (profile.linkedin_url) {
    output.push(`💼 LinkedIn: ${profile.linkedin_url}`);
  }
  if (profile.github_url) {
    output.push(`🐙 GitHub: ${profile.github_url}`);
  }

  output.push('', t.responses.contact.footer);
  return output;
};

// Función helper para generar resumen de educación
const generateEducationSummary = (educations: Education[], t: any): string[] => {
  if (educations.length === 0) {
    return t.responses.education.noEducation;
  }

  const output = [t.responses.education.title, ''];

  educations.forEach((edu, index) => {
    output.push(`🎓 ${edu.title}`);
    output.push(`   ${edu.institution}`);

    const startYear = new Date(edu.start_date).getFullYear();
    const endYear = edu.end_date
      ? new Date(edu.end_date).getFullYear()
      : t.responses.education.current;
    output.push(`   📅 ${startYear} - ${endYear}`);

    if (edu.description) {
      const desc = edu.description || '';
      const lines = desc.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        output.push(`   • ${line.trim()}`);
      });
    }

    if (index < educations.length - 1) {
      output.push('');
    }
  });

  output.push('', t.responses.education.footer);
  return output;
};

// Función helper para generar ayuda dinámica
const generateHelpOutput = (t: any, currentLanguage: string): string[] => {
  const output = [];

  // Encabezado - usando el idioma actual
  const isSpanish = currentLanguage === 'es';

  if (isSpanish) {
    output.push('Comandos disponibles:');
  } else {
    output.push('Available commands:');
  }

  // Comandos principales usando las traducciones existentes
  output.push(`  help      - ${t.commands.help.description}`);
  output.push(`  about     - ${t.commands.about.description}`);
  output.push(`  skills    - ${t.commands.skills.description}`);
  output.push(`  projects  - ${t.commands.projects.description}`);
  output.push(`  contact   - ${t.commands.contact.description}`);
  output.push(`  experience- ${t.commands.experience.description}`);
  output.push(`  education - ${t.commands.education.description}`);
  output.push(`  refresh   - ${t.commands.refresh.description}`);
  output.push(`  clear     - ${t.commands.clear.description}`);
  output.push(`  whoami    - ${t.commands.whoami.description}`);
  output.push(`  ls        - ${t.commands.ls.description}`);
  output.push(`  cat       - ${t.commands.cat.description}`);
  output.push('');

  // Easter Eggs
  if (isSpanish) {
    output.push('🎮 Easter Eggs (¡Descúbrelos todos!):');
  } else {
    output.push('🎮 Easter Eggs (Discover them all!):');
  }

  output.push(`  hack      - ${t.commands.hack.description}`);
  output.push(`  undertale - ${t.commands.undertale.description}`);
  output.push(`  matrix    - ${t.commands.matrix.description}`);
  output.push(`  coffee    - ${t.commands.coffee.description}`);
  output.push(`  sudo      - ${t.commands.sudo.description}`);
  output.push(`  konami    - ${t.commands.konami.description}`);
  output.push(`  pokemon   - ${t.commands.pokemon.description}`);
  output.push(`  pizza     - ${t.commands.pizza.description}`);
  output.push(`  vim       - ${t.commands.vim.description}`);
  output.push(`  42        - ${t.commands['42'].description}`);
  output.push(`  debug     - ${t.commands.debug.description}`);
  output.push(`  emoji     - ${t.commands.emoji.description}`);
  output.push('');

  // Tips finales
  if (isSpanish) {
    output.push("💡 Tip: Escribe 'ls' para explorar o usa Tab para autocompletar");
    output.push(
      'Los comandos marcados con (datos reales de BD) cargan información de la base de datos'
    );
  } else {
    output.push("💡 Tip: Type 'ls' to explore or use Tab to autocomplete");
    output.push('Commands marked with (real DB data) load information from the database');
  }

  return output;
};

// Aquí definimos la "base de datos" de respuestas:
const COMMANDS: Record<string, CommandFn> = {
  help: (args: string[], t: any, currentLanguage: string) => ({
    output: generateHelpOutput(t, currentLanguage),
  }),

  about: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateProfileSummary(cachedProfile, t),
    };
  },

  whoami: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    const profile = cachedProfile;

    if (!profile) {
      return {
        output: t.commands.whoami.fallback,
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
      output.push(profile.about_me);
    }

    return { output };
  },

  skills: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateSkillsSummary(cachedSkills || [], t),
    };
  },

  projects: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateProjectsSummary(cachedProjects || [], t),
    };
  },

  contact: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateContactInfo(cachedProfile, t),
    };
  },

  experience: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateExperienceSummary(cachedExperiences || [], t),
    };
  },

  education: async (args: string[], t: any, currentLanguage: string) => {
    await fetchRealData();
    return {
      output: generateEducationSummary(cachedEducation || [], t),
    };
  },

  ls: (args: string[], t: any, currentLanguage: string) => {
    const directories = t.commands.ls.directories;

    if (args.length > 0) {
      const dir = args[0];
      switch (dir) {
        case 'skills':
        case 'skills/':
          return {
            output: t.commands.ls.skills,
          };
        case 'projects':
        case 'projects/':
          return {
            output: t.commands.ls.projects,
          };
        default:
          return {
            output: [t.commands.ls.error.replace('{dir}', dir)],
          };
      }
    }

    return {
      output: directories,
    };
  },

  cat: (args: string[], t: any, currentLanguage: string) => {
    if (args.length === 0) {
      return {
        output: t.commands.cat.noFile,
      };
    }

    const file = args[0];
    const catResponses = t.commands.cat.files;

    if (catResponses[file]) {
      return {
        output: catResponses[file],
      };
    }

    return {
      output: [t.commands.cat.notFound.replace('{file}', file)],
    };
  },

  clear: (args: string[], t: any, currentLanguage: string) => ({
    output: [],
    clearScreen: true,
  }),

  // Comando para refrescar datos desde la base de datos
  refresh: async (args: string[], t: any, currentLanguage: string) => {
    // Limpiar cache
    cachedSkills = null;
    cachedProjects = null;
    cachedExperiences = null;
    cachedProfile = null;
    cachedEducation = null;

    // Cargar datos frescos
    await fetchRealData();

    return {
      output: t.commands.refresh.output,
    };
  },

  // Comandos de Easter Eggs
  matrix: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.matrix.output,
  }),

  undertale: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.undertale.output,
  }),

  coffee: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.coffee.output,
  }),

  sudo: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.sudo.output,
  }),

  hack: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.hack.output,
  }),

  konami: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.konami.output,
  }),

  pokemon: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.pokemon.output,
  }),

  pizza: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.pizza.output,
  }),

  vim: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.vim.output,
  }),

  '42': (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands['42'].output,
  }),

  debug: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.debug.output,
  }),

  emoji: (args: string[], t: any, currentLanguage: string) => ({
    output: t.commands.emoji.output,
  }),

  rm: (args: string[], t: any, currentLanguage: string) => {
    if (args.length === 0) {
      return {
        output: t.commands.rm.noOperand,
      };
    }

    return {
      output: t.commands.rm.readOnly,
    };
  },
};

export async function runCommand(input: string, language?: string): Promise<CommandResult> {
  const lang = language || getCurrentLanguage();
  const t = getTerminalTranslations(lang);

  // Separamos en tokens: comando + argumentos
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  if (cmd === '') {
    return { output: [''] }; // Enter sin nada, devolvemos línea en blanco
  }

  // Verificar si el comando existe
  if (!COMMANDS[cmd]) {
    return {
      output: [`${t.responses.commandNotFound}: ${cmd}`, t.responses.tryHelp],
    };
  }

  try {
    const fn = COMMANDS[cmd];
    const result = await fn(args, t, lang);
    return result;
  } catch (error) {
    console.error('Error ejecutando comando:', error);
    return {
      output: [`${t.responses.error}: ${cmd}`, t.responses.tryHelp],
    };
  }
}

// Función para autocompletar comandos
export function getAutocompleteSuggestions(input: string): string[] {
  const availableCommands = Object.keys(COMMANDS);
  return availableCommands.filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()));
}
