# ProfileHero Hooks Refactoring

## Resumen

Se ha completado la refactorización del componente `ProfileHero` extrayendo su lógica en 8 hooks especializados para mejorar la organización del código y la separación de responsabilidades.

## Hooks Creados

### 1. `useProfileData.ts`

- **Propósito**: Gestión de datos del perfil de usuario
- **Funcionalidades**:
  - Carga de datos del perfil desde la API
  - Autenticación con patrón
  - Estados de carga y error
  - Validación de patrón de seguridad

### 2. `useProfileStats.ts`

- **Propósito**: Cálculo de estadísticas del perfil
- **Funcionalidades**:
  - Conteo de proyectos
  - Conteo de certificaciones
  - Cálculo de años de experiencia
  - Estados de carga para cada tipo de dato

### 3. `useWidgetManager.tsx`

- **Propósito**: Gestión de widgets interactivos
- **Funcionalidades**:
  - Control del widget activo (terminal, video, projects)
  - Mensajes de ayuda contextuales
  - Switching entre diferentes widgets

### 4. `useAuthState.ts`

- **Propósito**: Estado de autenticación
- **Funcionalidades**:
  - Control de visibilidad del modal de patrón
  - Gestión de errores de autenticación
  - Funciones de reset y manejo de éxito/error

### 5. `useLanguage.ts`

- **Propósito**: Gestión de idiomas
- **Funcionalidades**:
  - Cambio de idioma
  - Verificación de idiomas disponibles
  - Integración con react-i18next

### 6. `useThemeManager.ts`

- **Propósito**: Gestión de temas
- **Funcionalidades**:
  - Cambio de tema (light, dark, sepia, auto)
  - Iconos y etiquetas según el tema
  - Integración con ThemeContext

### 7. `useTypingRotator.ts`

- **Propósito**: Efecto de escritura rotativa
- **Funcionalidades**:
  - Animación de escritura de texto
  - Rotación entre múltiples textos
  - Control de velocidades de escritura/borrado
  - Pausas configurables

### 8. `useSkills.ts`

- **Propósito**: Gestión de habilidades
- **Funcionalidades**:
  - Carga de skills desde la API
  - Filtrado por categoría
  - Obtención de todas las categorías
  - Estados de carga y error

## Exportación Centralizada

El archivo `index.ts` proporciona una exportación centralizada de todos los hooks para facilitar su importación:

```typescript
import {
  useProfileData,
  useProfileStats,
  useWidgetManager,
  // ... otros hooks
} from './hooks';
```

## Beneficios de la Refactorización

1. **Separación de Responsabilidades**: Cada hook tiene una función específica
2. **Reutilización**: Los hooks pueden usarse en otros componentes
3. **Mantenibilidad**: Código más fácil de mantener y debuggear
4. **Testabilidad**: Cada hook puede probarse de forma aislada
5. **Legibilidad**: El componente principal será más limpio y fácil de entender

## Próximos Pasos

1. Actualizar el componente `ProfileHero.tsx` para usar estos hooks
2. Eliminar la lógica duplicada del componente principal
3. Verificar que toda la funcionalidad se mantiene
4. Crear tests unitarios para cada hook

## Estructura de Archivos

```
ProfileHero/
├── hooks/
│   ├── useAuthState.ts
│   ├── useLanguage.ts
│   ├── useProfileData.ts
│   ├── useProfileStats.ts
│   ├── useSkills.ts
│   ├── useThemeManager.ts
│   ├── useTypingRotator.ts
│   ├── useWidgetManager.tsx
│   └── index.ts
└── ProfileHero.tsx
```

## Estado Actual

✅ **Completado**: Creación de todos los hooks especializados
🔄 **Pendiente**: Refactorización del componente principal
🔄 **Pendiente**: Testing de la integración
