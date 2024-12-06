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
import router from '@adonisjs/core/services/router'

router.get('/', [LiveController])
router.get('/climbers', [ClimbersController, 'index'])
router.post('/climbers', [ClimbersController, 'create'])
router.delete('/climbers/:id', [ClimbersController, 'delete'])
router.get('/categories', [CategoriesController, 'index'])
router.post('/categories', [CategoriesController, 'create'])
router.delete('/categories/:id', [CategoriesController, 'delete'])
