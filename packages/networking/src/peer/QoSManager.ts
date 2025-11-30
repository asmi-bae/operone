import { EventEmitter } from 'events';

export interface QoSMetrics {
  peerId: string;
  latency: number; // Current RTT in ms
  bandwidth: number; // Current bandwidth usage in MB/s
  packetLoss: number; // Packet loss percentage (0-100)
  jitter: number; // Latency variation in ms
  queueDepth: number; // Messages waiting to send
  lastUpdate: number;
}

export type QoSPriority = 'critical' | 'high' | 'normal' | 'low';

export interface QoSPolicy {
  priority: QoSPriority;
  maxBandwidth?: number; // MB/s
  maxLatency?: number; // ms
  minBandwidth?: number; // MB/s
  retryPolicy: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
    initialDelay: number; // ms
  };
}

export class QoSManager extends EventEmitter {
  private metrics: Map<string, QoSMetrics> = new Map();
  private policies: Map<string, QoSPolicy> = new Map(); // message type -> policy
  private bandwidthAllocations: Map<string, number> = new Map(); // peerId -> allocated bandwidth limit
  private latencyHistory: Map<string, number[]> = new Map(); // peerId -> history of RTTs
  
  // Default policies
  private readonly DEFAULT_POLICY: QoSPolicy = {
    priority: 'normal',
    retryPolicy: {
      maxRetries: 3,
      backoff: 'exponential',
      initialDelay: 1000
    }
  };

  constructor() {
    super();
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default QoS policies for standard message types
   */
  private initializeDefaultPolicies() {
    this.setPolicy('heartbeat', {
      priority: 'critical',
      maxLatency: 1000,
      retryPolicy: { maxRetries: 0, backoff: 'linear', initialDelay: 0 }
    });

    this.setPolicy('handshake', {
      priority: 'critical',
      maxLatency: 5000,
      retryPolicy: { maxRetries: 5, backoff: 'exponential', initialDelay: 500 }
    });

    this.setPolicy('tool-call', {
      priority: 'high',
      retryPolicy: { maxRetries: 3, backoff: 'exponential', initialDelay: 1000 }
    });

    this.setPolicy('tool-result', {
      priority: 'high',
      retryPolicy: { maxRetries: 3, backoff: 'exponential', initialDelay: 1000 }
    });

    this.setPolicy('file-transfer', {
      priority: 'low',
      maxBandwidth: 5, // Limit file transfers to 5 MB/s by default
      retryPolicy: { maxRetries: 10, backoff: 'linear', initialDelay: 5000 }
    });
  }

  /**
   * Set a QoS policy for a specific message type
   */
  setPolicy(messageType: string, policy: QoSPolicy) {
    this.policies.set(messageType, policy);
  }

  /**
   * Get the QoS policy for a message type
   */
  getPolicy(messageType: string): QoSPolicy {
    return this.policies.get(messageType) || this.DEFAULT_POLICY;
  }

  /**
   * Update metrics for a peer
   */
  updateMetrics(peerId: string, update: Partial<QoSMetrics>) {
    const current = this.metrics.get(peerId) || {
      peerId,
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      jitter: 0,
      queueDepth: 0,
      lastUpdate: Date.now()
    };

    const updated = { ...current, ...update, lastUpdate: Date.now() };
    this.metrics.set(peerId, updated);
    
    // Check for violations
    this.checkViolations(peerId, updated);
  }

  /**
   * Record a latency measurement
   */
  recordLatency(peerId: string, rtt: number) {
    const history = this.latencyHistory.get(peerId) || [];
    history.push(rtt);
    
    // Keep last 20 samples
    if (history.length > 20) history.shift();
    this.latencyHistory.set(peerId, history);

    // Calculate jitter (standard deviation of latency)
    let jitter = 0;
    if (history.length > 1) {
      const avg = history.reduce((a, b) => a + b, 0) / history.length;
      const variance = history.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / history.length;
      jitter = Math.sqrt(variance);
    }

    this.updateMetrics(peerId, { latency: rtt, jitter });
  }

  /**
   * Allocate bandwidth for a peer
   * @param peerId Peer ID
   * @param limitMBps Bandwidth limit in MB/s
   */
  allocateBandwidth(peerId: string, limitMBps: number) {
    this.bandwidthAllocations.set(peerId, limitMBps);
  }

  /**
   * Check if a message should be throttled based on current metrics and policy
   */
  shouldThrottle(peerId: string, messageType: string, messageSize: number): boolean {
    const metrics = this.metrics.get(peerId);
    if (!metrics) return false;

    const policy = this.getPolicy(messageType);
    const allocatedBandwidth = this.bandwidthAllocations.get(peerId) || Infinity;

    // Check bandwidth limit
    if (metrics.bandwidth > allocatedBandwidth) {
      return true;
    }

    // Check policy specific bandwidth limit
    if (policy.maxBandwidth && metrics.bandwidth > policy.maxBandwidth) {
      return true;
    }

    // Prioritize critical/high messages if queue is deep
    if (metrics.queueDepth > 50 && (policy.priority === 'normal' || policy.priority === 'low')) {
      return true;
    }

    return false;
  }

  /**
   * Get current metrics for a peer
   */
  getMetrics(peerId: string): QoSMetrics | undefined {
    return this.metrics.get(peerId);
  }

  /**
   * Calculate a health score for a peer connection (0-100)
   */
  getHealthScore(peerId: string): number {
    const metrics = this.metrics.get(peerId);
    if (!metrics) return 0;

    let score = 100;

    // Penalize high latency (> 200ms)
    if (metrics.latency > 200) {
      score -= Math.min(40, (metrics.latency - 200) / 10);
    }

    // Penalize packet loss
    score -= metrics.packetLoss * 100;

    // Penalize high jitter (> 50ms)
    if (metrics.jitter > 50) {
      score -= Math.min(20, (metrics.jitter - 50) / 2);
    }

    return Math.max(0, Math.round(score));
  }

  private checkViolations(peerId: string, metrics: QoSMetrics) {
    // Emit events if thresholds are exceeded
    if (metrics.latency > 1000) {
      this.emit('violation:latency', { peerId, latency: metrics.latency });
    }

    if (metrics.packetLoss > 0.05) { // 5%
      this.emit('violation:packet-loss', { peerId, packetLoss: metrics.packetLoss });
    }
  }
}
