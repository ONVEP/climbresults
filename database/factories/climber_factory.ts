import Climber from '#models/climber'
import factory from '@adonisjs/lucid/factories'

export const ClimberFactory = factory
  .define(Climber, async ({ faker }) => {
    return {}
  })
  .build()
