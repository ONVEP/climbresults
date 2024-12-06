import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
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

  @hasOne(() => CategoryClimber)
  declare categoryClimber: HasOne<typeof CategoryClimber>
}
