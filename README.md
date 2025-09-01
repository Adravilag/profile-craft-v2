# 🎨 ProfileCraft

**Una aplicación web moderna y completa para crear portafolios profesionales dinámicos**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFE62E)](https://vitejs.dev/)

---

## ✨ Características Principales

### 🎯 **Frontend Moderno**

- **React 19** con TypeScript para máxima seguridad de tipos
- **Vite** para desarrollo rápido y builds optimizados
- **Tailwind CSS 4** para estilos modernos y responsivos
- **React Router 7** para navegación SPA
- **Zustand** para gestión de estado global
- **React Query** para manejo de datos del servidor
- **i18next** para internacionalización completa

### 🚀 **Backend Robusto**

- **Node.js** con **Express.js** y TypeScript
- **MongoDB** con Mongoose para persistencia de datos
- **JWT** para autenticación segura
- **Multer** para gestión de archivos multimedia
- **bcryptjs** para hashing seguro de contraseñas
- **CORS** configurado para desarrollo y producción

### 🛡️ **Seguridad Avanzada**

- Autenticación JWT con cookies httpOnly
- Validación de entrada en todos los endpoints
- Hashing de contraseñas con salt
- Variables de entorno para configuración sensible
- Endpoints administrativos protegidos
- Auditoría de dependencias sin vulnerabilidades

### 🔧 **Herramientas de Desarrollo**

- **ESLint** + **Prettier** para calidad de código
- **Husky** + **lint-staged** para pre-commit hooks
- **Storybook** para desarrollo de componentes
- **Vitest** para testing unitario
- **TypeScript** strict mode en todo el proyecto

---

## 🏗️ Arquitectura del Proyecto

```
profile-craft/
├── 📁 app/
│   ├── 📁 front-end/          # Cliente React + Vite
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/ # Componentes reutilizables
│   │   │   ├── 📁 pages/      # Páginas de la aplicación
│   │   │   ├── 📁 hooks/      # Custom hooks
│   │   │   ├── 📁 services/   # Servicios y API calls
│   │   │   ├── 📁 utils/      # Utilidades y helpers
│   │   │   ├── 📁 types/      # Definiciones TypeScript
│   │   │   └── 📁 i18n/       # Traducciones
│   │   └── 📄 package.json
│   │
│   └── 📁 back-end/           # Servidor API REST
│       ├── 📁 src/
│       │   ├── 📁 controllers/ # Lógica de negocio
│       │   ├── 📁 models/      # Modelos de datos (Mongoose)
│       │   ├── 📁 routes/      # Rutas de la API
│       │   ├── 📁 middleware/  # Middleware personalizado
│       │   ├── 📁 config/      # Configuración
│       │   └── 📁 services/    # Servicios auxiliares
│       ├── 📁 tools/           # Herramientas de desarrollo
│       └── 📄 package.json
│
├── 📄 .env.example            # Variables de entorno de ejemplo
├── 📄 SECURITY.md             # Guía de seguridad
└── 📄 package.json            # Workspace principal
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** v18+
- **npm** v9+
- **MongoDB** v6+ (local o Atlas)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Adravilag/profile-craft.git
cd profile-craft
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias en todos los workspaces
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

#### Variables Obligatorias:

```env
# Seguridad
JWT_SECRET=tu-jwt-secret-de-64-caracteres-minimo
ADMIN_SECRET=tu-admin-secret-para-operaciones-sensibles

# Base de datos
MONGODB_URI=mongodb://localhost:27017/profilecraft

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Generar Secretos Seguros

```bash
# JWT Secret (64+ caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Admin Secret (32+ caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃‍♂️ Desarrollo

### Comandos Principales

```bash
# Desarrollo completo (frontend + backend)
npm run dev

# Solo frontend (puerto 5173)
npm run dev:frontend

# Solo backend (puerto 3000)
npm run dev:backend

# Build de producción
npm run build

# Verificación de tipos
npm run type-check

# Linting y formateo
npm run lint
npm run format
```

### URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Storybook**: http://localhost:6006

---

## 📊 Scripts Disponibles

### Workspace Principal

| Comando              | Descripción                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Inicia frontend y backend en paralelo |
| `npm run build`      | Build de producción para ambos        |
| `npm run type-check` | Verificación TypeScript completa      |
| `npm run lint`       | Linting en todos los workspaces       |
| `npm run format`     | Formateo con Prettier                 |
| `npm run clean`      | Limpia node_modules y builds          |

### Frontend (app/front-end)

| Comando             | Descripción                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Servidor de desarrollo Vite      |
| `npm run build`     | Build optimizado para producción |
| `npm run preview`   | Preview del build de producción  |
| `npm run storybook` | Inicia Storybook                 |
| `npm run test`      | Tests con Vitest                 |
| `npm run test:cov`  | Tests con coverage               |

### Backend (app/back-end)

| Comando               | Descripción                |
| --------------------- | -------------------------- |
| `npm run dev`         | Servidor con hot-reload    |
| `npm run build`       | Transpilación TypeScript   |
| `npm run start`       | Servidor de producción     |
| `npm run test:health` | Test de salud del servidor |

---

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Gestión de usuarios y autenticación
- **Profile**: Información personal del portafolio
- **Experience**: Experiencia laboral
- **Education**: Formación académica
- **Project**: Proyectos realizados
- **Skill**: Habilidades y competencias
- **Certification**: Certificaciones obtenidas
- **Testimonial**: Testimonios y recomendaciones

### Configuración MongoDB

```javascript
// Conexión automática con fallback
const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
mongoose.connect(mongoURI, {
  // Configuración optimizada
});
```

---

## 🔐 Seguridad

> ⚠️ **Importante**: Lee la [Guía de Seguridad](SECURITY.md) antes de desplegar en producción.

### Características de Seguridad

- ✅ **JWT tokens** con expiración y refresh
- ✅ **Cookies httpOnly** para almacenamiento seguro
- ✅ **bcrypt** para hashing de contraseñas
- ✅ **CORS** configurado correctamente
- ✅ **Validación de entrada** en todos los endpoints
- ✅ **Rate limiting** y protección DDoS
- ✅ **Headers de seguridad** implementados

### Checklist Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET único y seguro (64+ chars)
- [ ] HTTPS habilitado
- [ ] Endpoints debug deshabilitados
- [ ] Dependencias auditadas (`npm audit`)

---

## 🚀 Despliegue

### Preparación para Producción

```bash
# 1. Build de producción
npm run build

# 2. Verificar tipos
npm run type-check

# 3. Auditar seguridad
npm audit

# 4. Variables de entorno
export NODE_ENV=production
export JWT_SECRET=tu-jwt-secret-produccion
export MONGODB_URI=tu-mongodb-uri-produccion
```

### Plataformas Soportadas

- **Render**: Configuración automática incluida
- **Vercel**: Frontend optimizado para Edge
- **Railway**: Deploy con MongoDB Atlas
- **DigitalOcean**: VPS con Docker
- **AWS**: EC2 + RDS/DocumentDB

---

## 🧪 Testing

### Frontend Testing

```bash
# Tests unitarios
npm run test --workspace=app/front-end

# Tests con coverage
npm run test:cov --workspace=app/front-end

# Tests en modo UI
npm run test:ui --workspace=app/front-end
```

### API Testing

```bash
# Health check
npm run test:health --workspace=app/back-end

# Test de endpoints
npm run test:api --workspace=app/back-end
```

---

## 📖 Documentación Adicional

- [**Guía de Seguridad**](SECURITY.md) - Configuración de seguridad
- [**UI Inventory**](app/front-end/UI_INVENTORY.md) - Componentes disponibles
- [**Deploy Guide**](app/back-end/deploy/RENDER_DEPLOY.md) - Guía de despliegue

---

## 🤝 Contribución

### Configuración del Entorno

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Instalar dependencias: `npm install`
4. Configurar pre-commit hooks: `npm run prepare`

### Estándares de Código

- **TypeScript strict mode** obligatorio
- **ESLint + Prettier** configurados
- **Conventional Commits** para mensajes
- **Tests** para nuevas funcionalidades

### Proceso de PR

1. Asegurar que todos los tests pasan
2. Verificar type-check: `npm run type-check`
3. Ejecutar linting: `npm run lint`
4. Actualizar documentación si es necesario

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Adravilag/profile-craft/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/Adravilag/profile-craft/wiki)
- **Email**: tu-email@ejemplo.com

---

## 🎯 Roadmap

### v0.2.0 - Q4 2025

- [ ] Sistema de temas personalizable
- [ ] Export a PDF mejorado
- [ ] Integración con redes sociales
- [ ] Analytics de portafolio

### v0.3.0 - Q1 2026

- [ ] Editor drag & drop
- [ ] Templates predefinidos
- [ ] Colaboración en tiempo real
- [ ] PWA support

---

<div align="center">

**¡Construido con ❤️ y tecnologías modernas!**

[⭐ Dale una estrella si te gusta el proyecto](https://github.com/Adravilag/profile-craft)

</div>
