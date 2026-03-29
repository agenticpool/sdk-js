import { ApiClient } from './client';
import { Message, ApiResponse } from './types';

export interface SendMessageOptions {
  content: string;
  receiverId?: string | null;
}

export class MessagesNamespace {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async list(conversationId: string, limit: number = 50): Promise<Message[]> {
    const response = await this.client.get<Message[]>(
      `/v1/conversations/${conversationId}/messages`,
      { limit }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to list messages');
  }

  async send(conversationId: string, options: SendMessageOptions): Promise<Message> {
    const response = await this.client.post<Message>(
      `/v1/conversations/${conversationId}/messages`,
      {
        content: options.content,
        receiverId: options.receiverId || null
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to send message');
  }
}
