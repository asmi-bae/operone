/**
 * Core types for the Operone orchestration system
 */

import type { PipelineContext, ExecutionPlan, Intent } from '@operone/thinking';

/**
 * Task represents a single unit of work to be executed by an agent
 */
export interface Task {
  id: string;
  type: string;
  description: string;
  dependencies: string[];  // Task IDs this depends on
  agent: string;           // Which agent should execute
  estimatedDuration?: number;
  priority: number;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, any>;
}

/**
 * Task graph with dependency information
 */
export interface TaskGraph {
  tasks: Map<string, Task>;
  rootTasks: string[];     // Tasks with no dependencies
  executionOrder: string[][]; // Parallel execution groups
}

/**
 * Retry policy for failed tasks
 */
export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;      // milliseconds
  backoffMultiplier?: number;
}

/**
 * Task execution result
 */
export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: Error;
  duration: number;
  retries: number;
}

/**
 * Execution status
 */
export type ExecutionStatus = 
  | 'pending' 
  | 'planning'
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'paused'
  | 'cancelled';

/**
 * Task execution state
 */
export interface TaskExecution {
  id: string;
  status: ExecutionStatus;
  userRequest: string;
  context?: PipelineContext;
  intent?: Intent;
  plan?: ExecutionPlan;
  taskGraph?: TaskGraph;
  currentStep: number;
  totalSteps: number;
  startTime: number;
  endTime?: number;
  checkpoints: Checkpoint[];
  completedTasks: string[];
  failedTasks: string[];
  result?: any;
  error?: Error;
  metadata?: Record<string, any>;
}

/**
 * Checkpoint for state recovery
 */
export interface Checkpoint {
  id: string;
  executionId: string;
  timestamp: number;
  completedTasks: string[];
  pendingTasks: string[];
  state: Record<string, any>;
  context: PipelineContext;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  agentId?: string;
  priority?: number;
  timeout?: number;
  enableCheckpointing?: boolean;
  checkpointInterval?: number;
  maxConcurrentTasks?: number;
  metadata?: Record<string, any>;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  executionId: string;
  success: boolean;
  data?: any;
  error?: Error;
  duration: number;
  tasksCompleted: number;
  tasksFailed: number;
  checkpointsCreated: number;
}

/**
 * Task progress event
 */
export interface TaskProgress {
  executionId: string;
  taskId: string;
  progress: number;      // 0-100
  message?: string;
  data?: any;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  maxConcurrentAgents?: number;
  enableCheckpointing?: boolean;
  checkpointInterval?: number;  // milliseconds
  enableAdaptivePlanning?: boolean;
  defaultTimeout?: number;
  defaultRetryPolicy?: RetryPolicy;
}
