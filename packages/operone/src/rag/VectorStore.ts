import { embed } from 'ai';

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class VectorStore {
  private documents: Map<string, VectorDocument> = new Map();
  private embeddingModel: any;

  constructor(embeddingModel?: any) {
    this.embeddingModel = embeddingModel;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
      normA += (a[i] ?? 0) * (a[i] ?? 0);
      normB += (b[i] ?? 0) * (b[i] ?? 0);
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Add a document to the vector store
   */
  public async addDocument(id: string, content: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.embeddingModel) {
      throw new Error('VectorStore not initialized with an embedding model');
    }

    const { embedding } = await embed({
      model: this.embeddingModel,
      value: content,
    });

    this.documents.set(id, { id, content, embedding, metadata });
  }

  /**
   * Search for similar documents using vector similarity
   */
  public async search(query: string, topK: number = 5): Promise<VectorDocument[]> {
    if (!this.embeddingModel) {
      throw new Error('VectorStore not initialized with an embedding model');
    }

    const { embedding: queryEmbedding } = await embed({
      model: this.embeddingModel,
      value: query,
    });
    
    const results = Array.from(this.documents.values())
      .map(doc => ({
        doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(result => result.doc);

    return results;
  }

  /**
   * Get document by ID
   */
  public getDocument(id: string): VectorDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Delete document by ID
   */
  public deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * Get total number of documents
   */
  public size(): number {
    return this.documents.size;
  }
}
