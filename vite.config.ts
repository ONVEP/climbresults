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
        'resources/js/results.ts',
        'resources/js/lateral_results.ts',
        'resources/js/timer.js',
        'resources/js/cg.ts',
        'resources/images/ECB25_BG_MEN_F.png',
        'resources/images/ECB25_BG_WOMEN_F.png',
        'resources/images/ECB25_BG_MEN_SF.png',
        'resources/images/ECB25_BG_WOMEN_SF.png',
        'resources/images/ECB25_BG_MEN_Q.png',
        'resources/images/ECB25_BG_WOMEN_Q.png',
        
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})
