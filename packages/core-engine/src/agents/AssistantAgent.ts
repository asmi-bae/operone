import { Agent } from '@repo/types';
import { RAGEngine } from '../rag/RAGEngine';
import { MemoryManager } from '../memory/MemoryManager';
import { generateText } from 'ai';
import { ModelProvider } from '../model-provider';

export interface AssistantAgentConfig {
  modelProvider: ModelProvider;
  memoryManager: MemoryManager;
}

export class AssistantAgent implements Agent {
  public readonly id = 'assistant-agent';
  public readonly name = 'Assistant Agent';
  public readonly role = 'assistant' as const;

  private modelProvider: ModelProvider;
  private ragEngine: RAGEngine;
  private memoryManager: MemoryManager;
  private lastThought: string = '';

  constructor(config: AssistantAgentConfig) {
    this.modelProvider = config.modelProvider;
    this.memoryManager = config.memoryManager;
    
    // Get embedding model from provider
    const embeddingModel = this.modelProvider.getEmbeddingModel();
    this.ragEngine = new RAGEngine(this.memoryManager, embeddingModel);
  }

  async think(input: string): Promise<string> {
    // Query RAG for relevant context
    const ragResults = await this.ragEngine.query(input, 3);
    const context = ragResults.map(r => r.content).join('\n');

    // Add to short-term memory
    this.memoryManager.addToShortTerm(input);

    const systemPrompt = `You are an intelligent assistant with access to:
- Long-term memory (RAG-based retrieval)
- Short-term conversation memory
- Vector-based document search

Use the provided context to answer questions accurately.
If you have a final answer, prefix it with "FINAL ANSWER:".`;

    const { text } = await generateText({
      model: this.modelProvider.getModel(),
      system: systemPrompt,
      prompt: `Context from memory:\n${context}\n\nUser question: ${input}\n\nProvide a thoughtful response.`,
    });

    this.lastThought = text;
    return text;
  }

  async act(action: string): Promise<void> {
    // Store important information in long-term memory
    if (action.length > 50) {
      await this.memoryManager.longTerm.store(action);
    }
  }

  async observe(): Promise<string> {
    return this.lastThought;
  }

  /**
   * Ingest documents into the RAG system
   */
  async ingestDocument(id: string, content: string, metadata?: Record<string, any>): Promise<void> {
    await this.ragEngine.ingestDocument(id, content, metadata);
  }

  /**
   * Get RAG statistics
   */
  getStats() {
    return this.ragEngine.getStats();
  }
}
