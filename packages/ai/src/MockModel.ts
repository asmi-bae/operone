import { ModelProvider, ModelOptions } from './types';

export class MockModel implements ModelProvider {
  id = 'mock-local';
  providerType = 'local' as const;
  private initialized: boolean = false;

  constructor() {}

  async load(): Promise<void> {
    this.initialized = true;
    console.log('Mock Model loaded (Simulation Mode)');
  }

  async generate(prompt: string, options?: ModelOptions): Promise<string> {
    if (!this.initialized) await this.load();
    return "This is a simulated AI response from the Mock Provider. I am working correctly!";
  }

  async *stream(prompt: string, options?: ModelOptions): AsyncIterable<string> {
    if (!this.initialized) await this.load();
    
    const response = "This is a simulated streaming response from the Mock Provider. I am working correctly!";
    const tokens = response.split(' ');
    
    for (const token of tokens) {
      yield token + ' ';
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate latency
    }
  }

  isReady(): boolean {
    return this.initialized;
  }

  isLoaded(): boolean {
    return this.initialized;
  }

  async unload(): Promise<void> {
    this.initialized = false;
    console.log('Mock Model unloaded');
  }
}
