# Operone API Contracts (High Performance & Integration)

This document defines the interfaces and data contracts for the Operone system, optimized for high throughput, low latency, and event-driven integration.

## 1. Agent System API

### 1.1 Agent Manager (RPC/HTTP)

**Create Agent**
\`POST /agents\`
```json
{
  "request": {
    "goal": "Summarize sales data",
    "capabilities": ["fs", "db", "ai"],
    "max_steps": 50,
    "resources": { "cpu": "1", "ram": "512MB" }
  },
  "response": {
    "agent_id": "uuid",
    "status": "created"
  }
}
```

**Start Agent (Streaming)**
\`POST /agents/{agent_id}/start?stream=true\`
*Response Type: text/event-stream*
```
event: step_start
data: {"step_id": 1, "action": "think"}

event: token
data: {"content": "I", "step_id": 1}

event: token
data: {"content": " need", "step_id": 1}

event: step_end
data: {"step_id": 1, "status": "ok", "output": "I need to read the file."}
```

**Batch Create Agents**
\`POST /agents/batch\`
```json
{
  "request": {
    "agents": [
      { "goal": "Task A" },
      { "goal": "Task B" }
    ]
  },
  "response": {
    "agent_ids": ["uuid-1", "uuid-2"]
  }
}
```

### 1.2 Worker API (Internal)

**Spawn Worker**
\`POST /internal/workers\`
```json
{
  "request": {
    "type": "agent_runtime",
    "payload": { "agent_id": "uuid" }
  },
  "response": { "worker_pid": 12345 }
}
```

### 1.3 Tool Interface

**Invoke Tool**
```json
{
  "tool": "file.read",
  "inputs": { "path": "/path/to/file.txt" },
  "agent_id": "uuid",
  "step_id": "step-1"
}
```

## 2. RAG Pipeline API

### 2.1 Ingest

**Batch Ingest (High Throughput)**
\`POST /rag/ingest/batch\`
```json
{
  "request": {
    "documents": [
      { "source": "file:///doc1.pdf", "metadata": { "priority": "high" } },
      { "source": "file:///doc2.pdf", "metadata": { "priority": "low" } }
    ],
    "options": { "chunk_size": 512, "overlap": 50 }
  },
  "response": {
    "job_id": "job-123",
    "status": "processing",
    "count": 2
  }
}
```

### 2.2 Retrieve

**Query**
\`POST /rag/query\`
```json
{
  "request": {
    "query": "What were the Q3 sales?",
    "top_k": 5,
    "filters": { "date_range": ["2023-01-01", "2023-12-31"] }
  },
  "response": {
    "results": [
      {
        "content": "Q3 sales were $1M...",
        "score": 0.95,
        "source": { "doc_id": "uuid", "chunk_id": "c1" }
      }
    ],
    "latency_ms": 45
  }
}
```

## 3. Memory System API

### 3.1 Operations

**Batch Write Memory**
\`POST /memory/batch\`
```json
{
  "request": {
    "scope": "longterm",
    "entries": [
      { "content": "Fact A", "tags": ["t1"] },
      { "content": "Fact B", "tags": ["t2"] }
    ]
  },
  "response": { "ids": ["mem-1", "mem-2"] }
}
```

**Read Memory**
\`GET /memory\`
Headers: `Cache-Control: max-age=60`
```json
{
  "request": {
    "query": "preferences",
    "scope": "session"
  },
  "response": {
    "entries": [
      { "id": "mem-1", "content": "User prefers dark mode", "score": 0.8 }
    ]
  }
}
```

## 4. System Events (Integration)

The system uses a Pub/Sub model (Redis/EventBus) for loose coupling.

**Topic: `agent.lifecycle`**
```json
{
  "event": "agent.started",
  "payload": { "agent_id": "uuid", "timestamp": 123456789 }
}
```

**Topic: `agent.trace`**
```json
{
  "event": "step.complete",
  "payload": { "agent_id": "uuid", "step_id": 1, "duration_ms": 150 }
}
```

**Topic: `rag.events`**
```json
{
  "event": "ingest.complete",
  "payload": { "job_id": "job-123", "docs_indexed": 50 }
}
```

## 5. Local Configuration Standards

To ensure "good run locally", all services must adhere to these defaults:

| Service | Port | URL | Env Var |
| :--- | :--- | :--- | :--- |
| **API Gateway** | 3000 | `http://localhost:3000` | `API_URL` |
| **Vector DB** | 6333 | `http://localhost:6333` | `QDRANT_URL` |
| **Redis** | 6379 | `redis://localhost:6379` | `REDIS_URL` |
| **Postgres** | 5432 | `postgresql://user:pass@localhost:5432/db` | `DATABASE_URL` |

## 6. Performance Guidelines

1.  **Streaming**: All LLM generation endpoints MUST support Server-Sent Events (SSE) to reduce Time-To-First-Token (TTFT).
2.  **Batching**: Any operation that can be done in bulk (ingest, memory write) MUST have a batch endpoint.
3.  **Caching**:
    *   Embeddings: Cache by content hash (SHA-256).
    *   Retrieval: Cache frequent queries (LRU).
4.  **Compression**: Use gzip/brotli for all HTTP responses > 1KB.
5.  **Async Workers**: Heavy tasks (ingest, long-running agents) MUST run in background workers, not the API thread.
