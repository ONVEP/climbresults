/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const LiveController = () => import('#controllers/live_controller')
const ClimbersController = () => import('#controllers/climbers_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const TimerController = () => import('#controllers/timer_controller')
const CategoryClimbersController = () => import('#controllers/category_climbers_controller')
import Category from '#models/category'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'

transmit.registerRoutes()

router.get('/', [LiveController])
router.get('/climbers', [ClimbersController, 'index'])
router.post('/climbers', [ClimbersController, 'create'])
router.delete('/climbers/:id', [ClimbersController, 'delete'])
router.patch('/climbers/:id/category', [ClimbersController, 'setCategory'])
router.get('/categories', [CategoriesController, 'index'])
router.post('/categories', [CategoriesController, 'create'])
router.delete('/categories/:id', [CategoriesController, 'delete'])

router.patch('/catclimbers/:id/place', [CategoryClimbersController, 'setPlace'])
router.patch('/catclimbers/:id/results', [CategoryClimbersController, 'results'])

router.post('/timer/start', [TimerController, 'start'])
router.post('/timer/pause', [TimerController, 'pause'])
router.post('/timer/reset', [TimerController, 'reset'])
router.post('/timer/adjust', [TimerController, 'adjust'])

router.get('/live/results', async ({ view }) => {
  const categories = await Category.query()
    .orderBy('id', 'asc')
    .limit(2)
    .preload('climbers', (climbersQuery) => {
      climbersQuery.preload('climber').orderBy('place', 'asc')
    })
    .exec()

  return view.render('pages/results', { categories })
})
router.get('/live/timer', async ({ view }) => {
  return view.render('pages/timer')
})

router.get('/logs', async ({ view, logger }) => {
  const logFile = await readFile('tmp/logs/app.log', 'utf-8').catch((err) => {
    logger.error({ err }, 'Error while reading log file')
    return ''
  })
  const logLines = logFile
    .split('\n')
    .map((l) => {
      try {
        const line = JSON.parse(l)
        return {
          ...line,
          time: DateTime.fromMillis(line.time).toFormat('HH:mm:ss.SSS'),
        }
      } catch {
        return null
      }
    })
    .filter((l) => l !== null)

  return view.render('pages/logs', { logs: logLines })
})
