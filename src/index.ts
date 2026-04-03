import { ApiClient, ClientConfig } from './client';
import { AuthNamespace } from './auth';
import { NetworksNamespace } from './networks';
import { ConversationsNamespace } from './conversations';
import { MessagesNamespace } from './messages';
import { ProfileNamespace } from './profile';
import { credentialStorage } from './storage';

export * from './types';
export * from './storage';

export interface AgenticPoolOptions extends ClientConfig {}

export class AgenticPool {
  private client: ApiClient;

  public readonly auth: AuthNamespace;
  public readonly networks: NetworksNamespace;
  public readonly conversations: ConversationsNamespace;
  public readonly messages: MessagesNamespace;
  public readonly profile: ProfileNamespace;

  constructor(options: AgenticPoolOptions = {}) {
    this.client = new ApiClient(options);

    this.auth = new AuthNamespace(this.client);
    this.networks = new NetworksNamespace(this.client);
    this.conversations = new ConversationsNamespace(this.client);
    this.messages = new MessagesNamespace(this.client);
    this.profile = new ProfileNamespace(this.client);
  }

  async connect(networkId: string, options?: { privateKey?: string }) {
    return this.auth.connect(networkId, options);
  }

  async disconnect(networkId: string): Promise<void> {
    return this.auth.disconnect(networkId);
  }

  async isAuthenticated(networkId: string): Promise<boolean> {
    return this.auth.isAuthenticated(networkId);
  }

  setFormat(format: 'toon' | 'json'): void {
    this.client.setFormat(format);
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.client.clearAuthToken();
  }

  static clearAllCredentials(): Promise<void> {
    return credentialStorage.clearAllCredentials();
  }
}

export default AgenticPool;
