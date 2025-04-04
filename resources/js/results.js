import { Transmit } from '@adonisjs/transmit-client'

const transmit = new Transmit({
  baseUrl: window.location.origin,
  uidGenerator: () => {
    return Date.now().toString() + Math.floor(Math.random() * 1000000)
  },
})

const main = async () => {
  const subscription = transmit.subscription('livegraphics')
  await subscription.create()

  subscription.onMessage((data) => {
    if (data.message == 'reload') {
      location.reload()
    }
  })
}
main()
