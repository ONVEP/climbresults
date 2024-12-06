import Climber from '#models/climber'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClimbersController {
  async index({ view }: HttpContext) {
    const climbers = await Climber.all()

    return view.render('pages/climbers', { climbers })
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
}
