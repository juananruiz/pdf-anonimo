import { defineConfig } from 'vitest/config'
import { createCanvas } from 'canvas'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    deps: {
      inline: ['canvas'],
    },
  },
})
