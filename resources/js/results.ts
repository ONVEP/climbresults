import type { CGLayers, ClimberRow } from '#providers/cg_provider'
import { Transmit } from '@adonisjs/transmit-client'

const updateRow = (result: ClimberRow | null, idx: number) => {
  const row = document.querySelector(`[data-cg-row="${idx + 1}"]`)
  console.log('Row:', row)

  if (!result) {
    row?.classList.add('opacity-0')
    row?.classList.remove('opacity-100')
    return
  }

  row?.classList.remove('opacity-0')
  row?.classList.add('opacity-100')

  const rank = document.querySelector(`[data-cg-row="${idx + 1}"] [data-cg-column="rank"]`)
  if (rank) rank.textContent = result.place.toString()
  const firstName = document.querySelector(
    `[data-cg-row="${idx + 1}"] [data-cg-column="first_name"]`
  )
  if (firstName) firstName.textContent = result.first_name
  const lastName = document.querySelector(`[data-cg-row="${idx + 1}"] [data-cg-column="last_name"]`)
  if (lastName) lastName.textContent = result.last_name
  const tag = document.querySelector(`[data-cg-row="${idx + 1}"] [data-cg-column="tag"]`)
  if (tag) tag.textContent = result.tag
  const nationality = document.querySelector(
    `[data-cg-row="${idx + 1}"] [data-cg-column="nationality"]`
  )
  if (nationality) nationality.textContent = result.nationality
  const score = document.querySelector(`[data-cg-row="${idx + 1}"] [data-cg-column="score"]`)
  if (score) score.textContent = result.score?.toString() ?? ''
  const flag = document.querySelector(
    `[data-cg-row="${idx + 1}"] [data-cg-column="flag"]`
  ) as HTMLImageElement
  console.log('Flag:', flag)
  if (flag) flag.src = result.flag
}

let timeout: NodeJS.Timeout | null = null

const nextPage = (results: CGLayers['RANKING']['data'], page = 0) => {
  if (!results) return
  const rows: (ClimberRow | null)[] = results?.results.slice(page * 10, (page + 1) * 10) ?? []
  while (rows.length < 10) rows.push(null)
  rows?.forEach((result, idx) => updateRow(result, idx))
  if(timeout) clearTimeout(timeout)
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
