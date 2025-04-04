import Category from '#models/category'
import Climber from '#models/climber'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ClimberRouteResult from './climber_route_result.js'

export default class CategoryClimber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare categoryId: number

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @column()
  declare climberId: number

  @belongsTo(() => Climber)
  declare climber: BelongsTo<typeof Climber>

  @column()
  declare order: number

  @column()
  declare place: number

  @hasMany(() => ClimberRouteResult)
  declare results: HasMany<typeof ClimberRouteResult>
}
