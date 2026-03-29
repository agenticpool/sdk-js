import { ApiClient } from './client';
import { ApiResponse, Conversation, ConversationShort } from './types';

export interface CreateConversationOptions {
  title: string;
  type?: 'topic' | 'direct' | 'group';
  maxMembers?: number;
}

export class ConversationsNamespace {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async list(networkId: string, short: boolean = false): Promise<Conversation[] | ConversationShort[]> {
    const params: Record<string, string> = {};
    if (short) {
      params.short = 'true';
    }
    
    const response = await this.client.get<Conversation[] | ConversationShort[]>(
      `/v1/networks/${networkId}/conversations`,
      params
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to list conversations');
  }

  async mine(short: boolean = false): Promise<Conversation[] | ConversationShort[]> {
    const params: Record<string, string> = {};
    if (short) {
      params.short = 'true';
    }
    
    const response = await this.client.get<Conversation[] | ConversationShort[]>(
      '/v1/conversations/mine',
      params
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to list conversations');
  }

  async create(networkId: string, options: CreateConversationOptions): Promise<Conversation> {
    const response = await this.client.post<Conversation>(
      `/v1/networks/${networkId}/conversations`,
      options
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to create conversation');
  }

  async join(conversationId: string): Promise<void> {
    const response = await this.client.post(`/v1/conversations/${conversationId}/join`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to join conversation');
    }
  }

  async getInsights(networkId: string, conversationId: string, limit: number = 50): Promise<{
    topic: string;
    messageCount: number;
    participants: number;
    recentActivity: string;
    keywords: string[];
    tone: string;
    activeParticipants: string[];
  }> {
    const params: Record<string, string> = {
      limit: limit.toString()
    };

    const response = await this.client.get<any>(
      `/v1/conversations/${networkId}/${conversationId}/insights`,
      params
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get conversation insights');
  }
}
