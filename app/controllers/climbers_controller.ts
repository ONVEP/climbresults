import Category from '#models/category'
import CategoryClimber from '#models/category_climber'
import Climber from '#models/climber'
import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import { readFile } from 'node:fs/promises'

export default class ClimbersController {
  async index({ view }: HttpContext) {
    const climbers = await Climber.query()
      .preload('categoryClimbers', (q) => q.preload('category'))
      .exec()
    const categories = await Category.all()

    return view.render('pages/climbers', { climbers, categories })
  }

  async create({ request, response }: HttpContext) {
    const { firstName, lastName, nationality } = request.all()

    await Climber.create({
      firstName,
      lastName,
      nationality,
      flagUrl: `https://d1n1qj9geboqnb.cloudfront.net/flags/${nationality}.png`,
    })

    return response.redirect().toPath('/climbers')
  }

  async import({ request, response, logger }: HttpContext) {
    const tsvFile = request.file('tsvFile')
    if (!tsvFile?.tmpPath) {
      logger.error('No TSV file provided')
      return response.redirect().toPath('/climbers')
    }

    const tsv = await readFile(tsvFile.tmpPath, 'utf8')
    if (!tsv.trim()) {
      logger.error('TSV file is empty')
      return response.redirect().toPath('/climbers')
    }

    const lines = tsv
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)

    if (lines.length < 1) {
      logger.error('TSV file does not contain enough data')
      return response.redirect().toPath('/climbers')
    }

    const climbersToCreate = lines
      .map((line: string) => line.split('\t').map((value: string) => value.trim()))
      .map((columns: string[]) => {
        const tag = columns[0] || null
        const firstName = columns[1] || ''
        const lastName = columns[2] || ''
        const nationality = columns[3] || ''

        if (!firstName || !lastName || !nationality) return null

        return {
          firstName,
          lastName,
          nationality,
          tag,
          flagUrl: `https://d1n1qj9geboqnb.cloudfront.net/flags/${nationality}.png`,
        }
      })
      .filter((climber) => climber !== null)

    if (climbersToCreate.length > 0) {
      await Climber.createMany(climbersToCreate)
    }

    return response.redirect().toPath('/climbers')
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const { firstName, lastName, nationality } = request.all()

    const climber = await Climber.findOrFail(id)
    climber.firstName = firstName
    climber.lastName = lastName
    climber.nationality = nationality
    climber.flagUrl = `https://d1n1qj9geboqnb.cloudfront.net/flags/${nationality}.png`
    await climber.save()

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
    if (!dbCategory) return response.redirect().toPath('/climbers')

    await CategoryClimber.updateOrCreate(
      { climberId: id },
      {
        climberId: id,
        categoryId: dbCategory ? category : null,
        order: order,
        place: 0,
      }
    )

    transmit.broadcast('livegraphics', { message: 'reload' })
    console.log('transmitted')

    return response.redirect().toPath('/climbers')
  }
}
