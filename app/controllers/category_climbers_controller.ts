import CategoryClimber from '#models/category_climber'
import ClimberRouteResult from '#models/climber_route_result'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
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
    const { id, route } = params
    const { result } = request.body()

    const routeResult = await ClimberRouteResult.findByOrFail({
      categoryClimberId: id,
      route: route,
    })
    routeResult.top = result === 'top'
    routeResult.zone = result === 'zone' || result === 'top'
    await routeResult.save()
    logger.info(`Updated results for climber ${id} on route ${route}: ${result}`)

    transmit.broadcast('livegraphics', { message: 'reload' })

    return response.redirect().toPath('/')
  }

  async delete({ params, response }: HttpContext) {
    const { id } = params

    const climber = await CategoryClimber.find(id)
    await climber?.delete()

    transmit.broadcast('livegraphics', { message: 'reload' })

    return response.redirect().toPath('/climbers')
  }
}
