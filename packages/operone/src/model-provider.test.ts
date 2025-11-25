import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModelProvider, ModelRegistry, ProviderManager, createDefaultConfig } from './model-provider';
import type { ProviderConfig, ProviderType } from '@repo/types';

// Mock AI SDK providers
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => ({ name: 'openai-provider' })),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => ({ name: 'anthropic-provider' })),
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => ({ name: 'google-provider' })),
}));

vi.mock('@ai-sdk/mistral', () => ({
  createMistral: vi.fn(() => ({ name: 'mistral-provider' })),
}));

describe('ModelProvider', () => {
  describe('provider creation', () => {
    it('should create OpenAI provider', () => {
      const config: ProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig()).toEqual(config);
    });

    it('should create Anthropic provider', () => {
      const config: ProviderConfig = {
        type: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig().type).toBe('anthropic');
    });

    it('should create Ollama provider', () => {
      const config: ProviderConfig = {
        type: 'ollama',
        baseURL: 'http://localhost:11434',
        model: 'llama2',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig().type).toBe('ollama');
    });

    it('should create Google provider', () => {
      const config: ProviderConfig = {
        type: 'google',
        apiKey: 'test-key',
        model: 'gemini-pro',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig().type).toBe('google');
    });

    it('should create Mistral provider', () => {
      const config: ProviderConfig = {
        type: 'mistral',
        apiKey: 'test-key',
        model: 'mistral-large',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig().type).toBe('mistral');
    });

    it('should create custom provider', () => {
      const config: ProviderConfig = {
        type: 'custom',
        baseURL: 'http://localhost:8000',
        model: 'custom-model',
      };

      const provider = new ModelProvider(config);
      expect(provider.getConfig().type).toBe('custom');
    });
  });

  describe('model operations', () => {
    let provider: ModelProvider;

    beforeEach(() => {
      provider = new ModelProvider({
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      });
    });

    it('should get model instance', () => {
      // Mock the provider as a function
      const mockProvider = provider as any;
      mockProvider.provider = vi.fn((model: string) => ({ name: `model-${model}` }));
      
      const model = provider.getModel();
      expect(model).toBeDefined();
    });

    it('should get embedding model', () => {
      // Mock the textEmbeddingModel function
      const mockProvider = provider as any;
      mockProvider.provider = {
        textEmbeddingModel: vi.fn(() => ({ name: 'embedding-model' })),
      };
      
      const embeddingModel = provider.getEmbeddingModel();
      expect(embeddingModel).toBeDefined();
    });

    it('should update model', () => {
      provider.setModel('gpt-4-turbo');
      expect(provider.getConfig().model).toBe('gpt-4-turbo');
    });

    it('should get provider configuration', () => {
      const config = provider.getConfig();
      expect(config.type).toBe('openai');
      expect(config.model).toBe('gpt-4');
    });
  });
});

describe('ModelRegistry', () => {
  describe('model lookup', () => {
    it('should get models for OpenAI provider', () => {
      const models = ModelRegistry.getModels('openai');
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.id.includes('gpt'))).toBe(true);
    });

    it('should get models for Anthropic provider', () => {
      const models = ModelRegistry.getModels('anthropic');
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.id.includes('claude'))).toBe(true);
    });

    it('should get models for Google provider', () => {
      const models = ModelRegistry.getModels('google');
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.id.includes('gemini'))).toBe(true);
    });

    it('should get models for Mistral provider', () => {
      const models = ModelRegistry.getModels('mistral');
      expect(models.length).toBeGreaterThan(0);
    });

    it('should get specific model by ID', () => {
      // Get the first OpenAI model from the registry
      const models = ModelRegistry.getModels('openai');
      const firstModel = models[0];
      
      if (firstModel) {
        const model = ModelRegistry.getModel('openai', firstModel.id);
        expect(model).toBeDefined();
        expect(model?.id).toBe(firstModel.id);
        expect(model?.provider).toBe('openai');
      }
    });

    it('should return undefined for non-existent model', () => {
      const model = ModelRegistry.getModel('openai', 'nonexistent-model');
      expect(model).toBeUndefined();
    });
  });

  describe('provider listing', () => {
    it('should get all providers', () => {
      const providers = ModelRegistry.getAllProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('google');
      expect(providers).toContain('mistral');
      expect(providers).toContain('ollama');
    });
  });

  describe('Ollama models', () => {
    it('should update Ollama models', () => {
      const customModels = [
        {
          id: 'custom-llama',
          name: 'Custom Llama',
          provider: 'ollama' as ProviderType,
        },
      ];

      ModelRegistry.updateOllamaModels(customModels);
      const models = ModelRegistry.getModels('ollama');
      
      expect(models.some(m => m.id === 'custom-llama')).toBe(true);
    });
  });
});

describe('ProviderManager', () => {
  let manager: ProviderManager;

  beforeEach(() => {
    manager = new ProviderManager();
  });

  describe('provider management', () => {
    it('should add provider', () => {
      const config: ProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const provider = manager.addProvider('openai-1', config);
      expect(provider).toBeDefined();
      expect(provider.getConfig().type).toBe('openai');
    });

    it('should get provider by ID', () => {
      const config: ProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      manager.addProvider('openai-1', config);
      const provider = manager.getProvider('openai-1');

      expect(provider).toBeDefined();
      expect(provider?.getConfig().model).toBe('gpt-4');
    });

    it('should return undefined for non-existent provider', () => {
      const provider = manager.getProvider('nonexistent');
      expect(provider).toBeUndefined();
    });

    it('should remove provider', () => {
      const config: ProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      manager.addProvider('openai-1', config);
      const removed = manager.removeProvider('openai-1');

      expect(removed).toBe(true);
      expect(manager.getProvider('openai-1')).toBeUndefined();
    });

    it('should return false when removing non-existent provider', () => {
      const removed = manager.removeProvider('nonexistent');
      expect(removed).toBe(false);
    });

    it('should get all provider IDs', () => {
      manager.addProvider('openai-1', { type: 'openai', model: 'gpt-4', apiKey: 'key1' });
      manager.addProvider('anthropic-1', { type: 'anthropic', model: 'claude-3-opus', apiKey: 'key2' });

      const ids = manager.getProviderIds();
      expect(ids).toContain('openai-1');
      expect(ids).toContain('anthropic-1');
      expect(ids).toHaveLength(2);
    });

    it('should get all providers', () => {
      manager.addProvider('openai-1', { type: 'openai', model: 'gpt-4', apiKey: 'key1' });
      manager.addProvider('anthropic-1', { type: 'anthropic', model: 'claude-3-opus', apiKey: 'key2' });

      const providers = manager.getAllProviders();
      expect(providers.size).toBe(2);
      expect(providers.has('openai-1')).toBe(true);
      expect(providers.has('anthropic-1')).toBe(true);
    });
  });

  describe('active provider management', () => {
    beforeEach(() => {
      manager.addProvider('openai-1', { type: 'openai', model: 'gpt-4', apiKey: 'key1' });
      manager.addProvider('anthropic-1', { type: 'anthropic', model: 'claude-3-opus', apiKey: 'key2' });
    });

    it('should set active provider', () => {
      const success = manager.setActiveProvider('openai-1');
      expect(success).toBe(true);

      const active = manager.getActiveProvider();
      expect(active?.getConfig().type).toBe('openai');
    });

    it('should return false when setting non-existent provider as active', () => {
      const success = manager.setActiveProvider('nonexistent');
      expect(success).toBe(false);
    });

    it('should switch active provider', () => {
      manager.setActiveProvider('openai-1');
      manager.setActiveProvider('anthropic-1');

      const active = manager.getActiveProvider();
      expect(active?.getConfig().type).toBe('anthropic');
    });

    it('should set first added provider as active', () => {
      const newManager = new ProviderManager();
      newManager.addProvider('first', { type: 'openai', model: 'gpt-4', apiKey: 'key' });

      const active = newManager.getActiveProvider();
      expect(active?.getConfig().type).toBe('openai');
    });
  });
});

describe('createDefaultConfig', () => {
  it('should create default OpenAI config', () => {
    const config = createDefaultConfig();
    expect(config.type).toBe('openai');
    expect(config.model).toBe('gpt-4o-mini'); // Actual default from implementation
  });
});
