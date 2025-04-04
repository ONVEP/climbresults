import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'climber_route_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('route').notNullable()
      table.integer('order').notNullable()
      table.boolean('zone').nullable()
      table.integer('zone_tries').nullable()
      table.boolean('top').nullable()
      table.integer('top_tries').nullable()
      table
        .integer('category_climber_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('category_climbers')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
