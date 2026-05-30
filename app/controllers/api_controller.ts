import { LiveStatus } from '#providers/live_provider'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ApiController {
  async clibmersByGroup({ request, response, logger }: HttpContext) {
    const group = Number(request.param('group'))
    const slot = Number(request.param('slot'))
    logger.debug(
      { raw: request.param('group'), group },
      `Request group ${group} (${request.param('group')})`
    )
    if (group === undefined || group === null || Number.isNaN(group)) {
      return response.status(400).json({ error: 'Group is required' })
    }
    if (slot === undefined || slot === null || Number.isNaN(slot)) {
      return response.status(400).json({ error: 'Slot is required' })
    }

    const climbers = await db
      .query()
      .select(
        'climbers.first_name',
        'climbers.last_name',
        'climbers.id',
        'climbers.nationality',
        'climbers.tag',
        'category_climbers.id as category_climber_id'
      )
      .from('climber_route_results')
      .join(
        'category_climbers',
        'category_climbers.id',
        'climber_route_results.category_climber_id'
      )
      .join('climbers', 'climbers.id', 'category_climbers.climber_id')
      .where('climber_route_results.order', group)
      .if(LiveStatus.getCurrentCategory(slot) !== null, (q) =>
        q.andWhere('category_climbers.category_id', LiveStatus.getCurrentCategory(slot)!)
      )

    return response.json(climbers)
  }

  async getCurrentCategory({ request, response }: HttpContext) {
    const slot = request.param('slot')
    return response.json({
      category: LiveStatus.getCurrentCategory(slot),
    })
  }

  async setCurrentCategory({ request, response }: HttpContext) {
    const categoryId = Number(request.body().category)
    if (!categoryId || Number.isNaN(categoryId)) {
      return response.status(400).json({ error: 'Category ID is required' })
    }

    LiveStatus.setCurrentCategory(request.param('slot'), categoryId)
    return response.json({ message: 'Current category set successfully' })
  }
}
