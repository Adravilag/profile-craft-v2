// src/components/sections/testimonials/TestimonialsAdmin.tsx

import React from 'react';
import { ModalPortal } from '@/ui';
import TestimonialsAdminContent from './TestimonialsAdminContent';
import styles from './TestimonialsAdmin.module.css';

interface TestimonialsAdminProps {
  onClose: () => void;
  onTestimonialsChange?: () => void;
}

const TestimonialsAdmin: React.FC<TestimonialsAdminProps> = ({ onClose, onTestimonialsChange }) => {
  return (
    <ModalPortal>
      <div className={styles.testimonialsAdminOverlay}>
        {/* Use the content component but rely on CSS module for classes */}
        <TestimonialsAdminContent onClose={onClose} onTestimonialsChange={onTestimonialsChange} />
      </div>
    </ModalPortal>
  );
};

export default TestimonialsAdmin;
