// src/components/sections/testimonials/TestimonialsAdmin.tsx

import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import TestimonialsAdminContent from './TestimonialsAdminContent';
import styles from './TestimonialsAdmin.module.css';

interface TestimonialsAdminProps {
  onClose: () => void;
  onTestimonialsChange?: () => void;
}

const TestimonialsAdmin: React.FC<TestimonialsAdminProps> = ({ onClose, onTestimonialsChange }) => {
  return (
    <ModalShell title="Administrar testimonios" onClose={onClose} maxWidth={1000}>
      <div className={styles.testimonialsAdminContentArea}>
        <TestimonialsAdminContent onClose={onClose} onTestimonialsChange={onTestimonialsChange} />
      </div>
    </ModalShell>
  );
};

export default TestimonialsAdmin;
