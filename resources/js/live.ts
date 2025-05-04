function setCurrentClimber(climber: string) {
  document.querySelectorAll('tr[data-climber-row]').forEach((row) => {
    row.classList.remove('bg-orange-400/20')
  })
  document.querySelectorAll(`tr[data-order="${climber}"]`).forEach((row) => {
    row.classList.add('bg-orange-400/20')
  })
}

function loadTimer() {
  const startTimer = document.getElementById('start-timer')
  const pauseTimer = document.getElementById('pause-timer')
  const resetTimer = document.getElementById('reset-timer')
  const timerPlusOne = document.getElementById('timer-plus-one')
  const timerMinusOne = document.getElementById('timer-minus-one')
  const timerPlusTenth = document.getElementById('timer-plus-tenth')
  const timerMinusTenth = document.getElementById('timer-minus-tenth')
  const timerShow = document.getElementById('timer-show')
  const timerHide = document.getElementById('timer-hide')
  if (startTimer)
    startTimer.addEventListener('click', () => {
      console.log('Start timer clicked')
      fetch('timer/start', {
        method: 'POST',
      })
    })
  if (pauseTimer)
    pauseTimer.addEventListener('click', () => {
      console.log('Pause timer clicked')
      fetch('timer/pause', {
        method: 'POST',
      })
    })
  if (resetTimer)
    resetTimer.addEventListener('click', () => {
      console.log('Reset timer clicked')
      fetch('timer/reset', {
        method: 'POST',
      })
    })
  if (timerPlusOne)
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
  if (timerMinusOne)
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
  if (timerPlusTenth)
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
  if (timerMinusTenth)
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
  if (timerShow)
    timerShow.addEventListener('click', () => {
      console.log('Show timer clicked')
      fetch('/api/cg/timer/show', {
        method: 'POST',
      })
    })
  if (timerHide)
    timerHide.addEventListener('click', () => {
      console.log('Hide timer clicked')
      fetch('/api/cg/timer/hide', {
        method: 'POST',
      })
    })
}

document.addEventListener('DOMContentLoaded', () => {
  const savedClimber = localStorage.getItem('currentClimber') || '1'
  setCurrentClimber(savedClimber)

  const currentClimber = document.getElementById('currentClimber') as HTMLInputElement
  currentClimber.value = savedClimber
  currentClimber.addEventListener('input', (event) => {
    console.log((event.target as HTMLInputElement)?.value)
    setCurrentClimber((event.target as HTMLInputElement)?.value)
    localStorage.setItem('currentClimber', (event.target as HTMLInputElement)?.value)
  })

  loadTimer()

  const categoryDetails = document.querySelectorAll('details[data-category]')
  for (const detail of categoryDetails) {
    const category = detail.getAttribute('data-category')
    if (localStorage.getItem(`category-${category}-expanded`) === 'true')
      detail.setAttribute('open', '')
    detail.addEventListener('toggle', () => {
      const expanded = detail.hasAttribute('open')
      localStorage.setItem(`category-${category}-expanded`, JSON.stringify(expanded))
    })
  }

  const currentCategory = document.getElementById('current-category') as HTMLInputElement | null
  if (currentCategory) {
    currentCategory.addEventListener('change', (event) => {
      fetch('/api/current-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: (event.target as HTMLInputElement).value }),
      })
    })
  }

  const resultBackground = document.getElementById('result-background') as HTMLInputElement
  const showResults = document.getElementById('show-results')
  const hideResults = document.getElementById('hide-results')
  console.log(resultBackground, showResults, hideResults)
  if (resultBackground && showResults && hideResults) {
    showResults.addEventListener('click', () => {
      fetch(`/api/cg/results/${currentCategory?.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ background: resultBackground.value }),
      })
    })
    hideResults.addEventListener('click', () => {
      fetch(`/api/cg/results/hide`, { method: 'POST' })
    })
  }

  const showLateral = document.getElementById('show-lateral')
  const hideLateral = document.getElementById('hide-lateral')
  if (showLateral && hideLateral) {
    showLateral.addEventListener('click', () => {
      fetch(`/api/cg/lateral/${currentCategory?.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ background: resultBackground.value }),
      })
    })
    hideLateral.addEventListener('click', () => {
      fetch(`/api/cg/lateral/hide`, { method: 'POST' })
    })
  }

  const leftButtons = document.querySelectorAll('[data-send-left]')
  leftButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const climberId = button.getAttribute('data-send-left')
      if (climberId) {
        fetch(`/api/cg/leftclimber/${climberId}`, {
          method: 'POST',
        })
      }
    })
  })
  const rightButtons = document.querySelectorAll('[data-send-right]')
  rightButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const climberId = button.getAttribute('data-send-right')
      if (climberId) {
        fetch(`/api/cg/rightclimber/${climberId}`, {
          method: 'POST',
        })
      }
    })
  })

  const leftClearButtons = document.querySelectorAll('.clear-left')
  leftClearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      fetch('/api/cg/leftclimber/hide', {
        method: 'POST',
      })
    })
  })
  const rightClearButtons = document.querySelectorAll('.clear-right')
  rightClearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      fetch('/api/cg/rightclimber/hide', {
        method: 'POST',
      })
    })
  })
})

import { Transmit } from '@adonisjs/transmit-client'
import { timeToString } from './lib'

const main = async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const subscription = transmit.subscription('timer2')
  await subscription.create()

  subscription.onMessage((data: { time: number }) => {
    console.log(data, timeToString(data.time))
    document.getElementById('timer')!.innerText = data.time.toString()
  })
}
main()

console.log('Live page')
