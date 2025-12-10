import { defineConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.mts';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test, include: ['**/*.test.ts'],
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    name: '@operone/context',
    environment: 'node',
  },
});
