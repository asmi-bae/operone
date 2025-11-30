import type { Worker } from 'worker_threads';

import { EventBus } from './EventBus';

interface WorkerTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout?: number;
  retries: number;
  maxRetries: number;
}

interface PendingTask {
  task: WorkerTask;
  workerIndex: number;
  startTime: number;
  timeoutHandle?: NodeJS.Timeout;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeWorkers: Map<number, boolean> = new Map(); // worker index -> busy
  private pendingTasks: Map<string, PendingTask> = new Map(); // taskId -> pending task info
  private maxWorkers: number;
  private workerScript: string;
  private eventBus: EventBus;
  private defaultTimeout: number = 30000; // 30 seconds default timeout

  constructor(maxWorkers: number = 4, workerScriptPath?: string) {
    this.maxWorkers = maxWorkers;
    this.eventBus = EventBus.getInstance();
    // For TS execution in dev, we might need a loader or point to the .ts file with ts-node/tsx.
    const defaultWorkerPath = typeof __dirname !== 'undefined' 
      ? `${__dirname}/../worker/agent-worker.js` 
      : '../worker/agent-worker.js';
    this.workerScript = workerScriptPath || defaultWorkerPath;
    this.initialize();
  }

  private async initialize() {
    // Check if running in Node.js environment
    if (typeof process === 'undefined' || (process as any).type === 'renderer' || (process as any).browser) {
      console.warn('[WorkerPool] Skipping worker initialization in browser environment');
      return;
    }

    for (let i = 0; i < this.maxWorkers; i++) {
      await this.spawnWorker(i);
    }
  }

  private async spawnWorker(index: number) {
    // In a real production build, ensure this path resolves to the built worker file
    // For now, we'll assume the worker script exists or will be created.
    try {
        // Dynamic import to avoid bundling worker_threads in browser
        const { Worker } = await import('worker_threads');
        
        const worker = new Worker(this.workerScript, {
            workerData: { workerId: index }
        });

        worker.on('message', (message) => {
            this.handleWorkerMessage(index, message);
        });

        worker.on('error', (err) => {
            console.error(`Worker ${index} error:`, err);
            this.eventBus.publish('system', 'worker:error', { workerId: index, error: err.message });
            this.handleWorkerError(index, err);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker ${index} stopped with exit code ${code}`);
                this.eventBus.publish('system', 'worker:exit', { workerId: index, code });
                this.handleWorkerExit(index, code);
            }
        });

        this.workers[index] = worker;
        this.activeWorkers.set(index, false);
    } catch (error) {
        console.error('Failed to spawn worker:', error);
    }
  }

  private handleWorkerMessage(workerIndex: number, message: any) {
    // Handle task completion
    if (message.type === 'task:complete') {
        const { taskId, result, error } = message;
        const pendingTask = this.pendingTasks.get(taskId);
        
        if (pendingTask) {
            // Clear timeout
            if (pendingTask.timeoutHandle) {
                clearTimeout(pendingTask.timeoutHandle);
            }
            
            // Remove from pending tasks
            this.pendingTasks.delete(taskId);
            
            // Mark worker as available
            this.activeWorkers.set(workerIndex, false);
            
            // Resolve or reject the promise
            if (error) {
                pendingTask.task.reject(new Error(error));
            } else {
                pendingTask.task.resolve(result);
            }
            
            // Emit completion event
            this.eventBus.publish('system', 'task:complete', {
                taskId,
                workerId: workerIndex,
                duration: Date.now() - pendingTask.startTime,
                success: !error
            });
            
            // Process next task
            this.processNextTask();
        } else {
            console.warn(`Received completion for unknown task: ${taskId}`);
        }
    }
    
    // Re-emit events from worker to main event bus
    if (message.type === 'event') {
        this.eventBus.publish(message.topic, message.event, message.payload);
    }
    
    // Handle progress updates
    if (message.type === 'task:progress') {
        const { taskId, progress } = message;
        this.eventBus.publish('system', 'task:progress', { taskId, progress });
    }
  }

  private handleWorkerError(workerIndex: number, error: Error) {
    // Find and fail all tasks assigned to this worker
    for (const [taskId, pendingTask] of this.pendingTasks.entries()) {
      if (pendingTask.workerIndex === workerIndex) {
        // Clear timeout
        if (pendingTask.timeoutHandle) {
          clearTimeout(pendingTask.timeoutHandle);
        }
        
        // Retry or fail the task
        if (pendingTask.task.retries < pendingTask.task.maxRetries) {
          pendingTask.task.retries++;
          this.taskQueue.unshift(pendingTask.task); // Add to front of queue for retry
          this.pendingTasks.delete(taskId);
        } else {
          pendingTask.task.reject(new Error(`Worker error: ${error.message}`));
          this.pendingTasks.delete(taskId);
        }
      }
    }
    
    // Mark worker as available
    this.activeWorkers.set(workerIndex, false);
    
    // Respawn the worker
    this.spawnWorker(workerIndex);
  }

  private handleWorkerExit(workerIndex: number, code: number) {
    // Similar to handleWorkerError, but for worker exits
    this.handleWorkerError(workerIndex, new Error(`Worker exited with code ${code}`));
  }

  private handleTaskTimeout(taskId: string) {
    const pendingTask = this.pendingTasks.get(taskId);
    
    if (pendingTask) {
      // Remove from pending tasks
      this.pendingTasks.delete(taskId);
      
      // Mark worker as available
      this.activeWorkers.set(pendingTask.workerIndex, false);
      
      // Retry or fail the task
      if (pendingTask.task.retries < pendingTask.task.maxRetries) {
        pendingTask.task.retries++;
        this.taskQueue.unshift(pendingTask.task); // Add to front of queue for retry
        this.eventBus.publish('system', 'task:timeout:retry', { taskId, retries: pendingTask.task.retries });
      } else {
        pendingTask.task.reject(new Error(`Task timeout after ${pendingTask.task.timeout}ms`));
        this.eventBus.publish('system', 'task:timeout:failed', { taskId });
      }
      
      // Process next task
      this.processNextTask();
    }
  }

  public async executeTask(
    type: string, 
    payload: any, 
    options: { priority?: number; timeout?: number; maxRetries?: number } = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: Math.random().toString(36).substring(7),
        type,
        payload,
        priority: options.priority ?? 0,
        timeout: options.timeout ?? this.defaultTimeout,
        retries: 0,
        maxRetries: options.maxRetries ?? 3,
        resolve,
        reject
      };

      this.taskQueue.push(task);
      
      // Sort queue by priority (higher priority first)
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      this.processNextTask();
    });
  }

  private processNextTask() {
    if (this.taskQueue.length === 0) return;

    const availableWorkerIndex = this.workers.findIndex((_, i) => !this.activeWorkers.get(i));
    
    if (availableWorkerIndex === -1) return; // No workers available

    const task = this.taskQueue.shift();
    if (!task) return;

    const worker = this.workers[availableWorkerIndex];
    this.activeWorkers.set(availableWorkerIndex, true);

    // Track pending task with timeout
    const timeoutHandle = task.timeout ? setTimeout(() => {
      this.handleTaskTimeout(task.id);
    }, task.timeout) : undefined;

    this.pendingTasks.set(task.id, {
      task,
      workerIndex: availableWorkerIndex,
      startTime: Date.now(),
      timeoutHandle
    });
    
    if (worker) {
        worker.postMessage({
            type: 'task:start',
            taskId: task.id,
            taskType: task.type,
            payload: task.payload
        });
        
        this.eventBus.publish('system', 'task:start', {
          taskId: task.id,
          taskType: task.type,
          workerId: availableWorkerIndex
        });
    } else {
        console.error(`Worker at index ${availableWorkerIndex} is undefined`);
        // Clear timeout and reject task
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        this.pendingTasks.delete(task.id);
        task.reject(new Error('Worker not available'));
    }
  }
  
  public terminate() {
      // Clear all pending tasks
      for (const [taskId, pendingTask] of this.pendingTasks.entries()) {
        if (pendingTask.timeoutHandle) {
          clearTimeout(pendingTask.timeoutHandle);
        }
        pendingTask.task.reject(new Error('Worker pool terminated'));
      }
      this.pendingTasks.clear();
      
      // Terminate all workers
      this.workers.forEach(w => w.terminate());
  }
  
  public getStats() {
    return {
      totalWorkers: this.maxWorkers,
      activeWorkers: Array.from(this.activeWorkers.values()).filter(busy => busy).length,
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length
    };
  }
}
