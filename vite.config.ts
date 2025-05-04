import adonisjs from '@adonisjs/vite/client'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css',
        'resources/css/cg.css',
        'resources/js/app.js',
        'resources/js/live.ts',
        'resources/js/results.js',
        'resources/js/timer.js',
        'resources/js/cg.ts',
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})
