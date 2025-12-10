import type { ModelInfo, ProviderType, ProviderConfig } from '@repo/types';

/**
 * Browser-compatible Memory Manager
 * Uses localStorage instead of SQLite for browser environments
 */
export interface MemoryEntry {
  id: number;
  content: string;
  timestamp: number;
  metadata?: string;
}

export class BrowserMemoryManager {
  public shortTerm: string[] = [];
  private readonly maxShortTermSize = 10;
  private readonly storageKey = 'operone-long-term-memory';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage not available, memory features will be limited');
      return;
    }
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  private getStoredEntries(): MemoryEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  }

  private saveEntries(entries: MemoryEntry[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  public longTerm = {
    query: async (text: string): Promise<string[]> => {
      const entries = this.getStoredEntries();
      const results = entries
        .filter(entry => entry.content.toLowerCase().includes(text.toLowerCase()))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      return results.map(r => r.content);
    },

    store: async (text: string): Promise<void> => {
      const entries = this.getStoredEntries();
      const newEntry: MemoryEntry = {
        id: Date.now(),
        content: text,
        timestamp: Date.now(),
      };
      
      entries.push(newEntry);
      
      if (entries.length > 1000) {
        entries.splice(0, entries.length - 1000);
      }
      
      this.saveEntries(entries);
    }
  };

  public addToShortTerm(content: string): void {
    this.shortTerm.push(content);
    if (this.shortTerm.length > this.maxShortTermSize) {
      this.shortTerm.shift();
    }
  }

  public clearShortTerm(): void {
    this.shortTerm = [];
  }

  public clearLongTerm(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  public getStats(): { vectorDocuments: number; shortTermMemory: number } {
    const entries = this.getStoredEntries();
    return {
      vectorDocuments: entries.length,
      shortTermMemory: this.shortTerm.length,
    };
  }
}

/**
 * Browser-compatible Model Registry
 */
export class BrowserModelRegistry {
  private static models: Record<ProviderType, ModelInfo[]> = {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, description: 'Most capable GPT-4 model' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: 'Affordable and fast' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000, description: 'Previous generation flagship' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385, description: 'Fast and efficient' },
    ],
    anthropic: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', contextWindow: 200000, description: 'Most intelligent model' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', contextWindow: 200000, description: 'Fastest model' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', contextWindow: 200000, description: 'Powerful model for complex tasks' },
    ],
    google: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'google', contextWindow: 1000000, description: 'Latest experimental model' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', contextWindow: 2000000, description: 'Most capable Gemini model' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', contextWindow: 1000000, description: 'Fast and efficient' },
    ],
    mistral: [
      { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral', contextWindow: 128000, description: 'Most capable Mistral model' },
      { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral', contextWindow: 32000, description: 'Efficient and fast' },
      { id: 'codestral-latest', name: 'Codestral', provider: 'mistral', contextWindow: 32000, description: 'Specialized for code' },
    ],

    openrouter: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', description: 'Via OpenRouter' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter', description: 'Via OpenRouter' },
      { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'openrouter', description: 'Via OpenRouter' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter', description: 'Via OpenRouter' },
    ],
    custom: [],
    local: [],
  };



  static getModels(provider: ProviderType): ModelInfo[] {
    return this.models[provider] || [];
  }

  static getModel(provider: ProviderType, modelId: string): ModelInfo | undefined {
    return this.models[provider]?.find(m => m.id === modelId);
  }

  static getAllProviders(): ProviderType[] {
    return Object.keys(this.models) as ProviderType[];
  }
}

/**
 * Ollama Detector for browser environments
 */


/**
 * Browser AI Service - provides AI functionality using Ollama in browser
 */
export class BrowserAIService {
  private memoryManager: BrowserMemoryManager;


  constructor() {
    this.memoryManager = new BrowserMemoryManager();
  }

  async initialize(): Promise<boolean> {
    // Ollama is disabled
    return false;
  }



  async sendMessage(_message: string): Promise<string> {
   throw new Error('Ollama is disabled');
  }

  getActiveProviderConfig(): ProviderConfig | null {
    return null;
  }

  getAllProviderConfigs(): Record<string, ProviderConfig> {
    return {};
  }

  async getModels(_providerType: 'ollama'): Promise<ModelInfo[]> {
    return [];
  }

  isAvailable(): boolean {
    return false;
  }

  async ingestDocument(_id: string, content: string, _metadata?: any): Promise<void> {
    this.memoryManager.longTerm.store(content);
  }

  async queryMemory(query: string): Promise<string[]> {
    return await this.memoryManager.longTerm.query(query);
  }

  getMemoryStats(): { vectorDocuments: number; shortTermMemory: number } {
    return this.memoryManager.getStats();
  }

  getOllamaInfo() {
    return null;
  }
}

/**
 * Browser Adapter - exports all browser-specific utilities
 */
export const BrowserAdapter = {
  BrowserMemoryManager,
  BrowserModelRegistry,

  BrowserAIService,
};
