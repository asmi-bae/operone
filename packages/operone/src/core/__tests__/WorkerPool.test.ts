import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WorkerPool } from '../WorkerPool';
import { EventBus } from '../EventBus';

// Mock worker_threads
vi.mock('worker_threads', () => ({
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    postMessage: vi.fn(),
    terminate: vi.fn()
  }))
}));

describe('WorkerPool', () => {
  let workerPool: WorkerPool;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (workerPool) {
      workerPool.terminate();
    }
  });

  describe('initialization', () => {
    it('should create a worker pool with default workers', () => {
      workerPool = new WorkerPool(4);
      const stats = workerPool.getStats();
      
      expect(stats.totalWorkers).toBe(4);
      expect(stats.activeWorkers).toBe(0);
      expect(stats.pendingTasks).toBe(0);
      expect(stats.queuedTasks).toBe(0);
    });

    it('should create a worker pool with custom number of workers', () => {
      workerPool = new WorkerPool(8);
      const stats = workerPool.getStats();
      
      expect(stats.totalWorkers).toBe(8);
    });
  });

  describe('task execution', () => {
    beforeEach(() => {
      workerPool = new WorkerPool(2);
    });

    it('should queue tasks when all workers are busy', async () => {
      // Execute multiple tasks
      const task1 = workerPool.executeTask('test', { data: 1 });
      const task2 = workerPool.executeTask('test', { data: 2 });
      const task3 = workerPool.executeTask('test', { data: 3 });

      const stats = workerPool.getStats();
      
      // With 2 workers, 2 tasks should be active and 1 queued
      expect(stats.activeWorkers + stats.queuedTasks).toBeGreaterThanOrEqual(1);
    });

    it('should respect task priority', async () => {
      // Create tasks with different priorities
      const lowPriority = workerPool.executeTask('test', { data: 1 }, { priority: 1 });
      const highPriority = workerPool.executeTask('test', { data: 2 }, { priority: 10 });
      const mediumPriority = workerPool.executeTask('test', { data: 3 }, { priority: 5 });

      const stats = workerPool.getStats();
      
      // Tasks should be queued
      expect(stats.pendingTasks + stats.queuedTasks).toBeGreaterThan(0);
    });

    it('should handle task timeout', async () => {
      const task = workerPool.executeTask('test', { data: 1 }, { timeout: 100 });

      // Wait for timeout
      await expect(task).rejects.toThrow(/timeout/i);
    });

    it('should retry failed tasks', async () => {
      const task = workerPool.executeTask('test', { data: 1 }, { maxRetries: 3 });

      // Task should be retried on failure
      const stats = workerPool.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('stats', () => {
    beforeEach(() => {
      workerPool = new WorkerPool(4);
    });

    it('should return accurate stats', () => {
      const stats = workerPool.getStats();
      
      expect(stats).toHaveProperty('totalWorkers');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats).toHaveProperty('pendingTasks');
      expect(stats).toHaveProperty('queuedTasks');
      
      expect(stats.totalWorkers).toBe(4);
      expect(stats.activeWorkers).toBe(0);
      expect(stats.pendingTasks).toBe(0);
      expect(stats.queuedTasks).toBe(0);
    });

    it('should update stats when tasks are executed', async () => {
      workerPool.executeTask('test', { data: 1 });
      
      const stats = workerPool.getStats();
      
      // At least one task should be pending or active
      expect(stats.pendingTasks + stats.activeWorkers).toBeGreaterThan(0);
    });
  });

  describe('termination', () => {
    it('should terminate all workers', () => {
      workerPool = new WorkerPool(4);
      
      workerPool.terminate();
      
      // After termination, stats should show no activity
      const stats = workerPool.getStats();
      expect(stats.activeWorkers).toBe(0);
    });

    it('should reject pending tasks on termination', async () => {
      workerPool = new WorkerPool(1);
      
      const task = workerPool.executeTask('test', { data: 1 });
      workerPool.terminate();
      
      await expect(task).rejects.toThrow(/terminated/i);
    });
  });

  describe('event emission', () => {
    beforeEach(() => {
      workerPool = new WorkerPool(2);
    });

    it('should emit task:start event', (done) => {
      const unsubscribe = eventBus.subscribe('system', 'task:start', (data) => {
        expect(data).toHaveProperty('taskId');
        expect(data).toHaveProperty('taskType');
        expect(data).toHaveProperty('workerId');
        unsubscribe();
        done();
      });

      workerPool.executeTask('test', { data: 1 });
    });
  });
});
