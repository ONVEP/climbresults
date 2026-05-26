import type { DataColumnSchema } from '#common/api_types'
import { DataColumnType } from '#common/api_types'
import { DateTime } from 'luxon'
import type { Component } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { post, useModelSummaryQuery } from '../../lib/api'

const DataImportDialog: Component<{
  data?: string | null
  columns?: DataColumnSchema[] | null
  onClose?: () => void
}> = (props) => {
  const [headers, setHeaders] = createSignal<string[] | null>(null)

  const modelSummaries = createMemo(() => {
    const models = new Set<string>()
    props.columns?.forEach((col) => {
      if (col.type === DataColumnType.MODEL_REFERENCE && col.model) {
        models.add(col.model)
      }
    })
    return Array.from(models)
      .map((model) => ({ model, data: useModelSummaryQuery(model).data }))
      .reduce(
        (acc, curr) => ({ ...acc, [curr.model]: curr.data || [] }),
        {} as Record<string, any[]>
      )
  })

  const data = createMemo(() => {
    const raw = props.data
    if (typeof raw !== 'string') return
    const data = raw
      .split('\n')
      .map((line) => line.split('\t').map((cell) => cell.trim()))
      .filter((row) => row.length > 0 && row.some((cell) => cell.length > 0))
    const maxCols = data.reduce((acc, row) => (row.length > acc ? row.length : acc), 0)
    setHeaders(
      new Array(maxCols).fill('').map((_, i) => (props.columns ?? []).at(i)?.property || '')
    )
    if (data.length < 1 || maxCols < 2) return null
    return data
  })

  const parse = (raw: string, column: string) => {
    const colSchema = props.columns?.find((c) => c.property === column)
    const trimmed = raw.trim().replaceAll(/\r/gi, '')
    if (!colSchema) return trimmed
    switch (colSchema.type) {
      case DataColumnType.NUMBER:
        return parseInt(trimmed)
      case DataColumnType.BOOLEAN:
        return ['true', '1', 'yes', 'oui'].includes(trimmed.toLowerCase())
      case DataColumnType.DATE:
        return DateTime.fromFormat(trimmed, 'd-MM-yy').toISODate()
      case DataColumnType.MODEL_REFERENCE:
        const options = modelSummaries()[colSchema.model!] || []
        const match = options.find(
          (opt: { id: number; summary: string }) =>
            opt.summary === trimmed || (opt.id && opt.id.toString() === trimmed)
        )
        if (!match)
          console.warn(
            `No match found for model reference ${colSchema.model} with value ${trimmed}`,
            options
          )
        return match ? match.id : null
      default:
        return trimmed
    }
  }

  const handleConfirmImport = async () => {
    if (!data() || !headers()) return
    const rows = data()!.map((row) => {
      const obj: Record<string, any> = {}
      row.forEach((cell, i) => {
        if (headers()![i]) {
          obj[headers()![i]] = parse(cell, headers()![i])
        }
      })
      return obj
    })
    await post(`/api/data?model=${location.hash.slice(1)}`, rows)
    props.onClose?.()
  }

  return (
    <Show when={typeof props.data === 'string'}>
      <Portal>
        <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-base-100 p-4 rounded shadow-lg min-w-1/3 max-w-[95dvw]">
            <h2 class="text-xl mb-4">Importer des données</h2>
            <Show
              when={data()}
              fallback={
                <div role="alert" class="alert alert-error alert-soft">
                  <span>Aucun tableau détecté dans le presse-papiers</span>
                </div>
              }
            >
              <div class="max-h-[calc(100dvh-16rem)] overflow-auto">
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      {headers()?.map((_, i) => (
                        <th>
                          <select
                            class="select select-sm w-full"
                            value={headers()?.at(i)}
                            onChange={(e) => {
                              const newHeaders = headers()!.slice()
                              newHeaders[i] = e.currentTarget.value
                              setHeaders(newHeaders)
                            }}
                          >
                            <option value="">--</option>
                            <For each={props.columns}>
                              {(col) => <option value={col.property}>{col.displayName}</option>}
                            </For>
                          </select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data()?.map((row) => (
                      <tr class="hover:bg-base-200">
                        {row.map((cell, i) => (
                          <td>{headers() ? parse(cell, headers()![i]) : cell}</td>
                        ))}
                        {Array(headers()!.length - row.length)
                          .fill(null)
                          .map(() => (
                            <td></td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Show>
            <div class="mt-4 flex justify-end">
              <button class="btn mr-2" onClick={props.onClose}>
                Annuler
              </button>
              <button
                class="btn btn-primary"
                classList={{ 'btn-disabled': data() == null }}
                onClick={handleConfirmImport}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export default DataImportDialog
