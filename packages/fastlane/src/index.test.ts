import { describe, it, expect } from 'vitest';
import * as exports from './index';

describe('@operone/fastlane', () => {
  it('should export modules', () => {
    expect(exports).toBeDefined();
  });
});
