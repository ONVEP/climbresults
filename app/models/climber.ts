import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import CategoryClimber from './category_climber.js'

export default class Climber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare nationality: string

  @column()
  declare flagUrl: string | null

  @column()
  declare tag: string | null

  @hasMany(() => CategoryClimber)
  declare categoryClimbers: HasMany<typeof CategoryClimber>

  @column()
  declare ifscId: number
}
