import CategoryClimber from '#models/category_climber'
import { scrapperProvider } from '#providers/scrapper_provider'
import IFSC, { PollingStatus } from '#scrappers/ifsc'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @hasMany(() => CategoryClimber)
  declare climbers: HasMany<typeof CategoryClimber>

  @column()
  declare ifscCategoryRoundId: number

  private _ifscScrapper: IFSC | null = null
  get ifscScrapper() {
    if (!this.ifscCategoryRoundId) return null
    if (!this._ifscScrapper) this._ifscScrapper = new IFSC(this)
    return this._ifscScrapper
  }

  async scrapIFSC(): Promise<PollingStatus> {
    if (!this.ifscScrapper)
      return {
        result: 'error',
        message: 'No IFSC scrapper available',
      }
    return await this.ifscScrapper.pollResults()
  }

  set autoPolling(value: boolean) {
    if (value) scrapperProvider.register(this)
    else scrapperProvider.unregister(this)
  }

  get autoPolling() {
    return scrapperProvider.isRegistered(this.id)
  }

  get pollingStatus() {
    return scrapperProvider.pollingStatus(this.id)
  }
}
