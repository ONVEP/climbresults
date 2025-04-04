import Category from '#models/category'
import { scrapperProvider } from '#providers/scrapper_provider'
import { getIfscCategoryRoundResults } from '#scrappers/ifsc'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class CategoriesController {
  async index({ view }: HttpContext) {
    const categories = await Category.all()

    return view.render('pages/categories', { categories })
  }

  async create({ request, response }: HttpContext) {
    const { name, ifsc } = request.all()
    if (name === null && ifsc === null) return response.redirect().toPath('/categories')

    if (ifsc === null) await Category.create({ name })
    if (name === null)
      try {
        const data = await getIfscCategoryRoundResults(ifsc)
        const cat = await Category.create({
          name: `${data.round} ${data.category} (${data.event})`,
          ifscCategoryRoundId: ifsc,
        })
        cat.scrapIFSC()
      } catch (err) {
        logger.error({ err }, 'Error while creating category from IFSC')
      }

    return response.redirect().toPath('/categories')
  }

  async delete({ params, response }: HttpContext) {
    const { id } = params

    const category = await Category.findOrFail(id)
    await category.delete()

    return response.redirect().toPath('/categories')
  }

  async poll({ params, response }: HttpContext) {
    const { id } = params

    const category = await Category.find(id)
    if (category) {
      const status = await category.scrapIFSC()
      scrapperProvider.setPollingStatus(category.id, status)
    }
    return response.redirect().toPath('/categories')
  }

  async startAutoPoll({ params, response }: HttpContext) {
    const { id } = params

    const category = await Category.find(id)
    if (category) category.autoPolling = true

    return response.redirect().toPath('/categories')
  }

  async stopAutoPoll({ params, response }: HttpContext) {
    const { id } = params

    const category = await Category.find(id)
    if (category) category.autoPolling = false

    return response.redirect().toPath('/categories')
  }
}
