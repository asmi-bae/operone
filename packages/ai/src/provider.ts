import { LanguageModelV2, LanguageModelV2CallOptions, LanguageModelV2Prompt, LanguageModelV2StreamPart } from '@ai-sdk/provider';
import { LocalModel } from './LocalModel';
import { MockModel } from './MockModel';

interface LocalProviderConfig {
  modelPath: string;
  contextSize?: number;
  model: string;
  useMock?: boolean; // Enable mock mode explicitly
}

export class LocalLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2';
  readonly supportedUrls = {};
  readonly provider = 'local';
  readonly modelId: string;
  private localModel: LocalModel | MockModel;
  private useMock: boolean;

  constructor(config: LocalProviderConfig) {
    this.modelId = config.model;
    this.useMock = config.useMock || !config.modelPath || config.modelPath === '';
    
    if (this.useMock) {
      console.log('Local Provider: Using Mock Model (no valid model path configured)');
      this.localModel = new MockModel();
    } else {
      this.localModel = new LocalModel({
        path: config.modelPath,
        contextSize: config.contextSize,
      });
    }
  }

  get defaultObjectGenerationMode() {
    return 'json' as const;
  }

  async doGenerate(options: LanguageModelV2CallOptions) {
    if (this.useMock) {
      const response = await this.localModel.generate('');
      return {
        content: [{ type: 'text' as const, text: response }],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        finishReason: 'stop' as const,
        warnings: [],
        rawCall: { rawPrompt: '', rawOutput: response, rawSettings: {} },
      };
    }

    try {
        await this.localModel.load();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('Failed to load local model:', error);
        
        return {
          content: [{ type: 'text' as const, text: `Error: Failed to load model. ${errorMessage}` }],
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          finishReason: 'error' as const,
          warnings: [],
          rawCall: { rawPrompt: '', rawOutput: '', rawSettings: {} },
        };
    }

    const promptText = this.getPromptText(options);
    const response = await this.localModel.generate(promptText);

    return {
      content: [{ type: 'text' as const, text: response }],
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      finishReason: 'stop' as const,
      warnings: [],
      rawCall: { rawPrompt: promptText, rawOutput: response, rawSettings: {} },
    };
  }

  async doStream(options: LanguageModelV2CallOptions): Promise<{ stream: ReadableStream<LanguageModelV2StreamPart>; rawCall: { rawPrompt: any; rawSettings: any } }> {
    if (this.useMock) {
      const mockStream = this.localModel.stream('');
      const stream = new ReadableStream<LanguageModelV2StreamPart>({
        async start(controller) {
          let fullText = '';
          for await (const token of mockStream) {
            fullText += token;
            controller.enqueue({ type: 'text-delta', delta: token } as any);
          }
          controller.enqueue({ type: 'finish', finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } });
          controller.close();
        }
      });
      return { stream, rawCall: { rawPrompt: '', rawSettings: {} } };
    }

    try {
        await this.localModel.load();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('Failed to load local model:', error);

        const stream = new ReadableStream<LanguageModelV2StreamPart>({
            start(controller) {
                controller.enqueue({ type: 'text-delta', delta: `Error: Failed to load model. ${errorMessage}` } as any);
                controller.enqueue({ type: 'finish', finishReason: 'error', usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } });
                controller.close();
            }
        });
        return {
            stream,
            rawCall: { rawPrompt: '', rawSettings: {} }
        };
    }

    const promptText = this.getPromptText(options);
    const text = await this.localModel.generate(promptText);
    
    const stream = new ReadableStream<LanguageModelV2StreamPart>({
      start(controller) {
        controller.enqueue({ type: 'text-delta', delta: text } as any);
        controller.enqueue({ type: 'finish', finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } });
        controller.close();
      }
    });

    return {
      stream,
      rawCall: { rawPrompt: promptText, rawSettings: {} }
    };
  }

  private getPromptText(options: LanguageModelV2CallOptions): string {
    return this.convertPrompt(options.prompt);
  }

  private convertPrompt(prompt: LanguageModelV2Prompt): string {
    return prompt.map((msg: any) => `${msg.role}: ${JSON.stringify(msg.content)}`).join('\n') + '\nassistant: ';
  }
}

export function createLocal(config: LocalProviderConfig) {
    const model = new LocalLanguageModel(config);
    return function(modelId: string) {
        return model;
    }
}
