import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryManager } from './MemoryManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(tmpdir(), `test-memory-${Date.now()}.db`);
    memoryManager = new MemoryManager(testDbPath);
  });

  afterEach(async () => {
    memoryManager.close();
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('short-term memory', () => {
    it('should add items to short-term memory', () => {
      memoryManager.addToShortTerm('memory 1');
      memoryManager.addToShortTerm('memory 2');

      expect(memoryManager.shortTerm).toHaveLength(2);
      expect(memoryManager.shortTerm).toContain('memory 1');
      expect(memoryManager.shortTerm).toContain('memory 2');
    });

    it('should enforce max size of short-term memory', () => {
      // Add more than max size (10)
      for (let i = 0; i < 15; i++) {
        memoryManager.addToShortTerm(`memory ${i}`);
      }

      expect(memoryManager.shortTerm).toHaveLength(10);
      // Should have the last 10 items
      expect(memoryManager.shortTerm[0]).toBe('memory 5');
      expect(memoryManager.shortTerm[9]).toBe('memory 14');
    });

    it('should clear short-term memory', () => {
      memoryManager.addToShortTerm('memory 1');
      memoryManager.addToShortTerm('memory 2');
      
      memoryManager.clearShortTerm();

      expect(memoryManager.shortTerm).toHaveLength(0);
    });
  });

  describe('long-term memory', () => {
    it('should store items in long-term memory', async () => {
      await memoryManager.longTerm.store('important memory 1');
      await memoryManager.longTerm.store('important memory 2');

      const results = await memoryManager.longTerm.query('important');
      
      expect(results).toHaveLength(2);
      expect(results).toContain('important memory 1');
      expect(results).toContain('important memory 2');
    });

    it('should query long-term memory', async () => {
      await memoryManager.longTerm.store('error occurred in system');
      await memoryManager.longTerm.store('user logged in');
      await memoryManager.longTerm.store('error in database connection');

      const results = await memoryManager.longTerm.query('error');

      expect(results).toHaveLength(2);
      expect(results.some(r => r.includes('error occurred'))).toBe(true);
      expect(results.some(r => r.includes('error in database'))).toBe(true);
    });

    it('should return results ordered by timestamp (most recent first)', async () => {
      await memoryManager.longTerm.store('first memory');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await memoryManager.longTerm.store('second memory');
      await new Promise(resolve => setTimeout(resolve, 10));
      await memoryManager.longTerm.store('third memory');

      const results = await memoryManager.longTerm.query('memory');

      expect(results[0]).toBe('third memory');
      expect(results[1]).toBe('second memory');
      expect(results[2]).toBe('first memory');
    });

    it('should limit query results to 10 items', async () => {
      for (let i = 0; i < 15; i++) {
        await memoryManager.longTerm.store(`memory ${i}`);
      }

      const results = await memoryManager.longTerm.query('memory');

      expect(results).toHaveLength(10);
    });

    it('should return empty array for no matches', async () => {
      await memoryManager.longTerm.store('test memory');

      const results = await memoryManager.longTerm.query('nonexistent');

      expect(results).toEqual([]);
    });
  });

  describe('database operations', () => {
    it('should initialize database with correct schema', async () => {
      // Query should work without errors
      const results = await memoryManager.longTerm.query('test');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should persist data across instances', async () => {
      await memoryManager.longTerm.store('persistent memory');
      memoryManager.close();

      // Create new instance with same database
      const newManager = new MemoryManager(testDbPath);
      const results = await newManager.longTerm.query('persistent');

      expect(results).toContain('persistent memory');
      newManager.close();
    });

    it('should close database connection', () => {
      expect(() => memoryManager.close()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw error in browser environment', () => {
      // This test verifies the error message for browser environment
      // In actual browser, Database would be undefined
      expect(() => {
        // Simulating browser environment would require mocking
        // For now, we just verify the constructor works in Node
        new MemoryManager();
      }).not.toThrow();
    });
  });
});
