import { useMemo, useState } from 'react';
import {
  CERTIFICATION_ISSUERS,
  ISSUER_CATEGORIES,
  findIssuerById,
} from '../../data/certificationIssuers';
import type { CertificationIssuer } from '../../data/certificationIssuers';

export const useCertifications = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => ISSUER_CATEGORIES, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CERTIFICATION_ISSUERS.filter((issuer: CertificationIssuer) => {
      if (category !== 'all' && issuer.category !== category) return false;
      if (!q) return true;
      return (
        issuer.name.toLowerCase().includes(q) ||
        issuer.id.toLowerCase().includes(q) ||
        (issuer.description || '').toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const getById = (id: string) => findIssuerById(id);

  return {
    query,
    setQuery,
    category,
    setCategory,
    categories,
    results,
    getById,
  } as const;
};
