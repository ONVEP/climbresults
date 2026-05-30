import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin(),
    tailwindcss(),
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css',
        'resources/css/cg.css',
        'resources/js/app.tsx',
        'resources/js/live.ts',
        'resources/js/results.js',
        'resources/js/results.ts',
        'resources/js/lateral_results.ts',
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
