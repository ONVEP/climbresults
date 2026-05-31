import Category from '#models/category'
import { scrapperProvider } from '#providers/scrapper_provider'
import { getIfscCategoryRoundResults } from '#scrappers/ifsc'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import drive from '@adonisjs/drive/services/main'

export default class CategoriesController {
  async index({ view }: HttpContext) {
    const categories = await Category.all()

    const disk = drive.use('images')
    const { objects } = await disk.listAll('', { recursive: true })
    const bgImages = [...objects].filter((object) => object.isFile).map((object) => object.name)

    return view.render('pages/categories', { categories, bgImages })
  }

  async create({ request, response }: HttpContext) {
    const { name, ifsc, bgImageUrl } = request.all()
    if (name === null && ifsc === null) {
      logger.warn('No name or IFSC category round ID provided for category creation')
      return response.redirect().toPath('/categories')
    }

    if (ifsc === null) await Category.create({ name, bgImageUrl })
    if (name === null)
      try {
        const data = await getIfscCategoryRoundResults(ifsc)
        const cat = await Category.create({
          name: `${data.round} ${data.category} (${data.event})`,
          ifscCategoryRoundId: ifsc,
          bgImageUrl,
        })
        cat.scrapIFSC()
      } catch (err) {
        logger.error({ err }, 'Error while creating category from IFSC')
      }

    return response.redirect().toPath('/categories')
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const { name, ifsc, bgImageUrl } = request.all()

    const category = await Category.findOrFail(id)
    category.name = name

    const parsedIfsc = Number(ifsc)
    category.ifscCategoryRoundId = Number.isFinite(parsedIfsc) && ifsc !== '' ? parsedIfsc : null
    category.bgImageUrl = bgImageUrl || null

    await category.save()

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
      try {
        const status = await category.scrapIFSC()
        scrapperProvider.setPollingStatus(category.id, status)
      } catch (err) {
        logger.error({ err }, 'Error while polling category')
        scrapperProvider.setPollingStatus(category.id, { result: 'error', message: 'ERR_UNKWN_10' })
      }
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
