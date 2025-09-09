# Profile Craft - Frontend

Frontend de Profile Craft desarrollado con React, Vite y TypeScript.

## ✨ Características

- **Tema oscuro único**: Solo modo oscuro, optimizado para desarrolladores
- **Arquitectura modular**: Componentes reutilizables y escalables
- **Design System**: Sistema de tokens CSS centralizado
- **TypeScript**: Tipado estático para mejor desarrollo
- **Testing**: Jest y React Testing Library
- **Performance**: Optimizado con Vite y lazy loading

## 🎨 Sistema de Temas

**⚠️ IMPORTANTE**: Este proyecto usa únicamente **modo oscuro**. No hay modo claro disponible.

- **Tema predeterminado**: Dark theme
- **Variables CSS**: Sistema de design tokens centralizado
- **Arquitectura**: CSS Modules + BEM methodology

## Scripts principales

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run preview`: Previsualiza la aplicación compilada.
- `npm run test`: Ejecuta las pruebas unitarias.
- `npm run test:watch`: Ejecuta las pruebas en modo watch.

## Estructura recomendada

```
src/
├── components/          # Componentes reutilizables
├── contexts/           # Contextos de React (temas, etc.)
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
├── services/           # Servicios y APIs
├── styles/             # Sistema de estilos CSS
│   ├── 01-foundations/ # Base: reset, typography
│   ├── 02-utilities/   # Utilities: spacing, colors
│   ├── 03-components/  # Components: modals, forms
│   ├── 04-features/    # Features: secciones específicas
│   └── variables.css   # Design tokens
├── types/              # Definiciones de tipos TypeScript
└── utils/              # Utilidades generales
```

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

## 🎯 Guías de Desarrollo

### Componentes

- Usar CSS Modules para estilos
- Nomenclatura BEM para clases CSS
- TypeScript para tipado
- Props interfaces bien definidas

### Estilos

- Solo variables CSS del design system
- Mobile-first responsive design
- Animaciones con `transform`/`opacity`
- Dark theme único (no light mode)

### Testing

- Jest + React Testing Library
- Tests unitarios para componentes
- Tests de integración para flujos

## 📦 Dependencias principales

- **React 18**: Biblioteca principal
- **Vite**: Build tool y dev server
- **TypeScript**: Tipado estático
- **Jest**: Testing framework
- **PostCSS**: Procesamiento de CSS

## 🔧 Configuración

### Variables de entorno

```env
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
```

### VS Code

Extensiones recomendadas:

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- CSS Modules
- Jest

---

**💡 Nota**: Este proyecto está optimizado para modo oscuro únicamente. Todos los estilos y componentes están diseñados con este tema en mente.
