# Feature Mapping: Blueprint vs. Current Implementation

This document maps the features described in the Operone blueprint to the current codebase state, identifying implemented components, specific file locations, performance gaps, and integration needs.

## 1. Agent System (D)

| Feature | Blueprint Requirement | Current Implementation | File Location | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Agent Manager** | Lifecycle APIs (create, start, pause, resume, stop) | Implemented in `AgentManager`. | `packages/operone/src/core/AgentManager.ts` | 🟢 Implemented |
| **Agent Runtime** | Step execution, tool calls, resource quotas | `ReasoningEngine` handles the loop. `OSAgent` handles `act`. | `packages/operone/src/reasoning/ReasoningEngine.ts`<br>`packages/operone/src/agents/OSAgent.ts` | 🟢 Implemented |
| **Planner** | Goal -> Subtasks, verify plan | Implemented `Planner` class. | `packages/operone/src/thinking/Planner.ts` | 🟢 Implemented |
| **Tool Registry** | Metadata, schemas, permission scope | Implemented `ToolRegistry`. | `packages/operone/src/core/ToolRegistry.ts` | 🟢 Implemented |
| **Isolation** | Process/Container isolation | Runs in-process (Node.js). | N/A | 🔴 Missing |
| **Worker Pool** | Parallel execution of agents | Implemented `WorkerPool`. | `packages/operone/src/core/WorkerPool.ts` | 🟢 Implemented |
| **Observability** | Structured logs, trace IDs | `EventBus` integrated for detailed events. | `packages/operone/src/core/EventBus.ts` | 🟢 Implemented |

### Performance Gaps - Agent System
- **Blocking Execution**: `ReasoningEngine.reason` awaits every step sequentially. No support for parallel tool execution.
- **No Streaming**: `OSAgent.think` awaits full LLM response. Should stream tokens for lower TTFT (Time To First Token).
- **In-Process**: Agents run in the main thread/process, blocking the event loop for heavy tasks. Needs worker threads or separate processes.

## 2. RAG Pipeline (E)

| Feature | Blueprint Requirement | Current Implementation | File Location | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Ingestor** | File/URL/Email sources, normalization | `RAGEngine` supports batch ingest. | `packages/operone/src/rag/RAGEngine.ts` | 🟢 Implemented |
| **Chunker** | Rules-based, overlap control | Implemented `Chunker`. | `packages/operone/src/rag/Chunker.ts` | 🟢 Implemented |
| **Embedder** | Model router, caching | `VectorStore` + `EmbeddingCache`. | `packages/operone/src/rag/VectorStore.ts` | 🟢 Implemented |
| **Indexer** | Vector DB writing, metadata | `VectorStore.ts` supports batch add. | `packages/operone/src/rag/VectorStore.ts` | 🟢 Implemented |
| **Retriever** | Hybrid search, filters | `RAGEngine.query` with filters. | `packages/operone/src/rag/RAGEngine.ts` | 🟢 Implemented |
| **Reranker** | Recency + lexical + vector scoring | Implemented hybrid scoring in `RAGEngine`. | `packages/operone/src/rag/RAGEngine.ts` | � Implemented |

### Performance Gaps - RAG Pipeline
- **Sequential Ingest**: `ingestDocument` processes one doc at a time. Needs `batchIngest` for bulk uploads.
- **No Caching**: Embeddings are re-computed on every ingest. Needs a content-hash cache (Redis/KV).
- **Naive Retrieval**: `RAGEngine.query` fetches all results then filters in memory. Should push filters to the Vector DB.
- **Blocking Writes**: `MemoryManager.longTerm.store` writes synchronously to SQLite. Should be async/batched.

## 3. Memory System (F)

| Feature | Blueprint Requirement | Current Implementation | File Location | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Working Memory** | Per-task, ephemeral | `MemoryManager.shortTerm` (array). | `packages/operone/src/memory/MemoryManager.ts` | 🟢 Implemented |
| **Session Memory** | Per-user sliding window | Implemented `SessionMemory`. | `packages/operone/src/memory/MemoryManager.ts` | 🟢 Implemented |
| **Long-Term Memory** | Vector + Knowledge Graph | `MemoryManager.longTerm` + `EntityExtractor`. | `packages/operone/src/memory/MemoryManager.ts` | 🟢 Implemented |
| **Consolidation** | Periodic summarization | Implemented `consolidate` method. | `packages/operone/src/memory/MemoryManager.ts` | 🟢 Implemented |

### Performance Gaps - Memory System
- **Synchronous SQLite**: `better-sqlite3` is synchronous. Heavy writes will block the main thread.
- **No Compression**: Old memory entries are kept forever in full text. Needs periodic summarization/pruning.
- **Single Connection**: `MemoryManager` shares one DB connection.

## 4. Integration Points (Event Bus)

| Event | Publisher | Subscriber | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| `agent:created` | Agent Manager | UI, Logger | Notify UI of new agent | 🟢 Implemented |
| `agent:step` | Agent Runtime | UI, Memory | Stream progress & logs | 🟢 Implemented |
| `rag:ingested` | RAG Pipeline | Notification Service | Confirm doc availability | 🟢 Implemented |
| `memory:updated` | Memory System | RAG Pipeline | Trigger re-indexing | 🟢 Implemented |

## 5. API Layer (New)

| Component | Requirement | Current Implementation | File Location | Status |
| :--- | :--- | :--- | :--- | :--- |
| **API Server** | REST/RPC Endpoints | Implemented `APIServer` class. | `packages/operone/src/server.ts` | 🟢 Implemented |
| **Worker Entry** | Worker Thread Entry Point | Implemented `worker.ts`. | `packages/operone/src/worker.ts` | 🟢 Implemented |

## 6. Local Runtime Gaps

| Component | Requirement | Current State | Fix |
| :--- | :--- | :--- | :--- |
| **Vector DB** | Dedicated Service (Qdrant/Chroma) | In-memory/SQLite | `docker-compose.yml` with Qdrant | 🟢 Implemented |
| **Redis** | Event Bus / Cache | Missing | `docker-compose.yml` with Redis | 🟢 Implemented |
| **Hot Reload** | Backend Service Reload | `vitest` watch only | Add `nodemon` or `tsx watch` scripts |
| **Env Vars** | Standardized `.env` | Scattered | Create `.env.example` template |

## Key:
- 🟢 **Implemented**: Found in codebase and appears functional.
- 🟡 **Partial**: Found but lacks full feature set or robustness.
- 🔴 **Missing**: No significant code found.
