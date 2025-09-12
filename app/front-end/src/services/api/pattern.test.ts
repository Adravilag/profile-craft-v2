import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del API antes de importar cualquier cosa
vi.mock('../http', () => ({
  API: {
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  },
}));

// Mock de los módulos de dependencias
vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    api: vi.fn(),
  },
}));

vi.mock('@/utils/secureLogging', () => ({
  createSecureLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('@/utils/domainSecurity', () => ({
  validateRequest: vi.fn(() => true),
  isProductionDomain: vi.fn(() => false),
}));

vi.mock('@/features/users/services/userId', () => ({
  getDynamicUserId: vi.fn(() => Promise.resolve('test-user-id')),
}));

vi.mock('@/features/users/utils/userConfig', () => ({
  getUserId: vi.fn(() => 'test-user-id'),
}));

// Ahora importar la función que queremos probar
import { getUserPattern } from '../api';
import { API } from '../http';

describe('Pattern API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPattern', () => {
    it('should fetch user pattern successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          pattern: '1708',
        },
      };
      (API.get as any).mockResolvedValue(mockResponse);

      // Act
      const result = await getUserPattern('68c3fb8a51694161d560442b');

      // Assert
      expect(API.get).toHaveBeenCalledWith('/profile/68c3fb8a51694161d560442b/pattern');
      expect(result).toBe('1708');
    });

    it('should handle errors when fetching pattern', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (API.get as any).mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUserPattern('invalid-id')).rejects.toThrow('Network error');
    });
  });
});
