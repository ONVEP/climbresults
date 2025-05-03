import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const cgDataSchema = vine.object({
  shown: vine.boolean(),
  data: vine.record(vine.any()).optional(),
})
export type CGData = Infer<typeof cgDataSchema>
export const cgDataValidator = vine.compile(cgDataSchema)

const cgDataCollectionSchema = vine.record(cgDataSchema)
export type CGDataCollection = Infer<typeof cgDataCollectionSchema>
export const cgDataCollectionValidator = vine.compile(cgDataCollectionSchema)
