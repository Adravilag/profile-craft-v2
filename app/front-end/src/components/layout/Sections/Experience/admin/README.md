# Componentes Reutilizables de Administración de Experiencia

Esta carpeta contiene componentes reutilizables para añadir y editar experiencias laborales y educativas.

## Componentes Disponibles

### AddExperienceForm

Componente reutilizable para añadir y editar experiencias laborales.

#### Props

- `editingExperience?: Experience` - Experiencia a editar (opcional, si no se proporciona se crea una nueva)
- `onSave: () => void` - Callback llamado cuando se guarda exitosamente
- `onCancel: () => void` - Callback llamado cuando se cancela la operación

#### Ejemplo de Uso

```tsx
import { AddExperienceForm } from '@/components/layout/Sections/Experience/admin';

// Para crear nueva experiencia
<AddExperienceForm
  onSave={() => {
    // Recargar lista de experiencias
    loadExperiences();
    setShowForm(false);
  }}
  onCancel={() => setShowForm(false)}
/>

// Para editar experiencia existente
<AddExperienceForm
  editingExperience={selectedExperience}
  onSave={() => {
    // Recargar lista de experiencias
    loadExperiences();
    setShowForm(false);
  }}
  onCancel={() => setShowForm(false)}
/>
```

### AddEducationForm

Componente reutilizable para añadir y editar información educativa.

#### Props

- `editingEducation?: Education` - Educación a editar (opcional, si no se proporciona se crea una nueva)
- `onSave: () => void` - Callback llamado cuando se guarda exitosamente
- `onCancel: () => void` - Callback llamado cuando se cancela la operación

#### Ejemplo de Uso

```tsx
import { AddEducationForm } from '@/components/layout/Sections/Experience/admin';

// Para crear nueva educación
<AddEducationForm
  onSave={() => {
    // Recargar lista de educación
    loadEducation();
    setShowForm(false);
  }}
  onCancel={() => setShowForm(false)}
/>

// Para editar educación existente
<AddEducationForm
  editingEducation={selectedEducation}
  onSave={() => {
    // Recargar lista de educación
    loadEducation();
    setShowForm(false);
  }}
  onCancel={() => setShowForm(false)}
/>
```

## Características

### Validación

- Validación en tiempo real de campos requeridos
- Mensajes de error personalizados en español
- Indicadores visuales de campos válidos/inválidos

### UX/UI

- Diseño responsive con Material Design principles
- Animaciones suaves y transiciones
- Contador de caracteres para campos de texto largo
- Autocompletado de tecnologías (solo en AddExperienceForm)

### Funcionalidades

- Soporte para trabajos/estudios actuales
- Gestión de fechas con inputs de tipo month
- Gestión de tecnologías con chips (solo en AddExperienceForm)
- Calificaciones y notas adicionales (solo en AddEducationForm)

## Testing

Los componentes incluyen tests unitarios comprehensivos utilizando Vitest y React Testing Library.

Para ejecutar los tests:

```bash
npm test AddExperienceForm
npm test AddEducationForm  # Cuando esté implementado
```

## Estilos

Los componentes utilizan CSS Modules para evitar conflictos de estilos y mantener la encapsulación.

- `AddExperienceForm.module.css`
- `AddEducationForm.module.css`

Los estilos están basados en variables CSS customizadas que siguen Material Design principles.

## Integración con APIs

Los componentes se integran automáticamente con:

- `experiences` API para experiencias laborales
- `education` API para información educativa

Ambos incluyen manejo de errores y notificaciones de éxito/fallo.
