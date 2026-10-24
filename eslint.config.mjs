import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  globalIgnores([
    // Every build folder: .next, .next.nosync, .next-e2e.nosync, .next-phone.nosync…
    '.next*/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
