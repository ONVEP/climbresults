import { Transmit } from '@adonisjs/transmit-client'
import { timeToString } from './lib'

const transmit = new Transmit({
  baseUrl: window.location.origin,
  uidGenerator: () => {
    return Date.now().toString() + Math.floor(Math.random() * 1000000)
  },
})

const main = async () => {
  const subscription = transmit.subscription('timer')
  await subscription.create()

  subscription.onMessage((data) => {
    const text = timeToString(data.time)
    console.log(text)
    document.getElementById('t_minutes').innerHTML = text.split(':')[0]
    document.getElementById('t_sec_1').innerHTML = text.split(':')[1][0]
    document.getElementById('t_sec_2').innerHTML = text.split(':')[1][1]
  })
}
main()
