import CategoryClimber from '#models/category_climber'
import { scrapperProvider } from '#providers/scrapper_provider'
import IFSC, { PollingStatus } from '#scrappers/ifsc'
import Spreadsheet from '#scrappers/spreadsheet'
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
  declare ifscCategoryRoundId: number | null

  @column()
  declare bgImageUrl: string | null

  @column()
  declare spreadsheetId: string | null

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

  private _spreadsheetScrapper: Spreadsheet | null = null
  get spreadsheetScrapper() {
    if (!this.spreadsheetId) return null
    if (!this._spreadsheetScrapper) this._spreadsheetScrapper = new Spreadsheet(this)
    return this._spreadsheetScrapper
  }

  async scrapSpreadsheet(): Promise<PollingStatus> {
    if (!this.spreadsheetId)
      return {
        result: 'error',
        message: 'No spreadsheet scrapper available',
      }
    if (!this.spreadsheetScrapper)
      return {
        result: 'error',
        message: 'Spreadsheet scrapper initialization failed',
      }
    return await this.spreadsheetScrapper.pollResults()
  }

  async poll(): Promise<PollingStatus> {
    if (this.ifscCategoryRoundId) return await this.scrapIFSC()
    if (this.spreadsheetId) return await this.scrapSpreadsheet()
    return {
      result: 'warning',
      message: 'No scrapper available for this category',
    }
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
