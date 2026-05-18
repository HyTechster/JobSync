import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the Supabase client globally so authStore's initAuth() and any other
// module-level Supabase calls never make real network requests during tests.
// Individual tests can override specific methods with vi.mocked() as needed.
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp:             vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut:            vi.fn().mockResolvedValue({ error: null }),
      updateUser:         vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn(() => ({
      select:  vi.fn().mockReturnThis(),
      eq:      vi.fn().mockReturnThis(),
      neq:     vi.fn().mockReturnThis(),
      order:   vi.fn().mockReturnThis(),
      limit:   vi.fn().mockResolvedValue({ data: [], error: null }),
      single:  vi.fn().mockResolvedValue({ data: null, error: null }),
      insert:  vi.fn().mockResolvedValue({ data: null, error: null }),
      update:  vi.fn().mockReturnThis(),
      delete:  vi.fn().mockReturnThis(),
      filter:  vi.fn().mockReturnThis(),
      in:      vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn().mockReturnValue({
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
        upload:       vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn().mockReturnValue({
      on:        vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}))
