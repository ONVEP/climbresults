import { Transmit } from '@adonisjs/transmit-client'

const transmit = new Transmit({
  baseUrl: window.location.origin,
})

const subscription = transmit.subscription('livegraphics')
await subscription.create()

subscription.onMessage((data) => {
  if (data.message == 'reload') {
    location.reload()
  }
})
