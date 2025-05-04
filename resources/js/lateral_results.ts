import type { CGLayers, ClimberRow } from '#providers/cg_provider'
import { Transmit } from '@adonisjs/transmit-client'

const nbClimbers = 24

const updateRow = (result: ClimberRow | null, idx: number) => {
  const row = document
    .querySelector('[data-cglayer="LATERAL_RANKING"]')
    ?.querySelectorAll(`[data-cg-row]`)[idx]
  if (!row) return
  if (!result) {
    row?.classList.add('opacity-0', 'border-none')
    row?.classList.remove('opacity-100')
    return
  }

  row?.classList.remove('opacity-0', 'border-none')
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
}

let timeout: NodeJS.Timeout | null = null

const nextPage = (results: CGLayers['LATERAL_RANKING']['data'], page = 0) => {
  console.log('results', results)
  if (!results) return
  const rows: (ClimberRow | null)[] =
    results?.results.slice(page * nbClimbers, (page + 1) * nbClimbers) ?? []
  while (rows.length < nbClimbers) rows.push(null)
  rows?.forEach((result, idx) => updateRow(result, idx))
  if (timeout) clearTimeout(timeout)

  const titles = document.querySelectorAll(`[data-cgtitle]`)
  titles.forEach((title) => {
    const titleName = title.getAttribute('data-cgtitle')
    if (!titleName) return
    if (results.background.includes(titleName)) {
      title.classList.add('flex')
      title.classList.remove('hidden')
    } else {
      title.classList.add('hidden')
      title.classList.remove('flex')
    }
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  const transmit = new Transmit({
    baseUrl: window.location.origin,
    uidGenerator: () => {
      return Date.now().toString() + Math.floor(Math.random() * 1000000)
    },
  })

  const subscription = transmit.subscription('LATERAL_RANKING')
  await subscription.create()

  subscription.onMessage((data: CGLayers['LATERAL_RANKING']) => {
    console.log('Received data for layer:', 'LATERAL_RANKING', data)
    if (timeout) clearTimeout(timeout)
    console.log('data.data', data.data)
    if (data.data && data.shown) {
      nextPage(data.data)
    }
  })
})
