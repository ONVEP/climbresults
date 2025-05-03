import env from '#start/env'
import transmit from '@adonisjs/transmit/services/main'
import { timeToString } from '../app/utils/conversion.js'
import { CGStatus } from './cg_provider.js'

const TIMER_DURATION = env.get('TIMER_DURATION', 0)
const TIMER_PAUSE_DURATION = env.get('TIMER_PAUSE_DURATION', 0)
const TIMER_LOOP = env.get('TIMER_LOOP', false)

export class Timer {
  private startTimestamp: number | null = null
  private pausedTimestamp: number | null = null

  private refreshTimeout: NodeJS.Timeout | null = null

  start() {
    if (this.startTimestamp !== null && this.pausedTimestamp === null) return
    if (this.startTimestamp !== null && this.pausedTimestamp !== null) {
      this.startTimestamp += Date.now() - this.pausedTimestamp
      this.pausedTimestamp = null
    } else {
      this.startTimestamp = Date.now()
    }
    this.updateTime()
  }

  stop() {
    if (this.startTimestamp === null) return
    this.startTimestamp = null
    this.pausedTimestamp = null
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout)
    this.updateTime()
  }

  pause() {
    if (this.startTimestamp === null || this.pausedTimestamp !== null) return
    this.pausedTimestamp = Date.now()
  }

  addSeconds(s: number) {
    if (this.startTimestamp === null) return
    this.startTimestamp += Math.round(s * 1000)
    transmit.broadcast('timer2', { time: timeToString(this.time) })
    const time = timeToString(this.time)
    CGStatus.updateLayer('TIMER', { t1: time[0], t2: time[2], t3: time[3] })
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

  private updateTime() {
    transmit.broadcast('timer2', { time: timeToString(this.time) })
    const time = timeToString(this.time)
    CGStatus.updateLayer('TIMER', { t1: time[0], t2: time[2], t3: time[3] })
    if (this.startTimestamp !== null && this.pausedTimestamp === null) {
      console.log(
        Date.now(),
        this.startTimestamp,
        1000 - ((Date.now() - this.startTimestamp) % 1000)
      )
      const remainingMs = 1000 - ((Date.now() - this.startTimestamp) % 1000)
      if (this.time > 0 || TIMER_LOOP) {
        this.refreshTimeout = setTimeout(() => this.updateTime(), remainingMs)
      }
    }
  }
}

export const timer = new Timer()
