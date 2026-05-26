import type { DataColumnSchema } from '#common/api_types'
import { DataColumnType } from '#common/api_types'
import type { ReportViewColumnTransform } from '#models/report_view'
import { DateTime } from 'luxon'

export function getCellDisplayValue(column: DataColumnSchema, value: any): string {
  switch (column.type) {
    case DataColumnType.STRING:
    case DataColumnType.NUMBER:
      return value?.toString() || ''
    case DataColumnType.BOOLEAN:
      return value ? 'Oui' : 'Non'
    case DataColumnType.DATE:
      return DateTime.fromISO(value).isValid ? DateTime.fromISO(value).toLocaleString() : '-'
    case DataColumnType.MODEL_REFERENCE:
      return value?.toString() || ''
    default:
      return value?.toString() || ''
  }
}

export type TransformParameter = {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'textarea' | 'checkbox' | 'select'
  defaultValue?: any
  options?: { value: string; label: string }[]
  optionsSource?: string // For dynamic options like 'translation_tables'
}

export type TransformDefinition = {
  type: ReportViewColumnTransform['type']
  label: string
  inputType: DataColumnType | 'any'
  outputType: DataColumnType
  parameters?: TransformParameter[]
  handler: (value: any, params: Record<string, any>, table?: Record<string, string>) => any
}

export const TRANSFORM_DEFINITIONS: TransformDefinition[] = [
  {
    type: 'uppercase',
    label: 'MAJUSCULES',
    inputType: DataColumnType.STRING,
    outputType: DataColumnType.STRING,
    handler: (value: any) => {
      if (!value) return ''
      return value.toString().toUpperCase()
    },
  },
  {
    type: 'lowercase',
    label: 'minuscules',
    inputType: DataColumnType.STRING,
    outputType: DataColumnType.STRING,
    handler: (value: any) => {
      if (!value) return ''
      return value.toString().toLowerCase()
    },
  },
  {
    type: 'titlecase',
    label: 'Première Lettre Majuscule',
    inputType: DataColumnType.STRING,
    outputType: DataColumnType.STRING,
    handler: (value: any) => {
      if (!value) return ''
      return value
        .toString()
        .toLowerCase()
        .replace(/\b\w/g, (char: string) => char.toUpperCase())
    },
  },
  {
    type: 'age',
    label: "Calculer l'âge",
    inputType: DataColumnType.DATE,
    outputType: DataColumnType.NUMBER,
    parameters: [
      {
        key: 'manipulation',
        label: 'Calculer à',
        type: 'select',
        defaultValue: 'none',
        options: [
          { value: 'none', label: 'Maintenant' },
          { value: 'start_of_year', label: "Début d'année" },
          { value: 'end_of_year', label: "Fin d'année" },
          { value: 'start_of_month', label: 'Début de mois' },
          { value: 'end_of_month', label: 'Fin de mois' },
        ],
      },
      {
        key: 'offset',
        label: 'Décalage',
        placeholder: '0',
        defaultValue: 0,
      },
      {
        key: 'offsetUnit',
        label: 'Unité de décalage',
        type: 'select',
        defaultValue: 'days',
        options: [
          { value: 'days', label: 'Jours' },
          { value: 'weeks', label: 'Semaines' },
          { value: 'months', label: 'Mois' },
          { value: 'years', label: 'Années' },
        ],
      },
      {
        key: 'showUnit',
        label: "Afficher l'unité",
        type: 'checkbox',
        defaultValue: true,
      },
    ],
    handler: (value: any, params: Record<string, any>) => {
      if (!value) return ''
      const birthDate = DateTime.fromISO(value)
      if (!birthDate.isValid) return value?.toString() || ''

      let referenceDate = DateTime.now()

      // Apply manipulation to reference date
      switch (params.manipulation) {
        case 'none':
          // Use current date
          break
        case 'start_of_year':
          referenceDate = referenceDate.startOf('year')
          break
        case 'end_of_year':
          referenceDate = referenceDate.endOf('year')
          break
        case 'start_of_month':
          referenceDate = referenceDate.startOf('month')
          break
        case 'end_of_month':
          referenceDate = referenceDate.endOf('month')
          break
      }

      // Apply offset if provided
      const offset = Number(params.offset) || 0
      if (offset !== 0) {
        const unit = params.offsetUnit || 'days'
        referenceDate = referenceDate.plus({ [unit]: offset })
      }

      const years = Math.floor(referenceDate.diff(birthDate, 'years').years)
      const showUnit = params.showUnit !== false
      return showUnit ? `${years} ans` : `${years}`
    },
  },
  {
    type: 'date_format',
    label: 'Format de date personnalisé',
    inputType: DataColumnType.DATE,
    outputType: DataColumnType.STRING,
    parameters: [{ key: 'format', label: 'Format', placeholder: 'dd/MM/yyyy' }],
    handler: (value: any, params: Record<string, any>) => {
      if (!value) return ''
      const dt = DateTime.fromISO(value)
      if (!dt.isValid) return value?.toString() || ''
      return dt.toFormat(params.format)
    },
  },
  {
    type: 'date_manipulation',
    label: 'Manipulation de date',
    inputType: DataColumnType.DATE,
    outputType: DataColumnType.DATE,
    parameters: [
      {
        key: 'manipulation',
        label: 'Manipulation',
        type: 'select',
        defaultValue: 'none',
        options: [
          { value: 'none', label: 'Aucune' },
          { value: 'start_of_year', label: "Début d'année" },
          { value: 'end_of_year', label: "Fin d'année" },
          { value: 'start_of_month', label: 'Début de mois' },
          { value: 'end_of_month', label: 'Fin de mois' },
        ],
      },
      {
        key: 'offset',
        label: 'Décalage',
        placeholder: '0',
        defaultValue: 0,
      },
      {
        key: 'offsetUnit',
        label: 'Unité de décalage',
        type: 'select',
        defaultValue: 'days',
        options: [
          { value: 'days', label: 'Jours' },
          { value: 'weeks', label: 'Semaines' },
          { value: 'months', label: 'Mois' },
          { value: 'years', label: 'Années' },
        ],
      },
    ],
    handler: (value: any, params: Record<string, any>) => {
      if (!value) return ''
      let dt = DateTime.fromISO(value)
      if (!dt.isValid) return value?.toString() || ''

      // Apply manipulation
      switch (params.manipulation) {
        case 'none':
          // No manipulation, keep the date as is
          break
        case 'start_of_year':
          dt = dt.startOf('year')
          break
        case 'end_of_year':
          dt = dt.endOf('year')
          break
        case 'start_of_month':
          dt = dt.startOf('month')
          break
        case 'end_of_month':
          dt = dt.endOf('month')
          break
      }

      // Apply offset if provided
      const offset = Number(params.offset) || 0
      if (offset !== 0) {
        const unit = params.offsetUnit || 'days'
        dt = dt.plus({ [unit]: offset })
      }

      return dt
    },
  },
  {
    type: 'boolean_custom',
    label: 'Booléen personnalisé',
    inputType: DataColumnType.BOOLEAN,
    outputType: DataColumnType.STRING,
    parameters: [
      {
        key: 'trueValue',
        label: 'Valeur si vrai',
        placeholder: 'Oui',
        defaultValue: 'Oui',
      },
      {
        key: 'falseValue',
        label: 'Valeur si faux',
        placeholder: 'Non',
        defaultValue: 'Non',
      },
    ],
    handler: (value: any, params: Record<string, any>) => {
      const trueValue = params.trueValue || 'Oui'
      const falseValue = params.falseValue || 'Non'
      return value ? trueValue : falseValue
    },
  },
  {
    type: 'correspondance',
    label: 'Table de correspondance',
    inputType: 'any',
    outputType: DataColumnType.STRING,
    parameters: [
      {
        key: 'tableId',
        label: 'Table de correspondance',
        placeholder: 'Sélectionner une table',
        type: 'select',
        optionsSource: 'translation_tables',
      },
    ],
    handler: (value: any, _, table?: Record<string, string>) => {
      if (!value) return ''
      const stringValue = value.toString()
      // Look up the translation table from the cache
      if (table) {
        const translatedValue = table[stringValue]
        return translatedValue !== undefined ? translatedValue : stringValue
      }

      return stringValue
    },
  },
  {
    type: 'number_mapping',
    label: 'Correspondance numérique',
    inputType: 'any',
    outputType: DataColumnType.STRING,
    parameters: [
      {
        key: 'mapping',
        type: 'textarea',
        label: 'Règles de correspondance',
        placeholder: '[10..12]:Valeur 1;[1,3,5]:Valeur 2',
      },
    ],
    handler: (value: any, params: Record<string, any>) => {
      if (value === null || value === undefined) return ''
      const numValue = Number(value)
      if (isNaN(numValue)) return value.toString()

      const mapping: string = params.mapping?.trim()
      if (!mapping) return value.toString()

      // Split by semicolon to get each rule
      const rules = mapping
        .split('\n')
        .map((rule: string) => rule.trim())
        .filter((rule: string) => rule.length > 0)

      for (const rule of rules) {
        const colonIndex = rule.indexOf(':')
        if (colonIndex === -1) continue

        const pattern = rule.substring(0, colonIndex).trim()
        const label = rule.substring(colonIndex + 1).trim()

        // Remove brackets
        const innerPattern = pattern.replace(/^\[|\]$/g, '').trim()

        // Split by comma to handle mixed patterns like [1..5,7,9..]
        const subPatterns = innerPattern.split(',').map((p: string) => p.trim())

        let matches = false
        for (const subPattern of subPatterns) {
          // Check if it's a range (contains dash)
          if (subPattern.includes('..')) {
            const parts = subPattern.split('..').map((p: string) => p.trim())
            if (parts.length === 2) {
              let min = Number.parseFloat(parts[0])
              if (isNaN(min)) min = -Infinity
              let max = Number.parseFloat(parts[1])
              if (isNaN(max)) max = Infinity

              if (numValue >= min && numValue <= max) {
                matches = true
                break
              }
            }
          } else {
            // It's a specific value
            const specificValue = Number(subPattern)
            if (!isNaN(specificValue) && specificValue === numValue) {
              matches = true
              break
            }
          }
        }

        if (matches) {
          return label
        }
      }

      // No match found, return original value
      return value.toString()
    },
  },
]

export const TRANSFORM_HANDLERS = new Map(
  TRANSFORM_DEFINITIONS.map((def) => [
    def.type,
    { handler: def.handler, outputType: def.outputType },
  ])
)

export const TRANSFORM_LABELS = new Map(TRANSFORM_DEFINITIONS.map((def) => [def.type, def.label]))

export function renderTransformedCellValue(
  column: DataColumnSchema,
  value: any,
  transforms: ReportViewColumnTransform[] | undefined,
  table?: Record<string, string>
): string {
  if (!transforms || transforms.length === 0) {
    return getCellDisplayValue(column, value)
  }

  let transformedValue = value
  let outputType: DataColumnType = column.type
  for (const transform of transforms) {
    const transformDef = TRANSFORM_HANDLERS.get(transform.type)
    if (transformDef) {
      // Extract parameters from the transform object (excluding 'type')
      const { type, ...params } = transform as any
      transformedValue = transformDef.handler(transformedValue, params, table)
      outputType = transformDef.outputType
    }
  }
  return getCellDisplayValue({ ...column, type: outputType }, transformedValue)
}
