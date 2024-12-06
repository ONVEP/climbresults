import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async index({ view }: HttpContext) {
    const categories = await Category.all()

    return view.render('pages/categories', { categories })
  }

  async create({ request, response }: HttpContext) {
    const { name } = request.all()

    await Category.create({ name })

    return response.redirect().toPath('/categories')
  }

  async delete({ params, response }: HttpContext) {
    const { id } = params

    const category = await Category.findOrFail(id)
    await category.delete()

    return response.redirect().toPath('/categories')
  }
}
