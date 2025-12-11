/**
 * StateManager - Manages execution state, checkpoints, and recovery
 */

import { nanoid } from 'nanoid';
import type { MemoryManager } from '../memory/MemoryManager';
import type { Checkpoint, TaskExecution } from './types';
import type { PipelineContext } from '@operone/thinking';

export interface StateManagerConfig {
  enablePersistence?: boolean;
  checkpointInterval?: number;  // milliseconds
  maxCheckpoints?: number;      // per execution
}

export class StateManager {
  private memoryManager: MemoryManager;
  private config: StateManagerConfig;
  
  // In-memory storage for executions and checkpoints
  private executionStore: Map<string, string> = new Map();
  private checkpointStore: Map<string, string> = new Map();
  
  // In-memory cache of active executions
  private executionCache: Map<string, TaskExecution> = new Map();
  private checkpointCache: Map<string, Checkpoint> = new Map();

  constructor(
    memoryManager: MemoryManager,
    config: StateManagerConfig = {}
  ) {
    this.memoryManager = memoryManager;
    this.config = {
      enablePersistence: true,
      checkpointInterval: 30000, // 30 seconds
      maxCheckpoints: 10,
      ...config,
    };
  }

  /**
   * Create a new execution state
   */
  async createExecution(
    userRequest: string,
    context?: PipelineContext
  ): Promise<TaskExecution> {
    const execution: TaskExecution = {
      id: nanoid(),
      status: 'pending',
      userRequest,
      context,
      currentStep: 0,
      totalSteps: 0,
      startTime: Date.now(),
      checkpoints: [],
      completedTasks: [],
      failedTasks: [],
    };

    this.executionCache.set(execution.id, execution);

    if (this.config.enablePersistence) {
      await this.persistExecution(execution);
    }

    return execution;
  }

  /**
   * Get execution state by ID
   */
  async getExecutionState(executionId: string): Promise<TaskExecution | undefined> {
    // Check cache first
    let execution = this.executionCache.get(executionId);
    
    if (!execution && this.config.enablePersistence) {
      // Try to load from storage
      execution = await this.loadExecution(executionId);
      if (execution) {
        this.executionCache.set(executionId, execution);
      }
    }

    return execution;
  }

  /**
   * Update execution state
   */
  async updateExecutionState(
    executionId: string,
    updates: Partial<TaskExecution>
  ): Promise<void> {
    const execution = await this.getExecutionState(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    Object.assign(execution, updates);
    this.executionCache.set(executionId, execution);

    if (this.config.enablePersistence) {
      await this.persistExecution(execution);
    }
  }

  /**
   * Create a checkpoint for an execution
   */
  async createCheckpoint(execution: TaskExecution): Promise<Checkpoint> {
    if (!execution.context) {
      throw new Error('Cannot create checkpoint without context');
    }

    const checkpoint: Checkpoint = {
      id: nanoid(),
      executionId: execution.id,
      timestamp: Date.now(),
      completedTasks: [...execution.completedTasks],
      pendingTasks: execution.taskGraph
        ? Array.from(execution.taskGraph.tasks.keys()).filter(
            taskId => !execution.completedTasks.includes(taskId)
          )
        : [],
      state: {
        currentStep: execution.currentStep,
        totalSteps: execution.totalSteps,
        status: execution.status,
      },
      context: execution.context,
    };

    // Add to execution's checkpoint list
    execution.checkpoints.push(checkpoint);

    // Limit number of checkpoints
    if (
      this.config.maxCheckpoints &&
      execution.checkpoints.length > this.config.maxCheckpoints
    ) {
      const removed = execution.checkpoints.shift();
      if (removed) {
        this.checkpointCache.delete(removed.id);
        if (this.config.enablePersistence) {
          await this.deleteCheckpoint(removed.id);
        }
      }
    }

    this.checkpointCache.set(checkpoint.id, checkpoint);

    if (this.config.enablePersistence) {
      await this.persistCheckpoint(checkpoint);
      await this.persistExecution(execution);
    }

    return checkpoint;
  }

  /**
   * Restore execution from a checkpoint
   */
  async restoreFromCheckpoint(checkpointId: string): Promise<TaskExecution> {
    let checkpoint = this.checkpointCache.get(checkpointId);

    if (!checkpoint && this.config.enablePersistence) {
      checkpoint = await this.loadCheckpoint(checkpointId);
      if (checkpoint) {
        this.checkpointCache.set(checkpointId, checkpoint);
      }
    }

    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const execution = await this.getExecutionState(checkpoint.executionId);
    if (!execution) {
      throw new Error(`Execution ${checkpoint.executionId} not found`);
    }

    // Restore state from checkpoint
    execution.currentStep = checkpoint.state.currentStep;
    execution.totalSteps = checkpoint.state.totalSteps;
    execution.status = 'running';
    execution.completedTasks = [...checkpoint.completedTasks];
    execution.context = checkpoint.context;

    this.executionCache.set(execution.id, execution);

    if (this.config.enablePersistence) {
      await this.persistExecution(execution);
    }

    return execution;
  }

  /**
   * Get all checkpoints for an execution
   */
  async getCheckpoints(executionId: string): Promise<Checkpoint[]> {
    const execution = await this.getExecutionState(executionId);
    return execution?.checkpoints || [];
  }

  /**
   * Delete an execution and all its checkpoints
   */
  async deleteExecution(executionId: string): Promise<void> {
    const execution = this.executionCache.get(executionId);
    
    if (execution) {
      // Delete all checkpoints
      for (const checkpoint of execution.checkpoints) {
        this.checkpointCache.delete(checkpoint.id);
        if (this.config.enablePersistence) {
          await this.deleteCheckpoint(checkpoint.id);
        }
      }
    }

    this.executionCache.delete(executionId);

    if (this.config.enablePersistence) {
      this.executionStore.delete(`execution:${executionId}`);
    }
  }

  /**
   * List all active executions
   */
  async listActiveExecutions(): Promise<TaskExecution[]> {
    const executions = Array.from(this.executionCache.values());
    return executions.filter(
      e => e.status === 'running' || e.status === 'paused' || e.status === 'planning'
    );
  }

  /**
   * Persist execution to storage
   */
  private async persistExecution(execution: TaskExecution): Promise<void> {
    this.executionStore.set(
      `execution:${execution.id}`,
      JSON.stringify(execution)
    );
  }

  /**
   * Load execution from storage
   */
  private async loadExecution(executionId: string): Promise<TaskExecution | undefined> {
    const data = this.executionStore.get(`execution:${executionId}`);
    return data ? JSON.parse(data) : undefined;
  }

  /**
   * Persist checkpoint to storage
   */
  private async persistCheckpoint(checkpoint: Checkpoint): Promise<void> {
    this.checkpointStore.set(
      `checkpoint:${checkpoint.id}`,
      JSON.stringify(checkpoint)
    );
  }

  /**
   * Load checkpoint from storage
   */
  private async loadCheckpoint(checkpointId: string): Promise<Checkpoint | undefined> {
    const data = this.checkpointStore.get(`checkpoint:${checkpointId}`);
    return data ? JSON.parse(data) : undefined;
  }

  /**
   * Delete checkpoint from storage
   */
  private async deleteCheckpoint(checkpointId: string): Promise<void> {
    this.checkpointStore.delete(`checkpoint:${checkpointId}`);
  }

  /**
   * Clean up old completed executions
   */
  async cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, execution] of this.executionCache.entries()) {
      if (
        (execution.status === 'completed' || execution.status === 'failed') &&
        execution.endTime &&
        now - execution.endTime > olderThanMs
      ) {
        await this.deleteExecution(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}
