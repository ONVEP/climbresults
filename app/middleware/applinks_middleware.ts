import type { Permission } from '#security/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export type AppLink = {
  label: string
  url: string
  icon: string // Icon name from https://lucide.dev/icons/
  active: (ctx: HttpContext) => boolean
  permission?: Permission | Permission[]
}

const appLinks: AppLink[] = [
  { label: 'Accueil', url: '/', icon: 'lucide:home', active: (ctx) => ctx.request.url() === '/' },
  {
    label: 'Live',
    url: '/live',
    icon: 'lucide:radio-tower',
    active: (ctx) => ctx.request.url().startsWith('/live'),
  },
  {
    label: 'Grimpeurs',
    url: '/climbers',
    icon: 'lucide:users',
    active: (ctx) => ctx.request.url().startsWith('/climbers'),
  },
  {
    label: 'Catégories',
    url: '/categories',
    icon: 'lucide:tags',
    active: (ctx) => ctx.request.url().startsWith('/categories'),
  },
  {
    label: 'Configuration',
    url: '/configuration',
    icon: 'lucide:settings-2',
    active: (ctx) => ctx.request.url().startsWith('/configuration'),
  },
]

export default class ApplinksMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.request.method() !== 'GET') {
      return await next()
    }
    // const user = ctx.auth.user as User | undefined
    ctx.view.share({
      app_links: appLinks
        .filter((link) => {
          if (!link.permission) return true
          // const permissions = Array.isArray(link.permission) ? link.permission : [link.permission]
          return true
        })
        .map((link) => ({ ...link, active: link.active(ctx) })),
    })
    return await next()
  }
}
