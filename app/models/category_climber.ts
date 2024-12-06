import Category from '#models/category'
import Climber from '#models/climber'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

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

  @column()
  declare results: number
}
