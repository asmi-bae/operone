import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VectorStore } from './VectorStore';

// Mock the AI SDK embed function
vi.mock('ai', () => ({
  embed: vi.fn(async ({ value }: { value: string }) => {
    // Simple mock: convert string to a vector based on character codes
    const embedding = value.split('').slice(0, 10).map(c => c.charCodeAt(0) / 255);
    // Pad to length 10
    while (embedding.length < 10) {
      embedding.push(0);
    }
    return { embedding };
  }),
}));

describe('VectorStore', () => {
  let vectorStore: VectorStore;
  let mockEmbeddingModel: any;

  beforeEach(() => {
    mockEmbeddingModel = { name: 'mock-embedding-model' };
    vectorStore = new VectorStore(mockEmbeddingModel);
  });

  describe('document operations', () => {
    it('should add document to store', async () => {
      await vectorStore.addDocument('doc1', 'This is a test document');

      expect(vectorStore.size()).toBe(1);
      const doc = vectorStore.getDocument('doc1');
      expect(doc).toBeDefined();
      expect(doc?.content).toBe('This is a test document');
    });

    it('should add document with metadata', async () => {
      const metadata = { source: 'test', author: 'user1' };
      await vectorStore.addDocument('doc1', 'Test content', metadata);

      const doc = vectorStore.getDocument('doc1');
      expect(doc?.metadata).toEqual(metadata);
    });

    it('should get document by ID', async () => {
      await vectorStore.addDocument('doc1', 'Content 1');
      await vectorStore.addDocument('doc2', 'Content 2');

      const doc = vectorStore.getDocument('doc1');
      expect(doc?.id).toBe('doc1');
      expect(doc?.content).toBe('Content 1');
    });

    it('should return undefined for non-existent document', () => {
      const doc = vectorStore.getDocument('nonexistent');
      expect(doc).toBeUndefined();
    });

    it('should delete document', async () => {
      await vectorStore.addDocument('doc1', 'Content');

      const deleted = vectorStore.deleteDocument('doc1');
      expect(deleted).toBe(true);
      expect(vectorStore.size()).toBe(0);
      expect(vectorStore.getDocument('doc1')).toBeUndefined();
    });

    it('should return false when deleting non-existent document', () => {
      const deleted = vectorStore.deleteDocument('nonexistent');
      expect(deleted).toBe(false);
    });

    it('should track size correctly', async () => {
      expect(vectorStore.size()).toBe(0);

      await vectorStore.addDocument('doc1', 'Content 1');
      expect(vectorStore.size()).toBe(1);

      await vectorStore.addDocument('doc2', 'Content 2');
      expect(vectorStore.size()).toBe(2);

      vectorStore.deleteDocument('doc1');
      expect(vectorStore.size()).toBe(1);
    });
  });

  describe('vector search', () => {
    beforeEach(async () => {
      // Add some test documents
      await vectorStore.addDocument('doc1', 'machine learning algorithms');
      await vectorStore.addDocument('doc2', 'deep neural networks');
      await vectorStore.addDocument('doc3', 'natural language processing');
      await vectorStore.addDocument('doc4', 'computer vision systems');
      await vectorStore.addDocument('doc5', 'reinforcement learning agents');
    });

    it('should search and return similar documents', async () => {
      const results = await vectorStore.search('learning', 3);

      expect(results).toHaveLength(3);
      expect(results.every(doc => doc.content)).toBe(true);
    });

    it('should respect topK parameter', async () => {
      const results = await vectorStore.search('learning', 2);
      expect(results).toHaveLength(2);
    });

    it('should return all documents if topK exceeds size', async () => {
      const results = await vectorStore.search('learning', 10);
      expect(results).toHaveLength(5);
    });

    it('should return documents with embeddings', async () => {
      const results = await vectorStore.search('learning', 1);
      
      expect(results[0]?.embedding).toBeDefined();
      expect(Array.isArray(results[0]?.embedding)).toBe(true);
    });
  });

  describe('cosine similarity', () => {
    it('should calculate similarity between vectors', async () => {
      // Add two similar documents
      await vectorStore.addDocument('doc1', 'machine learning');
      await vectorStore.addDocument('doc2', 'machine learning');

      const results = await vectorStore.search('machine learning', 2);

      // Both documents should have high similarity (close to 1)
      expect(results).toHaveLength(2);
    });

    it('should rank more similar documents higher', async () => {
      await vectorStore.addDocument('doc1', 'artificial intelligence');
      await vectorStore.addDocument('doc2', 'completely different topic');

      const results = await vectorStore.search('artificial intelligence', 2);

      // First result should be more similar
      expect(results[0]?.id).toBe('doc1');
    });
  });

  describe('error handling', () => {
    it('should throw error when adding document without embedding model', async () => {
      const storeWithoutModel = new VectorStore();

      await expect(
        storeWithoutModel.addDocument('doc1', 'content')
      ).rejects.toThrow('VectorStore not initialized with an embedding model');
    });

    it('should throw error when searching without embedding model', async () => {
      const storeWithoutModel = new VectorStore();

      await expect(
        storeWithoutModel.search('query')
      ).rejects.toThrow('VectorStore not initialized with an embedding model');
    });
  });

  describe('edge cases', () => {
    it('should handle empty search results', async () => {
      const results = await vectorStore.search('query', 5);
      expect(results).toEqual([]);
    });

    it('should handle documents with empty content', async () => {
      await vectorStore.addDocument('empty', '');
      expect(vectorStore.size()).toBe(1);
    });

    it('should overwrite document with same ID', async () => {
      await vectorStore.addDocument('doc1', 'original content');
      await vectorStore.addDocument('doc1', 'new content');

      expect(vectorStore.size()).toBe(1);
      const doc = vectorStore.getDocument('doc1');
      expect(doc?.content).toBe('new content');
    });
  });
});
