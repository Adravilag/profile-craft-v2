import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormField } from '../FormField/FormField';
import { Input } from '../Input/Input';
import { TextArea } from '../TextArea/TextArea';
import { Select } from '../Select/Select';
import { Checkbox } from '../Checkbox/Checkbox';
import { TechnologyInput } from '../TechnologyInput/TechnologyInput';
import { Button } from '../Button/Button';

const meta: Meta = {
  title: 'UI/FormExample',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const FormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    experience: '',
    description: '',
    technologies: [] as string[],
    newsletter: false,
    notifications: true,
    theme: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.position) newErrors.position = 'Selecciona una posición';
    if (formData.technologies.length === 0)
      newErrors.technologies = 'Agrega al menos una tecnología';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Formulario enviado correctamente!');
    }
  };

  const techSuggestions = [
    'React',
    'Vue.js',
    'Angular',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Express.js',
    'Python',
    'Django',
    'Java',
    'Spring Boot',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
    'HTML5',
    'CSS3',
    'SASS',
    'Docker',
    'AWS',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'GraphQL',
    'REST API',
    'Git',
    'Webpack',
    'Vite',
  ];

  const positionOptions = [
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'fullstack', label: 'Full Stack Developer' },
    { value: 'mobile', label: 'Mobile Developer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'qa', label: 'QA Engineer' },
    { value: 'ui-ux', label: 'UI/UX Designer' },
    { value: 'pm', label: 'Product Manager' },
  ];

  const experienceOptions = [
    { value: 'junior', label: 'Junior (0-2 años)' },
    { value: 'mid', label: 'Mid-level (2-5 años)' },
    { value: 'senior', label: 'Senior (5-8 años)' },
    { value: 'lead', label: 'Lead (8+ años)' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: 'var(--md-sys-color-on-surface, #fff)', marginBottom: '2rem' }}>
        Formulario de Ejemplo - Componentes UI
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {/* Información Personal */}
        <div>
          <h3 style={{ color: 'var(--md-sys-color-primary, #7c3aed)', marginBottom: '1rem' }}>
            Información Personal
          </h3>

          <FormField label="Nombre completo" icon="fa-user" error={errors.name} required>
            <Input
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              fullWidth
            />
          </FormField>

          <FormField label="Email" icon="fa-envelope" error={errors.email} required>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={!!errors.email}
              fullWidth
            />
          </FormField>

          <FormField label="Empresa" icon="fa-building" helperText="Empresa actual o anterior">
            <Input
              placeholder="Nombre de la empresa"
              value={formData.company}
              onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              fullWidth
            />
          </FormField>
        </div>

        {/* Información Profesional */}
        <div>
          <h3 style={{ color: 'var(--md-sys-color-primary, #7c3aed)', marginBottom: '1rem' }}>
            Información Profesional
          </h3>

          <FormField label="Posición" icon="fa-briefcase" error={errors.position} required>
            <Select
              placeholder="Selecciona tu posición"
              options={positionOptions}
              value={formData.position}
              onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
              error={!!errors.position}
              fullWidth
            />
          </FormField>

          <FormField label="Experiencia" icon="fa-chart-line">
            <Select
              placeholder="Años de experiencia"
              options={experienceOptions}
              value={formData.experience}
              onChange={e => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              fullWidth
            />
          </FormField>

          <FormField
            label="Tecnologías"
            icon="fa-code"
            error={errors.technologies}
            helperText="Agrega las tecnologías que manejas"
            required
          >
            <TechnologyInput
              value={formData.technologies}
              onChange={techs => setFormData(prev => ({ ...prev, technologies: techs }))}
              suggestions={techSuggestions}
              placeholder="Escribe y presiona Enter..."
              error={!!errors.technologies}
              maxTechnologies={10}
            />
          </FormField>

          <FormField
            label="Descripción"
            icon="fa-align-left"
            helperText="Cuéntanos sobre ti y tu experiencia"
          >
            <TextArea
              placeholder="Describe tu experiencia, logros, proyectos destacados..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={500}
              showCharacterCount
              fullWidth
            />
          </FormField>
        </div>

        {/* Preferencias */}
        <div>
          <h3 style={{ color: 'var(--md-sys-color-primary, #7c3aed)', marginBottom: '1rem' }}>
            Preferencias
          </h3>

          <Checkbox
            label="Suscribirse al newsletter"
            description="Recibe actualizaciones sobre nuevas oportunidades"
            checked={formData.newsletter}
            onChange={e => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
          />

          <Checkbox
            label="Notificaciones push"
            description="Recibe notificaciones en tiempo real"
            variant="switch"
            checked={formData.notifications}
            onChange={e => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
          />

          <Checkbox
            label="Tema oscuro"
            description="Usar tema oscuro en la interfaz"
            variant="switch"
            size="lg"
            checked={formData.theme}
            onChange={e => setFormData(prev => ({ ...prev, theme: e.target.checked }))}
          />
        </div>

        {/* Botones */}
        <div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}
        >
          <Button variant="secondary" type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Enviar Formulario
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CompleteForm: Story = {
  render: () => <FormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Un ejemplo completo que muestra todos los componentes UI trabajando juntos en un formulario funcional con validación.',
      },
    },
  },
};
