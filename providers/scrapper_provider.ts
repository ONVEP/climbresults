import Category from '#models/category'
import { PollingStatus } from '#scrappers/ifsc'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

class ScrapperProvider {
  private watchList: Category[] = []
  private intervalId: NodeJS.Timeout | null = null
  private pollingStatuses: Record<Category['id'], PollingStatus> = {}

  register(category: Category) {
    if (!this.isRegistered(category.id)) {
      this.watchList.push(category)
    }
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.poll(), env.get('POLLING_INTERVAL', 1000))
    }
  }

  unregister(category: Category) {
    this.watchList = this.watchList.filter((c) => c.id !== category.id)
    if (this.watchList.length === 0 && this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  isRegistered(categoryId: Category['id']) {
    return this.watchList.some((c) => c.id === categoryId)
  }

  pollingStatus(categoryId: Category['id']): PollingStatus {
    if (!this.isRegistered(categoryId) && !this.pollingStatuses[categoryId])
      return { result: 'info', message: 'Not running' }
    if (!this.isRegistered(categoryId))
      return {
        result: this.pollingStatuses[categoryId].result,
        message: `Last status: ${this.pollingStatuses[categoryId].message}`,
      }
    return (
      this.pollingStatuses[categoryId] ?? ({ result: 'info', message: 'Unknown' } as PollingStatus)
    )
  }

  setPollingStatus(categoryId: Category['id'], status: PollingStatus) {
    this.pollingStatuses[categoryId] = status
  }

  private async poll() {
    for (const category of this.watchList) {
      logger.info(`Polling category ${category.name} (${category.id})`)
      try {
        this.pollingStatuses[category.id] = await category.scrapIFSC()
      } catch (err) {
        this.pollingStatuses[category.id] = { result: 'error', message: 'ERR_UNKWN_13' }
        logger.error({ err }, 'Error while polling category')
      }
    }
  }
}

export const scrapperProvider = new ScrapperProvider()
