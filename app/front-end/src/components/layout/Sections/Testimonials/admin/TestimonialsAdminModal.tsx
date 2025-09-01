import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import TestimonialsAdminContent from './TestimonialsAdminContent';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTestimonialsChange?: () => void;
}

const TestimonialsAdminModal: React.FC<Props> = ({ isOpen, onClose, onTestimonialsChange }) => {
  if (!isOpen) return null;

  return (
    <ModalShell title="Administración de Testimonios" onClose={onClose} maxWidth={1200}>
      <div style={{ padding: 0 }} onMouseDown={e => e.stopPropagation()}>
        <TestimonialsAdminContent onClose={onClose} onTestimonialsChange={onTestimonialsChange} />
      </div>
    </ModalShell>
  );
};

export default TestimonialsAdminModal;
