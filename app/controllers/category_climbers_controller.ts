import CategoryClimber from '#models/category_climber'
import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'

export default class CategoryClimbersController {
  async setPlace({ params, request, response }: HttpContext) {
    const { id } = params
    const { direction } = request.body()

    const climber = await CategoryClimber.findOrFail(id)
    const oldplace = climber.place
    if (direction === 'up') {
      climber.place -= 1
    }
    if (direction === 'down') {
      climber.place += 1
    }

    const oldClimbers = await CategoryClimber.query()
      .where('category_id', climber.categoryId)
      .andWhere('place', climber.place)
      .exec()

    for (const oldClimber of oldClimbers) {
      oldClimber.place = oldplace
      await oldClimber.save()
    }

    await climber.save()

    transmit.broadcast('livegraphics', { message: 'reload' })

    return response.redirect().toPath('/')
  }

  async results({ params, request, response }: HttpContext) {
    const { id } = params
    const { results } = request.body()

    const climber = await CategoryClimber.findOrFail(id)
    climber.results = results
    await climber.save()

    transmit.broadcast('livegraphics', { message: 'reload' })

    return response.redirect().toPath('/')
  }
}
