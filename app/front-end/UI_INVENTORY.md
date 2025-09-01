# UI Inventory — front-end

Fecha: 31-08-2025
Breve: Inventario automático de componentes y utilidades UI detectados en `src`.

## Resumen rápido

- Archivos escaneados: `front-end/src/**/*` (varios tests y stories incluidos).
- Resultado: muchos componentes UI ya existen en `src/components/ui` y `src/ui`.

## Componentes / utilidades reutilizables (prioridad alta)

- Theme / Contexts
  - `src/contexts/ThemeContext.tsx`
  - `src/contexts/UnifiedThemeContext.tsx`
  - `src/app/providers/providers.tsx`

- Primitives / Controls
  - Button: `src/components/ui/Button/Button.tsx` (+ tests, stories)
  - DateInput: `src/components/ui/DateInput/DateInput.tsx`
  - Dropdown: `src/components/ui/Dropdown/Dropdown.tsx`
  - LoadingSpinner: `src/components/ui/LoadingSpinner/LoadingSpinner.tsx` (+stories/tests)
  - Toast: `src/components/ui/Toast/Toast.tsx`
  - ModalShell / Modal: `src/components/ui/Modal/ModalShell.tsx`, `src/components/ui/Modal/TestimonialModal.tsx`
  - FloatingActionButtonGroup & FAB: `src/components/ui/FloatingActionButtonGroup/*`

- Images / Media
  - OptimizedImage util: `src/utils/OptimizedImage/index.tsx`
  - MediaUploader (admin): `src/components/admin/MediaUploader/MediaUploader.tsx`

- Layout / Shell
  - Footer: `src/components/layout/Footer/Footer.tsx` + `Footer.module.css`
  - RootLayout: `src/components/layout/RootLayout/RootLayout.tsx`
  - Navigation / SmartNavigation: `src/components/layout/Navigation/*`

- Domain components (good candidates to generalize)
  - SkillPill, SkillBadge, SkillCard: `src/components/shared/SkillPill.tsx`, `src/components/common/SkillBadge/SkillBadge.tsx`, `src/features/skills/...`
  - HighlightCard, ProjectCard (cards under features/sections)
  - Testimonial modal & form

- Utilities / UX helpers
  - Modal portal, focus management and ModalShell (already robust)
  - Accessibility utils: `src/utils/accessibilityUtils.ts`
  - Skeletons / spinners (LoadingSpinner)

## Observaciones

- Muchas piezas ya tienen tests and stories (good). Eg. Button, Modal, LoadingSpinner.
- Existe un `src/ui/index.tsx` que re-exporta `Footer` y algunas cosas; conviene centralizar ahí todos los componentes públicos.
- CSS modules widely used (`*.module.css`). Consider centralizing tokens in `src/ui/theme/tokens.ts` and using CSS variables.

## Sugerencia de organización (mínima, incremental)

- `src/ui/` (package entry)
  - `theme/` (tokens.ts, ThemeProvider)
  - `primitives/` (Button, Input, Icon, Image)
  - `components/` (Card, ProjectCard, SkillPill)
  - `layout/` (Footer, RootLayout, Navigation)
  - `feedback/` (Modal, Toast, Spinner)
  - `index.tsx` (re-exports públicos)

## Acciones recomendadas (priorizadas)

1. Centralizar exports en `src/ui/index.tsx` (hacer más recursos "public API").
2. Implementar tokens de tema (`src/ui/theme/tokens.ts`) y migrar variables comunes.
3. Extraer/normalizar `Icon` wrapper para SVGs.
4. Revisar y documentar Button variants (ya existe) y usarla en todos los botones del proyecto.
5. Añadir un pequeño README y plantillas de Storybook.

## Próximos pasos que puedo ejecutar ahora

- A) Crear este archivo de inventario (hecho).
- B) Consolidar exportes en `src/ui/index.tsx` (edición automática).
- C) Crear `src/ui/theme/tokens.ts` y un `Button` demo que use tokens.
- D) Generar una PR-snapshot / lista de archivos que importan `Button` para migración.

Dime cuál quieres que haga a continuación (B/C/D) o indícame otra acción y la empiezo.
