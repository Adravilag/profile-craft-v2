import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { IssuerSelector, CredentialIdInput } from './forms';
import { CERTIFICATION_ISSUERS } from '@/data/certificationIssuers';

describe('[TEST] Forms Components', () => {
  describe('🔴 [TEST] IssuerSelector', () => {
    it('debería renderizar todos los emisores disponibles', () => {
      // [TEST]
      const mockOnChange = vi.fn();

      render(
        <IssuerSelector value="" onChange={mockOnChange} placeholder="Seleccionar emisor..." />
      );

      // [RESULTADO] Test passed
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      // Verificar que el placeholder aparece
      expect(screen.getByText('Seleccionar emisor...')).toBeInTheDocument();

      // Verificar que todos los emisores están presentes
      CERTIFICATION_ISSUERS.forEach(issuer => {
        expect(screen.getByText(issuer.name)).toBeInTheDocument();
      });
    });

    it('debería llamar onChange cuando se selecciona un emisor', () => {
      // [TEST]
      const mockOnChange = vi.fn();

      render(<IssuerSelector value="" onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Amazon Web Services (AWS)' } });

      // [RESULTADO] Test passed
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'aws',
          name: 'Amazon Web Services (AWS)',
        })
      );
    });
  });

  describe('🔴 [TEST] CredentialIdInput', () => {
    it('debería mostrar placeholder genérico cuando no hay emisor', () => {
      // [TEST]
      const mockOnChange = vi.fn();

      render(<CredentialIdInput value="" onChange={mockOnChange} placeholder="ID de credencial" />);

      // [RESULTADO] Test passed
      const input = screen.getByPlaceholderText('ID de credencial');
      expect(input).toBeInTheDocument();
    });

    it('debería mostrar placeholder específico cuando hay emisor', () => {
      // [TEST]
      const mockOnChange = vi.fn();
      const awsIssuer = CERTIFICATION_ISSUERS.find(i => i.id === 'aws')!;

      render(<CredentialIdInput value="" onChange={mockOnChange} issuer={awsIssuer} />);

      // [RESULTADO] Test passed
      const input = screen.getByPlaceholderText('Ej: ABC123DEF456');
      expect(input).toBeInTheDocument();
    });

    it('debería mostrar placeholder específico para MiduDev', () => {
      // [TEST]
      const mockOnChange = vi.fn();
      const midudevIssuer = CERTIFICATION_ISSUERS.find(i => i.id === 'midudev')!;

      render(<CredentialIdInput value="" onChange={mockOnChange} issuer={midudevIssuer} />);

      // [RESULTADO] Test passed
      const input = screen.getByPlaceholderText('Ej: 66b2ab03a4a4d5c8e7894c23');
      expect(input).toBeInTheDocument();
    });

    it('debería llamar onChange cuando se cambia el valor', () => {
      // [TEST]
      const mockOnChange = vi.fn();

      render(<CredentialIdInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test-123' } });

      // [RESULTADO] Test passed
      expect(mockOnChange).toHaveBeenCalledWith('test-123');
    });
  });
});
