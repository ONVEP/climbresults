import vine from '@vinejs/vine'

export const route = vine.object({
  id: vine.number(),
  name: vine.string(),
  startlist: vine.string(),
})

export const ascent = vine.object({
  route_id: vine.number(),
  route_name: vine.string(),
  top: vine.boolean().nullable(),
  top_tries: vine.number().nullable(),
  zone: vine.boolean().nullable(),
  zone_tries: vine.number().nullable(),
  low_zone: vine.string().nullable(),
  points: vine.number(),
  low_zone_tries: vine.string().nullable(),
  modified: vine.string(),
  status: vine.string(),
})

export const rankingAthlete = vine.object({
  athlete_id: vine.number(),
  name: vine.string(),
  firstname: vine.string(),
  lastname: vine.string(),
  country: vine.string(),
  flag_url: vine.string(),
  federation_id: vine.number(),
  bib: vine.string(),
  rank: vine.number(),
  score: vine.string(),
  start_order: vine.number(),
  ascents: vine.array(ascent),
  combined_stages: vine.string().nullable(),
  active: vine.boolean(),
  under_appeal: vine.boolean(),
})

export const startListAthlete = vine.object({
  athlete_id: vine.number(),
  name: vine.string(),
  firstname: vine.string(),
  lastname: vine.string(),
  country: vine.string(),
  flag_url: vine.string(),
  federation_id: vine.number(),
  bib: vine.string(),
  route_start_positions: vine.array(
    vine.object({
      route_name: vine.string(),
      route_id: vine.number(),
      position: vine.number(),
    })
  ),
})

export const categoryRoundResult = vine.object({
  id: vine.number(),
  event: vine.string(),
  event_id: vine.number(),
  dcat_id: vine.number(),
  discipline: vine.string(),
  status: vine.string(),
  status_as_of: vine.string(),
  category: vine.string(),
  round: vine.string(),
  format: vine.string(),
  routes: vine.array(route),
  ranking: vine.array(rankingAthlete).optional(),
  startlist: vine.array(startListAthlete).optional(),
})

export const categoryRoundResultValidator = vine.compile(categoryRoundResult)
