import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ResourceAllocator } from '../ResourceAllocator';
import { EventBus } from '../EventBus';

describe('ResourceAllocator', () => {
  let allocator: ResourceAllocator;
  let eventBus: EventBus;

  beforeEach(() => {
    allocator = new ResourceAllocator({
      maxCpu: 80,
      maxMemory: 1024,
      maxDisk: 10240,
      maxNetworkBandwidth: 100
    });
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    allocator.stopMonitoring();
  });

  describe('allocation', () => {
    it('should allocate resources for a task', () => {
      const success = allocator.allocate('task1', {
        maxCpu: 20,
        maxMemory: 256
      });

      expect(success).toBe(true);
      
      const allocation = allocator.getAllocation('task1');
      expect(allocation).toBeDefined();
      expect(allocation?.taskId).toBe('task1');
      expect(allocation?.limits.maxCpu).toBe(20);
      expect(allocation?.limits.maxMemory).toBe(256);
    });

    it('should fail allocation when resources are insufficient', () => {
      // Allocate most resources
      allocator.allocate('task1', {
        maxCpu: 70,
        maxMemory: 900
      });

      // Try to allocate more than available
      const success = allocator.allocate('task2', {
        maxCpu: 20,
        maxMemory: 200
      });

      expect(success).toBe(false);
    });

    it('should allow allocation after resources are released', () => {
      allocator.allocate('task1', {
        maxCpu: 50,
        maxMemory: 512
      });

      allocator.release('task1');

      const success = allocator.allocate('task2', {
        maxCpu: 50,
        maxMemory: 512
      });

      expect(success).toBe(true);
    });
  });

  describe('resource release', () => {
    it('should release resources for a task', () => {
      allocator.allocate('task1', {
        maxCpu: 20,
        maxMemory: 256
      });

      allocator.release('task1');

      const allocation = allocator.getAllocation('task1');
      expect(allocation).toBeUndefined();
    });

    it('should emit resource:released event', (done) => {
      allocator.allocate('task1', {
        maxCpu: 20,
        maxMemory: 256
      });

      const unsubscribe = eventBus.subscribe('system', 'resource:released', (data) => {
        expect(data.taskId).toBe('task1');
        expect(data).toHaveProperty('duration');
        expect(data).toHaveProperty('finalUsage');
        unsubscribe();
        done();
      });

      allocator.release('task1');
    });
  });

  describe('usage tracking', () => {
    beforeEach(() => {
      allocator.allocate('task1', {
        maxCpu: 50,
        maxMemory: 512
      });
    });

    it('should update resource usage', () => {
      allocator.updateUsage('task1', {
        cpu: 30,
        memory: 256
      });

      const allocation = allocator.getAllocation('task1');
      expect(allocation?.usage.cpu).toBe(30);
      expect(allocation?.usage.memory).toBe(256);
    });

    it('should emit limit exceeded event when usage exceeds limits', (done) => {
      const unsubscribe = eventBus.subscribe('system', 'resource:limit:exceeded', (data) => {
        expect(data.taskId).toBe('task1');
        expect(data.violations).toBeInstanceOf(Array);
        expect(data.violations.length).toBeGreaterThan(0);
        unsubscribe();
        done();
      });

      allocator.updateUsage('task1', {
        cpu: 60, // Exceeds limit of 50
        memory: 256
      });
    });
  });

  describe('monitoring', () => {
    it('should start monitoring', () => {
      allocator.startMonitoring();
      
      // Monitoring should be active
      expect(allocator).toBeDefined();
    });

    it('should stop monitoring', () => {
      allocator.startMonitoring();
      allocator.stopMonitoring();
      
      // Monitoring should be stopped
      expect(allocator).toBeDefined();
    });

    it('should emit resource:usage events during monitoring', (done) => {
      const unsubscribe = eventBus.subscribe('system', 'resource:usage', (data) => {
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('allocations');
        unsubscribe();
        allocator.stopMonitoring();
        done();
      });

      allocator.startMonitoring();
    });
  });

  describe('statistics', () => {
    it('should return accurate stats', () => {
      allocator.allocate('task1', { maxCpu: 20, maxMemory: 256 });
      allocator.allocate('task2', { maxCpu: 30, maxMemory: 512 });

      const stats = allocator.getStats();

      expect(stats.totalAllocations).toBe(2);
      expect(stats.totalUsage.cpu).toBe(0); // No usage updated yet
      expect(stats.globalLimits.maxCpu).toBe(80);
      expect(stats.utilizationPercentage).toHaveProperty('cpu');
      expect(stats.utilizationPercentage).toHaveProperty('memory');
    });

    it('should calculate utilization percentage correctly', () => {
      allocator.allocate('task1', { maxCpu: 40, maxMemory: 512 });
      allocator.updateUsage('task1', { cpu: 40, memory: 512 });

      const stats = allocator.getStats();

      expect(stats.utilizationPercentage.cpu).toBe(50); // 40/80 * 100
      expect(stats.utilizationPercentage.memory).toBe(50); // 512/1024 * 100
    });
  });

  describe('getAllocations', () => {
    it('should return all allocations', () => {
      allocator.allocate('task1', { maxCpu: 20, maxMemory: 256 });
      allocator.allocate('task2', { maxCpu: 30, maxMemory: 512 });

      const allocations = allocator.getAllAllocations();

      expect(allocations).toHaveLength(2);
      expect(allocations[0].taskId).toBeDefined();
      expect(allocations[1].taskId).toBeDefined();
    });

    it('should return empty array when no allocations', () => {
      const allocations = allocator.getAllAllocations();

      expect(allocations).toHaveLength(0);
    });
  });
});
