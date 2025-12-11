/**
 * Orchestrator - The central kernel that coordinates the entire AI agent pipeline
 * 
 * This is the heart of the Operone orchestration system. It:
 * - Receives user requests and initiates the pipeline
 * - Coordinates Context → Thinking → Planning → Execution
 * - Manages execution state and checkpoints
 * - Emits events for monitoring and UI updates
 * - Handles errors and recovery
 */

import { nanoid } from 'nanoid';
import { EventBus } from './EventBus';
import { WorkerPool } from './WorkerPool';
import { ToolRegistry } from './ToolRegistry';
import { ResourceAllocator } from './ResourceAllocator';
import { PerformanceMonitor } from './PerformanceMonitor';
import { StorageManager } from './StorageManager';
import { StateManager } from './StateManager';
import { PriorityQueue } from './PriorityQueue';
import { MemoryManager } from '../memory/MemoryManager';
import { ThinkingPipeline } from '@operone/thinking';
import type { PipelineResult } from '@operone/thinking';
import type {
  OrchestratorConfig,
  TaskExecution,
  ExecutionOptions,
  ExecutionResult,
  ExecutionStatus,
} from './types';

export class Orchestrator {
  private eventBus: EventBus;
  private workerPool: WorkerPool;
  private thinkingPipeline: ThinkingPipeline;
  private toolRegistry: ToolRegistry;
  private resourceAllocator: ResourceAllocator;
  private performanceMonitor: PerformanceMonitor;
  private storageManager: StorageManager;
  private stateManager: StateManager;
  private memoryManager: MemoryManager;
  
  // State management
  private activeExecutions: Map<string, TaskExecution> = new Map();
  private executionQueue: PriorityQueue<TaskExecution> = new PriorityQueue();
  
  // Configuration
  private config: Required<OrchestratorConfig>;
  
  // Checkpoint interval timer
  private checkpointTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxConcurrentAgents: config.maxConcurrentAgents || 3,
      enableCheckpointing: config.enableCheckpointing ?? true,
      checkpointInterval: config.checkpointInterval || 30000, // 30 seconds
      enableAdaptivePlanning: config.enableAdaptivePlanning ?? false,
      defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
      defaultRetryPolicy: config.defaultRetryPolicy || {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
      },
    };

    // Initialize core services
    this.eventBus = EventBus.getInstance();
    this.workerPool = new WorkerPool();
    this.toolRegistry = new ToolRegistry();
    this.resourceAllocator = new ResourceAllocator();
    this.performanceMonitor = new PerformanceMonitor();
    this.storageManager = new StorageManager();
    this.memoryManager = new MemoryManager();
    
    this.stateManager = new StateManager(
      this.memoryManager,
      {
        enablePersistence: true,
        checkpointInterval: this.config.checkpointInterval,
        maxCheckpoints: 10,
      }
    );

    this.thinkingPipeline = new ThinkingPipeline(
      {
        enableMemory: true,
        enableProfiling: true,
        enableAdaptiveOptimization: this.config.enableAdaptivePlanning,
      },
      this.eventBus,
      this.performanceMonitor
    );

    this.setupEventListeners();
  }

  /**
   * Execute a user request through the complete orchestration pipeline
   */
  async execute(
    userRequest: string,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Create execution state
    const execution = await this.stateManager.createExecution(userRequest);
    this.activeExecutions.set(execution.id, execution);

    try {
      // Emit start event
      await this.emitEvent('execution:started', {
        executionId: execution.id,
        userRequest,
        timestamp: startTime,
      });

      // Update status to planning
      await this.updateExecutionStatus(execution.id, 'planning');

      // Step 1: Process through thinking pipeline
      const thinkingResult = await this.processThinkingPipeline(
        execution,
        userRequest
      );

      // Check if it's a simple query that doesn't need task planning
      if (thinkingResult.context.safety?.requiresConfirmation) {
        return this.createSimpleResult(execution, thinkingResult);
      }

      // Step 2: Create task plan (will be implemented in TaskPlanner)
      // For now, create a simple single-task execution
      await this.updateExecutionStatus(execution.id, 'running');
      execution.totalSteps = 1;

      // Setup checkpoint timer if enabled
      if (this.config.enableCheckpointing) {
        this.startCheckpointTimer(execution.id);
      }

      // Step 3: Execute the plan
      // For now, just return the thinking result
      // Full task execution will be implemented in TaskExecutor
      const result = {
        data: thinkingResult.output,
        metadata: thinkingResult.output.metadata,
      };

      // Mark as completed
      await this.updateExecutionStatus(execution.id, 'completed');
      execution.endTime = Date.now();
      execution.result = result;

      // Stop checkpoint timer
      this.stopCheckpointTimer(execution.id);

      // Emit completion event
      await this.emitEvent('execution:completed', {
        executionId: execution.id,
        duration: execution.endTime - execution.startTime,
        result,
      });

      // Clean up
      this.activeExecutions.delete(execution.id);

      return {
        executionId: execution.id,
        success: true,
        data: result.data,
        duration: execution.endTime - execution.startTime,
        tasksCompleted: 1,
        tasksFailed: 0,
        checkpointsCreated: execution.checkpoints.length,
      };

    } catch (error) {
      return this.handleExecutionError(execution, error as Error);
    }
  }

  /**
   * Pause an execution
   */
  async pause(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    // Create checkpoint before pausing
    if (this.config.enableCheckpointing) {
      await this.stateManager.createCheckpoint(execution);
    }

    await this.updateExecutionStatus(executionId, 'paused');
    this.stopCheckpointTimer(executionId);

    await this.emitEvent('execution:paused', {
      executionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Resume a paused execution
   */
  async resume(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'paused') {
      throw new Error(`Execution ${executionId} is not paused`);
    }

    await this.updateExecutionStatus(executionId, 'running');
    
    if (this.config.enableCheckpointing) {
      this.startCheckpointTimer(executionId);
    }

    await this.emitEvent('execution:resumed', {
      executionId,
      timestamp: Date.now(),
    });

    // TODO: Continue execution from where it left off
  }

  /**
   * Cancel an execution
   */
  async cancel(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await this.updateExecutionStatus(executionId, 'cancelled');
    this.stopCheckpointTimer(executionId);
    execution.endTime = Date.now();

    await this.emitEvent('execution:cancelled', {
      executionId,
      timestamp: Date.now(),
    });

    this.activeExecutions.delete(executionId);
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<TaskExecution | undefined> {
    return this.stateManager.getExecutionState(executionId);
  }

  /**
   * List all active executions
   */
  async listActiveExecutions(): Promise<TaskExecution[]> {
    return this.stateManager.listActiveExecutions();
  }

  /**
   * Process user request through thinking pipeline
   */
  private async processThinkingPipeline(
    execution: TaskExecution,
    userRequest: string
  ): Promise<PipelineResult> {
    const result = await this.thinkingPipeline.process(userRequest);
    
    // Store result in execution
    execution.context = result.context;
    execution.intent = result.context.intent;
    execution.plan = result.context.plan;

    await this.stateManager.updateExecutionState(execution.id, {
      context: result.context,
      intent: result.context.intent,
      plan: result.context.plan,
    });

    return result;
  }

  /**
   * Update execution status
   */
  private async updateExecutionStatus(
    executionId: string,
    status: ExecutionStatus
  ): Promise<void> {
    await this.stateManager.updateExecutionState(executionId, { status });
    
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = status;
    }

    await this.emitEvent('execution:status_changed', {
      executionId,
      status,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle execution error
   */
  private async handleExecutionError(
    execution: TaskExecution,
    error: Error
  ): Promise<ExecutionResult> {
    execution.status = 'failed';
    execution.error = error;
    execution.endTime = Date.now();

    this.stopCheckpointTimer(execution.id);

    await this.emitEvent('execution:failed', {
      executionId: execution.id,
      error: error.message,
      timestamp: execution.endTime,
    });

    this.activeExecutions.delete(execution.id);

    return {
      executionId: execution.id,
      success: false,
      error,
      duration: execution.endTime - execution.startTime,
      tasksCompleted: execution.completedTasks.length,
      tasksFailed: execution.failedTasks.length,
      checkpointsCreated: execution.checkpoints.length,
    };
  }

  /**
   * Create result for simple queries
   */
  private createSimpleResult(
    execution: TaskExecution,
    thinkingResult: PipelineResult
  ): ExecutionResult {
    execution.status = 'completed';
    execution.endTime = Date.now();
    execution.result = thinkingResult.output;

    this.activeExecutions.delete(execution.id);

    return {
      executionId: execution.id,
      success: true,
      data: thinkingResult.output,
      duration: execution.endTime - execution.startTime,
      tasksCompleted: 1,
      tasksFailed: 0,
      checkpointsCreated: 0,
    };
  }

  /**
   * Start checkpoint timer for an execution
   */
  private startCheckpointTimer(executionId: string): void {
    const timer = setInterval(async () => {
      const execution = this.activeExecutions.get(executionId);
      if (execution && execution.status === 'running') {
        try {
          const checkpoint = await this.stateManager.createCheckpoint(execution);
          await this.emitEvent('checkpoint:created', {
            executionId,
            checkpointId: checkpoint.id,
            timestamp: checkpoint.timestamp,
          });
        } catch (error) {
          console.error(`Failed to create checkpoint for ${executionId}:`, error);
        }
      }
    }, this.config.checkpointInterval);

    this.checkpointTimers.set(executionId, timer);
  }

  /**
   * Stop checkpoint timer for an execution
   */
  private stopCheckpointTimer(executionId: string): void {
    const timer = this.checkpointTimers.get(executionId);
    if (timer) {
      clearInterval(timer);
      this.checkpointTimers.delete(executionId);
    }
  }

  /**
   * Emit event through EventBus
   */
  private async emitEvent(event: string, data: any): Promise<void> {
    await this.eventBus.publish('orchestrator', event, data);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen to thinking pipeline events
    this.eventBus.subscribe('pipeline:*', async (event) => {
      // Forward pipeline events with orchestrator context
      await this.eventBus.publish('orchestrator', 'pipeline_event', event);
    });

    // Listen to task events (will be used when TaskExecutor is implemented)
    this.eventBus.subscribe('task:*', async (event) => {
      await this.eventBus.publish('orchestrator', 'task_event', event);
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Stop all checkpoint timers
    for (const [executionId] of this.checkpointTimers) {
      this.stopCheckpointTimer(executionId);
    }

    // Clean up old executions
    await this.stateManager.cleanup();

    // Terminate worker pool
    await this.workerPool.terminate();
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    return {
      activeExecutions: this.activeExecutions.size,
      queuedExecutions: this.executionQueue.size,
      workerPool: this.workerPool.getStats(),
      performance: this.performanceMonitor.getReport(),
    };
  }
}
