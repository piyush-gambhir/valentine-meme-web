import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Cast: vitest 2 bundles vite@5 types, but the workspace also resolves vite@6.
  // The plugin object is structurally compatible at runtime.
  plugins: [react() as unknown as never],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
