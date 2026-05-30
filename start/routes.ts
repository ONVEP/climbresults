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
const LogsController = () => import('#controllers/logs_controller')
const ApiController = () => import('#controllers/api_controller')
const CGController = () => import('#controllers/cg_controller')
const CgApiController = () => import('#controllers/cg_api_controller')
import { controllers } from '#generated/controllers'
import Category from '#models/category'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import { middleware } from './kernel.ts'

transmit.registerRoutes()

router
  .group(() => {
    router.get('/', async ({ view }) => {
      return view.render('pages/home')
    })
    router.get('/live', [LiveController])
    router.get('/climbers', [ClimbersController, 'index'])
    router.post('/climbers', [ClimbersController, 'create'])
    router.delete('/climbers/:id', [ClimbersController, 'delete'])
    router.patch('/climbers/:id/category', [ClimbersController, 'setCategory'])
    router.get('/categories', [CategoriesController, 'index'])
    router.post('/categories', [CategoriesController, 'create'])
    router.delete('/categories/:id', [CategoriesController, 'delete'])
    router.post('/categories/:id/poll', [CategoriesController, 'poll'])
    router.post('/categories/:id/auto_poll_start', [CategoriesController, 'startAutoPoll'])
    router.post('/categories/:id/auto_poll_stop', [CategoriesController, 'stopAutoPoll'])

    router.patch('/catclimbers/:id/place', [CategoryClimbersController, 'setPlace'])
    router.patch('/catclimbers/:id/results/:route', [CategoryClimbersController, 'results'])
    router.delete('/catclimbers/:id', [CategoryClimbersController, 'delete'])

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

    router.get('/images', [controllers.Images, 'index'])
    router.post('/images', [controllers.Images, 'upload'])

    router.get('/configuration', [controllers.Config, 'index'])
  })
  .use(middleware.applinks())

router.get('/logs', [LogsController, 'index'])
router.post('/logs/clear', [LogsController, 'clear'])
router.get('/logs/content', [LogsController, 'content'])

router.get('/api/current-category', [ApiController, 'getCurrentCategory'])
router.post('/api/current-category', [ApiController, 'setCurrentCategory'])
router.get('/api/group/:group', [ApiController, 'clibmersByGroup'])

router.post('/api/cg/timer/show', [CgApiController, 'showTimer'])
router.post('/api/cg/timer/hide', [CgApiController, 'hideTimer'])
router.post('/api/cg/leftclimber/hide', [CgApiController, 'hideLeftClimber'])
router.post('/api/cg/leftclimber/:climberId', [CgApiController, 'setLeftClimber'])
router.post('/api/cg/rightclimber/hide', [CgApiController, 'hideRightClimber'])
router.post('/api/cg/rightclimber/:climberId', [CgApiController, 'setRightClimber'])
router.post('/api/cg/results/hide', [CgApiController, 'hideResults'])
router.post('/api/cg/results/:categoryId', [CgApiController, 'setResults'])
router.post('/api/cg/lateral/hide', [CgApiController, 'hideLateral'])
router.post('/api/cg/lateral/:categoryId', [CgApiController, 'setLateral'])

router.get('/api/config', [controllers.Config, 'getConfig'])
router.post('/api/config', [controllers.Config, 'updateConfig'])

router.get('/cg/:route', async ({ view, response, params }) => {
  try {
    return await view.render('pages/cg/' + params.route)
  } catch (error) {
    return response.status(404).send('Page not found')
  }
})
router.post('/api/cg/data', [CGController, 'data'])
