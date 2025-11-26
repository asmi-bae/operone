# Operone System - Visual Flow Diagrams

Complete visual guide to understanding how the Operone agent system works, with detailed diagrams showing data flow, timing, and component interactions.

---

## 📊 System Architecture Overview

```mermaid
graph TB
    subgraph "User Layer"
        U[User Application]
    end
    
    subgraph "Agent Layer"
        OS[OSAgent<br/>File & Shell]
        AS[AssistantAgent<br/>RAG & Memory]
        CA[Custom Agents]
    end
    
    subgraph "Orchestration Layer"
        RE[ReasoningEngine<br/>Think-Act-Observe]
        AM[AgentManager<br/>Multi-Agent Control]
        PL[Planner<br/>Task Planning]
    end
    
    subgraph "Core Services"
        EB[EventBus<br/>Event System]
        MP[ModelProvider<br/>AI Models]
        MM[MemoryManager<br/>Storage]
    end
    
    subgraph "Storage Layer"
        VS[VectorStore<br/>Embeddings]
        DB[(SQLite<br/>Database)]
    end
    
    subgraph "External Services"
        AI1[OpenAI]
        AI2[Anthropic]
        AI3[Google AI]
    end
    
    U --> OS
    U --> AS
    U --> RE
    U --> AM
    U --> PL
    
    OS --> EB
    AS --> EB
    RE --> OS
    RE --> AS
    AM --> OS
    AM --> AS
    PL --> EB
    
    OS --> MP
    AS --> MP
    AS --> MM
    
    MM --> VS
    MM --> DB
    
    MP --> AI1
    MP --> AI2
    MP --> AI3
    
    style U fill:#e1f5ff
    style OS fill:#fff4e1
    style AS fill:#fff4e1
    style RE fill:#f0e1ff
    style AM fill:#f0e1ff
    style PL fill:#f0e1ff
    style EB fill:#e1ffe1
    style MP fill:#e1ffe1
    style MM fill:#e1ffe1
    style VS fill:#ffe1e1
    style DB fill:#ffe1e1
```

---

## 🔄 Complete Request-Response Flow

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant ReasoningEngine
    participant ModelProvider
    participant AI
    participant EventBus
    participant Memory
    
    User->>ReasoningEngine: Execute Task
    ReasoningEngine->>EventBus: Emit 'loop:start'
    
    loop Until Final Answer (Max 5 iterations)
        ReasoningEngine->>EventBus: Emit 'iteration:start'
        
        Note over ReasoningEngine,Agent: THINK Phase
        ReasoningEngine->>Agent: think(input)
        Agent->>EventBus: Emit 'step:think:start'
        Agent->>ModelProvider: getModel()
        ModelProvider->>AI: generateText(prompt)
        AI-->>ModelProvider: response
        ModelProvider-->>Agent: thought
        Agent->>EventBus: Emit 'step:think:end'
        Agent-->>ReasoningEngine: thought
        
        alt Contains "FINAL ANSWER"
            ReasoningEngine->>EventBus: Emit 'loop:complete'
            ReasoningEngine-->>User: Return Result ✓
        else Continue Loop
            Note over ReasoningEngine,Agent: ACT Phase
            ReasoningEngine->>Agent: act(thought)
            Agent->>EventBus: Emit 'step:act:start'
            Agent->>Agent: Execute Action
            Agent->>EventBus: Emit 'step:act:end'
            
            Note over ReasoningEngine,Agent: OBSERVE Phase
            ReasoningEngine->>Agent: observe()
            Agent-->>ReasoningEngine: observation
            Agent->>Memory: Store observation
        end
    end
    
    alt Max Iterations Reached
        ReasoningEngine->>EventBus: Emit 'loop:failed'
        ReasoningEngine-->>User: Return Failure ✗
    end
```

---

## 🎯 Execution Mode Comparison

```mermaid
graph LR
    subgraph "Mode 1: Direct Agent"
        D1[User Request] --> D2[Agent.think]
        D2 --> D3[Agent.act]
        D3 --> D4[Agent.observe]
        D4 --> D5[Result]
        D5 -.->|~1.6s| D1
    end
    
    subgraph "Mode 2: Reasoning Loop"
        R1[User Request] --> R2[ReasoningEngine]
        R2 --> R3{Iteration Loop}
        R3 --> R4[Think-Act-Observe]
        R4 --> R5{Final Answer?}
        R5 -->|No| R3
        R5 -->|Yes| R6[Result]
        R6 -.->|3-15s| R1
    end
    
    subgraph "Mode 3: Multi-Agent"
        M1[User Request] --> M2[AgentManager]
        M2 --> M3[Agent 1]
        M2 --> M4[Agent 2]
        M2 --> M5[Agent N]
        M3 --> M6[Orchestrate]
        M4 --> M6
        M5 --> M6
        M6 --> M7[Result]
        M7 -.->|Variable| M1
    end
    
    subgraph "Mode 4: Planned Tasks"
        P1[User Request] --> P2[Planner]
        P2 --> P3[Create Plan]
        P3 --> P4[Step 1]
        P4 --> P5[Step 2]
        P5 --> P6[Step N]
        P6 --> P7[Result]
        P7 -.->|2-10s| P1
    end
    
    style D1 fill:#e1f5ff
    style R1 fill:#e1f5ff
    style M1 fill:#e1f5ff
    style P1 fill:#e1f5ff
    style D5 fill:#e1ffe1
    style R6 fill:#e1ffe1
    style M7 fill:#e1ffe1
    style P7 fill:#e1ffe1
```

---

## 🧠 OSAgent Detailed Flow

```mermaid
stateDiagram-v2
    [*] --> Initialize
    Initialize --> Ready: Constructor Complete
    
    Ready --> Thinking: User Request
    Thinking --> AIProcessing: Call AI Model
    AIProcessing --> ThoughtGenerated: Response Received
    
    ThoughtGenerated --> ParseAction: Extract Action
    ParseAction --> FileOperation: File Command
    ParseAction --> ShellOperation: Shell Command
    
    FileOperation --> FileTool: Execute
    ShellOperation --> ShellTool: Execute
    
    FileTool --> ActionComplete: Result
    ShellTool --> ActionComplete: Result
    
    ActionComplete --> StoreResult: Save Observation
    StoreResult --> Ready: Return to User
    
    ThoughtGenerated --> Error: Invalid Action
    FileOperation --> Error: Access Denied
    ShellOperation --> Error: Command Failed
    Error --> Ready: Handle Error
    
    Ready --> [*]: Cleanup
```

---

## 💾 AssistantAgent RAG Flow

```mermaid
graph TD
    subgraph "Document Ingestion"
        I1[Document Input] --> I2[Chunker]
        I2 --> I3[Generate Chunks<br/>with Overlap]
        I3 --> I4[AI Embedding Model]
        I4 --> I5[Vector Embeddings]
        I5 --> I6[VectorStore]
        I6 --> I7[SQLite Database]
    end
    
    subgraph "Query Processing"
        Q1[User Query] --> Q2[Embed Query]
        Q2 --> Q3[Search VectorStore]
        Q3 --> Q4[Calculate Similarity]
        Q4 --> Q5[Rank Results]
        Q5 --> Q6[Top K Chunks]
    end
    
    subgraph "Answer Generation"
        A1[Query + Context] --> A2[Build Prompt]
        A2 --> A3[AI Model]
        A3 --> A4[Generated Answer]
        A4 --> A5[Store in Memory]
        A5 --> A6[Return to User]
    end
    
    I7 -.-> Q3
    Q6 --> A1
    
    style I1 fill:#e1f5ff
    style Q1 fill:#e1f5ff
    style A6 fill:#e1ffe1
```

---

## ⏱️ Timeline Visualization

```mermaid
gantt
    title Operone System Execution Timeline
    dateFormat X
    axisFormat %Lms
    
    section Initialization
    ModelProvider Init       :0, 10
    MemoryManager Init      :10, 20
    EventBus Init          :20, 10
    Agent Creation         :30, 40
    System Ready           :70, 10
    
    section Think Phase
    User Request           :100, 10
    Agent.think() Start    :110, 10
    AI Model Call          :120, 1000
    Think Complete         :1120, 10
    
    section Act Phase
    Agent.act() Start      :1130, 10
    Execute Action         :1140, 100
    Act Complete           :1240, 10
    
    section Observe Phase
    Agent.observe()        :1250, 20
    Store Result           :1270, 30
    Return to User         :1300, 10
```

---

## 🔄 Event Bus Message Flow

```mermaid
graph TB
    subgraph "Event Publishers"
        P1[OSAgent]
        P2[AssistantAgent]
        P3[ReasoningEngine]
        P4[AgentManager]
        P5[Planner]
    end
    
    subgraph "EventBus (Singleton)"
        EB[Event Queue]
        R[Event Router]
    end
    
    subgraph "Event Subscribers"
        S1[Logger]
        S2[Monitoring]
        S3[UI Updates]
        S4[Analytics]
        S5[Custom Handlers]
    end
    
    P1 -->|step:think:start| EB
    P1 -->|step:act:end| EB
    P2 -->|step:think:start| EB
    P3 -->|loop:start| EB
    P3 -->|iteration:start| EB
    P4 -->|lifecycle:created| EB
    P5 -->|create:complete| EB
    
    EB --> R
    
    R -->|Filter & Route| S1
    R -->|Filter & Route| S2
    R -->|Filter & Route| S3
    R -->|Filter & Route| S4
    R -->|Filter & Route| S5
    
    style EB fill:#ffe1e1
    style R fill:#ffe1e1
```

---

## 📋 Planner Execution Flow

```mermaid
flowchart TD
    Start([User Goal]) --> CreatePlan[Planner.createPlan]
    CreatePlan --> AIGenerate[AI: Generate Plan Steps]
    AIGenerate --> ParseJSON[Parse JSON Response]
    ParseJSON --> ValidatePlan{Valid Plan?}
    
    ValidatePlan -->|No| Error[Emit create:error]
    ValidatePlan -->|Yes| InitSteps[Initialize Steps]
    
    InitSteps --> Step1[Step 1: pending]
    Step1 --> UpdateStatus1[Update to 'running']
    UpdateStatus1 --> Execute1[Execute Step 1]
    Execute1 --> Complete1[Update to 'completed']
    
    Complete1 --> CheckDeps{Dependencies<br/>Met?}
    CheckDeps -->|No| Wait[Wait for Dependencies]
    Wait --> CheckDeps
    CheckDeps -->|Yes| Step2[Step 2: running]
    
    Step2 --> Execute2[Execute Step 2]
    Execute2 --> Complete2[Update to 'completed']
    
    Complete2 --> MoreSteps{More Steps?}
    MoreSteps -->|Yes| NextStep[Next Step]
    NextStep --> CheckDeps
    MoreSteps -->|No| Done([Plan Complete])
    
    Error --> End([Return Error])
    Done --> End
    
    style Start fill:#e1f5ff
    style Done fill:#e1ffe1
    style Error fill:#ffe1e1
```

---

## 🎭 Multi-Agent Orchestration

```mermaid
graph TB
    subgraph "AgentManager"
        AM[Agent Registry]
        AS[Agent States]
        AL[Agent Lifecycle]
    end
    
    subgraph "Agent Pool"
        A1[Agent 1<br/>Status: running<br/>CPU: 2<br/>RAM: 1GB]
        A2[Agent 2<br/>Status: paused<br/>CPU: 1<br/>RAM: 512MB]
        A3[Agent 3<br/>Status: stopped<br/>CPU: 4<br/>RAM: 2GB]
    end
    
    subgraph "Operations"
        O1[Register]
        O2[Start]
        O3[Pause]
        O4[Stop]
        O5[Query State]
    end
    
    subgraph "Events"
        E1[lifecycle:created]
        E2[lifecycle:started]
        E3[lifecycle:paused]
        E4[lifecycle:stopped]
    end
    
    AM --> A1
    AM --> A2
    AM --> A3
    
    O1 --> AM
    O2 --> AL
    O3 --> AL
    O4 --> AL
    O5 --> AS
    
    AL --> E1
    AL --> E2
    AL --> E3
    AL --> E4
    
    E1 -.-> EventBus
    E2 -.-> EventBus
    E3 -.-> EventBus
    E4 -.-> EventBus
    
    style A1 fill:#e1ffe1
    style A2 fill:#fff4e1
    style A3 fill:#ffe1e1
```

---

## 💡 Memory System Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        I1[User Input]
        I2[Agent Output]
        I3[Documents]
    end
    
    subgraph "Memory Manager"
        ST[Short-Term Memory<br/>In-Memory Array<br/>Max 100 items]
        LT[Long-Term Memory<br/>SQLite Database<br/>Persistent]
    end
    
    subgraph "RAG System"
        CH[Chunker<br/>Split Documents]
        EM[Embeddings<br/>Vector Generation]
        VS[VectorStore<br/>Similarity Search]
    end
    
    subgraph "Storage"
        DB[(SQLite DB<br/>Structured Data)]
        VC[(Vector Cache<br/>Embeddings)]
    end
    
    I1 --> ST
    I2 --> ST
    I3 --> CH
    
    ST --> LT
    LT --> DB
    
    CH --> EM
    EM --> VS
    VS --> VC
    
    VS -.Query.-> EM
    LT -.Query.-> DB
    
    style ST fill:#fff4e1
    style LT fill:#e1f5ff
    style VS fill:#f0e1ff
```

---

## 🔍 Think-Act-Observe Loop Detail

```mermaid
stateDiagram-v2
    [*] --> LoopStart: User Input
    
    state "Iteration Loop" as Loop {
        [*] --> Think
        
        Think --> ThinkStart: Emit Event
        ThinkStart --> CallAI: Generate Thought
        CallAI --> ThinkEnd: Emit Event
        ThinkEnd --> CheckFinal: Analyze Response
        
        CheckFinal --> FinalFound: Contains "FINAL ANSWER"
        CheckFinal --> Act: Continue Loop
        
        Act --> ActStart: Emit Event
        ActStart --> ExecuteAction: Perform Action
        ExecuteAction --> ActEnd: Emit Event
        
        ActEnd --> Observe
        Observe --> StoreStep: Record Step
        StoreStep --> NextIteration: Update Input
        
        NextIteration --> [*]: Iteration Complete
    }
    
    LoopStart --> Loop
    Loop --> LoopComplete: Final Answer Found
    Loop --> LoopFailed: Max Iterations
    Loop --> LoopError: Error Occurred
    
    LoopComplete --> [*]: Success ✓
    LoopFailed --> [*]: Failure ✗
    LoopError --> [*]: Error ⚠️
```

---

## 📊 Performance Metrics Dashboard

```mermaid
graph TB
    subgraph "Operation Times"
        T1[Agent.think<br/>~1.0s<br/>Range: 0.5-2.0s]
        T2[Agent.act<br/>~0.1s<br/>Range: 0.05-0.5s]
        T3[Agent.observe<br/>~0.01s<br/>Range: 0.01-0.05s]
        T4[RAG Query<br/>~1.5s<br/>Range: 1.0-3.0s]
        T5[Document Ingest<br/>~2.0s<br/>Range: 1.0-5.0s]
        T6[Reasoning Loop<br/>~4.5s<br/>Range: 3.0-10.0s]
    end
    
    subgraph "Bottlenecks"
        B1[AI Model Calls<br/>70% of time]
        B2[Embedding Generation<br/>20% of time]
        B3[Database I/O<br/>10% of time]
    end
    
    subgraph "Optimization Targets"
        O1[Cache AI Responses]
        O2[Batch Embeddings]
        O3[Connection Pooling]
    end
    
    T1 --> B1
    T4 --> B2
    T5 --> B2
    T6 --> B1
    
    B1 --> O1
    B2 --> O2
    B3 --> O3
    
    style B1 fill:#ffe1e1
    style B2 fill:#fff4e1
    style B3 fill:#fff4e1
    style O1 fill:#e1ffe1
    style O2 fill:#e1ffe1
    style O3 fill:#e1ffe1
```

---

## 🌊 Data Flow: End-to-End Example

```mermaid
flowchart LR
    subgraph "User Layer"
        U1[User: 'Analyze my code']
    end
    
    subgraph "Orchestration"
        R1[ReasoningEngine<br/>Start Loop]
    end
    
    subgraph "Agent Processing"
        A1[OSAgent<br/>Think]
        A2[AI Model<br/>Generate]
        A3[OSAgent<br/>Act]
        A4[ShellTool<br/>Execute]
        A5[OSAgent<br/>Observe]
    end
    
    subgraph "Memory & Storage"
        M1[MemoryManager<br/>Store]
        M2[VectorStore<br/>Index]
    end
    
    subgraph "Analysis"
        AN1[AssistantAgent<br/>Ingest Results]
        AN2[RAG Query<br/>Find Context]
        AN3[AI Model<br/>Summarize]
    end
    
    subgraph "Response"
        RE1[Final Answer<br/>Return to User]
    end
    
    U1 --> R1
    R1 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> M1
    M1 --> AN1
    AN1 --> M2
    M2 --> AN2
    AN2 --> AN3
    AN3 --> RE1
    RE1 --> U1
    
    style U1 fill:#e1f5ff
    style RE1 fill:#e1ffe1
```

---

## 🎨 Component Interaction Matrix

| Component | Calls → | EventBus | ModelProvider | MemoryManager | VectorStore | AI Model |
|-----------|---------|----------|---------------|---------------|-------------|----------|
| **OSAgent** | ✓ | ✓ | ✓ | ✗ | ✗ | via Provider |
| **AssistantAgent** | ✓ | ✓ | ✓ | ✓ | ✓ | via Provider |
| **ReasoningEngine** | ✓ | ✓ | ✗ | ✗ | ✗ | via Agent |
| **AgentManager** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Planner** | ✓ | ✓ | ✓ | ✗ | ✗ | via Provider |
| **RAGEngine** | ✗ | ✗ | ✗ | ✓ | ✓ | via Provider |
| **MemoryManager** | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

---

## 🚀 Quick Reference: Common Patterns

### Pattern 1: Simple Query
```
User → OSAgent.think() → AI Model → OSAgent.act() → Result
Duration: ~1.6s
```

### Pattern 2: Autonomous Task
```
User → ReasoningEngine → Loop[Think→Act→Observe] → Final Answer
Duration: ~4.5s (3 iterations)
```

### Pattern 3: Knowledge Query
```
User → AssistantAgent.ingest() → VectorStore → AssistantAgent.think() → AI + Context → Answer
Duration: ~3.5s (2s ingest + 1.5s query)
```

### Pattern 4: Multi-Step Plan
```
User → Planner.create() → AI Plan → Execute Steps → Update Status → Complete
Duration: ~2s (plan) + execution time
```

---

## 📈 Scaling Considerations

```mermaid
graph TB
    subgraph "Single Agent"
        S1[1 Request] --> S2[1 Agent] --> S3[~1.6s]
    end
    
    subgraph "Reasoning Loop"
        R1[1 Request] --> R2[1 Agent<br/>5 Iterations] --> R3[~4.5s]
    end
    
    subgraph "Multi-Agent"
        M1[1 Request] --> M2[3 Agents<br/>Parallel] --> M3[~1.8s]
    end
    
    subgraph "Batch Processing"
        B1[10 Requests] --> B2[WorkerPool<br/>5 Workers] --> B3[~3.2s]
    end
    
    style S3 fill:#e1ffe1
    style R3 fill:#fff4e1
    style M3 fill:#e1ffe1
    style B3 fill:#e1ffe1
```

---

## 🔗 Related Documentation

- **[Usage Guide](./USAGE_GUIDE.md)** - How to implement these patterns
- **[API Contract](./API_CONTRACT.md)** - Detailed API specifications
- **[Project Report](./PROJECT_REPORT.md)** - System architecture
- **[Known Issues](./KNOWN_ISSUES.md)** - Troubleshooting

---

## 💡 Understanding the Diagrams

### Color Coding
- 🔵 **Blue** - User inputs/requests
- 🟢 **Green** - Successful outputs/completions
- 🟡 **Yellow** - Processing/in-progress states
- 🔴 **Red** - Errors/failures
- 🟣 **Purple** - Orchestration components

### Timing Notation
- `T0` - Start time (0ms)
- `T0+Xms` - X milliseconds after start
- `~Xs` - Approximate duration in seconds

### Symbol Legend
- `→` - Synchronous call
- `-.->` - Asynchronous/event-driven
- `[*]` - Start/end state
- `{}` - Decision point
- `()` - Terminal state
