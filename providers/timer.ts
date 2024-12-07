import env from '#start/env'
import transmit from '@adonisjs/transmit/services/main'

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
    this.updateTime()
  }

  pause() {
    if (this.startTimestamp === null || this.pausedTimestamp !== null) return
    this.pausedTimestamp = Date.now()
  }

  addSeconds(s: number) {
    if (this.startTimestamp === null) return
    this.startTimestamp += Math.round(s * 1000)
  }

  get time() {
    if (this.startTimestamp === null) return env.get('TIMER')
    const ellapsed = Math.round(
      ((this.pausedTimestamp === null ? Date.now() : this.pausedTimestamp) - this.startTimestamp) /
        1000
    )
    return env.get('TIMER') - ellapsed
  }

  private updateTime() {
    transmit.broadcast('timer', this.time)
    if (this.startTimestamp !== null && this.pausedTimestamp === null) {
      console.log(
        Date.now(),
        this.startTimestamp,
        1000 - ((Date.now() - this.startTimestamp) % 1000)
      )
      const remainingMs = 1000 - ((Date.now() - this.startTimestamp) % 1000)
      if (this.time > 0) {
        this.refreshTimeout = setTimeout(() => this.updateTime(), remainingMs)
      }
    }
  }
}

export const timer = new Timer()
