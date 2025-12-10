import { describe, it, expect } from 'vitest';
import * as exports from './index';

describe('@operone/core', () => {
  it('should export modules', () => {
    expect(exports).toBeDefined();
  });
});
