/**
 * TaskExecutor - Executes task graphs with parallel execution support
 * 
 * Manages the execution of tasks from a TaskGraph, handling:
 * - Parallel execution of independent tasks
 * - Dependency resolution
 * - Error handling and retries
 * - Progress tracking
 */

import { EventBus } from './EventBus';
import { WorkerPool } from './WorkerPool';
import type { Task, TaskGraph, TaskResult, ExecutionOptions } from './types';

export interface TaskExecutorConfig {
  maxConcurrentTasks?: number;
  enableRetries?: boolean;
  timeout?: number;
}

export class TaskExecutor {
  private eventBus: EventBus;
  private workerPool: WorkerPool;
  private config: Required<TaskExecutorConfig>;

  // Track task execution state
  private completedTasks: Set<string> = new Set();
  private failedTasks: Set<string> = new Set();
  private runningTasks: Set<string> = new Set();

  constructor(config: TaskExecutorConfig = {}) {
    this.eventBus = EventBus.getInstance();
    this.workerPool = new WorkerPool();
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      enableRetries: config.enableRetries ?? true,
      timeout: config.timeout || 300000, // 5 minutes
    };
  }

  /**
   * Execute a task graph
   */
  async executeGraph(
    graph: TaskGraph,
    options: ExecutionOptions = {}
  ): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();
    this.completedTasks.clear();
    this.failedTasks.clear();
    this.runningTasks.clear();

    try {
      // Execute tasks in dependency order
      for (const parallelGroup of graph.executionOrder) {
        const groupResults = await this.executeParallelGroup(
          parallelGroup,
          graph.tasks,
          options
        );

        // Merge results
        for (const [taskId, result] of groupResults) {
          results.set(taskId, result);
        }

        // Check if any critical tasks failed
        const criticalFailures = Array.from(groupResults.values()).filter(
          result => !result.success && graph.tasks.get(result.taskId)?.priority === 1
        );

        if (criticalFailures.length > 0) {
          throw new Error(
            `Critical task failed: ${criticalFailures[0]!.error?.message || 'Unknown error'}`
          );
        }
      }

      return results;
    } catch (error) {
      // Emit error event
      await this.emitEvent('graph:failed', {
        error: (error as Error).message,
        completedTasks: this.completedTasks.size,
        failedTasks: this.failedTasks.size,
      });
      throw error;
    }
  }

  /**
   * Execute a group of parallel tasks
   */
  private async executeParallelGroup(
    taskIds: string[],
    allTasks: Map<string, Task>,
    options: ExecutionOptions
  ): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();

    // Execute all tasks in parallel
    const promises = taskIds.map(async taskId => {
      const task = allTasks.get(taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      const result = await this.executeTask(task, options);
      results.set(taskId, result);
      return result;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: Task,
    options: ExecutionOptions
  ): Promise<TaskResult> {
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = task.retryPolicy?.maxRetries || 0;

    this.runningTasks.add(task.id);

    // Emit start event
    await this.emitEvent('task:started', {
      taskId: task.id,
      type: task.type,
      description: task.description,
      agent: task.agent,
    });

    while (retries <= maxRetries) {
      try {
        // Execute task based on type
        const data = await this.executeTaskByType(task);

        // Success
        const result: TaskResult = {
          taskId: task.id,
          success: true,
          data,
          duration: Date.now() - startTime,
          retries,
        };

        this.completedTasks.add(task.id);
        this.runningTasks.delete(task.id);

        // Emit completion event
        await this.emitEvent('task:completed', {
          taskId: task.id,
          duration: result.duration,
          retries,
        });

        return result;

      } catch (error) {
        retries++;

        if (retries > maxRetries) {
          // Failed after all retries
          const result: TaskResult = {
            taskId: task.id,
            success: false,
            error: error as Error,
            duration: Date.now() - startTime,
            retries: retries - 1,
          };

          this.failedTasks.add(task.id);
          this.runningTasks.delete(task.id);

          // Emit failure event
          await this.emitEvent('task:failed', {
            taskId: task.id,
            error: (error as Error).message,
            retries: retries - 1,
          });

          return result;
        }

        // Retry with backoff
        const delay = this.calculateRetryDelay(retries, task);
        await this.sleep(delay);

        // Emit retry event
        await this.emitEvent('task:retry', {
          taskId: task.id,
          attempt: retries,
          maxRetries,
        });
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Unexpected execution path');
  }

  /**
   * Execute task based on its type
   */
  private async executeTaskByType(task: Task): Promise<any> {
    // For now, return a mock result
    // In the future, this will delegate to the appropriate agent
    
    // Simulate some work
    await this.sleep(100);

    return {
      taskId: task.id,
      type: task.type,
      description: task.description,
      result: `Executed ${task.type} task: ${task.description}`,
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, task: Task): number {
    const baseDelay = task.retryPolicy?.retryDelay || 1000;
    const multiplier = task.retryPolicy?.backoffMultiplier || 2;
    return baseDelay * Math.pow(multiplier, attempt - 1);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Emit event through EventBus
   */
  private async emitEvent(event: string, data: any): Promise<void> {
    await this.eventBus.publish('task', event, data);
  }

  /**
   * Get execution statistics
   */
  getStats() {
    return {
      completed: this.completedTasks.size,
      failed: this.failedTasks.size,
      running: this.runningTasks.size,
    };
  }

  /**
   * Cancel all running tasks
   */
  async cancelAll(): Promise<void> {
    // TODO: Implement task cancellation
    this.runningTasks.clear();
  }
}
