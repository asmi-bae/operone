import type { ModelInfo, ProviderType } from '@repo/types'

/**
 * Browser-compatible Model Registry
 * Contains only the methods needed for browser functionality
 */
export class BrowserModelRegistry {
  // Dynamic model registry - populated only with detected/imported models
  private static models: Record<ProviderType, ModelInfo[]> = {
    openai: [],
    anthropic: [],
    google: [],
    mistral: [],

    openrouter: [],
    local: [],
    custom: [],
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
