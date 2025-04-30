import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'category_climbers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('categories.id')
        .onDelete('CASCADE')
      table
        .integer('climber_id')
        .unsigned()
        .notNullable()
        .references('climbers.id')
        .onDelete('CASCADE')
      table.integer('order')
      table.string('route')
      table.integer('place')
      table.integer('results')
      table.string('score')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
