import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  root: 'src',
  server: {
    port: 1421,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@domain': resolve(__dirname, './src/core/domain'),
      '@services': resolve(__dirname, './src/core/services'),
      '@infrastructure': resolve(__dirname, './src/core/infrastructure'),
      '@components': resolve(__dirname, './src/components'),
      '@composables': resolve(__dirname, './src/composables'),
    },
  },
});
