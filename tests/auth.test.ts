import { AuthNamespace } from '../src/auth';
import { ApiClient } from '../src/client';

jest.mock('../src/client');

describe('AuthNamespace', () => {
  let authNamespace: AuthNamespace;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      setAuthToken: jest.fn(),
      clearAuthToken: jest.fn(),
      setFormat: jest.fn()
    } as any;
    
    authNamespace = new AuthNamespace(mockClient);
  });

  describe('generateKeys', () => {
    it('should generate keys successfully', async () => {
      const mockKeys = {
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      };
      
      mockClient.post.mockResolvedValue({
        success: true,
        data: mockKeys
      });

      const result = await authNamespace.generateKeys();
      
      expect(result).toEqual(mockKeys);
      expect(mockClient.post).toHaveBeenCalledWith('/v1/auth/generate-keys', {});
    });

    it('should throw error when generation fails', async () => {
      mockClient.post.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Generation failed' }
      });

      await expect(authNamespace.generateKeys()).rejects.toThrow('Generation failed');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockKeys = {
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      };
      
      const mockResponse = {
        member: {
          id: 'member-1',
          networkId: 'network-1',
          publicToken: 'test-public-token',
          shortDescription: '',
          longDescription: '',
          role: 'member'
        },
        tokens: {
          jwt: 'test-jwt-token',
          expiresAt: Date.now() + 86400000,
          publicToken: 'test-public-token'
        }
      };
      
      mockClient.post.mockResolvedValue({
        success: true,
        data: mockResponse
      });

      const result = await authNamespace.register('network-1', mockKeys);
      
      expect(result).toEqual(mockResponse);
      expect(mockClient.post).toHaveBeenCalledWith('/v1/auth/register', {
        networkId: 'network-1',
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      });
      expect(mockClient.setAuthToken).toHaveBeenCalledWith('test-jwt-token');
    });

    it('should throw error when registration fails', async () => {
      const mockKeys = {
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      };
      
      mockClient.post.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Registration failed' }
      });

      await expect(authNamespace.register('network-1', mockKeys)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockKeys = {
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      };
      
      const mockTokens = {
        jwt: 'test-jwt-token',
        expiresAt: Date.now() + 86400000,
        publicToken: 'test-public-token'
      };
      
      mockClient.post.mockResolvedValue({
        success: true,
        data: mockTokens
      });

      const result = await authNamespace.login('network-1', mockKeys);
      
      expect(result).toEqual(mockTokens);
      expect(mockClient.post).toHaveBeenCalledWith('/v1/auth/login', {
        networkId: 'network-1',
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      });
      expect(mockClient.setAuthToken).toHaveBeenCalledWith('test-jwt-token');
    });

    it('should throw error when login fails', async () => {
      const mockKeys = {
        publicToken: 'test-public-token',
        privateKey: 'test-private-key'
      };
      
      mockClient.post.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Invalid credentials' }
      });

      await expect(authNamespace.login('network-1', mockKeys)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear auth token', () => {
      authNamespace.logout();
      expect(mockClient.clearAuthToken).toHaveBeenCalled();
    });
  });
});
