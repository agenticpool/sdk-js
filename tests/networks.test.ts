import { NetworksNamespace } from '../src/networks';
import { ApiClient } from '../src/client';

jest.mock('../src/client');

describe('NetworksNamespace', () => {
  let networksNamespace: NetworksNamespace;
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
    
    networksNamespace = new NetworksNamespace(mockClient);
  });

  describe('list', () => {
    it('should list networks without filters', async () => {
      const mockNetworks = [
        {
          id: 'network-1',
          name: 'Test Network',
          description: 'Test Description',
          status: 'live',
          users: 10
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockNetworks
      });

      const result = await networksNamespace.list();
      
      expect(result).toEqual(mockNetworks);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks', {});
    });

    it('should list networks with filter', async () => {
      const mockNetworks = [
        {
          id: 'network-1',
          name: 'Popular Network',
          description: 'Test Description',
          status: 'live',
          users: 100
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockNetworks
      });

      const result = await networksNamespace.list({ filter: 'popular' });
      
      expect(result).toEqual(mockNetworks);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks', { filter: 'popular' });
    });

    it('should list networks with short format', async () => {
      const mockNetworks = [
        {
          id: 'network-1',
          name: 'Test Network',
          description: 'Test Description'
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockNetworks
      });

      const result = await networksNamespace.list({ short: true });
      
      expect(result).toEqual(mockNetworks);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks', { short: 'true' });
    });

    it('should throw error when listing fails', async () => {
      mockClient.get.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to list networks' }
      });

      await expect(networksNamespace.list()).rejects.toThrow('Failed to list networks');
    });
  });

  describe('get', () => {
    it('should get network by id', async () => {
      const mockNetwork = {
        id: 'network-1',
        name: 'Test Network',
        description: 'Test Description',
        status: 'live',
        users: 10
      };
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockNetwork
      });

      const result = await networksNamespace.get('network-1');
      
      expect(result).toEqual(mockNetwork);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks/network-1');
    });

    it('should throw error when network not found', async () => {
      mockClient.get.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Network not found' }
      });

      await expect(networksNamespace.get('network-999')).rejects.toThrow('Network not found');
    });
  });

  describe('create', () => {
    it('should create network', async () => {
      const mockNetwork = {
        id: 'network-1',
        name: 'New Network',
        description: 'New Description',
        status: 'testing',
        users: 0
      };
      
      mockClient.post.mockResolvedValue({
        success: true,
        data: mockNetwork
      });

      const result = await networksNamespace.create({
        name: 'New Network',
        description: 'New Description'
      });
      
      expect(result).toEqual(mockNetwork);
      expect(mockClient.post).toHaveBeenCalledWith('/v1/networks', {
        name: 'New Network',
        description: 'New Description',
        longDescription: '',
        logoUrl: '',
        isPublic: true
      });
    });

    it('should throw error when creation fails', async () => {
      mockClient.post.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to create network' }
      });

      await expect(networksNamespace.create({
        name: 'New Network',
        description: 'New Description'
      })).rejects.toThrow('Failed to create network');
    });
  });

  describe('mine', () => {
    it('should get my networks', async () => {
      const mockNetworks = [
        {
          id: 'network-1',
          name: 'My Network',
          description: 'My Description',
          status: 'testing',
          users: 1
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockNetworks
      });

      const result = await networksNamespace.mine();
      
      expect(result).toEqual(mockNetworks);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks/mine', {});
    });

    it('should throw error when getting my networks fails', async () => {
      mockClient.get.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to list networks' }
      });

      await expect(networksNamespace.mine()).rejects.toThrow('Failed to list networks');
    });
  });

  describe('getMembers', () => {
    it('should get network members', async () => {
      const mockMembers = [
        {
          publicToken: 'token-1',
          shortDescription: 'Member 1',
          role: 'member'
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockMembers
      });

      const result = await networksNamespace.getMembers('network-1');
      
      expect(result).toEqual(mockMembers);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks/network-1/members');
    });
  });

  describe('getQuestions', () => {
    it('should get network questions', async () => {
      const mockQuestions = [
        {
          id: 'question-1',
          networkId: 'network-1',
          question: 'What is your name?',
          order: 1,
          required: true
        }
      ];
      
      mockClient.get.mockResolvedValue({
        success: true,
        data: mockQuestions
      });

      const result = await networksNamespace.getQuestions('network-1');
      
      expect(result).toEqual(mockQuestions);
      expect(mockClient.get).toHaveBeenCalledWith('/v1/networks/network-1/questions');
    });
  });
});
