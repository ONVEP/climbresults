import { Config } from '#providers/config_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class ConfigController {
  async index({ view }: HttpContext) {
    return view.render('pages/configuration')
  }

  async getConfig({}: HttpContext) {
    return Config.getDescriptions()
  }

  async updateConfig({ request }: HttpContext) {
    const changes = request.body() as Record<string, any>
    const currentConfig = Config.getConfig()

    for (const key in changes) {
      if (key in currentConfig) {
        const newValue = changes[key]
        if (newValue === null) await Config.reset(key as keyof typeof currentConfig)
        else await Config.set(key as keyof typeof currentConfig, newValue)
      }
    }
    return Config.getDescriptions()
  }
}
