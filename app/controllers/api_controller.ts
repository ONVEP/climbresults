import { LiveStatus } from '#providers/live_provider'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ApiController {
  async clibmersByGroup({ request, response, logger }: HttpContext) {
    const group = Number(request.param('group'))
    logger.debug({ raw: request.param('group'), group })
    if (group === undefined || group === null || Number.isNaN(group)) {
      return response.status(400).json({ error: 'Group is required' })
    }

    const climbers = await db
      .query()
      .select(
        'climbers.first_name',
        'climbers.last_name',
        'climbers.id',
        'climbers.nationality',
        'climbers.tag'
      )
      .from('climber_route_results')
      .join(
        'category_climbers',
        'category_climbers.id',
        'climber_route_results.category_climber_id'
      )
      .join('climbers', 'climbers.id', 'category_climbers.climber_id')
      .where('climber_route_results.order', group)
      .if(LiveStatus.currentCategory !== null, (q) =>
        q.andWhere('category_climbers.category_id', LiveStatus.currentCategory!)
      )

    return response.json(climbers)
  }

  async getCurrentCategory({ response }: HttpContext) {
    return response.json({
      category: LiveStatus.currentCategory,
    })
  }

  async setCurrentCategory({ request, response }: HttpContext) {
    const categoryId = Number(request.body().category)
    if (!categoryId || Number.isNaN(categoryId)) {
      return response.status(400).json({ error: 'Category ID is required' })
    }

    LiveStatus.currentCategory = categoryId
    return response.json({ message: 'Current category set successfully' })
  }
}
