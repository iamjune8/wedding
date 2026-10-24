import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fromRoot('./'),
      // `server-only` throws outside React Server Components; tests run in plain Node.
      'server-only': fromRoot('./test/server-only-stub.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.test.ts', 'components/**/*.test.tsx', 'app/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'components/**/*.tsx', 'app/calendar/**/*.ts'],
      exclude: ['**/*.test.*', 'components/ornaments/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
