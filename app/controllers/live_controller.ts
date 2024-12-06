import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class LiveController {
  async handle({ view }: HttpContext) {
    const categories = await Category.query()
      .preload('climbers', (climbersQuery) => {
        climbersQuery.preload('climber')
      })
      .exec()

    return view.render('pages/live', { categories })
  }
}
