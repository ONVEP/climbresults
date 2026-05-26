import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'config_options'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('option', 150)
      table.string('value', 500)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
