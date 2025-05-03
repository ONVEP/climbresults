import Climber from '#models/climber'
import ClimberGroup from '#models/climber_group'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ClimberGroupsController {
  async clear() {
    ClimberGroup.query().delete()
  }

  async index({ request }: HttpContext) {
    const minMax = await db
      .query()
      .select('MIN(route_idx) as min', 'MAX(route_idx) as max')
      .from('climber_groups')
      .first()
    const min = minMax?.min ?? 0
    const max = minMax?.max ?? 0

    const groups = await ClimberGroup.query().orderBy('group', 'asc')

    const climbers = await Climber.query().join(
      'climber_groups',
      'climber_groups.id',
      'climbers.id'
    )
    return {
      groups: groups.map((group) => {
        return {
          id: group.id,
          order: group.order,
          climber1: group.climber1.id,
          climber2: group.climber2.id,
          climber3: group.climber3.id,
          climber4: group.climber4.id,
        }
      }),
      climbers: climbers.map((climber) => {
        return {
          id: climber.id,
          name: climber.firstName + ' ' + climber.lastName + ' ' + climber.tag,
        }
      }),
    }
  }

  async create({ request }: HttpContext) {
    const data = request.body()
    const group = await ClimberGroup.create({
      order: data.order,
      climber1Id: data.climber1Id,
      climber2Id: data.climber2Id,
      climber3Id: data.climber3Id,
      climber4Id: data.climber4Id,
    })
    return group
  }

  async delete({ request }: HttpContext) {
    const data = request.body()
    await ClimberGroup.query().where('id', data.id).delete()
  }
}
