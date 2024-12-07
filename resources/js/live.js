function setCurrentClimber(climber) {
  document.querySelectorAll('tr[data-climber-row]').forEach((row) => {
    row.classList.remove('bg-orange-400/20')
  })
  document.querySelectorAll(`tr[data-order="${climber}"]`).forEach((row) => {
    row.classList.add('bg-orange-400/20')
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const savedClimber = localStorage.getItem('currentClimber') || '1'
  setCurrentClimber(savedClimber)

  const currentClimber = document.getElementById('currentClimber')
  currentClimber.value = savedClimber
  currentClimber.addEventListener('input', (event) => {
    console.log(event.target.value)
    setCurrentClimber(event.target.value)
    localStorage.setItem('currentClimber', event.target.value)
  })

  const startTimer = document.getElementById('start-timer')
  const pauseTimer = document.getElementById('pause-timer')
  const resetTimer = document.getElementById('reset-timer')
  const timerPlusOne = document.getElementById('timer-plus-one')
  const timerMinusOne = document.getElementById('timer-minus-one')
  const timerPlusTenth = document.getElementById('timer-plus-tenth')
  const timerMinusTenth = document.getElementById('timer-minus-tenth')
  startTimer.addEventListener('click', () => {
    console.log('Start timer clicked')
    fetch('timer/start', {
      method: 'POST',
    })
  })
  pauseTimer.addEventListener('click', () => {
    console.log('Pause timer clicked')
    fetch('timer/pause', {
      method: 'POST',
    })
  })
  resetTimer.addEventListener('click', () => {
    console.log('Reset timer clicked')
    fetch('timer/reset', {
      method: 'POST',
    })
  })
  timerPlusOne.addEventListener('click', () => {
    console.log('Timer plus one second clicked')
    fetch('timer/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seconds: 1 }),
    })
  })
  timerMinusOne.addEventListener('click', () => {
    console.log('Timer minus one second clicked')
    fetch('timer/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seconds: -1 }),
    })
  })
  timerPlusTenth.addEventListener('click', () => {
    console.log('Timer plus one tenth clicked')
    fetch('timer/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seconds: 0.1 }),
    })
  })
  timerMinusTenth.addEventListener('click', () => {
    console.log('Timer minus one tenth clicked')
    fetch('timer/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seconds: -0.1 }),
    })
  })
})

import { Transmit } from '@adonisjs/transmit-client'
import { timeToString } from './lib'

const transmit = new Transmit({
  baseUrl: window.location.origin,
})

const subscription = transmit.subscription('timer')
await subscription.create()

subscription.onMessage((data) => {
  document.getElementById('timer').innerText = timeToString(data)
})

console.log(1)
