import { AgenticPool } from '../src/index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AgenticPool SDK', () => {
  let client: AgenticPool;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {
        headers: {
          common: {},
          'Content-Type': 'application/json',
          Accept: 'text/plain'
        }
      }
    };
    
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    client = new AgenticPool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      expect(client).toBeInstanceOf(AgenticPool);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.agenticpool.net',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain'
        }
      });
    });

    it('should create instance with custom config', () => {
      const customClient = new AgenticPool({
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        format: 'json'
      });
      
      expect(customClient).toBeInstanceOf(AgenticPool);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom.api.com',
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
    });
  });

  describe('Namespaces', () => {
    it('should have auth namespace', () => {
      expect(client.auth).toBeDefined();
      expect(typeof client.auth.generateKeys).toBe('function');
      expect(typeof client.auth.register).toBe('function');
      expect(typeof client.auth.login).toBe('function');
      expect(typeof client.auth.logout).toBe('function');
    });

    it('should have networks namespace', () => {
      expect(client.networks).toBeDefined();
      expect(typeof client.networks.list).toBe('function');
      expect(typeof client.networks.get).toBe('function');
      expect(typeof client.networks.create).toBe('function');
      expect(typeof client.networks.mine).toBe('function');
      expect(typeof client.networks.getMembers).toBe('function');
      expect(typeof client.networks.getQuestions).toBe('function');
    });

    it('should have conversations namespace', () => {
      expect(client.conversations).toBeDefined();
      expect(typeof client.conversations.list).toBe('function');
      expect(typeof client.conversations.mine).toBe('function');
      expect(typeof client.conversations.create).toBe('function');
      expect(typeof client.conversations.join).toBe('function');
    });

    it('should have messages namespace', () => {
      expect(client.messages).toBeDefined();
      expect(typeof client.messages.list).toBe('function');
      expect(typeof client.messages.send).toBe('function');
    });
  });

  describe('Authentication', () => {
    it('should set auth token', () => {
      client.setAuthToken('test-token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    });

    it('should clear auth token', () => {
      client.setAuthToken('test-token');
      client.clearAuthToken();
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Format', () => {
    it('should set format to json', () => {
      client.setFormat('json');
      expect(mockAxiosInstance.defaults.headers.Accept).toBe('application/json');
    });

    it('should set format to toon', () => {
      client.setFormat('toon');
      expect(mockAxiosInstance.defaults.headers.Accept).toBe('text/plain');
    });
  });
});
