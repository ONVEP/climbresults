import type { DeepReadonly } from '#common/utility_types'
import ConfigOption from '#models/config_option'
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'
import type { ApplicationService } from '@adonisjs/core/types'

export type ConfigValue<T extends string | boolean | number = string | boolean | number> = {
  defaultValue: T
  value: T
  isModified: boolean
  isSecret?: boolean
}

export type ConfigOptions = {
  ROUTES_COUNT: ConfigValue<number>
  TIMER_DURATION: ConfigValue<number>
  TIMER_PAUSE_DURATION: ConfigValue<number>
  TIMER_LOOP: ConfigValue<boolean>
  POLLING_INTERVAL: ConfigValue<number>
}
export type ConfigOptionDescription = {
  category: string
  name: string
  description: string
}

export type ConfigDescriptions = Record<keyof ConfigOptions, ConfigOptionDescription>

export type ConfigSection = {
  category: string
  options: Array<{
    key: keyof ConfigOptions
    description: ConfigOptionDescription
  }>
}

export type ConfigData = {
  config: ConfigOptions
  sections: ConfigSection[]
}

export const CONFIG_DESCRIPTIONS: Record<keyof ConfigOptions, ConfigOptionDescription> = {
  ROUTES_COUNT: {
    category: 'Voies',
    name: 'Nombre de voies par catégorie',
    description: 'Nombre de voies affichées par catégorie.',
  },
  TIMER_DURATION: {
    category: 'Timer',
    name: 'Durée du timer',
    description: 'Durée du timer en secondes.',
  },
  TIMER_PAUSE_DURATION: {
    category: 'Timer',
    name: 'Durée de la pause',
    description: 'Durée de la pause en secondes.',
  },
  TIMER_LOOP: {
    category: 'Timer',
    name: 'Boucle du timer',
    description: 'Redémarrer le timer automatiquement après la fin du temps imparti.',
  },
  POLLING_INTERVAL: {
    category: 'Données',
    name: "Intervalle d'actualisation",
    description: "Intervalle d'actualisation des données des sources externes en millisecondes.",
  },
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'config:updated': Partial<ConfigOptions>
  }
}

function makeDefault<T extends string | number | boolean>(
  defaultValue: T,
  isSecret?: boolean
): ConfigValue<T> {
  return { defaultValue, value: defaultValue, isModified: false, isSecret }
}

class ConfigManager {
  private CONFIG: ConfigOptions = {
    ROUTES_COUNT: makeDefault(4),
    TIMER_DURATION: makeDefault(240),
    TIMER_PAUSE_DURATION: makeDefault(15),
    TIMER_LOOP: makeDefault(true),
    POLLING_INTERVAL: makeDefault(1000),
  }

  initConfig(options: ConfigOption[]) {
    const dbOptions: Record<string, unknown> = {}
    options.forEach((o) => {
      dbOptions[o.option] = JSON.parse(o.value)
    })
    for (let o in dbOptions) {
      const option = o as keyof ConfigOptions
      if (typeof this.CONFIG[option]?.value === 'undefined') {
        logger.warn('Skipping bad configuration entry: %s is not a valid name.', option)
        continue
      }
      if (typeof dbOptions[option] !== typeof this.CONFIG[option].value) {
        logger.warn(
          'Skipping bad configuration entry: %s is of type %s in database. It should be of type %s',
          option,
          typeof dbOptions[option],
          typeof this.CONFIG[option].value
        )
        continue
      }
      this.CONFIG[option].value = dbOptions[option] as any
      this.CONFIG[option].isModified = true
    }
    logger.info('App configuration loaded from database.')
  }

  get<T extends keyof ConfigOptions>(key: T, redactSecrets?: boolean): ConfigOptions[T] {
    const item = this.CONFIG[key]
    return redactSecrets && item.isSecret
      ? {
          ...item,
          value:
            typeof item.value === 'string' ? 'secret' : typeof item.value === 'number' ? 0 : false,
        }
      : item
  }

  async set<T extends keyof typeof this.CONFIG>(
    key: T,
    value: ConfigOptions[T]['value']
  ): Promise<ConfigOptions[T]['value']> {
    const newConfigOption = await ConfigOption.updateOrCreate(
      { option: key },
      { value: JSON.stringify(value) }
    )
    this.CONFIG[key].value = JSON.parse(newConfigOption.value)
    this.CONFIG[key].isModified = true
    emitter.emit('config:updated', { [key]: this.CONFIG[key] })
    return this.CONFIG[key].value
  }

  async reset<T extends keyof typeof this.CONFIG>(key: T) {
    const option = await ConfigOption.findBy({ option: key })
    if (!option) return
    logger /*.use('userActions')*/
      .info({ action: 'configProvider.reset', target: key })
    await option.delete()
    this.CONFIG[key].value = this.CONFIG[key].defaultValue
    this.CONFIG[key].isModified = false
  }

  getConfig(redactSecrets?: boolean) {
    const clone = JSON.parse(JSON.stringify(this.CONFIG)) as Record<string, ConfigValue>
    if (redactSecrets) {
      for (const key in clone) {
        if (clone[key].isSecret)
          clone[key].value =
            typeof clone[key].value === 'string'
              ? 'secret'
              : typeof clone[key].value === 'number'
                ? 0
                : false
      }
    }
    return clone as DeepReadonly<typeof this.CONFIG>
  }

  getDescriptions(): ConfigData {
    const clone = JSON.parse(JSON.stringify(this.CONFIG)) as Record<string, ConfigValue>
    for (const key in clone) {
      if (clone[key].isSecret)
        clone[key].value =
          typeof clone[key].value === 'string'
            ? 'secret'
            : typeof clone[key].value === 'number'
              ? 0
              : false
    }

    const sections: ConfigSection[] = []
    for (const key in clone) {
      const desc = CONFIG_DESCRIPTIONS[key as keyof ConfigOptions]
      let section = sections.find((s) => s.category === desc.category)
      if (!section) {
        section = { category: desc.category, options: [] }
        sections.push(section)
      }
      section.options.push({
        key: key as keyof ConfigOptions,
        description: desc,
      })
    }

    return { config: clone as ConfigOptions, sections }
  }
}

export const Config = new ConfigManager()

export default class ConfigProvider {
  private maxAttempts = 5
  private retryInterval = 5

  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    if (this.app.getEnvironment() !== 'web') return
    for (let i = 1; i <= this.maxAttempts; i++) {
      try {
        logger.info(`Loading configuration from database... (attempt ${i}/${this.maxAttempts})`)
        const options = await ConfigOption.all()
        Config.initConfig(options)
        break
      } catch (e: any) {
        if (i < this.maxAttempts) {
          logger.error(
            { e: { message: e.message, stack: e.stack } },
            `Failed to load configuration from database. The database may not be reachable. Retrying in ${this.retryInterval}s...`
          )
          await new Promise((resolve) => setTimeout(resolve, this.retryInterval * 1000))
        } else {
          logger.error(
            { e: { message: e.message, stack: e.stack } },
            'Failed to load configuration from database. The database may not be reachable. Maximum number of attempts reached.'
          )
        }
      }
    }
  }

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
