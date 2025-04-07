import string from '@adonisjs/core/helpers/string'
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

emitter.on('http:request_completed', (event) => {
  const method = event.ctx.request.method()
  const url = event.ctx.request.url(true)
  const duration = event.duration
  const responseCode = event.ctx.response.getStatus()
  const body = JSON.stringify(event.ctx.request.all())

  logger.info(`[${responseCode}] ${method} ${url}: ${string.prettyHrTime(duration)} | ${body}`)
})
