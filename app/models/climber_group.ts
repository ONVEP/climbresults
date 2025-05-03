import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Climber from './climber.js'

export default class ClimberGroup extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare group: number

  @column()
  declare routeIdx: number

  @column()
  declare climberId: number

  @belongsTo(() => Climber)
  declare climber: BelongsTo<typeof Climber>
}
