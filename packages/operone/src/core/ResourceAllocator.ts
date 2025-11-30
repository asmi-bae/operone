import { EventBus } from './EventBus';

export interface ResourceLimits {
  maxCpu?: number; // CPU percentage (0-100)
  maxMemory?: number; // Memory in MB
  maxDisk?: number; // Disk usage in MB
  maxNetworkBandwidth?: number; // Network bandwidth in MB/s
}

export interface ResourceUsage {
  cpu: number; // Current CPU usage percentage
  memory: number; // Current memory usage in MB
  disk: number; // Current disk usage in MB
  networkBandwidth: number; // Current network bandwidth in MB/s
  timestamp: number;
}

export interface ResourceAllocation {
  taskId: string;
  limits: ResourceLimits;
  usage: ResourceUsage;
  startTime: number;
}

export class ResourceAllocator {
  private allocations: Map<string, ResourceAllocation> = new Map();
  private eventBus: EventBus;
  private globalLimits: ResourceLimits;
  private monitoringInterval?: NodeJS.Timeout;
  private monitoringIntervalMs: number = 1000; // Monitor every second

  constructor(globalLimits: ResourceLimits = {}) {
    this.eventBus = EventBus.getInstance();
    this.globalLimits = {
      maxCpu: globalLimits.maxCpu ?? 80, // Default 80% CPU
      maxMemory: globalLimits.maxMemory ?? 1024, // Default 1GB
      maxDisk: globalLimits.maxDisk ?? 10240, // Default 10GB
      maxNetworkBandwidth: globalLimits.maxNetworkBandwidth ?? 100 // Default 100 MB/s
    };
  }

  /**
   * Allocate resources for a task
   */
  public allocate(taskId: string, limits: ResourceLimits): boolean {
    // Check if resources are available
    if (!this.canAllocate(limits)) {
      this.eventBus.publish('system', 'resource:allocation:failed', {
        taskId,
        limits,
        reason: 'Insufficient resources'
      });
      return false;
    }

    const allocation: ResourceAllocation = {
      taskId,
      limits,
      usage: {
        cpu: 0,
        memory: 0,
        disk: 0,
        networkBandwidth: 0,
        timestamp: Date.now()
      },
      startTime: Date.now()
    };

    this.allocations.set(taskId, allocation);

    this.eventBus.publish('system', 'resource:allocated', {
      taskId,
      limits
    });

    return true;
  }

  /**
   * Release resources for a task
   */
  public release(taskId: string): void {
    const allocation = this.allocations.get(taskId);
    
    if (allocation) {
      this.allocations.delete(taskId);
      
      this.eventBus.publish('system', 'resource:released', {
        taskId,
        duration: Date.now() - allocation.startTime,
        finalUsage: allocation.usage
      });
    }
  }

  /**
   * Update resource usage for a task
   */
  public updateUsage(taskId: string, usage: Partial<ResourceUsage>): void {
    const allocation = this.allocations.get(taskId);
    
    if (allocation) {
      allocation.usage = {
        ...allocation.usage,
        ...usage,
        timestamp: Date.now()
      };

      // Check if task is exceeding limits
      this.checkLimits(taskId, allocation);
    }
  }

  /**
   * Check if resources can be allocated
   */
  private canAllocate(limits: ResourceLimits): boolean {
    const currentAllocated = this.getCurrentTotalAllocated();

    // Check CPU
    if (limits.maxCpu && currentAllocated.cpu + limits.maxCpu > (this.globalLimits.maxCpu ?? 100)) {
      return false;
    }

    // Check memory
    if (limits.maxMemory && currentAllocated.memory + limits.maxMemory > (this.globalLimits.maxMemory ?? Infinity)) {
      return false;
    }

    // Check disk
    if (limits.maxDisk && currentAllocated.disk + limits.maxDisk > (this.globalLimits.maxDisk ?? Infinity)) {
      return false;
    }

    // Check network bandwidth
    if (limits.maxNetworkBandwidth && 
        currentAllocated.networkBandwidth + limits.maxNetworkBandwidth > (this.globalLimits.maxNetworkBandwidth ?? Infinity)) {
      return false;
    }

    return true;
  }

  /**
   * Get current total allocated resources (limits, not usage)
   */
  private getCurrentTotalAllocated(): ResourceUsage {
    const total: ResourceUsage = {
      cpu: 0,
      memory: 0,
      disk: 0,
      networkBandwidth: 0,
      timestamp: Date.now()
    };

    for (const allocation of this.allocations.values()) {
      total.cpu += allocation.limits.maxCpu ?? 0;
      total.memory += allocation.limits.maxMemory ?? 0;
      total.disk += allocation.limits.maxDisk ?? 0;
      total.networkBandwidth += allocation.limits.maxNetworkBandwidth ?? 0;
    }

    return total;
  }

  /**
   * Get current total resource usage across all tasks
   */
  private getCurrentTotalUsage(): ResourceUsage {
    const total: ResourceUsage = {
      cpu: 0,
      memory: 0,
      disk: 0,
      networkBandwidth: 0,
      timestamp: Date.now()
    };

    for (const allocation of this.allocations.values()) {
      total.cpu += allocation.usage.cpu;
      total.memory += allocation.usage.memory;
      total.disk += allocation.usage.disk;
      total.networkBandwidth += allocation.usage.networkBandwidth;
    }

    return total;
  }

  /**
   * Check if a task is exceeding its resource limits
   */
  private checkLimits(taskId: string, allocation: ResourceAllocation): void {
    const { limits, usage } = allocation;
    const violations: string[] = [];

    if (limits.maxCpu && usage.cpu > limits.maxCpu) {
      violations.push(`CPU: ${usage.cpu.toFixed(2)}% > ${limits.maxCpu}%`);
    }

    if (limits.maxMemory && usage.memory > limits.maxMemory) {
      violations.push(`Memory: ${usage.memory.toFixed(2)}MB > ${limits.maxMemory}MB`);
    }

    if (limits.maxDisk && usage.disk > limits.maxDisk) {
      violations.push(`Disk: ${usage.disk.toFixed(2)}MB > ${limits.maxDisk}MB`);
    }

    if (limits.maxNetworkBandwidth && usage.networkBandwidth > limits.maxNetworkBandwidth) {
      violations.push(`Network: ${usage.networkBandwidth.toFixed(2)}MB/s > ${limits.maxNetworkBandwidth}MB/s`);
    }

    if (violations.length > 0) {
      this.eventBus.publish('system', 'resource:limit:exceeded', {
        taskId,
        violations,
        usage,
        limits
      });
    }
  }

  /**
   * Start monitoring resource usage
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    this.monitoringInterval = setInterval(() => {
      this.monitorResources();
    }, this.monitoringIntervalMs);

    this.eventBus.publish('system', 'resource:monitoring:started', {});
  }

  /**
   * Stop monitoring resource usage
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      this.eventBus.publish('system', 'resource:monitoring:stopped', {});
    }
  }

  /**
   * Monitor resources for all tasks
   */
  private async monitorResources(): Promise<void> {
    // In a real implementation, this would use OS-level APIs to get actual resource usage
    // For now, we'll emit the current state
    const totalUsage = this.getCurrentTotalUsage();

    this.eventBus.publish('system', 'resource:usage', {
      total: totalUsage,
      allocations: Array.from(this.allocations.values()).map(a => ({
        taskId: a.taskId,
        usage: a.usage,
        limits: a.limits
      }))
    });
  }

  /**
   * Get resource statistics
   */
  public getStats() {
    const totalUsage = this.getCurrentTotalUsage();
    const allocations = Array.from(this.allocations.values());

    return {
      totalAllocations: allocations.length,
      totalUsage,
      globalLimits: this.globalLimits,
      utilizationPercentage: {
        cpu: this.globalLimits.maxCpu ? (totalUsage.cpu / this.globalLimits.maxCpu) * 100 : 0,
        memory: this.globalLimits.maxMemory ? (totalUsage.memory / this.globalLimits.maxMemory) * 100 : 0,
        disk: this.globalLimits.maxDisk ? (totalUsage.disk / this.globalLimits.maxDisk) * 100 : 0,
        networkBandwidth: this.globalLimits.maxNetworkBandwidth ? 
          (totalUsage.networkBandwidth / this.globalLimits.maxNetworkBandwidth) * 100 : 0
      }
    };
  }

  /**
   * Get allocation for a specific task
   */
  public getAllocation(taskId: string): ResourceAllocation | undefined {
    return this.allocations.get(taskId);
  }

  /**
   * Get all allocations
   */
  public getAllAllocations(): ResourceAllocation[] {
    return Array.from(this.allocations.values());
  }
}
