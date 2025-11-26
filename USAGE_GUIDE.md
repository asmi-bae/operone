# Operone Agent Usage Guide

This guide shows you how to use the various agents in the Operone system.

---

## Quick Start

### 1. Basic Setup

```typescript
import { 
  OSAgent, 
  AssistantAgent, 
  ReasoningEngine,
  MemoryManager,
  ModelProvider 
} from '@repo/operone';

// Initialize the model provider (OpenAI)
const modelProvider = new ModelProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

// Or use Ollama (Local)
/*
const ollamaProvider = new ModelProvider({
  provider: 'ollama',
  model: 'llama3.2',
  baseURL: 'http://localhost:11434' // Optional, defaults to this
});
*/

// Or use OpenRouter
/*
const openRouterProvider = new ModelProvider({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'anthropic/claude-3.5-sonnet'
});
*/
```

---

## Using OSAgent (File & Shell Operations)

The OSAgent can interact with your file system and execute shell commands.

### Example: File Operations

```typescript
import { OSAgent } from '@repo/operone';
import { ModelProvider } from '@repo/operone';

// Create the agent
const osAgent = new OSAgent({
  modelProvider,
  allowedPaths: ['/Users/yourname/projects'],
  allowedCommands: ['ls', 'cat', 'grep', 'find']
});

// Ask the agent to analyze files
const thought = await osAgent.think('What files are in my projects directory?');
console.log('Agent thinking:', thought);

// Execute the action
await osAgent.act(thought);

// Get the result
const result = await osAgent.observe();
console.log('Result:', result);
```

### Example: Shell Commands

```typescript
// Ask agent to run a command
const thought = await osAgent.think('Find all TypeScript files');
await osAgent.act(thought);
const files = await osAgent.observe();
console.log('TypeScript files:', files);
```

---

## Using AssistantAgent (RAG-based Q&A)

The AssistantAgent uses RAG (Retrieval-Augmented Generation) for context-aware responses.

### Example: Document Q&A

```typescript
import { AssistantAgent, MemoryManager } from '@repo/operone';

// Create memory manager
const memoryManager = new MemoryManager('./data/memory.db');

// Create assistant agent
const assistant = new AssistantAgent({
  modelProvider,
  memoryManager
});

// Ingest documents
await assistant.ingestDocument(
  'doc1',
  'The Operone system is an AI agent framework...',
  { source: 'documentation', category: 'overview' }
);

await assistant.ingestDocument(
  'doc2',
  'OSAgent handles file and shell operations...',
  { source: 'documentation', category: 'agents' }
);

// Ask questions
const answer = await assistant.think('What is Operone?');
console.log('Answer:', answer);

// Get statistics
const stats = assistant.getStats();
console.log('Documents indexed:', stats.vectorDocuments);
console.log('Short-term memory:', stats.shortTermMemory);
```

---

## Using ReasoningEngine (Think-Act-Observe Loop)

The ReasoningEngine orchestrates agents through a reasoning loop.

### Example: Autonomous Task Execution

```typescript
import { ReasoningEngine, OSAgent } from '@repo/operone';

// Create reasoning engine (max 5 iterations)
const reasoningEngine = new ReasoningEngine(5);

// Create an agent
const osAgent = new OSAgent({
  modelProvider,
  allowedPaths: ['/Users/yourname/projects'],
  allowedCommands: ['ls', 'cat', 'grep']
});

// Run reasoning loop
const result = await reasoningEngine.reason(
  osAgent,
  'Find all package.json files and list their dependencies'
);

if (result.success) {
  console.log('Task completed!');
  console.log('Final answer:', result.finalAnswer);
  console.log('Steps taken:', result.steps.length);
} else {
  console.log('Task failed:', result.finalAnswer);
}

// View reasoning steps
result.steps.forEach((step, i) => {
  console.log(`Step ${i + 1} (${step.type}):`, step.content);
});
```

---

## Using AgentManager (Multi-Agent Orchestration)

The AgentManager handles multiple agents running concurrently.

### Example: Managing Multiple Agents

```typescript
import { AgentManager, OSAgent, AssistantAgent } from '@repo/operone';

const manager = new AgentManager();

// Create agents
const osAgent = new OSAgent({ 
  modelProvider, 
  allowedPaths: ['/tmp'],
  allowedCommands: ['ls']
});

const assistant = new AssistantAgent({ 
  modelProvider, 
  memoryManager 
});

// Register agents
manager.registerAgent(osAgent, 'Monitor file system', {
  cpu: '2',
  ram: '1GB'
});

manager.registerAgent(assistant, 'Answer user questions', {
  cpu: '1',
  ram: '512MB'
});

// Start agents
await manager.startAgent('os-agent');
await manager.startAgent('assistant-agent');

// Check status
const state = manager.getAgentState('os-agent');
console.log('Agent status:', state?.status);

// List all agents
const agents = manager.listAgents();
console.log('Active agents:', agents.map(a => a.id));

// Pause/stop agents
await manager.pauseAgent('os-agent');
await manager.stopAgent('assistant-agent');
```

---

## Using Planner (Task Planning)

The Planner creates structured plans with dependencies.

### Example: Create Execution Plan

```typescript
import { Planner } from '@repo/operone';

const planner = new Planner(modelProvider);

// Create a plan
const plan = await planner.createPlan(
  'Build and deploy a web application',
  ['git.clone', 'npm.install', 'npm.build', 'docker.build', 'docker.push']
);

console.log('Plan ID:', plan.id);
console.log('Goal:', plan.goal);

// View steps
plan.steps.forEach(step => {
  console.log(`Step ${step.id}: ${step.description}`);
  console.log('  Dependencies:', step.dependencies);
  console.log('  Tool:', step.tool);
  console.log('  Status:', step.status);
});

// Update step status
await planner.updateStepStatus(plan, 'step-1', 'running');
await planner.updateStepStatus(plan, 'step-1', 'completed');
```

---

## Complete Example: Building a Code Analysis Tool

Here's a complete example combining multiple agents:

```typescript
import {
  OSAgent,
  AssistantAgent,
  ReasoningEngine,
  MemoryManager,
  ModelProvider,
  AgentManager
} from '@repo/operone';

async function analyzeCodebase(projectPath: string) {
  // Setup
  const modelProvider = new ModelProvider({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  });

  const memoryManager = new MemoryManager('./analysis.db');
  const manager = new AgentManager();

  // Create OS Agent for file operations
  const osAgent = new OSAgent({
    modelProvider,
    allowedPaths: [projectPath],
    allowedCommands: ['ls', 'cat', 'grep', 'find', 'wc']
  });

  // Create Assistant for analysis
  const assistant = new AssistantAgent({
    modelProvider,
    memoryManager
  });

  // Create reasoning engine
  const reasoningEngine = new ReasoningEngine(10);

  // Step 1: Scan codebase
  console.log('📁 Scanning codebase...');
  const scanResult = await reasoningEngine.reason(
    osAgent,
    `List all TypeScript files in ${projectPath} and count lines of code`
  );

  // Step 2: Ingest findings
  console.log('📚 Indexing code structure...');
  await assistant.ingestDocument(
    'codebase-scan',
    scanResult.finalAnswer,
    { type: 'analysis', timestamp: Date.now() }
  );

  // Step 3: Analyze
  console.log('🔍 Analyzing...');
  const analysis = await assistant.think(
    'Based on the codebase scan, what is the project structure and what are the main components?'
  );

  console.log('\n📊 Analysis Results:');
  console.log(analysis);

  // Cleanup
  memoryManager.close();

  return {
    scan: scanResult,
    analysis
  };
}

// Run the analysis
analyzeCodebase('/Users/yourname/projects/my-app')
  .then(results => console.log('✅ Analysis complete!'))
  .catch(err => console.error('❌ Error:', err));
```

---

## Event Bus Integration

All agents emit events through the EventBus for monitoring:

```typescript
import { EventBus } from '@repo/operone';

const eventBus = EventBus.getInstance();

// Subscribe to agent events
eventBus.subscribe('agent', 'step:think:start', (data) => {
  console.log('Agent started thinking:', data);
});

eventBus.subscribe('agent', 'step:act:end', (data) => {
  console.log('Agent completed action:', data);
});

// Subscribe to reasoning events
eventBus.subscribe('reasoning', 'loop:start', (data) => {
  console.log('Reasoning loop started:', data);
});

eventBus.subscribe('reasoning', 'loop:complete', (data) => {
  console.log('Reasoning loop completed:', data);
});

// Subscribe to planner events
eventBus.subscribe('planner', 'create:complete', (data) => {
  console.log('Plan created:', data);
});
```

---

## Environment Setup

Create a `.env` file:

```bash
# AI Provider Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Database
DATABASE_PATH=./data/memory.db

# Agent Configuration
ALLOWED_PATHS=/Users/yourname/projects,/tmp
ALLOWED_COMMANDS=ls,cat,grep,find,wc,git
```

---

## Best Practices

### 1. **Always Specify Allowed Paths/Commands**
```typescript
// ✅ Good - Restricted access
const osAgent = new OSAgent({
  modelProvider,
  allowedPaths: ['/specific/project'],
  allowedCommands: ['ls', 'cat']
});

// ❌ Bad - Too permissive
const osAgent = new OSAgent({
  modelProvider,
  allowedPaths: ['/'],
  allowedCommands: ['rm', 'sudo']
});
```

### 2. **Close Resources**
```typescript
// Always close memory manager
const memoryManager = new MemoryManager('./db.db');
try {
  // ... use memory manager
} finally {
  memoryManager.close();
}
```

### 3. **Handle Errors**
```typescript
try {
  const result = await reasoningEngine.reason(agent, input);
  if (!result.success) {
    console.error('Reasoning failed:', result.finalAnswer);
  }
} catch (error) {
  console.error('Error:', error);
}
```

### 4. **Monitor with Events**
```typescript
// Track agent activity
eventBus.subscribe('agent', 'step:error', (data) => {
  console.error('Agent error:', data);
  // Send alert, log to monitoring system, etc.
});
```

---

## Next Steps

- Check out the [API Documentation](./API_CONTRACT.md)
- Review the [Project Report](./PROJECT_REPORT.md)
- See [Test Examples](./packages/operone/src/) for more usage patterns
- Read [Known Issues](./KNOWN_ISSUES.md) for troubleshooting

---

## Need Help?

- 📖 Documentation: See `PROJECT_REPORT.md`
- 🧪 Examples: Check test files in `packages/operone/src/**/*.test.ts`
- 🐛 Issues: See `KNOWN_ISSUES.md`
