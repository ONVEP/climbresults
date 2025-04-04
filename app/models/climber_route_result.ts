import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import CategoryClimber from './category_climber.js'

export default class ClimberRouteResult extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare route: string

  @column()
  declare order: number

  @column()
  declare zone: boolean | null

  @column()
  declare zoneTries: number | null

  @column()
  declare top: boolean | null

  @column()
  declare topTries: number | null

  @column()
  declare categoryClimberId: number

  @belongsTo(() => CategoryClimber)
  declare categoryClimber: BelongsTo<typeof CategoryClimber>

  get progression() {
    if (this.top) return 'top'
    if (this.zone) return 'zone'
    return 'bottom'
  }
}
