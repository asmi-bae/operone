import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    name: '@operone/fs',
    environment: 'node',
    globals: true,
  },
});
