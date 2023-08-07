import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, './src/web-worker.ts'),
        fileName: 'web-worker',
        formats: ['cjs'],
      },
    },
  };
});
