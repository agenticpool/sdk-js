import { ApiClient } from './client';
import { KeyPair, AuthTokens, Member, ApiResponse } from './types';
import { credentialStorage, StoredCredentials } from './storage';

export interface ConnectResult {
  member?: Member;
  tokens: AuthTokens;
  isNewUser: boolean;
  publicToken: string;
}

export class AuthNamespace {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async generateKeys(): Promise<KeyPair> {
    const response = await this.client.post<KeyPair>('/v1/auth/generate-keys', {});
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to generate keys');
  }

  async register(networkId: string, keys: KeyPair): Promise<{ member: Member; tokens: AuthTokens }> {
    const response = await this.client.post<{ member: Member; tokens: AuthTokens }>('/v1/auth/register', {
      networkId,
      publicToken: keys.publicToken,
      privateKey: keys.privateKey
    });

    if (response.success && response.data) {
      this.client.setAuthToken(response.data.tokens.jwt);
      return response.data;
    }

    throw new Error(response.error?.message || 'Registration failed');
  }

  async login(networkId: string, keys: KeyPair): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>('/v1/auth/login', {
      networkId,
      publicToken: keys.publicToken,
      privateKey: keys.privateKey
    });

    if (response.success && response.data) {
      this.client.setAuthToken(response.data.jwt);
      return response.data;
    }

    throw new Error(response.error?.message || 'Login failed');
  }

  logout(): void {
    this.client.clearAuthToken();
  }

  async connect(networkId: string, options?: { privateKey?: string }): Promise<ConnectResult> {
    const stored = await credentialStorage.getCredentials(networkId);
    
    if (stored && credentialStorage.isTokenValid(stored)) {
      this.client.setAuthToken(stored.jwt!);
      return {
        tokens: {
          jwt: stored.jwt!,
          expiresAt: stored.expiresAt!,
          publicToken: stored.publicToken
        },
        isNewUser: false,
        publicToken: stored.publicToken
      };
    }

    if (stored && stored.privateKey) {
      try {
        const tokens = await this.login(networkId, {
          publicToken: stored.publicToken,
          privateKey: stored.privateKey
        });

        await credentialStorage.saveCredentials({
          networkId,
          publicToken: stored.publicToken,
          privateKey: stored.privateKey,
          jwt: tokens.jwt,
          expiresAt: tokens.expiresAt
        });

        return {
          tokens,
          isNewUser: false,
          publicToken: stored.publicToken
        };
      } catch {
        // Login failed, will try to register with new keys
      }
    }

    const keys = options?.privateKey
      ? { publicToken: this.generatePublicToken(), privateKey: options.privateKey }
      : await this.generateKeys();

    try {
      const result = await this.register(networkId, keys);

      await credentialStorage.saveCredentials({
        networkId,
        publicToken: keys.publicToken,
        privateKey: keys.privateKey,
        jwt: result.tokens.jwt,
        expiresAt: result.tokens.expiresAt
      });

      return {
        member: result.member,
        tokens: result.tokens,
        isNewUser: true,
        publicToken: keys.publicToken
      };
    } catch (registerError) {
      throw registerError;
    }
  }

  async disconnect(networkId: string): Promise<void> {
    this.logout();
    await credentialStorage.clearCredentials(networkId);
  }

  async getCredentials(networkId: string): Promise<StoredCredentials | null> {
    return credentialStorage.getCredentials(networkId);
  }

  async isAuthenticated(networkId: string): Promise<boolean> {
    const creds = await credentialStorage.getCredentials(networkId);
    return creds !== null && credentialStorage.isTokenValid(creds);
  }

  async ensureAuthenticated(networkId: string): Promise<ConnectResult> {
    return this.connect(networkId);
  }

  private generatePublicToken(): string {
    const bytes: number[] = [];
    for (let i = 0; i < 32; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
