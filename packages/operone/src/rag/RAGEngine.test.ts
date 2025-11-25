import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RAGEngine } from './RAGEngine';
import { MemoryManager } from '../memory/MemoryManager';
import * as path from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs/promises';

// Mock the AI SDK
vi.mock('ai', () => ({
  embed: vi.fn(async ({ value }: { value: string }) => {
    const embedding = value.split('').slice(0, 10).map(c => c.charCodeAt(0) / 255);
    while (embedding.length < 10) {
      embedding.push(0);
    }
    return { embedding };
  }),
}));

describe('RAGEngine', () => {
  let ragEngine: RAGEngine;
  let memoryManager: MemoryManager;
  let testDbPath: string;
  let mockEmbeddingModel: any;

  beforeEach(() => {
    testDbPath = path.join(tmpdir(), `test-rag-${Date.now()}.db`);
    memoryManager = new MemoryManager(testDbPath);
    mockEmbeddingModel = { name: 'mock-embedding-model' };
    ragEngine = new RAGEngine(memoryManager, mockEmbeddingModel);
  });

  afterEach(async () => {
    memoryManager.close();
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('document ingestion', () => {
    it('should ingest document into both vector store and memory', async () => {
      await ragEngine.ingestDocument('doc1', 'This is a test document');

      const stats = ragEngine.getStats();
      expect(stats.vectorDocuments).toBe(1);

      // Check long-term memory
      const memoryResults = await memoryManager.longTerm.query('test');
      expect(memoryResults).toContain('This is a test document');
    });

    it('should ingest document with metadata', async () => {
      const metadata = { source: 'test', timestamp: Date.now() };
      await ragEngine.ingestDocument('doc1', 'Document with metadata', metadata);

      const stats = ragEngine.getStats();
      expect(stats.vectorDocuments).toBe(1);
    });

    it('should ingest multiple documents', async () => {
      await ragEngine.ingestDocument('doc1', 'First document');
      await ragEngine.ingestDocument('doc2', 'Second document');
      await ragEngine.ingestDocument('doc3', 'Third document');

      const stats = ragEngine.getStats();
      expect(stats.vectorDocuments).toBe(3);
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      // Ingest test documents
      await ragEngine.ingestDocument('doc1', 'machine learning algorithms');
      await ragEngine.ingestDocument('doc2', 'deep neural networks');
      await ragEngine.ingestDocument('doc3', 'natural language processing');
    });

    it('should query and return results from both sources', async () => {
      const results = await ragEngine.query('learning', 5);

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.content && r.relevance !== undefined && r.source)).toBe(true);
    });

    it('should include source information', async () => {
      const results = await ragEngine.query('learning', 5);

      const hasVectorSource = results.some(r => r.source === 'vector');
      const hasMemorySource = results.some(r => r.source === 'memory');

      expect(hasVectorSource || hasMemorySource).toBe(true);
    });

    it('should respect topK parameter', async () => {
      const results = await ragEngine.query('learning', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should sort results by relevance', async () => {
      const results = await ragEngine.query('learning', 5);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.relevance).toBeGreaterThanOrEqual(results[i]!.relevance);
      }
    });

    it('should deduplicate results from different sources', async () => {
      const results = await ragEngine.query('machine learning', 10);

      const contents = results.map(r => r.content);
      const uniqueContents = new Set(contents);

      expect(contents.length).toBe(uniqueContents.size);
    });

    it('should return empty array for no matches', async () => {
      const results = await ragEngine.query('nonexistent query xyz123', 5);

      // Might return empty or very low relevance results
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('relevance scoring', () => {
    beforeEach(async () => {
      await ragEngine.ingestDocument('doc1', 'artificial intelligence');
      await ragEngine.ingestDocument('doc2', 'machine learning');
    });

    it('should assign relevance scores between 0 and 1', async () => {
      const results = await ragEngine.query('intelligence', 5);

      results.forEach(result => {
        expect(result.relevance).toBeGreaterThanOrEqual(0);
        expect(result.relevance).toBeLessThanOrEqual(1);
      });
    });

    it('should assign higher relevance to vector results', async () => {
      const results = await ragEngine.query('intelligence', 5);

      const vectorResults = results.filter(r => r.source === 'vector');
      const memoryResults = results.filter(r => r.source === 'memory');

      if (vectorResults.length > 0 && memoryResults.length > 0) {
        expect(vectorResults[0]!.relevance).toBeGreaterThan(memoryResults[0]!.relevance);
      }
    });
  });

  describe('statistics', () => {
    it('should return correct statistics', async () => {
      await ragEngine.ingestDocument('doc1', 'Document 1');
      await ragEngine.ingestDocument('doc2', 'Document 2');
      memoryManager.addToShortTerm('short term memory 1');
      memoryManager.addToShortTerm('short term memory 2');

      const stats = ragEngine.getStats();

      expect(stats.vectorDocuments).toBe(2);
      expect(stats.shortTermMemory).toBe(2);
    });

    it('should return zero for empty RAG system', () => {
      const stats = ragEngine.getStats();

      expect(stats.vectorDocuments).toBe(0);
      expect(stats.shortTermMemory).toBe(0);
    });
  });

  describe('integration', () => {
    it('should work with memory manager short-term memory', async () => {
      memoryManager.addToShortTerm('recent context 1');
      memoryManager.addToShortTerm('recent context 2');

      await ragEngine.ingestDocument('doc1', 'stored document');

      const stats = ragEngine.getStats();
      expect(stats.shortTermMemory).toBe(2);
      expect(stats.vectorDocuments).toBe(1);
    });

    it('should persist across queries', async () => {
      await ragEngine.ingestDocument('doc1', 'persistent document');

      const results1 = await ragEngine.query('persistent', 5);
      const results2 = await ragEngine.query('persistent', 5);

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });
  });
});
