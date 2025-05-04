import CategoryClimber from '#models/category_climber'
import Climber from '#models/climber'
import logger from '@adonisjs/core/services/logger'
import { ApplicationService } from '@adonisjs/core/types'
import transmit from '@adonisjs/transmit/services/main'

export type CGLayer = {
  shown: boolean
  data: Record<string, unknown> | null
}

export type CGClimber = {
  shown: boolean
  data: {
    catClimberId: number
    nationality: Climber['nationality']
    first_name: Climber['firstName']
    last_name: Climber['lastName']
    full_name: string
    tag: Climber['tag']
    place: CategoryClimber['place']
    score: CategoryClimber['score']
    top_tries: number
    zone_tries: number
    routes: { zone: boolean; top: boolean; current: boolean }[]
  } | null
}

type CGTimer = {
  shown: boolean
  data: { t1: string; t2: string; t3: string } | null
}

export type CGLayers = {
  LEFT_CLIMBER: CGClimber
  RIGHT_CLIMBER: CGClimber
  TIMER: CGTimer
  RANKING: {
    shown: boolean
    data: {
      results: ClimberRow[]
      background: string
    } | null
  }
}

export type ClimberRow = {
  catClimberId: number
  nationality: Climber['nationality']
  first_name: Climber['firstName']
  last_name: Climber['lastName']
  full_name: string
  tag: Climber['tag']
  place: CategoryClimber['place']
  score: CategoryClimber['score']
  top_tries: number
  zone_tries: number
  flag: string
  routes: { zone: boolean; top: boolean; current: boolean }[]
}

export type CGLayerName = keyof CGLayers

class CGProvider {
  private CG_LAYERS: CGLayers

  constructor() {
    this.CG_LAYERS = {
      LEFT_CLIMBER: {
        shown: false,
        data: null,
      },
      RIGHT_CLIMBER: {
        shown: false,
        data: null,
      },
      TIMER: {
        shown: false,
        data: null,
      },
      RANKING: {
        shown: false,
        data: null,
      },
    }
  }

  showLayer<T extends CGLayerName>(layer: T, data?: CGLayers[T]['data']) {
    if (data) {
      logger.debug(`Updating layer ${layer} data: ${JSON.stringify(data)}`)
      this.updateLayerPartial(layer, data)
    }
    logger.debug(`Showing layer ${layer}: ${JSON.stringify(this.CG_LAYERS[layer])}`)
    if (this.CG_LAYERS[layer].data) this.CG_LAYERS[layer].shown = true
    this.broadcastLayer(layer)
  }

  hideLayer<T extends CGLayerName>(layer: T) {
    this.CG_LAYERS[layer].shown = false
    this.broadcastLayer(layer)
  }

  updateLayer<T extends CGLayerName>(layer: T, data: CGLayers[T]['data']) {
    this.updateLayerPartial(layer, data)
    this.broadcastLayer(layer)
  }

  private updateLayerPartial<T extends CGLayerName>(layer: T, data: CGLayers[T]['data']) {
    if (!data) {
      this.CG_LAYERS[layer].data = null
      return
    }
    const oldData = this.CG_LAYERS[layer].data ?? {}
    this.CG_LAYERS[layer].data = { ...oldData, ...data }
  }

  broadcastLayer<T extends CGLayerName>(layer: T) {
    logger.debug(`Broadcasting layer ${layer}: ${JSON.stringify(this.CG_LAYERS[layer])}`)
    transmit.broadcast(layer, this.CG_LAYERS[layer])
  }

  getLayer<T extends CGLayerName>(layer: T): CGLayers[T] {
    return this.CG_LAYERS[layer]
  }
}

export const CGStatus = new CGProvider()

export default class CGProviderService {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    transmit.on('subscribe', (channel) => {
      if (CGStatus.getLayer(channel.channel as CGLayerName) !== undefined) {
        logger.debug(`Client subscribed to channel ${channel.channel}`)
        setTimeout(() => CGStatus.broadcastLayer(channel.channel as CGLayerName), 500)
      }
    })
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
