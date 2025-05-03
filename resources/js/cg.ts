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
          if (typeof value !== 'string' && value !== null && value !== undefined) continue
          const element = document.querySelectorAll(`[data-cg="${key}"]`)
          for (const el of element) {
            el.textContent = value ?? ''
          }
        }
      }
    })
  }
})
