import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@modyfi/vite-plugin-yaml'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react(), yaml(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100_000_000,
  },
  // Allow the dev server to serve files from the parent boardgames/ directory
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
