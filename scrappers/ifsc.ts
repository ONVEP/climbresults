import Category from '#models/category'
import CategoryClimber from '#models/category_climber'
import Climber from '#models/climber'
import ClimberRouteResult from '#models/climber_route_result'
import { categoryRoundResultValidator } from '#validators/ifsc'
import logger from '@adonisjs/core/services/logger'

const API_ENDPOINT = 'https://ifsc.results.info/api'

const fetchIFSC = async (url: string) => {
  logger.debug(`Fetching IFSC data from ${API_ENDPOINT + url}`)
  return fetch(API_ENDPOINT + url, {
    headers: {
      'accept': 'application/json',
      'accept-language': 'fr,fr-FR;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,nl;q=0.5,fr-BE;q=0.4',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'Referer': 'https://ifsc.results.info/event/1424/cr/9859',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: null,
    method: 'GET',
  }).then((r) => {
    if (r.ok) return r.json()
    throw new Error('Api call ended with error: ' + r.statusText)
  })
}

export const getIfscCategoryRoundResults = async (category: Category['ifscCategoryRoundId']) => {
  const response = await fetchIFSC(`/v1/category_rounds/${category}/results`)
  const data = await categoryRoundResultValidator.validate(response)
  return data
}

export type PollingStatus = { result: 'ok' | 'warning' | 'error' | 'info'; message: string }

export default class IFSC {
  pollTimer: NodeJS.Timeout | null = null
  private climberCache: Record<Climber['ifscId'], Climber> = {}

  constructor(private category: Category) {}

  async pollResults(): Promise<PollingStatus> {
    let data
    try {
      data = await getIfscCategoryRoundResults(this.category.ifscCategoryRoundId)
    } catch {
      return { result: 'error', message: 'Fetch error' }
    }
    if (!data.startlist) {
      logger.warn(`Startlist is not available for category ${this.category.ifscCategoryRoundId}`)
      return { result: 'warning', message: 'No startlist' }
    }
    for (const idx in data.startlist) {
      const climberData = data.startlist[idx]
      if (!this.climberCache[climberData.athlete_id]) {
        this.climberCache[climberData.athlete_id] = await Climber.firstOrCreate({
          ifscId: climberData.athlete_id,
        })
      }
      const climber = this.climberCache[climberData.athlete_id]
      climber.ifscId = climberData.athlete_id
      climber.firstName = climberData.firstname
      climber.lastName = climberData.lastname
      climber.nationality = climberData.country
      climber.flagUrl = climberData.flag_url
      climber.tag = climberData.bib.padStart(3, '0')
      climber.save()

      const ranking = data.ranking?.find((c) => c.athlete_id === climberData.athlete_id)
      const categoryClimber = await CategoryClimber.updateOrCreate(
        {
          climberId: climber.id,
          categoryId: this.category.id,
        },
        {
          order: ranking?.start_order ?? Number.parseInt(idx) + 1,
          place: ranking?.rank ?? Number.parseInt(idx) + 1,
          score: ranking?.score ?? null,
        }
      )

      await ClimberRouteResult.updateOrCreateMany(
        ['categoryClimberId', 'route'],
        climberData.route_start_positions.map((route) => ({
          order: route.position,
          route: route.route_name,
          categoryClimberId: categoryClimber.id,
        }))
      )
    }

    if (!data.ranking) {
      logger.warn(`Ranking is not available for category ${this.category.ifscCategoryRoundId}`)
      return { result: 'warning', message: 'No ranking' }
    }
    for (const idx in data.ranking) {
      const climberData = data.ranking[idx]
      if (!this.climberCache[climberData.athlete_id]) {
        this.climberCache[climberData.athlete_id] = await Climber.firstOrCreate({
          ifscId: climberData.athlete_id,
        })
      }
      const climber = this.climberCache[climberData.athlete_id]

      const categoryClimber = await CategoryClimber.updateOrCreate(
        {
          climberId: climber.id,
          categoryId: this.category.id,
        },
        {
          place: data.ranking.find((c) => c.athlete_id === climberData.athlete_id)?.rank ?? 0,
        }
      )

      await ClimberRouteResult.updateOrCreateMany(
        ['categoryClimberId', 'route'],
        climberData.ascents.map((route) => ({
          categoryClimberId: categoryClimber.id,
          route: route.route_name,
          top: route.top,
          topTries: route.top_tries,
          zone: route.zone,
          zoneTries: route.zone_tries,
        }))
      )
    }

    return { result: 'ok', message: 'Results updated' }
  }
}
