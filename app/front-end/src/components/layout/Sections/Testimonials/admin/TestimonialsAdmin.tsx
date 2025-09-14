// src/components/sections/testimonials/TestimonialsAdmin.tsx

import React, { useEffect, useState } from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import TestimonialsAdminContent from './TestimonialsAdminContent';
import styles from './TestimonialsAdmin.module.css';
import { testimonials as testimonialsApi } from '@/services/endpoints';
const { getAdminTestimonials } = testimonialsApi;

interface TestimonialsAdminProps {
  onClose: () => void;
  onTestimonialsChange?: () => void;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const TestimonialsAdmin: React.FC<TestimonialsAdminProps> = ({ onClose, onTestimonialsChange }) => {
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [counts, setCounts] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  }>({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        const all = await getAdminTestimonials();
        if (!mounted) return;
        const pending = all.filter((t: any) => (t.status || 'pending') === 'pending').length;
        const approved = all.filter((t: any) => t.status === 'approved').length;
        const rejected = all.filter((t: any) => t.status === 'rejected').length;
        setCounts({ pending, approved, rejected, all: all.length });
      } catch (e) {
        // ignore counts failures silently; admin content will show errors if loading fails
      }
    };
    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const headerActions = (
    <div className={styles.adminFilters}>
      <button
        className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
        onClick={() => setFilter('pending')}
      >
        Pendientes
        <span className={styles.filterCount}>{counts.pending}</span>
      </button>
      <button
        className={`${styles.filterBtn} ${filter === 'approved' ? styles.active : ''}`}
        onClick={() => setFilter('approved')}
      >
        Aprobados
        <span className={styles.filterCount}>{counts.approved}</span>
      </button>
      <button
        className={`${styles.filterBtn} ${filter === 'rejected' ? styles.active : ''}`}
        onClick={() => setFilter('rejected')}
      >
        Rechazados
        <span className={styles.filterCount}>{counts.rejected}</span>
      </button>
      <button
        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
        onClick={() => setFilter('all')}
      >
        Todos
        <span className={styles.filterCount}>{counts.all}</span>
      </button>
    </div>
  );

  return (
    <ModalShell
      title="Administrar testimonios"
      onClose={onClose}
      maxWidth={1000}
      headerActions={headerActions}
    >
      <div className={styles.testimonialsAdminContentArea}>
        <TestimonialsAdminContent
          filter={filter}
          setFilter={setFilter}
          onClose={onClose}
          onTestimonialsChange={onTestimonialsChange}
        />
      </div>
    </ModalShell>
  );
};

export default TestimonialsAdmin;
