import { CGLayerName, CGStatus } from '#providers/cg_provider'
import { cgDataCollectionValidator } from '#validators/cg_data'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class CGController {
  async data({ request, response }: HttpContext) {
    const [err, data] = await cgDataCollectionValidator.tryValidate(request.body())
    if (err) return response.status(err.status).json(err)

    for (const [layer, layerData] of Object.entries(data)) {
      if (layerData.data) {
        logger.debug(`Updating layer ${layer} with data: ${JSON.stringify(layerData)}`)
        CGStatus.updateLayer(layer as CGLayerName, layerData.data as any)
      }
      if (layerData.shown) {
        logger.debug(`Showing layer ${layer}`)
        CGStatus.showLayer(layer as CGLayerName)
      } else {
        logger.debug(`Hiding layer ${layer}`)
        CGStatus.hideLayer(layer as CGLayerName)
      }
    }

    return response.noContent()
  }
}
