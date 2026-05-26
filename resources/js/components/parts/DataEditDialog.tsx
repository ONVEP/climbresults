import type { DataColumnSchema } from '#common/api_types'
import TrashIcon from 'lucide-solid/icons/trash-2'
import type { Component } from 'solid-js'
import { createEffect, createSignal, For, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { DataCellRenderer } from './data_renderers/DataCellRenderer'

export const DataEditDialog: Component<{
  title?: string
  data?: any
  columns: DataColumnSchema[]
  onClose?: (data?: Record<string, any>) => void
  onDelete?: () => void
}> = (props) => {
  const [data, setData] = createSignal(props.data || {})
  const handleInput = (property: string) => (value: any) => {
    setData({ ...data(), [property]: value })
  }

  createEffect(() => {
    setData(props.data || {})
  })

  const columns = () => props.columns.filter((col) => !col.readonly)

  return (
    <Show when={props.data !== null}>
      <Portal>
        <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-base-100 p-4 rounded shadow-lg min-w-1/3 max-w-[95dvw]">
            <div class="flex justify-between">
              <h2 class="text-xl mb-4">{props.title}</h2>

              <Show when={props.onDelete}>
                <button
                  class="btn btn-error btn-square btn-soft"
                  onClick={() => {
                    props.onDelete?.()
                    props.onClose?.()
                  }}
                >
                  <TrashIcon />
                </button>
              </Show>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <For each={columns()}>
                {(col) => (
                  <div class="form-control mb-2">
                    <label class="label">
                      <span class="label-text">{col.displayName}</span>
                    </label>
                    <DataCellRenderer
                      column={col}
                      value={data()[col.property]}
                      onChange={handleInput(col.property)}
                    />
                  </div>
                )}
              </For>
            </div>
            <div class="mt-4 flex justify-end">
              <button class="btn mr-2" onClick={() => props.onClose?.()}>
                Annuler
              </button>
              <button class="btn btn-primary" onClick={() => props.onClose?.(data())}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export default DataEditDialog
