/**
 * TaskPlanner - Converts execution plans into executable task graphs
 * 
 * Takes the output from the ThinkingPipeline and creates a dependency graph
 * of tasks that can be executed in parallel where possible.
 */

import { nanoid } from 'nanoid';
import { DependencyGraph } from '@operone/thinking';
import type { ExecutionPlan, Intent, PipelineContext } from '@operone/thinking';
import type { Task, TaskGraph } from './types';

export interface TaskPlannerConfig {
  enableParallelization?: boolean;
  maxParallelTasks?: number;
  defaultPriority?: number;
}

export class TaskPlanner {
  private dependencyGraph: DependencyGraph;
  private config: Required<TaskPlannerConfig>;

  constructor(config: TaskPlannerConfig = {}) {
    this.dependencyGraph = new DependencyGraph();
    this.config = {
      enableParallelization: config.enableParallelization ?? true,
      maxParallelTasks: config.maxParallelTasks || 5,
      defaultPriority: config.defaultPriority || 5,
    };
  }

  /**
   * Create a task graph from an execution plan
   */
  async createPlan(
    intent: Intent,
    executionPlan: ExecutionPlan,
    context: PipelineContext
  ): Promise<TaskGraph> {
    const tasks = new Map<string, Task>();

    // Convert execution plan steps to tasks
    for (let i = 0; i < executionPlan.steps.length; i++) {
      const step = executionPlan.steps[i];
      if (!step) continue;
      
      const task: Task = {
        id: step.id, // Use the ID from the execution plan
        type: step.tool, // Use the tool type directly
        description: step.description,
        dependencies: this.findDependencies(step, executionPlan.steps),
        agent: this.assignAgent(step.tool, intent),
        priority: step.priority || this.calculatePriority(step, i, executionPlan.steps.length),
        estimatedDuration: step.estimatedDuration,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
        metadata: {
          stepIndex: i,
          parameters: step.parameters,
        },
      };

      tasks.set(task.id, task);
      
      // Add to dependency graph
      // Add to dependency graph
      this.dependencyGraph.addTask({
        id: task.id,
        description: task.description,
        status: 'pending',
      });

      // Add dependencies
      task.dependencies.forEach(depId => {
        this.dependencyGraph.addDependency(depId, task.id);
      });
    }

    // Find root tasks (no dependencies)
    const rootTasks = Array.from(tasks.values())
      .filter(task => task.dependencies.length === 0)
      .map(task => task.id);

    // Calculate execution order with parallelization
    const executionOrder = this.calculateExecutionOrder(tasks);

    return {
      tasks,
      rootTasks,
      executionOrder,
    };
  }

  /**
   * Helper to map tool type to general task category if needed
   * (Most logic should use the tool type directly now)
   */
  private inferTaskType(tool: string): string {
    return tool;
  }

  /**
   * Assign appropriate agent for a task based on tool type
   */
  private assignAgent(tool: string, intent: Intent): string {
    switch (tool) {
      case 'fs':
      case 'shell':
        return 'OSAgent';
      case 'networking':
      case 'peer':
        return 'NetworkAgent';
      case 'ai':
      case 'memory':
      case 'reasoning':
        return 'AssistantAgent';
      case 'github':
        return 'DeveloperAgent';
      default:
        return 'AssistantAgent';
    }
  }

  /**
   * Find dependencies for a step
   */
  private findDependencies(
    step: ExecutionPlan['steps'][0],
    allSteps: ExecutionPlan['steps']
  ): string[] {
    // If the plan already has dependencies, use them
    if (step.dependencies && step.dependencies.length > 0) {
      return step.dependencies;
    }

    // Fallback: sequential dependencies if no explicit dependencies and not parallelizable
    // We can't easily guess dependencies without more info, so we assume strict sequential
    // for safety unless parallelization is explicitly allowed or modeled in the plan.
    const stepIndex = allSteps.findIndex(s => s.id === step.id);
    if (stepIndex > 0) {
       const prevStep = allSteps[stepIndex - 1];
       if (prevStep) {
         return [prevStep.id];
       }
    }

    return [];
  }

  /**
   * Calculate task priority
   */
  private calculatePriority(
    step: ExecutionPlan['steps'][0],
    index: number,
    totalSteps: number
  ): number {
    // Earlier steps have higher priority (lower number)
    const positionPriority = Math.floor((index / totalSteps) * 10);
    
    // Critical steps get higher priority
    const criticalKeywords = ['error', 'critical', 'important', 'urgent'];
    const isCritical = criticalKeywords.some(keyword =>
      step.description.toLowerCase().includes(keyword)
    );

    return isCritical ? Math.max(1, positionPriority - 3) : positionPriority;
  }

  /**
   * Calculate execution order with parallelization
   */
  private calculateExecutionOrder(tasks: Map<string, Task>): string[][] {
    if (!this.config.enableParallelization) {
      // Sequential execution
      return Array.from(tasks.keys()).map(id => [id]);
    }

    const executionOrder: string[][] = [];
    const completed = new Set<string>();
    const taskArray = Array.from(tasks.values());

    while (completed.size < tasks.size) {
      const parallelGroup: string[] = [];

      for (const task of taskArray) {
        if (completed.has(task.id)) continue;

        // Check if all dependencies are completed
        const canExecute = task.dependencies.every(depId => completed.has(depId));

        if (canExecute && parallelGroup.length < this.config.maxParallelTasks) {
          parallelGroup.push(task.id);
        }
      }

      if (parallelGroup.length === 0) {
        // Circular dependency or error
        throw new Error('Cannot resolve task dependencies - possible circular dependency');
      }

      executionOrder.push(parallelGroup);
      parallelGroup.forEach(id => completed.add(id));
    }

    return executionOrder;
  }



  /**
   * Optimize task graph for better performance
   */
  optimizeGraph(graph: TaskGraph): TaskGraph {
    // Future optimizations:
    // 1. Merge independent tasks that use the same agent
    // 2. Reorder tasks to minimize context switching
    // 3. Identify tasks that can be cached
    // 4. Split large tasks into smaller ones

    // For now, simple optimization: sort tasks by priority within their execution groups
    // This doesn't change the graph structure, just logically reorders for display/execution if needed
    // Real graph optimization would be complex re-balancing of the graph.
    
    // We can verify no redundant dependencies here (transitive reduction)
    
    return graph;
  }

  /**
   * Validate task graph for correctness
   */
  validateGraph(graph: TaskGraph): boolean {
    // Check for circular dependencies
    for (const [taskId, task] of graph.tasks) {
      if (this.hasCircularDependency(taskId, task, graph.tasks, new Set())) {
        throw new Error(`Circular dependency detected for task ${taskId}`);
      }
    }

    // Check that all dependencies exist
    for (const [taskId, task] of graph.tasks) {
      for (const depId of task.dependencies) {
        if (!graph.tasks.has(depId)) {
          throw new Error(`Task ${taskId} depends on non-existent task ${depId}`);
        }
      }
    }

    return true;
  }

  /**
   * Check for circular dependencies
   */
  private hasCircularDependency(
    taskId: string,
    task: Task,
    allTasks: Map<string, Task>,
    visited: Set<string>
  ): boolean {
    if (visited.has(taskId)) {
      return true;
    }

    visited.add(taskId);

    for (const depId of task.dependencies) {
      const depTask = allTasks.get(depId);
      if (depTask && this.hasCircularDependency(depId, depTask, allTasks, new Set(visited))) {
        return true;
      }
    }

    return false;
  }
}
