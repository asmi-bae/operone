import { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface ModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom' | 'local';
  description?: string;
  contextLength?: number;
  isLocal?: boolean;
  isActive?: boolean;
  requiresAuth?: boolean;
  authStatus?: 'authenticated' | 'pending' | 'failed' | 'not_required';
}

interface ModelDetectorContextType {
  // Available models
  availableModels: ModelInfo[];
  isLoading: boolean;
  error: string | null;



  // Authentication (placeholder for future implementation)
  authenticateModel: (modelId: string, credentials: any) => Promise<boolean>;
  deauthenticateModel: (modelId: string) => Promise<void>;
  getAuthStatus: (modelId: string) => 'authenticated' | 'pending' | 'failed' | 'not_required';

  // Actions
  refreshModels: () => Promise<void>;

}

const ModelDetectorContext = createContext<ModelDetectorContextType | null>(null);

export function ModelDetectorProvider({ children }: { children: ReactNode }) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Detect imported GGUF models from electron storage
  const detectImportedModels = async () => {
    try {
      // @ts-ignore
      if (!window.electronAPI?.model) {
        return [];
      }

      // @ts-ignore
      const ggufModels = await window.electronAPI.model.list();

      // Convert GGUF models to ModelInfo format
      const modelInfos: ModelInfo[] = ggufModels.map((model: any) => ({
        id: `local:${model.id}`,
        name: model.name,
        provider: 'local' as const,
        description: `${model.parameterCount || 'Unknown size'} • ${model.quantization || 'GGUF'} • ${(model.fileSize / (1024 * 1024 * 1024)).toFixed(2)}GB`,
        contextLength: model.contextSize || 2048,
        isLocal: true,
        isActive: false,
        requiresAuth: false,
        authStatus: 'not_required' as const,
      }));

      return modelInfos;
    } catch (err) {
      console.error('Failed to detect imported GGUF models:', err);
      return [];
    }
  };


  // Detect all available models
  const detectAllModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const models: ModelInfo[] = [];

      // Detect imported GGUF models
      const importedModelInfos = await detectImportedModels();
      models.push(...importedModelInfos);

      // Fetch models from active provider (OpenRouter, etc.)
      if (window.electronAPI?.ai) {
        try {
          const activeProvider = await window.electronAPI.ai.getActiveProvider();

          if (activeProvider) {
            // Get models for the active provider type
            const providerModels = await window.electronAPI.ai.getModels(activeProvider.type);

            // Convert to ModelInfo format
            const providerModelInfos: ModelInfo[] = providerModels.map((model: any) => ({
              id: model.id,
              name: model.name,
              provider: model.provider as any,
              description: model.description,
              contextLength: model.contextWindow,
              isLocal: false,
              isActive: model.id === activeProvider.model, // Mark the configured model as active
              requiresAuth: false,
              authStatus: 'not_required' as const,
            }));

            models.push(...providerModelInfos);
          }
        } catch (err) {
          console.warn('Failed to fetch provider models:', err);
        }
      }

      // Note: Cloud provider models will be added when user configures them with API keys
      setAvailableModels(models);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect models');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh models
  const refreshModels = async () => {
    await detectAllModels();
  };



  // Authentication methods (placeholder for future implementation)
  const authenticateModel = async (modelId: string, credentials: any): Promise<boolean> => {
    // TODO: Implement actual authentication logic
    console.log(`Authenticating model ${modelId} with credentials:`, credentials);

    // Simulate authentication
    setAvailableModels(prev =>
      prev.map(model =>
        model.id === modelId
          ? { ...model, authStatus: 'authenticated' as const, isActive: true }
          : model
      )
    );

    return true;
  };

  const deauthenticateModel = async (modelId: string): Promise<void> => {
    // TODO: Implement actual deauthentication logic
    console.log(`Deauthenticating model ${modelId}`);

    setAvailableModels(prev =>
      prev.map(model =>
        model.id === modelId
          ? { ...model, authStatus: 'pending' as const, isActive: false }
          : model
      )
    );
  };

  const getAuthStatus = (modelId: string): 'authenticated' | 'pending' | 'failed' | 'not_required' => {
    const model = availableModels.find(m => m.id === modelId);
    return model?.authStatus || 'not_required';
  };

  // Initial detection
  useEffect(() => {
    detectAllModels();

    // Set up periodic refresh for all models
    const interval = setInterval(async () => {
      const importedModelInfos = await detectImportedModels();

      setAvailableModels(prev => {
        // Remove old local models, add refreshed ones
        const otherModels = prev.filter(m => m.provider !== 'local');
        return [...otherModels, ...importedModelInfos];
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: ModelDetectorContextType = {
    availableModels,
    isLoading,
    error,
    refreshModels,
    authenticateModel,
    deauthenticateModel,
    getAuthStatus,
  };

  return (
    <ModelDetectorContext.Provider value={value}>
      {children}
    </ModelDetectorContext.Provider>
  );
}

export function useModelDetector() {
  const context = useContext(ModelDetectorContext);
  if (!context) {
    throw new Error('useModelDetector must be used within a ModelDetectorProvider');
  }
  return context;
}
