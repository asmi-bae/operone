import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QoSManager } from '../peer/QoSManager';

describe('QoSManager', () => {
  let qosManager: QoSManager;
  const peerId = 'peer-1';

  beforeEach(() => {
    qosManager = new QoSManager();
  });

  describe('Metrics Management', () => {
    it('should initialize metrics for new peer', () => {
      qosManager.updateMetrics(peerId, { latency: 50 });
      const metrics = qosManager.getMetrics(peerId);
      
      expect(metrics).toBeDefined();
      expect(metrics?.latency).toBe(50);
      expect(metrics?.peerId).toBe(peerId);
    });

    it('should update existing metrics', () => {
      qosManager.updateMetrics(peerId, { latency: 50 });
      qosManager.updateMetrics(peerId, { bandwidth: 100 });
      
      const metrics = qosManager.getMetrics(peerId);
      expect(metrics?.latency).toBe(50);
      expect(metrics?.bandwidth).toBe(100);
    });

    it('should calculate jitter correctly', () => {
      // Add latency samples: 10, 20, 10, 20
      // Mean = 15
      // Variance = ((10-15)^2 + (20-15)^2 + (10-15)^2 + (20-15)^2) / 4 = 25
      // StdDev (Jitter) = 5
      
      qosManager.recordLatency(peerId, 10);
      qosManager.recordLatency(peerId, 20);
      qosManager.recordLatency(peerId, 10);
      qosManager.recordLatency(peerId, 20);
      
      const metrics = qosManager.getMetrics(peerId);
      expect(metrics?.jitter).toBe(5);
    });
  });

  describe('Throttling Logic', () => {
    it('should throttle based on allocated bandwidth', () => {
      qosManager.allocateBandwidth(peerId, 10); // 10 MB/s limit
      
      // Current usage 15 MB/s
      qosManager.updateMetrics(peerId, { bandwidth: 15 });
      
      const shouldThrottle = qosManager.shouldThrottle(peerId, 'tool-call', 1000);
      expect(shouldThrottle).toBe(true);
    });

    it('should throttle based on policy max bandwidth', () => {
      qosManager.setPolicy('custom-type', {
        priority: 'low',
        maxBandwidth: 5,
        retryPolicy: { maxRetries: 1, backoff: 'linear', initialDelay: 100 }
      });
      
      // Current usage 6 MB/s
      qosManager.updateMetrics(peerId, { bandwidth: 6 });
      
      const shouldThrottle = qosManager.shouldThrottle(peerId, 'custom-type', 1000);
      expect(shouldThrottle).toBe(true);
    });

    it('should throttle low priority messages when queue is deep', () => {
      qosManager.updateMetrics(peerId, { queueDepth: 100 });
      
      // Low priority should be throttled
      expect(qosManager.shouldThrottle(peerId, 'file-transfer', 1000)).toBe(true);
      
      // Critical priority should NOT be throttled
      expect(qosManager.shouldThrottle(peerId, 'heartbeat', 1000)).toBe(false);
    });
  });

  describe('Health Score', () => {
    it('should calculate perfect health score', () => {
      qosManager.updateMetrics(peerId, {
        latency: 50,
        packetLoss: 0,
        jitter: 10
      });
      
      expect(qosManager.getHealthScore(peerId)).toBe(100);
    });

    it('should penalize high latency', () => {
      qosManager.updateMetrics(peerId, {
        latency: 300, // 100ms over threshold -> -10 points
        packetLoss: 0,
        jitter: 0
      });
      
      expect(qosManager.getHealthScore(peerId)).toBe(90);
    });

    it('should penalize packet loss', () => {
      qosManager.updateMetrics(peerId, {
        latency: 50,
        packetLoss: 0.1, // 10% loss -> -10 points
        jitter: 0
      });
      
      expect(qosManager.getHealthScore(peerId)).toBe(90);
    });
  });

  describe('Violations', () => {
    it('should emit violation events', () => {
      const spy = vi.fn();
      qosManager.on('violation:latency', spy);
      
      qosManager.updateMetrics(peerId, { latency: 1500 }); // > 1000ms threshold
      
      expect(spy).toHaveBeenCalledWith({
        peerId,
        latency: 1500
      });
    });
  });
});
