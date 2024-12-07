import { ClimberFactory } from '#database/factories/climber_factory'
import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const women = await Category.create({
      name: 'Femmes',
    })
    const men = await Category.create({
      name: 'Hommes',
    })

    const menClimbers = await ClimberFactory.createMany(6)
    const womenClimbers = await ClimberFactory.createMany(6)

    for (let i in menClimbers) {
      await menClimbers[i].related('categoryClimber').create({
        categoryId: men.id,
        order: Number.parseInt(i) + 1,
        place: Number.parseInt(i) + 1,
        results: 0,
      })
    }

    for (let i in womenClimbers) {
      await womenClimbers[i].related('categoryClimber').create({
        categoryId: women.id,
        order: Number.parseInt(i) + 1,
        place: Number.parseInt(i) + 1,
        results: 0,
      })
    }
  }
}
