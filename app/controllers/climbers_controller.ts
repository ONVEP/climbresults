import Category from '#models/category'
import CategoryClimber from '#models/category_climber'
import Climber from '#models/climber'
import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'

export default class ClimbersController {
  async index({ view }: HttpContext) {
    const climbers = await Climber.query().preload('categoryClimber').exec()
    const categories = await Category.all()

    return view.render('pages/climbers', { climbers, categories })
  }

  async create({ request, response }: HttpContext) {
    const { firstName, lastName, nationality } = request.all()

    await Climber.create({ firstName, lastName, nationality })

    return response.redirect().toPath('/climbers')
  }

  async delete({ params, response }: HttpContext) {
    const { id } = params

    const climber = await Climber.findOrFail(id)
    await climber.delete()

    return response.redirect().toPath('/climbers')
  }

  async setCategory({ params, request, response }: HttpContext) {
    const { id } = params
    const { category, order } = request.body()

    await Climber.findOrFail(id)
    const dbCategory = await Category.find(category)

    await CategoryClimber.updateOrCreate(
      { climberId: id },
      {
        climberId: id,
        categoryId: dbCategory ? category : null,
        order: order,
        place: 0,
        results: 0,
      }
    )

    transmit.broadcast('livegraphics', { message: 'reload' })
    console.log('transmitted')

    return response.redirect().toPath('/climbers')
  }
}
