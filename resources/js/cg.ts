import type { CGLayer } from '#providers/cg_provider'
import { Transmit } from '@adonisjs/transmit-client'
import { timeToString } from './lib.js'
import.meta.glob(['../images/**'])

type TimerSyncState = {
  serverNow: number
  startTimestamp: number | null
  pausedTimestamp: number | null
  duration: number
  pauseDuration: number
  loop: boolean
  time: number
}

function isTimerSyncState(data: Record<string, unknown>): data is TimerSyncState {
  return (
    typeof data.serverNow === 'number' &&
    typeof data.duration === 'number' &&
    typeof data.pauseDuration === 'number' &&
    typeof data.loop === 'boolean'
  )
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

document.addEventListener('DOMContentLoaded', async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const layers = document.querySelectorAll('[data-cglayer]')
  let timerState: TimerSyncState | null = null
  let timerOffsetMs = 0
  let timerRefreshTimeout: number | null = null
  let hasHttpTimerSync = false

  const applyTimerState = (state: TimerSyncState, source: 'http' | 'layer') => {
    timerState = state
    if (source === 'http') {
      timerOffsetMs = state.serverNow - Date.now()
      hasHttpTimerSync = true
    } else if (!hasHttpTimerSync) {
      const candidateOffset = state.serverNow - Date.now()
      // Ignore obviously stale layer payloads, they can be old snapshots rebroadcast on subscribe.
      if (Math.abs(candidateOffset) < 5000) {
        timerOffsetMs = candidateOffset
      }
    }
    renderTimerLayer()
  }

  const syncTimerFromHttp = async () => {
    try {
      const response = await fetch('/timer/state')
      if (!response.ok) return
      const state = (await response.json()) as TimerSyncState
      applyTimerState(state, 'http')
    } catch (error) {
      console.warn('Unable to sync timer state from server', error)
    }
  }

  const renderTimerLayer = () => {
    if (!timerState) return
    const syncedNow = Date.now() + timerOffsetMs
    const time = timeToString(computeSyncedTime(timerState, syncedNow))
    const timerLayer = document.querySelector('[data-cglayer="TIMER"]')
    if (!timerLayer) return

    const t1 = timerLayer.querySelector('span[data-cg="t1"]')
    const t2 = timerLayer.querySelector('span[data-cg="t2"]')
    const t3 = timerLayer.querySelector('span[data-cg="t3"]')

    if (t1) t1.textContent = time[0] ?? '0'
    if (t2) t2.textContent = time[2] ?? '0'
    if (t3) t3.textContent = time[3] ?? '0'

    if (timerRefreshTimeout) window.clearTimeout(timerRefreshTimeout)
    if (timerState.startTimestamp !== null && timerState.pausedTimestamp === null) {
      const elapsed = syncedNow - timerState.startTimestamp
      const remainingMs = 1000 - (elapsed % 1000)
      timerRefreshTimeout = window.setTimeout(renderTimerLayer, Math.max(10, remainingMs))
    }
  }

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

        if (layerName === 'TIMER' && isTimerSyncState(data.data)) {
          applyTimerState(data.data, 'layer')
        }
      }
    })
  }

  await syncTimerFromHttp()
  window.setInterval(syncTimerFromHttp, 15000)
})
