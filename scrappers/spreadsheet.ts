import type Category from '#models/category'
import CategoryClimber from '#models/category_climber'
import Climber from '#models/climber'
import ClimberRouteResult from '#models/climber_route_result'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { google } from 'googleapis'

export type PollingStatus = { result: 'ok' | 'warning' | 'error' | 'info'; message: string }

export default class Spreadsheet {
  pollTimer: NodeJS.Timeout | null = null
  private climberCache: Map<Climber['tag'] & string, Climber> = new Map()
  private sheets: ReturnType<typeof google.sheets>

  constructor(private category: Category) {
    const credentials = JSON.parse(env.get('GOOGLE_API_KEY') || '{}')

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    this.sheets = google.sheets({ version: 'v4', auth })
  }

  async pollResults(): Promise<PollingStatus> {
    try {
      const warnings = []
      const spreadsheetId = this.category.spreadsheetId
      if (!spreadsheetId) {
        return {
          result: 'error',
          message: 'No spreadsheet ID',
        }
      }
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Results!A1',
      })
      const categoryName = res.data.values?.[0]?.[0]
      if (!categoryName) {
        warnings.push('Spreadsheet is accessible but A1 value is empty')
      } else if (categoryName !== this.category.name) {
        this.category.name = categoryName
        await this.category.save()
      }
      let data
      try {
        data = await this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Results!A4:AP14',
        })
      } catch {
        return { result: 'error', message: 'Fetch error' }
      }
      const climberData: {
        order: number
        tag: string
        attempts: { zone: number; top: number }[]
        score: number
        place: number
      }[] = []
      for (const idx in data.data.values ?? []) {
        const row = data.data.values?.[idx]
        if (!row) {
          warnings.push(`Row ${Number.parseInt(idx) + 4} is empty, skipping`)
          continue
        }
        const bib = row[0]?.toString().trim().padStart(3, '0')
        if (!bib) {
          warnings.push('A row has an empty bib value, skipping')
          continue
        }
        const attempts: { zone: number; top: number }[] = []
        for (let i = 23; i < 31; i += 2) {
          const top = Number.parseInt(row[i]?.toString() || '0')
          const zone = Number.parseInt(row[i + 1]?.toString() || '0')
          if (Number.isFinite(zone) && Number.isFinite(top)) {
            attempts.push({ zone, top })
          }
        }
        const score = Number.parseFloat(row[38]?.toString().replace(',', '.') || '0')
        const place = Number.parseInt(row[39]?.toString().replace(',', '.') || '0')
        if (!Number.isFinite(score) || !Number.isFinite(place)) {
          warnings.push(`Climber with bib ${bib} has invalid score or place value, skipping`)
          continue
        }
        if (place < 1) continue
        climberData.push({ order: Number.parseInt(idx) + 1, tag: bib, attempts, score, place })
      }

      for (const { order, tag, attempts, score, place } of climberData) {
        if (!this.climberCache.has(tag)) {
          this.climberCache.set(
            tag,
            await Climber.firstOrCreate({
              tag: tag,
            })
          )
        }
        const climber = this.climberCache.get(tag)!
        const categoryClimber = await CategoryClimber.updateOrCreate(
          {
            climberId: climber.id,
            categoryId: this.category.id,
          },
          {
            order,
            place,
            score: score.toString(),
          }
        )

        await ClimberRouteResult.updateOrCreateMany(
          ['categoryClimberId', 'route'],
          attempts.map((route, idx) => ({
            order: 1,
            top: route.top > 0,
            zone: route.zone > 0,
            topTries: route.top,
            zoneTries: route.zone,
            route: (idx + 1).toString(),
            categoryClimberId: categoryClimber.id,
          }))
        )
      }

      if (warnings.length > 0) {
        return { result: 'warning', message: warnings.join('; ') }
      }
      return { result: 'ok', message: 'Results updated' }
    } catch (err) {
      logger.error({ err }, 'Error while polling spreadsheet')
      return { result: 'error', message: 'ERR_UNKWN_11' }
    }
  }
}
