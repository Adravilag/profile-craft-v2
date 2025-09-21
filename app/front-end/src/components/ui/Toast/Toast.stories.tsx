import React, { useState } from 'react';
import { AccessibleToast } from './Toast';

const meta = {
  title: 'UI/Toast',
  component: AccessibleToast,
  args: {
    message: 'Operación completada correctamente.',
    type: 'success',
  },
  argTypes: {
    message: { control: 'text', description: 'Texto mostrado en el toast' },
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Tipo/variant del toast',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toast accesible con auto-dismiss y variantes de estado.',
      },
    },
  },
};

export default meta;

export const Default = {
  render: (args: any) => {
    const [visible, setVisible] = useState(true);
    return (
      <div
        style={{
          padding: 24,
          background: '#071127',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'start',
        }}
      >
        {visible ? (
          <AccessibleToast
            {...args}
            onDismiss={() => setVisible(false)}
            title={args.title}
            description={args.description}
          />
        ) : (
          <button onClick={() => setVisible(true)}>Mostrar Toast</button>
        )}
      </div>
    );
  },
};

export const Variants = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 24,
        background: '#071127',
        minHeight: '100vh',
      }}
    >
      <AccessibleToast
        title="Guardado"
        description="Tus cambios se guardaron correctamente."
        type="success"
        onDismiss={() => {}}
      />
      <AccessibleToast
        title="Error"
        description="No se pudo conectar con el servidor."
        type="error"
        onDismiss={() => {}}
      />
      <AccessibleToast
        title="Atención"
        description="Algunos campos faltan por completar."
        type="warning"
        onDismiss={() => {}}
      />
      <AccessibleToast
        title="Actualización"
        description="Hay una nueva versión disponible."
        type="info"
        onDismiss={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Muestra las 4 variantes disponibles en modo oscuro (sin light).' },
    },
  },
};

export const AutoDismiss = {
  render: () => {
    const [visible, setVisible] = useState(true);
    return (
      <div style={{ padding: 24, background: '#071127', minHeight: '100vh' }}>
        {visible ? (
          <AccessibleToast
            title="Guardado"
            description="Se guardó con éxito."
            type="success"
            onDismiss={() => setVisible(false)}
            // default success duration is 4s, but we demonstrate override
            duration={3000}
          />
        ) : (
          <button onClick={() => setVisible(true)}>Mostrar Toast</button>
        )}
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Toast auto-dismiss (success).' } } },
};

export const ErrorWithAction = {
  render: () => {
    const [visible, setVisible] = useState(true);
    const [attempts, setAttempts] = useState(0);
    return (
      <div style={{ padding: 24, background: '#071127', minHeight: '100vh' }}>
        {visible ? (
          <AccessibleToast
            title="Error"
            description={`No se pudo conectar. Intentos: ${attempts}`}
            type="error"
            onDismiss={() => setVisible(false)}
            // icon-only action; aria-label provided by the component
            // simulate async retry that takes 800ms and increments attempts
            onAction={async () => {
              await new Promise(r => setTimeout(r, 800));
              setAttempts(a => a + 1);
            }}
            // keep toast open while retrying
            closeOnAction={false}
          />
        ) : (
          <button onClick={() => setVisible(true)}>Mostrar Toast</button>
        )}
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Error persistente con acción de Reintentar.' } } },
};

export const Stack = {
  render: () => {
    type T = {
      id: number;
      title: string;
      description: string;
      type: 'success' | 'error' | 'warning' | 'info';
    };
    const [toasts, setToasts] = useState<T[]>([]);
    const push = (t: T) => setToasts(s => [t, ...s].slice(0, 4)); // keep max 4
    return (
      <div style={{ padding: 24, background: '#071127', minHeight: '100vh' }}>
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() =>
              push({
                id: Date.now(),
                title: 'Info',
                description: 'Mensaje informativo',
                type: 'info',
              })
            }
          >
            Push Info
          </button>
          <button
            style={{ marginLeft: 8 }}
            onClick={() =>
              push({
                id: Date.now(),
                title: 'Guardado',
                description: 'Guardado OK',
                type: 'success',
              })
            }
          >
            Push Success
          </button>
          <button
            style={{ marginLeft: 8 }}
            onClick={() =>
              push({ id: Date.now(), title: 'Error', description: 'Fallo', type: 'error' })
            }
          >
            Push Error
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {toasts.map(t => (
            <AccessibleToast
              key={t.id}
              title={t.title}
              description={t.description}
              type={t.type}
              onDismiss={() => setToasts(s => s.filter(x => x.id !== t.id))}
            />
          ))}
        </div>
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Stack simple con límite de 4 toasts.' } } },
};
