---
applyTo: 'src/styles/**'
---

# Sistema de Estilos y Diseño UI - Profile Craft

## 🎨 Filosofía de Diseño

**Principios Fundamentales:**

- **Design Token System** → Variables CSS centralizadas
- **Arquitectura Modular** → ITCSS + BEM híbrido
- **Mobile First** → Responsive por defecto
- **Accesibilidad** → WCAG 2.1 AA compliance
- **Performance** → CSS optimizado y lazy loading
- **Consistencia** → Reutilización de patrones y componentes

## 📁 Estructura de Archivos

```
src/styles/
├── 01-foundations/       # Base: reset, typography
├── 02-utilities/         # Utilities: spacing, colors, animations
├── 03-components/        # Components: modals, forms, layout
├── 04-features/          # Features: sections específicas
├── 05-optimizations/     # Optimizations: performance, purge
├── main.css             # Entry point - imports ordenados
├── variables.css        # Design tokens centralizados
└── terminal-tokens.css  # Tokens específicos para terminal
```

## 🏗️ Arquitectura CSS - ITCSS Adaptado

### 1. **01-foundations/** - Fundamentos

```css
/* reset.css - Normalización cross-browser */
/* typography.css - Sistema tipográfico */
```

### 2. **02-utilities/** - Utilidades

```css
/* spacing.css - Sistema de espaciado */
/* colors.css - Paleta de colores */
/* animations.css - Animaciones reutilizables */
/* special-effects.css - Efectos avanzados */
```

### 3. **03-components/** - Componentes

```css
/* modal.css - Sistema de modales */
/* forms.css - Formularios base */
/* layout.css - Grids y layouts */
/* interactive-elements.css - Botones, links */
```

### 4. **04-features/** - Características

```css
/* Estilos específicos por sección */
/* header.css, about.css, skills.css, etc. */
```

## 🎯 Design Token System

### **Variables Principales** (`variables.css`)

#### **🎨 Colores del Sistema**

```css
:root {
  /* === COLOR PALETTE === */
  /* Primary - Azul tecnológico */
  --color-accent: #58a6ff;
  --color-accent-button: #1f6feb;

  /* Backgrounds - Dark theme optimized */
  --bg-primary: #0d1117; /* Deep dark base */
  --bg-secondary: #161b22; /* Elevated surface */
  --bg-tertiary: #21262d; /* Input fields */
  --bg-elevated: #30363d; /* Cards and modals */

  /* Text colors - High contrast */
  --text-primary: #f0f6fc; /* Main text */
  --text-secondary: #8b949e; /* Secondary text */
  --text-muted: #7d8590; /* Muted text */

  /* Borders - Subtle definition */
  --border-primary: #30363d; /* Main borders */
  --border-accent: #58a6ff; /* Interactive borders */
}
```

#### **📏 Sistema de Espaciado**

```css
:root {
  /* === SPACING SCALE === */
  --space-1: 4px; /* xs */
  --space-2: 8px; /* sm */
  --space-4: 16px; /* md */
  --space-6: 24px; /* lg */
  --space-8: 32px; /* xl */
  --space-10: 40px; /* 2xl */
}
```

#### **🔤 Sistema Tipográfico**

```css
:root {
  /* === TYPOGRAPHY === */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Poppins', 'Inter', sans-serif;

  /* Font sizes - Responsive clamp */
  --text-xs: clamp(10px, 0.625rem + 0.1vw, 11px);
  --text-sm: clamp(11px, 0.75rem + 0.1vw, 12px);
  --text-base: clamp(13px, 0.875rem + 0.15vw, 14px);
  --text-lg: clamp(15px, 1rem + 0.2vw, 16px);

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

#### **🎭 Animaciones y Efectos**

```css
:root {
  /* === ANIMATIONS === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;

  /* Easing curves */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
}
```

## 🎨 Convenciones de Naming - BEM Methodology

### **Estructura BEM**

```css
/* Block */
.component {
}

/* Element */
.component__element {
}
.component__header {
}
.component__content {
}
.component__footer {
}

/* Modifier */
.component--variant {
}
.component__element--state {
}
```

### **Ejemplo Práctico: About Modal**

```css
/* ✅ CORRECTO - Ejemplo real del proyecto */
.about-modal {
} /* Block */
.about-modal__tabs {
} /* Element */
.about-modal__tab {
} /* Element */
.about-modal__tab--active {
} /* Modifier */
.about-modal__highlights-section {
} /* Element */
.about-modal__highlight-item {
} /* Element */
.about-modal__action-button--edit {
} /* Element + Modifier */
```

### **❌ Evitar - Anti-patrones**

```css
/* ❌ INCORRECTO */
.aboutModal {
} /* camelCase */
.about-modal-tab-active {
} /* No BEM structure */
.modal .tab.active {
} /* Nested selectors */
```

## 📱 Responsive Design Strategy

### **Mobile First Approach**

```css
/* ✅ Base styles - mobile (siguiendo el sistema actual) */
.component {
  padding: var(--space-2);
  font-size: var(--text-sm);
}

/* ✅ Tablet - 768px+ */
@media (min-width: 768px) {
  .component {
    padding: var(--space-4);
    font-size: var(--text-base);
  }
}

/* ✅ Desktop - 1024px+ */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
}
```

### **Breakpoints del Sistema**

```css
/* Usar estos valores exactos */
@media (min-width: 768px) {
  /* Tablet */
}
@media (min-width: 1024px) {
  /* Desktop */
}
@media (max-width: 640px) {
  /* Mobile adjustments */
}
```

## 🎭 Sistema de Animaciones

### **Performance-First Animations**

```css
/* ✅ Usar solo propiedades que no causan reflow */
.animation-fade {
  transition: opacity var(--duration-normal) var(--ease-in-out);
}

.animation-slide {
  transition: transform var(--duration-normal) var(--ease-in-out);
}

/* ✅ Animaciones de entrada suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(var(--space-1));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🏗️ Patrones de Componentes Probados

### **Modal System - Patrón validado**

```css
/* Basado en AboutModal exitoso */
.modal__tabs {
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: var(--space-6);
}

.modal__tab-nav {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.modal__tab {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.modal__tab--active {
  background-color: var(--color-accent-button);
  color: var(--text-primary);
}
```

### **Form System - Patrón validado**

```css
.form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.form__input {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transition: border-color var(--duration-fast);
}

.form__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--border-accent);
}
```

## 🚀 Workflow y Mejores Prácticas

### **✅ Proceso Validado - TDD + CSS**

1. **Análisis del Componente**

   ```bash
   # Identificar: ¿Qué tipo de componente es?
   # Modal, Form, List, Card, Navigation, etc.
   ```

2. **Crear Archivo CSS Feature**

   ```bash
   # Ubicación: src/styles/04-features/component-name.css
   # Naming: kebab-case matching component name
   ```

3. **Estructura BEM Desde el Inicio**

   ```css
   /* Block base */
   .component-name {
   }

   /* Elements principales */
   .component-name__header {
   }
   .component-name__content {
   }
   .component-name__footer {
   }

   /* States y modifiers */
   .component-name--loading {
   }
   .component-name__button--primary {
   }
   ```

4. **Importar en index.css**

   ```css
   /* src/styles/04-features/index.css */
   @import url('./component-name.css');
   ```

5. **Aplicar Clases en JSX**

   ```tsx
   // ✅ CORRECTO
   <div className="about-modal__tabs">
     <nav className="about-modal__tab-nav">
       <button className={`about-modal__tab ${active ? 'about-modal__tab--active' : ''}`}>

   // ❌ INCORRECTO - estilos inline
   <div style={{ borderBottom: '1px solid #eee' }}>
   ```

### **🧪 Testing de Estilos**

```tsx
// ✅ Test de clases CSS aplicadas
expect(container.querySelector('.about-modal__tabs')).toBeInTheDocument();
expect(activeTab).toHaveClass('about-modal__tab--active');
```

### **📁 Organización de Archivos**

```
component/
├── Component.tsx          # Lógica del componente
├── Component.test.tsx     # Tests unitarios
└── styles referenced →    # CSS en /styles/04-features/
```

## ⚡ Performance Guidelines

### **CSS Optimization - Aplicado**

- ✅ Evitar selectores complejos (`> * + * > .class`)
- ✅ Usar variables CSS para todos los valores
- ✅ Animaciones solo con `transform`/`opacity`
- ✅ Mobile-first responsive design

### **Lazy Loading de Estilos**

```css
/* Critical: variables + reset */
/* Lazy: features específicas */
```

## 🎯 Componentes Específicos

### **Modal System - Casos de Uso**

```css
/* Base modal - reutilizable */
.modal__overlay {
}
.modal__container {
}
.modal__header {
}
.modal__content {
}
.modal__footer {
}

/* Variants específicos */
.modal--small {
}
.modal--large {
}
.modal--fullscreen {
}
```

### **Interactive Elements**

```css
/* Buttons siguiendo el sistema */
.button {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.button--primary {
  background-color: var(--color-accent-button);
  color: var(--text-primary);
}

.button--secondary {
  background-color: var(--bg-elevated);
  border: 1px solid var(--border-primary);
}
```

## 📋 Checklist para Nuevos Componentes

### **Pre-implementación**

- [ ] ¿Existe un patrón similar en el sistema?
- [ ] ¿Qué variables de diseño necesito?
- [ ] ¿Cuáles son los estados (hover, focus, active, disabled)?
- [ ] ¿Es responsive por defecto?

### **Durante implementación**

- [ ] ✅ Usa design tokens (no magic numbers)
- [ ] ✅ Sigue nomenclatura BEM estricta
- [ ] ✅ Mobile-first responsive
- [ ] ✅ Animaciones con `transform`/`opacity`
- [ ] ✅ Estados de accesibilidad (focus, aria)

### **Post-implementación**

- [ ] ✅ CSS importado en index.css
- [ ] ✅ Tests verifican clases aplicadas
- [ ] ✅ Documentado en Storybook
- [ ] ✅ Performance validado (no reflow)

## 🔧 Tools & Workflow Validado

### **Development Stack**

- **PostCSS** → Transformaciones automáticas
- **Stylelint** → Linting y consistencia
- **Variables CSS** → Design tokens
- **BEM Linter** → Naming validation

### **Build Process**

- **Critical CSS** → Above-the-fold optimization
- **PurgeCSS** → Eliminación de CSS no usado
- **Minificación** → Compresión automática

## 🚨 Anti-patrones Identificados

### **❌ Evitar - Problemas reales encontrados**

```css
/* ❌ Magic numbers */
margin: 15px;
padding: 23px;

/* ✅ Design tokens */
margin: var(--space-4);
padding: var(--space-6);
```

```css
/* ❌ Selectores complejos */
.modal .content .tab.active > button {

/* ✅ BEM específico */
.modal__tab--active {
```

```tsx
// ❌ Estilos inline
<div style={{ borderBottom: '1px solid #eee' }}>

// ✅ Clases CSS
<div className="about-modal__tabs">
```

## 🎖️ Casos de Éxito

### **AboutModal - Patrón de Referencia**

- ✅ **422 líneas CSS** organizadas y mantenibles
- ✅ **BEM consistency** en todas las clases
- ✅ **Design tokens** aplicados consistentemente
- ✅ **Responsive design** mobile-first
- ✅ **Performance optimized** animations
- ✅ **Accessibility compliant** focus states

**Resultado:** Componente escalable, mantenible y performante que sigue todos los estándares del sistema.

---

**💡 Principio Fundamental:** Cada decisión de diseño debe estar basada en el sistema de tokens, ser consistente con los patrones existentes, y priorizando performance y accesibilidad.

## 🎨 Convenciones de Naming

### **BEM Methodology**

```css
/* Block */
.modal {
}

/* Element */
.modal__header {
}
.modal__content {
}
.modal__footer {
}

/* Modifier */
.modal--large {
}
.modal--error {
}
.modal__button--primary {
}
```

### **Utility Classes**

```css
/* Spacing */
.mt-sm {
  margin-top: var(--space-sm);
}
.p-md {
  padding: var(--space-md);
}

/* Colors */
.text-primary {
  color: var(--color-primary-500);
}
.bg-surface {
  background-color: var(--color-surface);
}

/* Typography */
.text-lg {
  font-size: var(--text-lg);
}
.font-semibold {
  font-weight: var(--font-weight-semibold);
}
```

## 📱 Responsive Design Strategy

### **Mobile First Approach**

```css
/* Base styles - mobile */
.component {
  padding: var(--space-sm);
  font-size: var(--text-base);
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: var(--space-md);
    font-size: var(--text-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-lg);
    font-size: var(--text-xl);
  }
}
```

### **Breakpoint System**

```css
/* Utilizables como mixins o clases */
@media (min-width: var(--bp-sm)) {
  /* 640px+ */
}
@media (min-width: var(--bp-md)) {
  /* 768px+ */
}
@media (min-width: var(--bp-lg)) {
  /* 1024px+ */
}
@media (min-width: var(--bp-xl)) {
  /* 1280px+ */
}
```

## 🎭 Sistema de Animaciones

### **Performance-First Animations**

```css
/* Usar solo propiedades que no causan reflow */
.animation-fade {
  transition: opacity var(--duration-normal) var(--easing-smooth);
}

.animation-slide {
  transition: transform var(--duration-normal) var(--easing-smooth);
}

/* Variables de timing */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### **Animaciones Complejas**

```css
/* Para efectos especiales */
@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
```

## 🎯 Componentes Específicos

### **Modal System**

```css
/* Base modal */
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background-color: var(--color-overlay);
}

.modal__content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
}
```

### **Form System**

```css
/* Input base */
.input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
```

## 🚀 Mejores Prácticas

### **✅ Hacer**

- Usar design tokens para todos los valores
- Mobile-first responsive design
- BEM para naming consistente
- Animaciones con `transform` y `opacity`
- Clases utilitarias para espaciado común
- CSS custom properties para temas

### **❌ Evitar**

- Magic numbers (usar variables)
- `!important` (excepto overrides necesarios)
- Selectores muy específicos
- Animaciones que causen reflow
- Estilos inline en React
- Dependencias CSS externas innecesarias

## 🎨 Color System

### **Paleta Principal**

```css
:root {
  /* Primary - Azul tecnológico */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* Neutral - Grises balanceados */
  --color-neutral-50: #f9fafb;
  --color-neutral-500: #6b7280;
  --color-neutral-900: #111827;

  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### **Dark Mode Support**

```css
/* Solo modo oscuro - no hay modo claro */
:root {
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text: var(--color-neutral-100);
}
```

## 📊 Performance Guidelines

### **CSS Optimization**

- Evitar selectores complejos (`> * + * > .class`)
- Minimizar especificidad
- Usar `will-change` solo cuando necesario
- Lazy load de estilos no críticos

### **Critical CSS**

```css
/* Inline en el HTML */
/* Solo estilos above-the-fold */
/* Variables más importantes */
/* Reset mínimo */
```

## 🧪 Testing CSS

### **Visual Regression Testing**

- Storybook para components aislados
- Chromatic para visual testing
- Responsive testing en múltiples breakpoints

### **Accessibility Testing**

- Contraste de colores WCAG AA
- Focus indicators visibles
- Texto legible en zoom 200%

## 📋 Checklist para Nuevos Estilos

- [ ] ¿Usa design tokens en lugar de valores hardcoded?
- [ ] ¿Sigue la nomenclatura BEM?
- [ ] ¿Es responsive (mobile-first)?
- [ ] ¿Las animaciones usan `transform`/`opacity`?
- [ ] ¿Tiene soporte para dark mode?
- [ ] ¿Cumple requisitos de accesibilidad?
- [ ] ¿Está documentado en Storybook?

## 🔧 Tools & Workflow

### **Development**

- PostCSS para transformaciones
- Stylelint para linting
- Prettier para formatting
- CSS Modules si necesario

### **Build**

- PurgeCSS para optimización
- Critical CSS extraction
- Minificación automática

---

**💡 Recuerda:** La consistencia es clave. Cada decisión de diseño debe estar justificada y documentada.

## Retroalimentación práctica para Sistema de Estilos y Diseño UI

- Control de scroll en modales: preferir `max-height` + `overflow-y: auto` en regiones internas (p. ej. paneles de tabs, listas). Evitar aplicar `overflow` en el contenedor global del modal para prevenir doble-scroll y problemas en móvil.
- Tokens y variables: documentar variables CSS clave (colores, spacing, tipografía, max-width) y eliminar variables huérfanas; mantener un contrato claro sobre cuándo usar `--token-` global versus variables locales del componente.
- Props visuales para componentes: estandarizar y documentar las props aceptadas para componentes de layout (ej.: `width`, `maxWidth`, `height`, `maxHeight`, `minWidth`). Recomendación: preferir `maxWidth` sobre `width` en modales para mejorar responsividad.
- Accesibilidad y reducción de movimiento:
  - Implementar `prefers-reduced-motion` para animaciones no esenciales.
  - Añadir reglas `:focus-visible` y roles/aria explícitos en patrones (tabs => `role="tablist"/role="tab"`, modals => `role="dialog"` y `aria-modal="true"`).
- Testing / depuración (snippet para pegar en guía de tests):

```js
// Dentro del test: esperar a que el loader desaparezca y depurar DOM
await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
screen.debug(); // o console.log(container.innerHTML)
```

- Normas de proceso breves:
  - Cada cambio de comportamiento debe venir con test asociado y commit separado: `test -> implement -> refactor`.
  - Si un test cambia por un motivo legítimo (contrato de la API/data), documentar el porqué en el PR.
