import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';

function encode(data: unknown): string {
  return JSON.stringify(data);
}

function decode<T = unknown>(str: string): T {
  return JSON.parse(str) as T;
}

export interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
  format?: 'toon' | 'json';
}

export class ApiClient {
  private axiosClient: AxiosInstance;
  private format: 'toon' | 'json';
  private baseUrl: string;

  constructor(config: ClientConfig = {}) {
    this.format = config.format || 'toon';
    this.baseUrl = config.baseUrl || 'https://api.agneticpool.net';
    
    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': this.format === 'toon' ? 'text/plain' : 'application/json'
      }
    });
  }

  setAuthToken(token: string): void {
    this.axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.axiosClient.defaults.headers.common['Authorization'];
  }

  setFormat(format: 'toon' | 'json'): void {
    this.format = format;
    this.axiosClient.defaults.headers['Accept'] = format === 'toon' ? 'text/plain' : 'application/json';
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = { 
      params: { ...params, format: this.format } 
    };
    
    const response = await this.axiosClient.get(path, config);
    return this.parseResponse<T>(response.data);
  }

  async post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const body = this.format === 'toon' && data ? encode(data) : JSON.stringify(data);
    const config: AxiosRequestConfig = { 
      params: { format: this.format },
      headers: { 'Content-Type': 'text/plain' }
    };
    
    const response = await this.axiosClient.post(path, body, config);
    return this.parseResponse<T>(response.data);
  }

  async put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const body = this.format === 'toon' && data ? encode(data) : JSON.stringify(data);
    const config: AxiosRequestConfig = { 
      params: { format: this.format },
      headers: { 'Content-Type': 'text/plain' }
    };
    
    const response = await this.axiosClient.put(path, body, config);
    return this.parseResponse<T>(response.data);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = { 
      params: { format: this.format } 
    };
    
    const response = await this.axiosClient.delete(path, config);
    return this.parseResponse<T>(response.data);
  }

  private parseResponse<T>(data: unknown): ApiResponse<T> {
    if (typeof data === 'string') {
      try {
        const parsed = decode(data) as unknown;
        return parsed as ApiResponse<T>;
      } catch {
        return { success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse response' } };
      }
    }
    return data as ApiResponse<T>;
  }
}
