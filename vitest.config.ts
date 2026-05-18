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
    // Provide placeholder Supabase env vars so supabase.ts doesn't throw at
    // import time. The actual client is mocked in test-setup.ts — no network
    // calls are ever made during tests.
    env: {
      VITE_SUPABASE_URL:      'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
