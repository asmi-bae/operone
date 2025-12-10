import { LanguageModelV1, LanguageModelV1CallOptions, LanguageModelV1Prompt, LanguageModelV1StreamPart } from '@ai-sdk/provider';
import { LocalModel } from './LocalModel';

interface LocalProviderConfig {
  modelPath: string;
  contextSize?: number;
  model: string;
}

export class LocalLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = 'v1';
  readonly provider = 'local';
  readonly modelId: string;
  private localModel: LocalModel;

  constructor(config: LocalProviderConfig) {
    this.modelId = config.model;
    this.localModel = new LocalModel({
        path: config.modelPath,
        contextSize: config.contextSize,
    });
  }

  get defaultObjectGenerationMode() {
    return 'json' as const;
  }

  async doGenerate(options: LanguageModelV1CallOptions) {
    // Ensure model is loaded
    await this.localModel.load();

    const promptText = this.getPromptText(options);
    
    // Simple generation for now
    const response = await this.localModel.generate(promptText);

    return {
      text: response,
      usage: { promptTokens: 0, completionTokens: 0 },
      finishReason: 'stop' as const,
      rawCall: { rawPrompt: promptText, rawOutput: response, rawSettings: {} },
    };
  }

  async doStream(options: LanguageModelV1CallOptions): Promise<{ stream: ReadableStream<LanguageModelV1StreamPart>; rawCall: { rawPrompt: any; rawSettings: any } }> {
    // Ensure model is loaded
    await this.localModel.load();

    const promptText = this.getPromptText(options);
    
    const text = await this.localModel.generate(promptText);
    
    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      start(controller) {
        controller.enqueue({ type: 'text-delta', textDelta: text });
        controller.enqueue({ type: 'finish', finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0 } });
        controller.close();
      }
    });

    return {
      stream,
      rawCall: { rawPrompt: promptText, rawSettings: {} }
    };
  }

  private getPromptText(options: LanguageModelV1CallOptions): string {
    if (options.inputFormat === 'prompt') {
      return this.convertPrompt(options.prompt);
    } else {
      // Handle messages format
      return options.prompt.map(msg => `${msg.role}: ${JSON.stringify(msg.content)}`).join('\n') + '\nassistant: ';
    }
  }

  private convertPrompt(prompt: LanguageModelV1Prompt): string {
    // Convert generic prompt to string
    return prompt.map(msg => `${msg.role}: ${JSON.stringify(msg.content)}`).join('\n') + '\nassistant: ';
  }
}

export function createLocal(config: LocalProviderConfig) {
    const model = new LocalLanguageModel(config);
    return function(modelId: string) {
        return model;
    }
}
