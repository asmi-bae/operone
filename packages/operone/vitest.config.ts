import { defineConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    name: '@repo/operone',
    environment: 'node',
    testTimeout: 15000, // Longer timeout for AI operations
  },
});
