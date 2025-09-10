import React from 'react';
import {
  CERTIFICATION_ISSUERS,
  getCredentialExample,
  type CertificationIssuer,
} from '@/data/certificationIssuers';

interface IssuerSelectorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (issuer: CertificationIssuer | null) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

interface CredentialIdInputProps {
  value: string;
  onChange: (value: string) => void;
  issuer?: CertificationIssuer | null;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const IssuerSelector: React.FC<IssuerSelectorProps> = ({
  id,
  name,
  value,
  onChange,
  required,
  placeholder = 'Seleccionar emisor...',
  className,
}) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={e => {
        const issuer = CERTIFICATION_ISSUERS.find(i => i.name === e.target.value) || null;
        onChange(issuer);
      }}
      required={required}
      className={className}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--md-sys-color-outline)',
        borderRadius: '8px',
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        fontSize: '0.875rem',
      }}
    >
      <option value="">{placeholder}</option>
      {CERTIFICATION_ISSUERS.map(issuer => (
        <option key={issuer.id} value={issuer.name}>
          {issuer.name}
        </option>
      ))}
    </select>
  );
};

export const CredentialIdInput: React.FC<CredentialIdInputProps> = ({
  value,
  onChange,
  issuer,
  placeholder = 'ID de credencial',
  className,
  id,
  name,
}) => {
  const dynamicPlaceholder = issuer ? getCredentialExample(issuer) : placeholder;

  return (
    <input
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={dynamicPlaceholder}
      className={className}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--md-sys-color-outline)',
        borderRadius: '8px',
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        fontSize: '0.875rem',
      }}
    />
  );
};

export default { IssuerSelector, CredentialIdInput };
