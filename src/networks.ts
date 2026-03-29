import { ApiClient } from './client';
import { Network, NetworkShort, MemberShort, ProfileQuestion, ApiResponse } from './types';

export interface ListNetworksOptions {
  filter?: 'popular' | 'new' | 'unpopular';
  short?: boolean;
}

export interface CreateNetworkOptions {
  name: string;
  description: string;
  longDescription?: string;
  logoUrl?: string;
  isPublic?: boolean;
}

export class NetworksNamespace {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async list(options: ListNetworksOptions = {}): Promise<Network[] | NetworkShort[]> {
    const params: Record<string, string> = {};
    
    if (options.filter) params.filter = options.filter;
    if (options.short) params.short = 'true';
    
    const response = await this.client.get<Network[] | NetworkShort[]>('/v1/networks', params);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to list networks');
  }

  async get(networkId: string): Promise<Network> {
    const response = await this.client.get<Network>(`/v1/networks/${networkId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Network not found');
  }

  async create(options: CreateNetworkOptions): Promise<Network> {
    const response = await this.client.post<Network>('/v1/networks', {
      name: options.name,
      description: options.description,
      longDescription: options.longDescription || '',
      logoUrl: options.logoUrl || '',
      isPublic: options.isPublic !== false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to create network');
  }

  async mine(options: { short?: boolean } = {}): Promise<Network[] | NetworkShort[]> {
    const params: Record<string, string> = {};
    if (options.short) params.short = 'true';
    
    const response = await this.client.get<Network[] | NetworkShort[]>('/v1/networks/mine', params);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to list networks');
  }

  async getMembers(networkId: string): Promise<MemberShort[]> {
    const response = await this.client.get<MemberShort[]>(`/v1/networks/${networkId}/members`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to list members');
  }

  async getQuestions(networkId: string): Promise<ProfileQuestion[]> {
    const response = await this.client.get<ProfileQuestion[]>(`/v1/networks/${networkId}/questions`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to list questions');
  }

  async getStats(networkId: string): Promise<{
    totalMembers: number;
    activeConversations: number;
    avgMessagesPerDay: number;
    topTopics: string[];
    newestMemberSince: string;
  }> {
    const response = await this.client.get<any>(`/v1/networks/${networkId}/stats`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get network stats');
  }

  async discover(strategy: 'popular' | 'newest' | 'unpopular' | 'recommended', limit: number = 20): Promise<{
    networks: Network[];
    totalFound: number;
    recommendedForYou?: Array<{ networkId: string; reason: string }>;
  }> {
    const params: Record<string, string> = {
      strategy,
      limit: limit.toString()
    };

    const response = await this.client.get<any>('/v1/networks/discover', params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to discover networks');
  }
}
