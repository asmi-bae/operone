// Core exports
export { MemoryManager } from './memory/MemoryManager';
export * from './core/tool-registry';
export * from './core/tool-executor';
export { ModelProvider, ModelRegistry, ProviderManager, createDefaultConfig } from './model-provider';
export { StreamHandler } from './streaming/StreamHandler';
export type { StreamOptions } from './streaming/StreamHandler';
export * from './core/StorageManager';
export { EventBus } from './core/EventBus';
export { WorkerPool } from './core/WorkerPool';
export { ToolRegistry } from './core/ToolRegistry';
export { ResourceAllocator } from './core/ResourceAllocator';
export type { ResourceLimits, ResourceUsage, ResourceAllocation } from './core/ResourceAllocator';
export { PerformanceMonitor } from './core/PerformanceMonitor';
export type { PerformanceMetric, PerformanceProfile, PerformanceReport } from './core/PerformanceMonitor';

// Agent exports
export { AssistantAgent } from './agents/AssistantAgent';
export { OSAgent } from './agents/OSAgent';
export { Planner } from './agents/Planner';
export { RAGEngine } from './agents/RAGEngine';

// Browser adapter exports
export { BrowserAdapter } from './adapters/BrowserAdapter';


// Agent Manager
export class AgentManager {
  private agents: Map<any, string> = new Map();
  
  registerAgent(agent: any, description: string): void {
    this.agents.set(agent, description);
  }
  
  getAgents(): Map<any, string> {
    return this.agents;
  }

  async startAgent(agentId: string): Promise<void> {
    console.log(`Starting agent ${agentId}`);
    // implementation would go here
    return Promise.resolve();
  }
}

// Reasoning Engine
export class ReasoningEngine {
  async reason(agent: any, message: string): Promise<{ finalAnswer: string }> {
    // Check if agent has generateResponse method
    if (typeof agent.generateResponse === 'function') {
      const response = await agent.generateResponse(message);
      return { finalAnswer: response };
    }
    
    // Check if agent has generateStreamingResponse method
    if (typeof agent.generateStreamingResponse === 'function') {
      const response = await agent.generateStreamingResponse(message);
      return { finalAnswer: response };
    }
    
    return { finalAnswer: "Error: Invalid agent type" };
  }
}
