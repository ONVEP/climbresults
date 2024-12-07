import { timer } from '#providers/timer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LiveController {
  async start({ response }: HttpContext) {
    timer.start()
    return response.ok({})
  }
  async pause({ response }: HttpContext) {
    timer.pause()
    return response.ok({})
  }
  async reset({ response }: HttpContext) {
    timer.stop()
    return response.ok({})
  }
  async adjust({ request, response }: HttpContext) {
    const req = request.all()
    timer.addSeconds(req.seconds)
    return response.ok({})
  }
}
