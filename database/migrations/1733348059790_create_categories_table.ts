import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('name')
      table.integer('ifsc_category_round_id').unsigned().nullable()
      table.string('bg_image_url').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
