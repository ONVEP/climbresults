import type Category from '#models/category'
import logger from '@adonisjs/core/services/logger'

class LiveProvider {
  private _currentCategories: Map<string, Category['id'] | null> = new Map()
  constructor() {}

  getCurrentCategory(slot: string) {
    return this._currentCategories.get(slot) || null
  }
  setCurrentCategory(slot: string, category: Category['id'] | null) {
    this._currentCategories.set(slot, category)
    logger.debug(
      { slot, category, currentCategories: Array.from(this._currentCategories.entries()) },
      `Current category for slot ${slot} set to ${category}`
    )
  }
  getCurrentCategories() {
    return this._currentCategories
  }
}

export const LiveStatus = new LiveProvider()
