import Category from '#models/category'
import { timer } from '#providers/timer'
import type { HttpContext } from '@adonisjs/core/http'

export function timeToString(time: number) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`
}

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
    })
  }
}
