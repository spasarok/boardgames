import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@modyfi/vite-plugin-yaml'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [react(), yaml(), viteSingleFile()],
  build: {
    outDir: '../docs',
    target: 'esnext',
    assetsInlineLimit: 100_000_000,
  },
})
