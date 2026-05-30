import { Config } from '#providers/config_provider'
import transmit from '@adonisjs/transmit/services/main'
import { timeToString } from '../app/utils/conversion.js'
import { CGStatus } from './cg_provider.js'

const TIMER_DURATION = Config.get('TIMER_DURATION').value
const TIMER_PAUSE_DURATION = Config.get('TIMER_PAUSE_DURATION').value
const TIMER_LOOP = Config.get('TIMER_LOOP').value

export class Timer {
  private startTimestamp: number | null = null
  private pausedTimestamp: number | null = null

  getClientState() {
    return {
      serverNow: Date.now(),
      startTimestamp: this.startTimestamp,
      pausedTimestamp: this.pausedTimestamp,
      duration: TIMER_DURATION,
      pauseDuration: TIMER_PAUSE_DURATION,
      loop: TIMER_LOOP,
      time: this.time,
    }
  }

  private syncClients() {
    const state = this.getClientState()
    const time = timeToString(state.time)

    transmit.broadcast('timer2', state)
    CGStatus.updateLayer('TIMER', {
      t1: time[0],
      t2: time[2],
      t3: time[3],
      ...state,
    })
  }

  start() {
    if (this.startTimestamp !== null && this.pausedTimestamp === null) return
    if (this.startTimestamp !== null && this.pausedTimestamp !== null) {
      this.startTimestamp += Date.now() - this.pausedTimestamp
      this.pausedTimestamp = null
    } else {
      this.startTimestamp = Date.now()
    }
    this.syncClients()
  }

  stop() {
    this.startTimestamp = null
    this.pausedTimestamp = null
    this.syncClients()
  }

  pause() {
    if (this.startTimestamp === null || this.pausedTimestamp !== null) return
    this.pausedTimestamp = Date.now()
    this.syncClients()
  }

  addSeconds(s: number) {
    if (this.startTimestamp === null) return
    this.startTimestamp += Math.round(s * 1000)
    this.syncClients()
  }

  get time() {
    let absoluteTimeEllapsed = 0
    if (this.startTimestamp !== null) {
      absoluteTimeEllapsed = Math.round(
        ((this.pausedTimestamp === null ? Date.now() : this.pausedTimestamp) -
          this.startTimestamp) /
          1000
      )
    }
    const loopElapsed = (absoluteTimeEllapsed % (TIMER_DURATION + TIMER_PAUSE_DURATION)) + 1
    if (loopElapsed < TIMER_PAUSE_DURATION) return TIMER_PAUSE_DURATION - loopElapsed
    return TIMER_PAUSE_DURATION + TIMER_DURATION - loopElapsed
  }
}

export const timer = new Timer()
