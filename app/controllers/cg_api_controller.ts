import CategoryClimber from '#models/category_climber'
import { CGStatus } from '#providers/cg_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApiController {
  async setLeftClimber({ request, response, logger }: HttpContext) {
    const climberId = Number.parseInt(request.param('climberId'))
    logger.debug(`Setting left climber to ${climberId}`)
    const climber = await CategoryClimber.find(climberId)
    if (!climber) return response.noContent()
    await climber.load('climber')
    await climber.load('results')

    CGStatus.updateLayer('LEFT_CLIMBER', {
      catClimberId: climber.id,
      first_name: climber.climber.firstName,
      last_name: climber.climber.lastName,
      full_name: `${climber.climber.firstName} ${climber.climber.lastName}`,
      tag: climber.climber.tag,
      nationality: climber.climber.nationality,
      place: climber.place,
      score: climber.score,
      top_tries: climber.results.reduce((acc, result) => acc + (result.topTries ?? 0), 0),
      zone_tries: climber.results.reduce((acc, result) => acc + (result.zoneTries ?? 0), 0),
      routes: climber.results.map((result) => ({
        zone: result.zone ?? false,
        top: result.top ?? false,
        current: false,
      })),
    })
  }

  async setResults({ request, logger }: HttpContext) {
    const climbers = await CategoryClimber.query()
      .where('category_id', request.param('categoryId'))
      .orderBy('place', 'asc')
      .preload('results')
      .preload('climber')
      .exec()
    logger.debug(`Setting climbers for category ${request.param('categoryId')}`)
    const climberData = climbers.map((climber) => ({
      catClimberId: climber.id,
      nationality: climber.climber.nationality,
      first_name: climber.climber.firstName,
      last_name: climber.climber.lastName,
      full_name: `${climber.climber.firstName} ${climber.climber.lastName}`,
      tag: climber.climber.tag,
      place: climber.place,
      score: climber.score,
      top_tries: climber.results.reduce((acc, result) => acc + (result.topTries ?? 0), 0),
      zone_tries: climber.results.reduce((acc, result) => acc + (result.zoneTries ?? 0), 0),
      flag: climber.climber.flagUrl ?? '',
      routes: climber.results.map((result) => ({
        zone: result.zone ?? false,
        top: result.top ?? false,
        current: false,
      })),
    }))
    logger.debug(
      `Setting results for category ${request.param('categoryId')} with background ${JSON.stringify(request.body())}`,
      climberData
    )
    CGStatus.showLayer('RANKING', { results: climberData, background: request.body().background })
  }

  async hideResults() {
    CGStatus.hideLayer('RANKING')
  }

  async showTimer() {
    CGStatus.showLayer('TIMER')
  }
  async hideTimer() {
    CGStatus.hideLayer('TIMER')
  }
}
