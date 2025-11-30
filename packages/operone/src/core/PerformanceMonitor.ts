import { EventBus } from './EventBus';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceProfile {
  operationId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metrics: PerformanceMetric[];
  children: PerformanceProfile[];
  parent?: string;
}

export interface PerformanceReport {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  operations: PerformanceProfile[];
}

export class PerformanceMonitor {
  private profiles: Map<string, PerformanceProfile> = new Map();
  private completedProfiles: PerformanceProfile[] = [];
  private eventBus: EventBus;
  private maxCompletedProfiles: number = 1000; // Keep last 1000 completed profiles

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Start profiling an operation
   */
  public startProfile(operationName: string, parentId?: string): string {
    const operationId = this.generateId();
    
    const profile: PerformanceProfile = {
      operationId,
      operationName,
      startTime: Date.now(),
      metrics: [],
      children: [],
      parent: parentId
    };

    this.profiles.set(operationId, profile);

    // Add as child to parent if specified
    if (parentId) {
      const parent = this.profiles.get(parentId);
      if (parent) {
        parent.children.push(profile);
      }
    }

    this.eventBus.publish('system', 'performance:profile:started', {
      operationId,
      operationName,
      parentId
    });

    return operationId;
  }

  /**
   * End profiling an operation
   */
  public endProfile(operationId: string): void {
    const profile = this.profiles.get(operationId);
    
    if (!profile) {
      console.warn(`Performance profile not found: ${operationId}`);
      return;
    }

    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;

    // Move to completed profiles if it's a root profile (no parent)
    if (!profile.parent) {
      this.completedProfiles.push(profile);
      
      // Limit the number of completed profiles
      if (this.completedProfiles.length > this.maxCompletedProfiles) {
        this.completedProfiles.shift();
      }
    }

    this.profiles.delete(operationId);

    this.eventBus.publish('system', 'performance:profile:completed', {
      operationId,
      operationName: profile.operationName,
      duration: profile.duration,
      metrics: profile.metrics
    });
  }

  /**
   * Add a metric to an operation
   */
  public addMetric(
    operationId: string,
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ): void {
    const profile = this.profiles.get(operationId);
    
    if (!profile) {
      console.warn(`Performance profile not found: ${operationId}`);
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    profile.metrics.push(metric);

    this.eventBus.publish('system', 'performance:metric:added', {
      operationId,
      metric
    });
  }

  /**
   * Measure execution time of a function
   */
  public async measure<T>(
    operationName: string,
    fn: () => Promise<T>,
    parentId?: string
  ): Promise<T> {
    const operationId = this.startProfile(operationName, parentId);
    
    try {
      const result = await fn();
      this.endProfile(operationId);
      return result;
    } catch (error) {
      this.addMetric(operationId, 'error', 1, 'count', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.endProfile(operationId);
      throw error;
    }
  }

  /**
   * Measure execution time of a synchronous function
   */
  public measureSync<T>(
    operationName: string,
    fn: () => T,
    parentId?: string
  ): T {
    const operationId = this.startProfile(operationName, parentId);
    
    try {
      const result = fn();
      this.endProfile(operationId);
      return result;
    } catch (error) {
      this.addMetric(operationId, 'error', 1, 'count', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.endProfile(operationId);
      throw error;
    }
  }

  /**
   * Get a performance report for a specific operation name
   */
  public getReport(operationName?: string): PerformanceReport {
    const operations = operationName
      ? this.completedProfiles.filter(p => p.operationName === operationName)
      : this.completedProfiles;

    if (operations.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        operations: []
      };
    }

    const durations = operations
      .map(p => p.duration ?? 0)
      .sort((a, b) => a - b);

    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = sum / durations.length;

    return {
      totalOperations: operations.length,
      averageDuration: avg,
      minDuration: durations[0] ?? 0,
      maxDuration: durations[durations.length - 1] ?? 0,
      p50Duration: this.percentile(durations, 50),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
      operations
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)] ?? 0;
  }

  /**
   * Get all active profiles
   */
  public getActiveProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get all completed profiles
   */
  public getCompletedProfiles(): PerformanceProfile[] {
    return this.completedProfiles;
  }

  /**
   * Clear all completed profiles
   */
  public clearCompletedProfiles(): void {
    this.completedProfiles = [];
    this.eventBus.publish('system', 'performance:profiles:cleared', {});
  }

  /**
   * Get performance statistics
   */
  public getStats() {
    const allOperations = this.completedProfiles;
    const operationNames = new Set(allOperations.map(p => p.operationName));

    const statsByOperation: Record<string, {
      count: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
    }> = {};

    for (const name of operationNames) {
      const report = this.getReport(name);
      statsByOperation[name] = {
        count: report.totalOperations,
        avgDuration: report.averageDuration ?? 0,
        minDuration: report.minDuration,
        maxDuration: report.maxDuration
      };
    }

    return {
      activeProfiles: this.profiles.size,
      completedProfiles: this.completedProfiles.length,
      operationTypes: operationNames.size,
      statsByOperation
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Export performance data for external analysis
   */
  public exportData() {
    return {
      activeProfiles: this.getActiveProfiles(),
      completedProfiles: this.getCompletedProfiles(),
      stats: this.getStats()
    };
  }
}
