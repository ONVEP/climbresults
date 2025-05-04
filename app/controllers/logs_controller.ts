import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { readFile, writeFile } from 'node:fs/promises'

export default class LogsController {
  async index({ view, logger }: HttpContext) {
    const logFile = await readFile('tmp/logs/app.log', 'utf-8').catch((err) => {
      logger.error({ err }, 'Error while reading log file')
      return ''
    })
    const logLines = logFile
      .split('\n')
      .map((l) => {
        try {
          const line = JSON.parse(l)
          return {
            ...line,
            time: DateTime.fromMillis(line.time).toFormat('HH:mm:ss.SSS'),
          }
        } catch {
          return null
        }
      })
      .filter((l) => l !== null)

    return view.render('pages/logs', { logs: logLines })
  }

  async clear({ response }: HttpContext) {
    await writeFile('tmp/logs/app.log', '', 'utf-8')
    return response.redirect().toPath('/logs')
  }

  async content({ response }: HttpContext) {
    return response.redirect().toPath('/')
    // const logFile = await readFile('tmp/logs/app.log', 'utf-8').catch((err) => {
    //   logger.error({ err }, 'Error while reading log file')
    //   return ''
    // })
    // const logLines = logFile
    //   .split('\n')
    //   .map((l) => {
    //     try {
    //       const line = JSON.parse(l)
    //       return {
    //         ...line,
    //         time: DateTime.fromMillis(line.time).toFormat('HH:mm:ss.SSS'),
    //       }
    //     } catch {
    //       return null
    //     }
    //   })
    //   .filter((l) => l !== null)

    // return view.render('pages/logs.partial', { logs: logLines })
  }
}
