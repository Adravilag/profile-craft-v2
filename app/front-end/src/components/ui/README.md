# Componentes UI Reutilizables - Profile Craft

Esta carpeta contiene componentes de interfaz de usuario reutilizables que siguen los principios de Material Design 3 y mantienen consistencia en toda la aplicación.

## 🎭 **Storybook Disponible**

Todos los componentes tienen stories documentadas. Para verlas:

```bash
npm run storybook
```

Luego visita: **http://localhost:6006**

### Stories Creadas:

- **UI/FormField** - Wrapper completo con diferentes configuraciones
- **UI/Input** - Todas las variantes y estados
- **UI/TextArea** - Con contador de caracteres y auto-resize
- **UI/Select** - Con opciones y iconos
- **UI/Checkbox** - Estándar y variante Switch
- **UI/TechnologyInput** - Gestor de tecnologías con autocompletado
- **UI/FormExample** - Formulario completo funcional

## Componentes Disponibles

### 📝 Componentes de Formulario

#### `FormField`

Wrapper completo para campos de formulario que incluye label, input, error y helper text.

```tsx
import { FormField, Input } from '@/components/ui';

<FormField
  label="Nombre"
  icon="fa-user"
  error={errors.name}
  helperText="Ingresa tu nombre completo"
  required
>
  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
</FormField>;
```

#### `Input`

Input básico reutilizable con múltiples variantes y estados.

```tsx
import { Input } from '@/components/ui';

<Input
  variant="outlined"
  size="md"
  placeholder="Escribe aquí..."
  startIcon={<i className="fas fa-search" />}
  error={hasError}
  fullWidth
/>;
```

**Props:**

- `variant`: 'default' | 'outlined' | 'filled'
- `size`: 'sm' | 'md' | 'lg'
- `error`: boolean
- `success`: boolean
- `fullWidth`: boolean
- `startIcon`: React.ReactNode
- `endIcon`: React.ReactNode

#### `TextArea`

Área de texto con contador de caracteres y auto-resize opcional.

```tsx
import { TextArea } from '@/components/ui';

<TextArea
  placeholder="Describe tu experiencia..."
  maxLength={500}
  showCharacterCount
  autoResize
  rows={4}
/>;
```

**Props:**

- `variant`: 'default' | 'outlined' | 'filled'
- `size`: 'sm' | 'md' | 'lg'
- `showCharacterCount`: boolean
- `autoResize`: boolean
- `maxLength`: number

#### `Select`

Select personalizado con opciones configurables.

```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular', disabled: true },
];

<Select
  options={options}
  placeholder="Selecciona una tecnología"
  icon={<i className="fas fa-code" />}
  fullWidth
/>;
```

#### `Checkbox`

Checkbox con variante switch y estados avanzados.

```tsx
import { Checkbox } from '@/components/ui';

// Checkbox estándar
<Checkbox
  label="Acepto los términos"
  description="Lee nuestros términos y condiciones"
  size="md"
/>

// Switch
<Checkbox
  variant="switch"
  label="Recibir notificaciones"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

#### `TechnologyInput`

Componente especializado para gestionar listas de tecnologías con autocompletado.

```tsx
import { TechnologyInput } from '@/components/ui';

const techSuggestions = ['React', 'Vue.js', 'Angular', 'TypeScript'];

<TechnologyInput
  value={selectedTechs}
  onChange={setSelectedTechs}
  suggestions={techSuggestions}
  maxTechnologies={10}
  placeholder="Agregar tecnología..."
/>;
```

### 🎯 Componentes de Acción

#### `Button`

Botón con múltiples variantes, estados de carga y tamaños.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" loading={isSubmitting} onClick={handleSubmit} fullWidth>
  Guardar Cambios
</Button>;
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean

## Características Principales

### 🎨 **Consistencia Visual**

- Todos los componentes siguen Material Design 3
- Variables CSS personalizadas para temas
- Estados consistentes (hover, focus, error, disabled)

### ♿ **Accesibilidad**

- Navegación por teclado completa
- ARIA labels y estados apropiados
- Soporte para lectores de pantalla
- Respeta `prefers-reduced-motion`
- Alto contraste automático

### 📱 **Responsive**

- Tamaños táctiles en móviles (44px mínimo)
- Adaptación automática a diferentes pantallas
- Comportamientos específicos para móvil

### 🔧 **Personalización**

- Variantes flexibles
- Props de configuración extensivas
- CSS modules para evitar conflictos
- Soporte para className personalizado

## Patrones de Uso

### Formulario Completo

```tsx
import { FormField, Input, TextArea, Select, Checkbox, Button } from '@/components/ui';

const ExampleForm = () => {
  return (
    <form>
      <FormField label="Nombre" icon="fa-user" required error={errors.name}>
        <Input value={data.name} onChange={handleChange} />
      </FormField>

      <FormField label="Descripción" icon="fa-align-left">
        <TextArea
          value={data.description}
          onChange={handleChange}
          maxLength={500}
          showCharacterCount
        />
      </FormField>

      <FormField label="Categoría" icon="fa-tag">
        <Select options={categories} value={data.category} onChange={handleChange} />
      </FormField>

      <Checkbox label="Proyecto destacado" checked={data.featured} onChange={handleChange} />

      <Button type="submit" loading={isSubmitting} fullWidth>
        Crear Proyecto
      </Button>
    </form>
  );
};
```

## Variables CSS Utilizadas

Los componentes utilizan las siguientes variables CSS que deben estar definidas en tu tema:

```css
:root {
  /* Colores principales */
  --md-sys-color-primary: #7c3aed;
  --md-sys-color-on-primary: #fff;
  --md-sys-color-surface: #1e1e1e;
  --md-sys-color-on-surface: #fff;
  --md-sys-color-outline: #666;
  --md-sys-color-outline-variant: #444;

  /* Estados */
  --md-sys-color-error: #ef4444;
  --md-sys-color-tertiary: #22c55e;

  /* Contenedores */
  --md-sys-color-surface-variant: #2a2a2a;
  --md-sys-color-primary-container: #3b2764;
  --md-sys-color-on-primary-container: #fff;
}
```

## Migración desde Componentes Existentes

Para migrar componentes existentes a estos nuevos:

1. **Identifica patrones repetitivos** en tus formularios actuales
2. **Reemplaza inputs básicos** con los componentes UI
3. **Envuelve con FormField** para consistencia visual
4. **Aprovecha las props de estado** (error, success, loading)
5. **Elimina CSS duplicado** ya cubierto por los componentes

## Contribuir

Al añadir nuevos componentes:

1. Sigue las convenciones de naming existentes
2. Incluye todos los estados necesarios (error, loading, disabled)
3. Añade soporte para accesibilidad
4. Documenta las props principales
5. Añade ejemplos de uso
6. Actualiza el archivo de exportación principal
