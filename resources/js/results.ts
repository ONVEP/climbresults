import type { CGLayers, ClimberRow } from '#providers/cg_provider'
import { Transmit } from '@adonisjs/transmit-client'

const updateRow = (result: ClimberRow | null, idx: number) => {
  const rows = document.querySelectorAll(`[data-cg-row="${idx + 1}"]`)

  rows.forEach((row) => {
    if (!result) {
      row?.classList.add('opacity-0')
      row?.classList.remove('opacity-100')
      return
    }

    row?.classList.remove('opacity-0')
    row?.classList.add('opacity-100')

    const rank = row.querySelector(`[data-cg-column="rank"]`)
    if (rank) rank.textContent = result.place.toString()
    const firstName = row.querySelector(`[data-cg-column="first_name"]`)
    if (firstName) firstName.textContent = result.first_name
    const lastName = row.querySelector(`[data-cg-column="last_name"]`)
    if (lastName) lastName.textContent = result.last_name
    const tag = row.querySelector(`[data-cg-column="tag"]`)
    if (tag) tag.textContent = result.tag
    const nationality = row.querySelector(`[data-cg-column="nationality"]`)
    if (nationality) nationality.textContent = result.nationality
    const score = row.querySelector(`[data-cg-column="score"]`)
    if (score) score.textContent = result.score?.toString() ?? ''
    const flag = row.querySelector(`[data-cg-column="flag"]`) as HTMLImageElement
    if (flag) flag.src = result.flag

    const progression = row.querySelector('[data-cg-column="progression"]')
    if (progression) {
      for (let i = 0; i < 4; i++) {
        const zone = result.routes[i]?.zone
        const top = result.routes[i]?.top
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
  })
}

let timeout: NodeJS.Timeout | null = null

const nextPage = (results: CGLayers['RANKING']['data'], page = 0) => {
  if (!results) return
  const rows: (ClimberRow | null)[] = results?.results.slice(page * 10, (page + 1) * 10) ?? []
  while (rows.length < 10) rows.push(null)
  rows?.forEach((result, idx) => updateRow(result, idx))
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(
    nextPage,
    10000,
    results,
    (page + 1) * 10 < results.results.length ? page + 1 : 0
  )
}

document.addEventListener('DOMContentLoaded', async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const subscription = transmit.subscription('RANKING')
  await subscription.create()

  subscription.onMessage((data: CGLayers['RANKING']) => {
    console.log('Received data for layer:', 'RANKING', data)
    if (!data.shown && timeout) clearTimeout(timeout)
    if (data.data && data.shown) {
      nextPage(data.data)
    }
  })
})
