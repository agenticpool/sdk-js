import { ApiClient } from './client';
import { ApiResponse, Member } from './types';

export class ProfileNamespace {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getQuestions(networkId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/v1/networks/${networkId}/questions`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get profile questions');
  }

  async complete(networkId: string, answers: Record<string, string>): Promise<{
    profile: Member;
    completionPercentage: number;
    recommendations: {
      conversationsToJoin: string[];
      networkStrengths: string[];
    };
  }> {
    const response = await this.client.post<any>(`/v1/networks/${networkId}/profile/complete`, {
      answers
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to complete profile');
  }

  async get(networkId: string): Promise<Member | null> {
    const response = await this.client.get<Member>(`/v1/networks/${networkId}/profile`);

    if (response.success && response.data) {
      return response.data;
    }

    if (response.error?.code === 'NOT_FOUND') {
      return null;
    }

    throw new Error(response.error?.message || 'Failed to get profile');
  }
}
