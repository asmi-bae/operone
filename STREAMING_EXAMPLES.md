# Streaming LLM Examples

This guide shows how to use the new streaming capabilities in Operone agents.

---

## Basic Streaming Example

### OSAgent with Streaming

```typescript
import { OSAgent, StreamOptions } from '@repo/operone';
import { ModelProvider } from '@repo/operone';

const modelProvider = new ModelProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

const osAgent = new OSAgent({
  modelProvider,
  allowedPaths: ['/tmp'],
  allowedCommands: ['ls', 'cat']
});

// Define streaming callbacks
const streamOptions: StreamOptions = {
  onToken: (token: string) => {
    // Print each token as it arrives
    process.stdout.write(token);
  },
  onComplete: (fullText: string) => {
    console.log('\n\n✅ Complete response:', fullText);
  },
  onError: (error: Error) => {
    console.error('❌ Stream error:', error.message);
  }
};

// Use streaming
const thought = await osAgent.think('List files in /tmp', streamOptions);
```

---

## AssistantAgent with Streaming

```typescript
import { AssistantAgent, MemoryManager, StreamOptions } from '@repo/operone';

const memoryManager = new MemoryManager('./memory.db');
const assistant = new AssistantAgent({
  modelProvider,
  memoryManager
});

// Ingest some documents
await assistant.ingestDocument('doc1', 'Operone is an AI agent framework...');

// Stream the response
let accumulatedText = '';
const streamOptions: StreamOptions = {
  onToken: (token) => {
    accumulatedText += token;
    console.log(`Token: "${token}" | Accumulated: ${accumulatedText.length} chars`);
  },
  onComplete: (fullText) => {
    console.log('Final answer:', fullText);
  }
};

const answer = await assistant.think('What is Operone?', streamOptions);
```

---

## ReasoningEngine with Streaming

```typescript
import { ReasoningEngine, OSAgent, StreamOptions } from '@repo/operone';

const engine = new ReasoningEngine(5);
const osAgent = new OSAgent({ modelProvider, allowedPaths: ['/tmp'] });

// Stream each thought in the reasoning loop
const streamOptions: StreamOptions = {
  onToken: (token) => {
    process.stdout.write(token);
  },
  onComplete: (thought) => {
    console.log('\n--- Thought complete ---\n');
  }
};

const result = await engine.reason(
  osAgent,
  'Find all .txt files and count them',
  streamOptions
);

console.log('Final result:', result.finalAnswer);
console.log('Steps taken:', result.steps.length);
```

---

## Monitoring Stream Events

```typescript
import { EventBus } from '@repo/operone';

const eventBus = EventBus.getInstance();

// Subscribe to streaming events
eventBus.subscribe('stream', 'start', (data) => {
  console.log('🚀 Stream started:', data.prompt);
});

eventBus.subscribe('stream', 'token', (data) => {
  console.log('📝 Token:', data.token);
  console.log('📊 Accumulated:', data.accumulated.substring(0, 50) + '...');
});

eventBus.subscribe('stream', 'complete', (data) => {
  console.log('✅ Stream complete');
  console.log('📏 Total tokens:', data.tokenCount);
});

eventBus.subscribe('stream', 'error', (data) => {
  console.error('❌ Stream error:', data.error);
});

// Now use any agent with streaming
const thought = await osAgent.think('test', streamOptions);
```

---

## Advanced: Custom Token Processing

```typescript
import { StreamHandler } from '@repo/operone';

const streamHandler = new StreamHandler();

// Transform tokens (e.g., uppercase)
const result = await streamHandler.streamWithTransform(
  modelProvider.getModel(),
  'Tell me a joke',
  'You are a comedian',
  (token) => token.toUpperCase(), // Transform function
  {
    onToken: (transformedToken) => {
      console.log('Uppercase token:', transformedToken);
    }
  }
);

console.log('Result:', result); // All uppercase
```

---

## Real-time UI Updates

```typescript
// Example: Update UI in real-time
let uiElement = document.getElementById('response');

const streamOptions: StreamOptions = {
  onToken: (token) => {
    // Update UI with each token
    if (uiElement) {
      uiElement.textContent += token;
    }
  },
  onComplete: (fullText) => {
    // Mark as complete
    uiElement?.classList.add('complete');
  },
  onError: (error) => {
    // Show error in UI
    uiElement?.classList.add('error');
    uiElement!.textContent = `Error: ${error.message}`;
  }
};

await assistant.think(userQuestion, streamOptions);
```

---

## Backward Compatibility

Streaming is **completely optional**. All existing code continues to work:

```typescript
// Old way (still works)
const thought = await osAgent.think('test');

// New way (with streaming)
const thought = await osAgent.think('test', streamOptions);
```

---

## Performance Comparison

| Mode | First Token | Full Response | User Experience |
|------|-------------|---------------|-----------------|
| **Non-streaming** | N/A | 2-5s | Blocking wait |
| **Streaming** | 50-200ms | 2-5s | Real-time feedback |

**Perceived latency reduction: ~80%**

---

## Best Practices

### 1. **Use Streaming for Long Responses**
```typescript
// Good for long responses
if (expectedResponseLength > 100) {
  await agent.think(input, streamOptions);
}
```

### 2. **Debounce UI Updates**
```typescript
let buffer = '';
let updateTimer: NodeJS.Timeout;

const streamOptions: StreamOptions = {
  onToken: (token) => {
    buffer += token;
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      updateUI(buffer);
      buffer = '';
    }, 50); // Update UI every 50ms
  }
};
```

### 3. **Handle Errors Gracefully**
```typescript
const streamOptions: StreamOptions = {
  onError: async (error) => {
    console.error('Stream failed:', error);
    // Fallback to non-streaming
    const result = await agent.think(input);
    return result;
  }
};
```

### 4. **Monitor Performance**
```typescript
const startTime = Date.now();
let firstTokenTime: number;

const streamOptions: StreamOptions = {
  onToken: (token) => {
    if (!firstTokenTime) {
      firstTokenTime = Date.now();
      console.log('Time to first token:', firstTokenTime - startTime, 'ms');
    }
  },
  onComplete: () => {
    console.log('Total time:', Date.now() - startTime, 'ms');
  }
};
```

---

## Troubleshooting

### Issue: Tokens not streaming
**Solution**: Ensure you're using `streamText()` compatible models (OpenAI, Anthropic, Google AI)

### Issue: High latency
**Solution**: Check network connection and model selection

### Issue: Memory leaks
**Solution**: Always clean up event listeners:
```typescript
const unsubscribe = eventBus.subscribe('stream', 'token', handler);
// Later...
unsubscribe();
```

---

## Next Steps

- See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for more examples
- Check [SYSTEM_DIAGRAMS.md](./SYSTEM_DIAGRAMS.md) for flow diagrams
- Review [API_CONTRACT.md](./API_CONTRACT.md) for API details
