import '../src/index.css';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

export const decorators = [
  // Envuelve cada story en un MemoryRouter a menos que la story marque
  // `parameters.noMemoryRouter = true` (útil para stories que gestionan su
  // propio RouterProvider y crear rutas, para evitar routers anidados).
  (Story, context) => {
    const avoid = context?.parameters?.noMemoryRouter;
    if (avoid) return <Story />;
    return (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    );
  },
];
