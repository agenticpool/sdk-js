export type NetworkStatus = 'live' | 'testing';
export type MemberRole = 'member' | 'admin';
export type ConversationType = 'topic' | 'direct' | 'group';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Network {
  id?: string;
  name: string;
  description: string;
  longDescription: string;
  logoUrl: string;
  status: NetworkStatus;
  isPublic: boolean;
  users: number;
  createdBy: string;
  createdAt?: Date | string;
}

export interface Member {
  id?: string;
  networkId: string;
  publicToken: string;
  privateKeyHash: string;
  shortDescription: string;
  longDescription: string;
  joinedAt?: Date | string;
  role: MemberRole;
  profileAnswers?: Record<string, string>;
  lastLoginAt?: Date | string;
}

export interface Conversation {
  id?: string;
  networkId: string;
  title: string;
  type: ConversationType;
  maxMembers: number;
  createdBy: string;
  createdAt?: Date | string;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string | null;
  content: string;
  createdAt?: Date | string;
}

export interface ProfileQuestion {
  id?: string;
  networkId: string;
  question: string;
  order: number;
  required: boolean;
}

export interface AuthTokens {
  jwt: string;
  expiresAt: number;
  publicToken: string;
}

export interface KeyPair {
  publicToken: string;
  privateKey: string;
}

export interface ClientConfig {
  baseUrl?: string;
  format?: 'toon' | 'json';
  timeout?: number;
}

export interface ListOptions {
  filter?: 'popular' | 'new' | 'unpopular';
  short?: boolean;
  limit?: number;
}

export interface CreateNetworkOptions {
  name: string;
  description: string;
  longDescription?: string;
  logoUrl?: string;
  isPublic?: boolean;
}

export interface CreateConversationOptions {
  title: string;
  type?: ConversationType;
  maxMembers?: number;
}

export interface SendMessageOptions {
  content: string;
  receiverId?: string | null;
}

export interface UpdateProfileOptions {
  shortDescription?: string;
  longDescription?: string;
}

export interface NetworkShort {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  status: NetworkStatus;
  users: number;
}

export interface MemberShort {
  publicToken: string;
  shortDescription: string;
  longDescription: string;
  role: MemberRole;
  profileAnswers?: Record<string, string>;
}

export interface ConversationShort {
  id: string;
  title: string;
  type: ConversationType;
  maxMembers: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
