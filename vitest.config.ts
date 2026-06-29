import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    // fileParallelism: false runs each file in its own isolated fork one at a
    // time (Vitest 4 replacement for the removed poolOptions.forks.singleFork).
    // Each fork starts fresh so memory from one file doesn't carry into the
    // next, preventing OOM accumulation in the CI runner.
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 15_000,
    // Provide placeholder Supabase env vars so supabase.ts doesn't throw at
    // import time. The actual client is mocked in test-setup.ts — no network
    // calls are ever made during tests.
    env: {
      VITE_SUPABASE_URL:      'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
