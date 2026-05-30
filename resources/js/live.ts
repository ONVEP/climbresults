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

  const currentCategories: Map<number, string> = new Map()
  const currentCategory = document.querySelectorAll(
    '#current-category0,#current-category1'
  ) as NodeListOf<HTMLSelectElement>
  if (currentCategory) {
    currentCategory.forEach((select) => {
      const slot = Number(select.getAttribute('data-slot') ?? '0')
      if (select.value) currentCategories.set(slot, select.value)

      select.addEventListener('change', (event) => {
        const slot = (event.target as HTMLSelectElement).getAttribute('data-slot') ?? '0'
        fetch(`/api/current-category/${slot}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: (event.target as HTMLSelectElement).value }),
        }).then(() => {
          currentCategories.set(Number(slot), (event.target as HTMLSelectElement).value)
        })
      })
    })
  }

  const getSelectedCategoryForSlot = (slot: number) => {
    const selectedFromMap = currentCategories.get(slot)
    if (selectedFromMap) return selectedFromMap

    const select = document.getElementById(`current-category${slot}`) as HTMLSelectElement | null
    return select?.value || null
  }

  ;[0, 1].forEach((slot) => {
    const showResults = document.getElementById(`show-results${slot}`)
    const hideResults = document.getElementById(`hide-results${slot}`)

    if (showResults) {
      showResults.addEventListener('click', () => {
        const categoryId = getSelectedCategoryForSlot(slot)
        if (!categoryId) return

        fetch(`/api/cg/results/${categoryId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      })
    }

    if (hideResults) {
      hideResults.addEventListener('click', () => {
        fetch(`/api/cg/results/hide`, { method: 'POST' })
      })
    }
  })

  const showLateral = document.getElementById('show-lateral')
  const hideLateral = document.getElementById('hide-lateral')
  if (showLateral && hideLateral) {
    showLateral.addEventListener('click', () => {
      fetch(`/api/cg/lateral/${currentCategories.get(0)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
import { timeToString } from './lib.js'

type TimerSyncState = {
  serverNow: number
  startTimestamp: number | null
  pausedTimestamp: number | null
  duration: number
  pauseDuration: number
  loop: boolean
  time: number
}

function computeSyncedTime(state: TimerSyncState, now: number) {
  let absoluteTimeEllapsed = 0
  if (state.startTimestamp !== null) {
    absoluteTimeEllapsed = Math.round(
      ((state.pausedTimestamp === null ? now : state.pausedTimestamp) - state.startTimestamp) / 1000
    )
  }

  const loopElapsed = (absoluteTimeEllapsed % (state.duration + state.pauseDuration)) + 1
  if (loopElapsed < state.pauseDuration) return state.pauseDuration - loopElapsed
  return state.pauseDuration + state.duration - loopElapsed
}

const main = async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const subscription = transmit.subscription('timer2')
  await subscription.create()

  let timerState: TimerSyncState | null = null
  let serverOffsetMs = 0
  let refreshTimeout: number | null = null

  const timerValue = document.getElementById('timer')

  const renderTimer = () => {
    if (!timerValue || !timerState) return

    const syncedNow = Date.now() + serverOffsetMs
    const time = computeSyncedTime(timerState, syncedNow)
    timerValue.innerText = timeToString(time)

    if (refreshTimeout) window.clearTimeout(refreshTimeout)
    if (timerState.startTimestamp !== null && timerState.pausedTimestamp === null) {
      const elapsed = syncedNow - timerState.startTimestamp
      const remainingMs = 1000 - (elapsed % 1000)
      refreshTimeout = window.setTimeout(renderTimer, Math.max(10, remainingMs))
    }
  }

  const applyState = (state: TimerSyncState) => {
    timerState = state
    serverOffsetMs = state.serverNow - Date.now()
    renderTimer()
  }

  const syncFromHttp = async () => {
    try {
      const response = await fetch('/timer/state')
      if (!response.ok) return
      const state = (await response.json()) as TimerSyncState
      applyState(state)
    } catch (error) {
      console.warn('Unable to sync timer state from server', error)
    }
  }

  subscription.onMessage((data: TimerSyncState) => {
    applyState(data)
  })

  await syncFromHttp()
  window.setInterval(syncFromHttp, 15000)
}
main()

console.log('Live page')
