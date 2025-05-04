import type { CGLayer } from '#providers/cg_provider'
import { Transmit } from '@adonisjs/transmit-client'

document.addEventListener('DOMContentLoaded', async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const layers = document.querySelectorAll('[data-cglayer]')

  for (const layer of layers) {
    const layerName = layer.getAttribute('data-cglayer')
    if (!layerName) continue
    console.log('Registering layer:', layerName)
    const subscription = transmit.subscription(layerName)
    await subscription.create()

    subscription.onMessage((data: CGLayer) => {
      if (data.shown) layer.setAttribute('data-cg-shown', '1')
      else layer.removeAttribute('data-cg-shown')
      console.log('Received data for layer:', layerName, data)
      if (data.data) {
        for (const [key, value] of Object.entries(data.data)) {
          if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            value !== null &&
            value !== undefined
          )
            continue
          const textElements = document.querySelectorAll(
            `[data-cglayer="${layerName}"] span[data-cg="${key}"]`
          )
          for (const el of textElements) {
            el.textContent = value?.toString() ?? ''
          }
          const imgElements = document.querySelectorAll(
            `[data-cglayer="${layerName}"] img[data-cg="${key}"]`
          )
          for (const el of imgElements) {
            if (value) {
              el.setAttribute('src', value.toString())
            } else {
              el.removeAttribute('src')
            }
          }
        }
        const progression = document.querySelector(
          `[data-cglayer="${layerName}"] [data-cg-column="progression"]`
        )
        if (progression && data.data.routes) {
          for (let i = 0; i < 4; i++) {
            const zone = (data.data.routes as any[])[i]?.zone
            const top = (data.data.routes as any[])[i]?.top
            console.log('routes', data.data.routes, zone, top)
            if (top) {
              progression.children[i].children[0].classList.add('bg-cg-accent')
              progression.children[i].children[0].classList.remove('bg-cg-neutral-dark')
            } else {
              progression.children[i].children[0].classList.remove('bg-cg-accent')
              progression.children[i].children[0].classList.add('bg-cg-neutral-dark')
            }
            if (zone) {
              progression.children[i].children[1].classList.add('bg-cg-accent')
              progression.children[i].children[1].classList.remove('bg-cg-neutral-dark')
            } else {
              progression.children[i].children[1].classList.remove('bg-cg-accent')
              progression.children[i].children[1].classList.add('bg-cg-neutral-dark')
            }
          }
        }
      }
    })
  }
})
