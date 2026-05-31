import Category from '#models/category'
import CategoryClimber from '#models/category_climber'
import { type CGLayers, CGStatus } from '#providers/cg_provider'
import { LiveStatus } from '#providers/live_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApiController {
  async setLeftClimber({ request, response, logger }: HttpContext) {
    const climberId = Number.parseInt(request.param('climberId'))
    logger.debug(`Setting left climber to ${climberId}`)
    const climber = await CategoryClimber.find(climberId)
    if (!climber) return response.noContent()
    await climber.load('climber')
    await climber.load('results')

    CGStatus.showLayer('LEFT_CLIMBER', {
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
  async hideLeftClimber() {
    CGStatus.hideLayer('LEFT_CLIMBER')
  }

  async setRightClimber({ request, response, logger }: HttpContext) {
    const climberId = Number.parseInt(request.param('climberId'))
    logger.debug(`Setting right climber to ${climberId}`)
    const climber = await CategoryClimber.find(climberId)
    if (!climber) return response.noContent()
    await climber.load('climber')
    await climber.load('results')

    CGStatus.showLayer('RIGHT_CLIMBER', {
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
  async hideRightClimber() {
    CGStatus.hideLayer('RIGHT_CLIMBER')
  }

  async setResults({ request, logger }: HttpContext) {
    const category = await Category.find(request.param('categoryId'))
    if (!category) {
      logger.warn(`Category ${request.param('categoryId')} not found`)
      return
    }
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
    logger.debug({ climberData }, `Setting results for category ${request.param('categoryId')}`)
    CGStatus.showLayer('RANKING', { results: climberData, background: category.bgImageUrl })
  }

  async hideResults() {
    CGStatus.hideLayer('RANKING')
  }

  async setLateral({ request, logger }: HttpContext) {
    const categories = [...LiveStatus.getCurrentCategories().entries()]
    const results: CGLayers['LATERAL_RANKING']['data'] = []
    for (const [, categoryId] of categories.sort((a, b) => a[0].localeCompare(b[0]))) {
      const category = await Category.find(categoryId)
      if (!category || !categoryId) {
        logger.warn(`Category ${categoryId} not found`)
        return
      }
      const climbers = await CategoryClimber.query()
        .where('category_id', categoryId)
        .orderBy('place', 'asc')
        .preload('results')
        .preload('climber')
        .exec()
      logger.debug(`Setting climbers for category ${categoryId}`)
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
      results.push({ results: climberData, background: category.bgImageUrl ?? '' })
    }
    logger.debug(`Setting results for category ${request.param('categoryId')}`)
    CGStatus.showLayer('LATERAL_RANKING', results)
  }

  async hideLateral() {
    CGStatus.hideLayer('LATERAL_RANKING')
  }

  async showTimer() {
    CGStatus.showLayer('TIMER')
  }
  async hideTimer() {
    CGStatus.hideLayer('TIMER')
  }
}
