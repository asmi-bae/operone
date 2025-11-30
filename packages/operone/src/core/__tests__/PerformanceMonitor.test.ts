import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { EventBus } from '../EventBus';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let eventBus: EventBus;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    eventBus = EventBus.getInstance();
  });

  describe('profiling', () => {
    it('should start and end a profile', () => {
      const operationId = monitor.startProfile('test-operation');
      
      expect(operationId).toBeDefined();
      expect(operationId).toMatch(/^perf_/);
      
      monitor.endProfile(operationId);
      
      const completed = monitor.getCompletedProfiles();
      expect(completed).toHaveLength(1);
      expect(completed[0].operationName).toBe('test-operation');
      expect(completed[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should support nested profiles', () => {
      const parentId = monitor.startProfile('parent-operation');
      const childId = monitor.startProfile('child-operation', parentId);
      
      monitor.endProfile(childId);
      monitor.endProfile(parentId);
      
      const completed = monitor.getCompletedProfiles();
      expect(completed).toHaveLength(1); // Only root profile
      expect(completed[0].children).toHaveLength(1);
      expect(completed[0].children[0].operationName).toBe('child-operation');
    });

    it('should track active profiles', () => {
      const id1 = monitor.startProfile('op1');
      const id2 = monitor.startProfile('op2');
      
      const active = monitor.getActiveProfiles();
      expect(active).toHaveLength(2);
      
      monitor.endProfile(id1);
      
      const activeAfter = monitor.getActiveProfiles();
      expect(activeAfter).toHaveLength(1);
    });
  });

  describe('metrics', () => {
    it('should add metrics to a profile', () => {
      const operationId = monitor.startProfile('test-operation');
      
      monitor.addMetric(operationId, 'cpu-usage', 45.5, '%');
      monitor.addMetric(operationId, 'memory-usage', 512, 'MB');
      
      monitor.endProfile(operationId);
      
      const completed = monitor.getCompletedProfiles();
      expect(completed[0].metrics).toHaveLength(2);
      expect(completed[0].metrics[0].name).toBe('cpu-usage');
      expect(completed[0].metrics[0].value).toBe(45.5);
      expect(completed[0].metrics[1].name).toBe('memory-usage');
    });

    it('should support metric tags', () => {
      const operationId = monitor.startProfile('test-operation');
      
      monitor.addMetric(operationId, 'api-call', 1, 'count', {
        endpoint: '/api/users',
        method: 'GET'
      });
      
      monitor.endProfile(operationId);
      
      const completed = monitor.getCompletedProfiles();
      expect(completed[0].metrics[0].tags).toEqual({
        endpoint: '/api/users',
        method: 'GET'
      });
    });
  });

  describe('measure', () => {
    it('should measure async function execution time', async () => {
      const result = await monitor.measure('async-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      });
      
      expect(result).toBe('success');
      
      const completed = monitor.getCompletedProfiles();
      expect(completed).toHaveLength(1);
      expect(completed[0].duration).toBeGreaterThanOrEqual(10);
    });

    it('should measure sync function execution time', () => {
      const result = monitor.measureSync('sync-operation', () => {
        return 42;
      });
      
      expect(result).toBe(42);
      
      const completed = monitor.getCompletedProfiles();
      expect(completed).toHaveLength(1);
      expect(completed[0].operationName).toBe('sync-operation');
    });

    it('should handle errors in measured functions', async () => {
      await expect(
        monitor.measure('error-operation', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
      
      const completed = monitor.getCompletedProfiles();
      expect(completed).toHaveLength(1);
      expect(completed[0].metrics.some(m => m.name === 'error')).toBe(true);
    });
  });

  describe('reports', () => {
    beforeEach(() => {
      // Create some sample profiles
      for (let i = 0; i < 10; i++) {
        const id = monitor.startProfile('test-operation');
        monitor.endProfile(id);
      }
    });

    it('should generate performance report', () => {
      const report = monitor.getReport('test-operation');
      
      expect(report.totalOperations).toBe(10);
      expect(report.averageDuration).toBeGreaterThanOrEqual(0);
      expect(report.minDuration).toBeDefined();
      expect(report.maxDuration).toBeDefined();
      expect(report.p50Duration).toBeDefined();
      expect(report.p95Duration).toBeDefined();
      expect(report.p99Duration).toBeDefined();
    });

    it('should filter report by operation name', () => {
      const id = monitor.startProfile('different-operation');
      monitor.endProfile(id);
      
      const report = monitor.getReport('different-operation');
      
      expect(report.totalOperations).toBe(1);
      expect(report.operations[0].operationName).toBe('different-operation');
    });

    it('should return all operations when no filter', () => {
      const id = monitor.startProfile('another-operation');
      monitor.endProfile(id);
      
      const report = monitor.getReport();
      
      expect(report.totalOperations).toBe(11); // 10 + 1
    });

    it('should handle empty report', () => {
      monitor.clearCompletedProfiles();
      
      const report = monitor.getReport('non-existent');
      
      expect(report.totalOperations).toBe(0);
      expect(report.averageDuration).toBe(0);
      expect(report.operations).toHaveLength(0);
    });
  });

  describe('statistics', () => {
    it('should return accurate stats', () => {
      const id1 = monitor.startProfile('op1');
      const id2 = monitor.startProfile('op2');
      
      monitor.endProfile(id1);
      monitor.endProfile(id2);
      
      const stats = monitor.getStats();
      
      expect(stats.activeProfiles).toBe(0);
      expect(stats.completedProfiles).toBe(2);
      expect(stats.operationTypes).toBe(2);
      expect(stats.statsByOperation).toHaveProperty('op1');
      expect(stats.statsByOperation).toHaveProperty('op2');
    });

    it('should calculate stats by operation', () => {
      for (let i = 0; i < 5; i++) {
        const id = monitor.startProfile('repeated-op');
        monitor.endProfile(id);
      }
      
      const stats = monitor.getStats();
      
      expect(stats.statsByOperation['repeated-op'].count).toBe(5);
      expect(stats.statsByOperation['repeated-op'].avgDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('data management', () => {
    it('should clear completed profiles', () => {
      const id = monitor.startProfile('test');
      monitor.endProfile(id);
      
      expect(monitor.getCompletedProfiles()).toHaveLength(1);
      
      monitor.clearCompletedProfiles();
      
      expect(monitor.getCompletedProfiles()).toHaveLength(0);
    });

    it('should export performance data', () => {
      const id1 = monitor.startProfile('active-op');
      const id2 = monitor.startProfile('completed-op');
      monitor.endProfile(id2);
      
      const data = monitor.exportData();
      
      expect(data.activeProfiles).toHaveLength(1);
      expect(data.completedProfiles).toHaveLength(1);
      expect(data.stats).toBeDefined();
    });

    it('should limit completed profiles to max size', () => {
      // Create more than max profiles (default 1000)
      for (let i = 0; i < 1100; i++) {
        const id = monitor.startProfile('test');
        monitor.endProfile(id);
      }
      
      const completed = monitor.getCompletedProfiles();
      expect(completed.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('event emission', () => {
    it('should emit profile:started event', (done) => {
      const unsubscribe = eventBus.subscribe('system', 'performance:profile:started', (data) => {
        expect(data).toHaveProperty('operationId');
        expect(data.operationName).toBe('test-op');
        unsubscribe();
        done();
      });
      
      monitor.startProfile('test-op');
    });

    it('should emit profile:completed event', (done) => {
      const operationId = monitor.startProfile('test-op');
      
      const unsubscribe = eventBus.subscribe('system', 'performance:profile:completed', (data) => {
        expect(data.operationId).toBe(operationId);
        expect(data).toHaveProperty('duration');
        unsubscribe();
        done();
      });
      
      monitor.endProfile(operationId);
    });

    it('should emit metric:added event', (done) => {
      const operationId = monitor.startProfile('test-op');
      
      const unsubscribe = eventBus.subscribe('system', 'performance:metric:added', (data) => {
        expect(data.operationId).toBe(operationId);
        expect(data.metric.name).toBe('test-metric');
        unsubscribe();
        done();
      });
      
      monitor.addMetric(operationId, 'test-metric', 100, 'ms');
    });
  });
});
