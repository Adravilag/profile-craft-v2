// Mapeo de emisores de certificaciones con información automática
export interface CertificationIssuer {
  id: string;
  name: string;
  logoUrl: string;
  verifyBaseUrl?: string;
  certificateImageUrl?: string; // Nueva propiedad para URLs específicas de imágenes de certificados
  category:
    | 'cloud'
    | 'programming'
    | 'database'
    | 'security'
    | 'design'
    | 'project-management'
    | 'other';
  description?: string;
}

export const CERTIFICATION_ISSUERS: CertificationIssuer[] = [
  // Cloud Providers
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    logoUrl: '/assets/images/certification-logos/aws.svg',
    verifyBaseUrl: 'https://www.credly.com/badges/',
    category: 'cloud',
    description: 'Certificaciones de servicios en la nube de Amazon',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Azure',
    logoUrl: '/assets/images/certification-logos/microsoft.svg',
    verifyBaseUrl: 'https://learn.microsoft.com/en-us/users/',
    category: 'cloud',
    description: 'Certificaciones de Microsoft Azure y tecnologías relacionadas',
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud Platform',
    logoUrl: '/assets/images/certification-logos/google-cloud.svg',
    verifyBaseUrl: 'https://www.credential.net/profile/',
    category: 'cloud',
    description: 'Certificaciones de Google Cloud Platform',
  },
  {
    id: 'sololearn',
    name: 'SoloLearn',
    logoUrl: '/assets/images/certification-logos/sololearn.png',
    verifyBaseUrl: 'https://www.sololearn.com/certificates/',
    certificateImageUrl: 'https://api2.sololearn.com/v2/certificates/{credentialId}/image/pdf',
    category: 'programming',
    description: 'Certificaciones de programación y desarrollo web',
  },
  {
    id: 'codecademy',
    name: 'Codecademy',
    logoUrl: '/assets/images/certification-logos/codecademy.svg',
    verifyBaseUrl: 'https://www.codecademy.com/profiles/',
    category: 'programming',
    description: 'Certificaciones de programación y ciencias de datos',
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    logoUrl: '/assets/images/certification-logos/freecodecamp.svg',
    verifyBaseUrl: 'https://www.freecodecamp.org/certification/',
    category: 'programming',
    description: 'Certificaciones gratuitas de desarrollo web y programación',
  },
  {
    id: 'udemy',
    name: 'Udemy',
    logoUrl: '/assets/images/certification-logos/udemy.svg',
    verifyBaseUrl: 'https://www.udemy.com/certificate/',
    category: 'programming',
    description: 'Certificaciones de cursos en línea',
  },
  {
    id: 'coursera',
    name: 'Coursera',
    logoUrl: '/assets/images/certification-logos/coursera.svg',
    verifyBaseUrl: 'https://www.coursera.org/account/accomplishments/certificate/',
    category: 'programming',
    description: 'Certificaciones universitarias y profesionales',
  },

  // Database
  {
    id: 'oracle',
    name: 'Oracle',
    logoUrl: '/assets/images/certifications/oracle-logo.png',
    verifyBaseUrl: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=',
    category: 'database',
    description: 'Certificaciones de Oracle Database y tecnologías Java',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    logoUrl: '/assets/images/certifications/mongodb-logo.png',
    verifyBaseUrl: 'https://university.mongodb.com/certification/verify/',
    category: 'database',
    description: 'Certificaciones de MongoDB y NoSQL',
  },

  // Security
  {
    id: 'cisco',
    name: 'Cisco',
    logoUrl: '/assets/images/certifications/cisco-logo.png',
    verifyBaseUrl:
      'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/verify.html',
    category: 'security',
    description: 'Certificaciones de redes y ciberseguridad',
  },
  {
    id: 'comptia',
    name: 'CompTIA',
    logoUrl: '/assets/images/certifications/comptia-logo.png',
    verifyBaseUrl: 'https://www.certmetrics.com/comptia/public/verification.aspx',
    category: 'security',
    description: 'Certificaciones de TI y ciberseguridad',
  },

  // Design
  {
    id: 'adobe',
    name: 'Adobe',
    logoUrl: '/assets/images/certifications/adobe-logo.png',
    verifyBaseUrl: 'https://www.adobe.com/training/certification/verification.html',
    category: 'design',
    description: 'Certificaciones de diseño gráfico y multimedia',
  },
  {
    id: 'figma',
    name: 'Figma',
    logoUrl: '/assets/images/certifications/figma-logo.png',
    category: 'design',
    description: 'Certificaciones de diseño UX/UI',
  },

  // Project Management
  {
    id: 'pmi',
    name: 'Project Management Institute (PMI)',
    logoUrl: '/assets/images/certifications/pmi-logo.png',
    verifyBaseUrl: 'https://www.pmi.org/certifications/certification-registry',
    category: 'project-management',
    description: 'Certificaciones de gestión de proyectos',
  },
  {
    id: 'scrum',
    name: 'Scrum.org',
    logoUrl: '/assets/images/certifications/scrum-logo.png',
    verifyBaseUrl: 'https://www.scrum.org/user/',
    category: 'project-management',
    description: 'Certificaciones de metodologías ágiles y Scrum',
  },
  // Others
  {
    id: 'linkedin',
    name: 'LinkedIn Learning',
    logoUrl: '/assets/images/certification-logos/linkedin.svg',
    verifyBaseUrl: 'https://www.linkedin.com/learning/certificates/',
    category: 'other',
    description: 'Certificaciones profesionales de LinkedIn',
  },
  {
    id: 'edx',
    name: 'edX',
    logoUrl: '/assets/images/certifications/edx-logo.png',
    verifyBaseUrl: 'https://courses.edx.org/certificates/',
    category: 'other',
    description: 'Certificaciones universitarias en línea',
  },
  {
    id: 'platzi',
    name: 'Platzi',
    logoUrl: '/assets/images/certifications/platzi-logo.png',
    verifyBaseUrl: 'https://platzi.com/p/',
    category: 'programming',
    description: 'Certificaciones de tecnología en español',
  },
  {
    id: 'midudev',
    name: 'MiduDev',
    logoUrl: '/assets/images/certification-logos/midudev.svg',
    verifyBaseUrl: 'https://certificados.midudev.com/',
    certificateImageUrl: 'https://certificados.midudev.com/{credentialId}.pdf',
    category: 'programming',
    description: 'Certificaciones de desarrollo web moderno y JavaScript',
  },
];

// Función auxiliar para buscar emisor por ID
export const findIssuerById = (id: string): CertificationIssuer | undefined => {
  return CERTIFICATION_ISSUERS.find(issuer => issuer.id === id);
};

// Función auxiliar para buscar emisor por nombre (aproximado)
export const findIssuerByName = (name: string): CertificationIssuer | undefined => {
  const lowerName = name.toLowerCase();
  return CERTIFICATION_ISSUERS.find(
    issuer =>
      issuer.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(issuer.name.toLowerCase()) ||
      issuer.id === lowerName
  );
};

// Función para generar URL de verificación completa
export const generateVerifyUrl = (
  issuer: CertificationIssuer,
  credentialId: string
): string | undefined => {
  if (!issuer.verifyBaseUrl || !credentialId) return undefined;
  // Algunas plataformas exponen la verificación en una URL base + id (sin .pdf)
  // Para imágenes/descargas específicas se usa `certificateImageUrl` con sufijo si aplica.
  return `${issuer.verifyBaseUrl}${credentialId}`;
};

// Función para generar URL de imagen del certificado
export const generateCertificateImageUrl = (
  issuer: CertificationIssuer,
  credentialId: string
): string | undefined => {
  if (!issuer.certificateImageUrl || !credentialId) return undefined;
  const result = issuer.certificateImageUrl.replace('{credentialId}', credentialId);

  // Debug log para MiduDev
  if (issuer.id === 'midudev') {
    console.log('🐛 generateCertificateImageUrl DEBUG:', {
      issuer: issuer.id,
      template: issuer.certificateImageUrl,
      credentialId,
      result,
      endsWithPdf: result.endsWith('.pdf'),
    });
  }

  return result;
};

// Función para validar formato de credencial según el emisor
export const validateCredentialId = (
  issuer: CertificationIssuer,
  credentialId: string
): boolean => {
  if (!credentialId || !credentialId.trim()) return false;

  const cleanId = credentialId.trim();

  // Validaciones específicas por emisor
  switch (issuer.id) {
    case 'aws':
      // AWS: alfanumérico, 8-50 caracteres
      return /^[A-Za-z0-9-]{8,50}$/.test(cleanId);

    case 'microsoft':
      // Microsoft: formato específico con guiones
      return /^[A-Za-z0-9-]{10,40}$/.test(cleanId);

    case 'google-cloud':
      // Google Cloud: alfanumérico, 10-40 caracteres
      return /^[A-Za-z0-9-]{10,40}$/.test(cleanId);

    case 'sololearn':
      // SoloLearn: formato CT-XXXXXXXXX
      return /^CT-[A-Z0-9]{6,20}$/.test(cleanId);

    case 'codecademy':
      // Codecademy: alfanumérico, 6-30 caracteres
      return /^[A-Za-z0-9]{6,30}$/.test(cleanId);

    case 'freecodecamp':
      // freeCodeCamp: username/certification-name
      return /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(cleanId);

    case 'udemy':
      // Udemy: código alfanumérico largo
      return /^[A-Z0-9]{10,30}$/.test(cleanId);

    case 'coursera':
      // Coursera: alfanumérico con posibles guiones
      return /^[A-Za-z0-9-]{10,40}$/.test(cleanId);

    case 'oracle':
      // Oracle: formato específico
      return /^[A-Z0-9]{8,25}$/.test(cleanId);

    case 'mongodb':
      // MongoDB: alfanumérico
      return /^[A-Za-z0-9]{8,30}$/.test(cleanId);

    case 'cisco':
      // Cisco: formato específico
      return /^[A-Z0-9]{10,25}$/.test(cleanId);

    case 'comptia':
      // CompTIA: formato específico
      return /^[A-Z0-9]{8,20}$/.test(cleanId);

    case 'linkedin':
      // LinkedIn: alfanumérico
      return /^[A-Za-z0-9]{8,40}$/.test(cleanId);

    case 'platzi':
      // Platzi: username/certificado
      return /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(cleanId);

    case 'midudev':
      // MiduDev: formato hexadecimal de 24 caracteres (ObjectId de MongoDB)
      return /^[a-f0-9]{24}$/.test(cleanId);

    default:
      // Validación general: al menos 6 caracteres alfanuméricos
      return /^[A-Za-z0-9-_]{6,50}$/.test(cleanId);
  }
};

// Función para obtener ejemplos de formato de credencial
export const getCredentialExample = (issuer: CertificationIssuer): string => {
  switch (issuer.id) {
    case 'aws':
      return 'Ej: ABC123DEF456';
    case 'microsoft':
      return 'Ej: MC-123456-789';
    case 'google-cloud':
      return 'Ej: GCP123456789';
    case 'sololearn':
      return 'Ej: CT-SBWD5KGG';
    case 'codecademy':
      return 'Ej: ABC123XYZ789';
    case 'freecodecamp':
      return 'Ej: usuario/responsive-web-design';
    case 'udemy':
      return 'Ej: UC-12345678';
    case 'coursera':
      return 'Ej: ABCD1234EFGH';
    case 'oracle':
      return 'Ej: 1Z0-123456';
    case 'mongodb':
      return 'Ej: MDB123456';
    case 'cisco':
      return 'Ej: CSCO12345678';
    case 'comptia':
      return 'Ej: COMP123456';
    case 'linkedin':
      return 'Ej: AaBbCcDdEeFf';
    case 'platzi':
      return 'Ej: usuario/certificado-react';
    case 'midudev':
      return 'Ej: 66b2ab03a4a4d5c8e7894c23';
    default:
      return 'Ej: ABC123XYZ789';
  }
};

// Categorías para filtrado
export const ISSUER_CATEGORIES = [
  { id: 'all', name: 'Todas las categorías' },
  { id: 'cloud', name: 'Cloud Computing' },
  { id: 'programming', name: 'Programación' },
  { id: 'database', name: 'Bases de Datos' },
  { id: 'security', name: 'Ciberseguridad' },
  { id: 'design', name: 'Diseño' },
  { id: 'project-management', name: 'Gestión de Proyectos' },
  { id: 'other', name: 'Otros' },
] as const;
