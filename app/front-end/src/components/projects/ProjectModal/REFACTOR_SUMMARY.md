# Refactorización de ProjectModal

## Cambios Realizados

### 1. Estructura del Componente

- **Antes**: Modal personalizado con backdrop, posicionamiento manual y botón de cierre
- **Después**: Utiliza `ModalShell` como base con configuración declarativa

### 2. Gestión de Botones

- **Antes**: Enlaces `<a>` con estilos personalizados
- **Después**: Configuración de botones mediante `actionButtons` prop en `ModalShell`

### 3. Propiedades del Componente

```typescript
// ANTES
type Props = {
  project: Project | null;
  onClose: () => void;
};

// DESPUÉS
type Props = {
  project: Project | null;
  onClose: () => void;
  isOpen?: boolean; // Nueva prop para control explícito
};
```

### 4. Configuración de Botones de Acción

```typescript
const actionButtons = [
  ...(project.demoUrl
    ? [
        {
          key: 'demo',
          label: 'Ver Demo',
          onClick: () => window.open(project.demoUrl, '_blank', 'noopener,noreferrer'),
          variant: 'primary' as const,
          ariaLabel: `Ver demo de ${project.title}`,
        },
      ]
    : []),
  ...(project.repoUrl
    ? [
        {
          key: 'repo',
          label: 'Ver Código',
          onClick: () => window.open(project.repoUrl, '_blank', 'noopener,noreferrer'),
          variant: 'secondary' as const,
          ariaLabel: `Ver código de ${project.title}`,
        },
      ]
    : []),
];
```

### 5. Simplificación de CSS

- **Eliminado**: `.backdrop`, `.modal`, `.close`, `.ctas`, `.cta`
- **Mantenido**: Estilos específicos del contenido del modal
- **Mejorado**: Layout responsivo con flexbox

### 6. Mejoras de Accesibilidad

- Etiquetas ARIA más descriptivas
- Gestión de teclado delegada a `ModalShell`
- Mejor semántica HTML

## Beneficios de la Refactorización

### ✅ Consistencia

- Todos los modales ahora usan la misma base
- Comportamiento uniforme de botones y teclado

### ✅ Mantenibilidad

- Menos código duplicado
- Lógica centralizada en `ModalShell`
- CSS más simple y enfocado

### ✅ Flexibilidad

- Configuración declarativa de botones
- Fácil personalización de ancho y comportamiento

### ✅ Accesibilidad

- Gestión automática de foco y teclado
- Roles ARIA correctos
- Mejor soporte para lectores de pantalla

## Ejemplos de Uso

### Modal Básico

```tsx
<ProjectModal project={projectData} onClose={handleClose} isOpen={true} />
```

### Con Control de Estado

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<ProjectModal
  project={selectedProject}
  onClose={() => setIsModalOpen(false)}
  isOpen={isModalOpen}
/>;
```

## Archivos Modificados

1. **ProjectModal.tsx** - Refactorización completa del componente
2. **ProjectModal.module.css** - Simplificación de estilos
3. **ProjectModal.stories.tsx** - Nuevas stories con casos de prueba

## Compatibilidad

La refactorización mantiene la misma interfaz pública, por lo que no requiere cambios en los componentes que usan `ProjectModal`.
