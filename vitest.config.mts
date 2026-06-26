import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Load .env.local so NEXT_PUBLIC_* vars are available in tests, but always
    // pin mock mode so the suite is deterministic and never hits real Supabase –
    // regardless of the developer's local NEXT_PUBLIC_IS_MOCK toggle.
    env: { ...loadEnv(mode, process.cwd(), ''), NEXT_PUBLIC_IS_MOCK: 'true' },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
