import Category from '#models/category'

class LiveProvider {
  private _currentCategory: Category['id'] | null = null
  constructor() {}

  get currentCategory() {
    return this._currentCategory
  }
  set currentCategory(category: Category['id'] | null) {
    this._currentCategory = category
  }
}

export const LiveStatus = new LiveProvider()
