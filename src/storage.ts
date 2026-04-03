export interface StoredCredentials {
  publicToken: string;
  privateKey: string;
  jwt?: string;
  expiresAt?: number;
  networkId: string;
}

const STORAGE_KEY_PREFIX = 'agneticpool_';

export class CredentialStorage {
  private memoryStorage: Map<string, StoredCredentials> = new Map();
  private nodeFs: typeof import('fs') | null = null;
  private nodePath: typeof import('path') | null = null;
  private nodeOs: typeof import('os') | null = null;
  private configDir: string | null = null;
  private isBrowser: boolean = false;
  private localStorageImpl: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void; length: number; key: (index: number) => string | null; } | null = null;

  constructor() {
    this.isBrowser = typeof globalThis !== 'undefined' && 
                      typeof (globalThis as any).localStorage !== 'undefined';
    
    if (this.isBrowser) {
      this.localStorageImpl = (globalThis as any).localStorage;
    } else if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        this.nodeFs = require('fs');
        this.nodePath = require('path');
        this.nodeOs = require('os');
        this.configDir = this.nodePath!.join(this.nodeOs!.homedir(), '.agneticpool', 'credentials');
        this.ensureDir(this.configDir);
      } catch {
        // Fallback to memory storage
      }
    }
  }

  private ensureDir(dir: string): void {
    if (this.nodeFs && !this.nodeFs.existsSync(dir)) {
      this.nodeFs.mkdirSync(dir, { recursive: true });
    }
  }

  async getCredentials(networkId: string): Promise<StoredCredentials | null> {
    const key = `${STORAGE_KEY_PREFIX}${networkId}`;

    if (this.isBrowser && this.localStorageImpl) {
      const stored = this.localStorageImpl.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    }

    if (this.nodeFs && this.configDir) {
      const filePath = this.nodePath!.join(this.configDir, `${networkId}.json`);
      if (this.nodeFs.existsSync(filePath)) {
        try {
          const content = this.nodeFs.readFileSync(filePath, 'utf-8');
          return JSON.parse(content);
        } catch {
          return null;
        }
      }
    }

    return this.memoryStorage.get(key) || null;
  }

  async saveCredentials(credentials: StoredCredentials): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${credentials.networkId}`;

    if (this.isBrowser && this.localStorageImpl) {
      this.localStorageImpl.setItem(key, JSON.stringify(credentials));
      return;
    }

    if (this.nodeFs && this.configDir) {
      const filePath = this.nodePath!.join(this.configDir, `${credentials.networkId}.json`);
      this.nodeFs.writeFileSync(filePath, JSON.stringify(credentials, null, 2));
      return;
    }

    this.memoryStorage.set(key, credentials);
  }

  async clearCredentials(networkId: string): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${networkId}`;

    if (this.isBrowser && this.localStorageImpl) {
      this.localStorageImpl.removeItem(key);
      return;
    }

    if (this.nodeFs && this.configDir) {
      const filePath = this.nodePath!.join(this.configDir, `${networkId}.json`);
      if (this.nodeFs.existsSync(filePath)) {
        this.nodeFs.unlinkSync(filePath);
      }
      return;
    }

    this.memoryStorage.delete(key);
  }

  async clearAllCredentials(): Promise<void> {
    if (this.isBrowser && this.localStorageImpl) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < this.localStorageImpl.length; i++) {
        const key = this.localStorageImpl.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.localStorageImpl!.removeItem(key));
      return;
    }

    if (this.nodeFs && this.configDir) {
      const files = this.nodeFs.readdirSync(this.configDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          this.nodeFs!.unlinkSync(this.nodePath!.join(this.configDir!, file));
        }
      });
      return;
    }

    this.memoryStorage.clear();
  }

  isTokenValid(credentials: StoredCredentials): boolean {
    if (!credentials.jwt || !credentials.expiresAt) {
      return false;
    }
    const bufferTime = 5 * 60 * 1000;
    return Date.now() < (credentials.expiresAt - bufferTime);
  }
}

export const credentialStorage = new CredentialStorage();
