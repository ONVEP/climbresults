import { Transmit } from '@adonisjs/transmit-client'
import { timeToString } from './lib'

const transmit = new Transmit({
  baseUrl: window.location.origin,
  uidGenerator: () => {
    return Date.now().toString() + Math.floor(Math.random() * 1000000)
  },
})

const main = async () => {
  const subscription = transmit.subscription('timer2')
  await subscription.create()

  let timerState = null
  let serverOffsetMs = 0
  let refreshTimeout = null

  const computeSyncedTime = (state, now) => {
    let absoluteTimeEllapsed = 0
    if (state.startTimestamp !== null) {
      absoluteTimeEllapsed = Math.round(
        ((state.pausedTimestamp === null ? now : state.pausedTimestamp) - state.startTimestamp) /
          1000
      )
    }

    const loopElapsed = (absoluteTimeEllapsed % (state.duration + state.pauseDuration)) + 1
    if (loopElapsed < state.pauseDuration) return state.pauseDuration - loopElapsed
    return state.pauseDuration + state.duration - loopElapsed
  }

  const renderTimer = () => {
    if (!timerState) return
    const syncedNow = Date.now() + serverOffsetMs
    const text = timeToString(computeSyncedTime(timerState, syncedNow))
    document.getElementById('t_minutes').innerHTML = text.split(':')[0]
    document.getElementById('t_sec_1').innerHTML = text.split(':')[1][0]
    document.getElementById('t_sec_2').innerHTML = text.split(':')[1][1]

    if (refreshTimeout) window.clearTimeout(refreshTimeout)
    if (timerState.startTimestamp !== null && timerState.pausedTimestamp === null) {
      const elapsed = syncedNow - timerState.startTimestamp
      const remainingMs = 1000 - (elapsed % 1000)
      refreshTimeout = window.setTimeout(renderTimer, Math.max(10, remainingMs))
    }
  }

  const applyState = (state) => {
    timerState = state
    serverOffsetMs = state.serverNow - Date.now()
    renderTimer()
  }

  const syncFromHttp = async () => {
    try {
      const response = await fetch('/timer/state')
      if (!response.ok) return
      applyState(await response.json())
    } catch (error) {
      console.warn('Unable to sync timer state from server', error)
    }
  }

  subscription.onMessage((data) => {
    applyState(data)
  })

  await syncFromHttp()
  window.setInterval(syncFromHttp, 15000)
}
main()
