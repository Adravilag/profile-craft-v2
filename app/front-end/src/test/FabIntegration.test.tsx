import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FabProvider, useFab } from '@/contexts/FabContext';
import { ModalProvider } from '@/contexts/ModalContext';
import FloatingActionButtonGroup from '../ui/components/FloatingActionButtonGroup';
import type { FABAction } from '../ui/components/FloatingActionButtonGroup';
import TestimonialsSection from '@/components/layout/Sections/Testimonials/TestimonialsSection';

// Helper component to render a FloatingActionButtonGroup that uses FabContext
const FabButtonsFromContext: React.FC = () => {
  const { openTestimonialModal, openTestimonialsAdmin } = useFab();
  const actions = [
    {
      id: 'add-testimonial',
      onClick: openTestimonialModal,
      icon: 'fas fa-plus',
      label: 'Añadir Testimonio',
      color: 'success',
    },
    {
      id: 'admin-testimonials',
      onClick: openTestimonialsAdmin,
      icon: 'fas fa-shield-alt',
      label: 'Gestionar Testimonios',
      color: 'primary',
    },
  ] as unknown as FABAction[];
  return <FloatingActionButtonGroup actions={actions} position="bottom-right" />;
};

describe('FAB integration with TestimonialsSection', () => {
  test('clicking FAB opens TestimonialModal', async () => {
    render(
      <FabProvider>
        <ModalProvider>
          <FabButtonsFromContext />
          <TestimonialsSection />
        </ModalProvider>
      </FabProvider>
    );

    const addBtn = screen.getByLabelText('Añadir Testimonio');
    fireEvent.click(addBtn);

    // findByRole waits for an element with role "dialog" and accessible name to appear
    // The page renders multiple dialogs during the test; target the testimonial modal by its title
    const dialog = await screen.findByRole('dialog', { name: /Añadir Nuevo Testimonio/i });
    expect(dialog).toBeInTheDocument();
  });
});
