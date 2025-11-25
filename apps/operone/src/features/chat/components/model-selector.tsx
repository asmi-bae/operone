"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { OllamaDetector, type OllamaModel } from "@/utils/ollama-detector";
import { useAI } from "@/contexts/ai-context";
import type { ModelInfo } from "@repo/types";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  const navigate = useNavigate();
  const { activeProvider, getAvailableModels } = useAI();
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);

  // Load models from active provider
  const loadProviderModels = useCallback(async () => {
    if (!activeProvider) return;
    
    setIsLoading(true);
    try {
      const models = await getAvailableModels(activeProvider.type);
      setAvailableModels(models);
    } catch (error) {
      console.error("Failed to load provider models:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProvider, getAvailableModels]);

  // Check Ollama availability and load models
  const loadOllamaModels = useCallback(async () => {
    const detector = OllamaDetector.getInstance();
    
    setIsLoading(true);
    try {
      const isAvailable = await detector.checkAvailability();
      setIsOllamaAvailable(isAvailable);
      
      if (isAvailable) {
        const models = await detector.getAvailableModels();
        setOllamaModels(models);
        
        // Convert Ollama models to ModelInfo format
        const ollamaModelInfos: ModelInfo[] = models.map(model => ({
          id: `ollama:${model.name}`,
          name: model.name,
          provider: "ollama" as const,
          description: `${model.details.family} • ${model.details.parameter_size} • ${model.details.quantization_level}`,
          capabilities: ["chat"],
          contextLength: model.details.parameter_size === "7B" ? 4096 : 8192, // Estimate based on model size
        }));
        
        setAvailableModels(prev => [...prev.filter(m => !m.id.startsWith("ollama:")), ...ollamaModelInfos]);
      }
    } catch (error) {
      console.error("Failed to load Ollama models:", error);
      setIsOllamaAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load models when component mounts or provider changes
  useEffect(() => {
    loadProviderModels();
    loadOllamaModels();
  }, [loadProviderModels, loadOllamaModels]);

  // Auto-detect models periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadOllamaModels();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [loadOllamaModels]);

  const handleAddModel = () => {
    navigate("/settings/models/add");
  };

  const allModels = [
    ...availableModels,
    // Add built-in models if no models are available
    ...(availableModels.length === 0 ? [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "openai" as const,
        description: "OpenAI's most capable model",
        capabilities: ["chat"] as const,
        contextLength: 128000,
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: "anthropic" as const,
        description: "Anthropic's most capable model",
        capabilities: ["chat"] as const,
        contextLength: 200000,
      },
    ] : []),
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoading}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select model">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>
                  {allModels.find(m => m.id === selectedModel)?.name || "Select model"}
                </span>
                {isOllamaAvailable && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" title="Ollama connected" />
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </div>
                {selectedModel === model.id && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </div>
            </SelectItem>
          ))}
          
          {/* Ollama models section */}
          {ollamaModels.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Ollama Models
              </div>
              {ollamaModels.map((model) => (
                <SelectItem key={`ollama:${model.name}`} value={`ollama:${model.name}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.details.family} • {model.details.parameter_size}
                      </span>
                    </div>
                    {selectedModel === `ollama:${model.name}` && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          {/* Add model option */}
          <div className="border-t pt-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2"
              onClick={handleAddModel}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
        </SelectContent>
      </Select>
      
      {/* Status indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {isOllamaAvailable && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span>Ollama</span>
          </div>
        )}
        <span>•</span>
        <span>{allModels.length} models</span>
      </div>
    </div>
  );
}
