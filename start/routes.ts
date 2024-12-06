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
