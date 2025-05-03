import Category from '#models/category'
import { LiveStatus } from '#providers/live_provider'
import { timer } from '#providers/timer'
import type { HttpContext } from '@adonisjs/core/http'
import { timeToString } from '../utils/conversion.js'

export default class LiveController {
  async handle({ view }: HttpContext) {
    const categories = await Category.query()
      .preload('climbers', (climbersQuery) => {
        climbersQuery.preload('climber').orderBy('place', 'asc')
        climbersQuery.preload('results').orderBy('route', 'asc')
      })
      .exec()

    const data = categories.map((category) => {
      return {
        category,
        routes: category.climbers.reduce((acc, climber) => {
          const climberRoutes = climber.results
            .map((result) => result.route)
            .filter((route) => !acc.includes(route))
          return acc.concat(climberRoutes)
        }, [] as string[]),
      }
    })

    return view.render('pages/live', {
      categories: data,
      timer: timeToString(timer.time),
      currentCategory: LiveStatus.currentCategory,
    })
  }
}
