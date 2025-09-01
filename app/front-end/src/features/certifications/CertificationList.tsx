import React from 'react';
import { useCertifications } from './useCertifications';

const CertificationList: React.FC = () => {
  const { query, setQuery, category, setCategory, categories, results } = useCertifications();

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          aria-label="Buscar emisores"
          placeholder="Buscar emisores..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            // eslint-disable-next-line react/jsx-key
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <ul>
        {results.map(issuer => (
          <li
            key={issuer.id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}
          >
            <img src={issuer.logoUrl} alt={`${issuer.name} logo`} width={40} height={40} />
            <div>
              <div style={{ fontWeight: 600 }}>{issuer.name}</div>
              {issuer.description && <div style={{ fontSize: 12 }}>{issuer.description}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationList;
