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
import Category from '#models/category'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'

transmit.registerRoutes()

router.get('/', [LiveController])
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

router.get('/logs', [LogsController, 'index'])
router.post('/logs/clear', [LogsController, 'clear'])
router.get('/logs/content', [LogsController, 'content'])

router.get('/api/current-category', [ApiController, 'getCurrentCategory'])
router.post('/api/current-category', [ApiController, 'setCurrentCategory'])
router.get('/api/group/:group', [ApiController, 'clibmersByGroup'])
