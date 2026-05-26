import { DataColumnType } from '#common/api_types'
import type { Condition } from '#common/condition_types'
import { patch, queryClient, useApiItemQuery, useListQuery, useModelSchemaQuery } from '#lib/api'
import type ReportView from '#models/report_view'
import type { FormattingRule, ReportViewColumn } from '#models/report_view'
import FilterIcon from 'lucide-solid/icons/filter'
import PaletteIcon from 'lucide-solid/icons/palette'
import PlusIcon from 'lucide-solid/icons/plus'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
  type Component,
} from 'solid-js'
import { useEventBus } from '../../../lib/events'
import { EditableSpan } from '../common/EditableSpan'
import { ColumnTransformEditor } from './ColumnTransformEditor'
import { ConditionalFormattingDialog } from './ConditionalFormattingDialog'
import { FilterDialog } from './FilterDialog'

export const ViewConfig: Component<{ selectedView: number }> = (props) => {
  const eventBus = useEventBus()
  const models = useListQuery('models')
  const [selectedColumn, setSelectedColumn] = createSignal<string>('')
  const [selectedColumnIndex, setSelectedColumnIndex] = createSignal<number | null>(null)
  const [showFilterDialog, setShowFilterDialog] = createSignal(false)
  const [showFormattingDialog, setShowFormattingDialog] = createSignal(false)

  const reportView = createMemo(() =>
    useApiItemQuery<ReportView>('report_views', props.selectedView)
  )

  const selectedColumnData = createMemo(() => {
    const index = selectedColumnIndex()
    if (index === null) return null
    const columns = reportView().data?.columns
    if (!columns) return null
    return columns[index] || null
  })

  const currentModel = () => {
    return useModelSchemaQuery(reportView().data?.mainModel || null)
  }

  const referencedModels = createMemo(() => {
    const schema = currentModel().data || []
    const refModels: Record<string, typeof schema> = {}

    schema.forEach((column) => {
      if (column.type === DataColumnType.MODEL_REFERENCE && column.model) {
        if (!refModels[column.model]) {
          refModels[column.model] = useModelSchemaQuery(column.model).data || []
        }
      }
    })

    return refModels
  })

  const getColumnLabel = (column: ReportViewColumn) => {
    // Check if it's a referenced column (format: "Model.property")
    if (column.key.includes('.')) {
      const [modelName, propertyKey] = column.key.split('.', 2)
      const refSchema = referencedModels()[modelName]
      const schemaColumn = refSchema?.find((c) => c.property === propertyKey)
      return column.label ?? schemaColumn?.displayName ?? column.key
    }

    // Otherwise, check the main model
    const schemaColumn = currentModel().data?.find((c) => c.property === column.key)
    return column.label ?? schemaColumn?.displayName ?? column.key
  }

  const updateMainModel = (e: Event) => {
    const select = e.target as HTMLSelectElement
    const value = select.value === 'null' ? null : select.value
    patch(`/api/report_views/${props.selectedView}`, { mainModel: value, columns: [] }).then(() => {
      reportView().refetch()
    })
  }

  const editName = (val: string) => {
    patch(`/api/report_views/${props.selectedView}`, { name: val }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['report_views'] })
    })
  }

  const addColumn = () => {
    const key = selectedColumn()
    if (!key) return

    const columns = reportView().data?.columns || []
    const newColumns = [...columns, { key, width: 100 }]

    patch(`/api/report_views/${props.selectedView}`, { columns: newColumns }).then(() => {
      reportView().refetch()
      setSelectedColumn('')
    })
  }

  const removeColumn = (index: number) => {
    const columns = reportView().data?.columns || []
    const newColumns = columns.filter((_, i) => i !== index)

    patch(`/api/report_views/${props.selectedView}`, { columns: newColumns }).then(() => {
      reportView().refetch()
    })
  }

  const updateColumnLabel = (index: number, label: string) => {
    const columns = reportView().data?.columns || []
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], label: label || undefined }

    patch(`/api/report_views/${props.selectedView}`, { columns: newColumns }).then(() => {
      reportView().refetch()
    })
  }

  createEffect(() => {
    const unsubscribe = eventBus.subscribe('report:column-drop', (data) => {
      const columns = reportView().data?.columns || []
      const newColumns = [...columns]
      newColumns.splice(data.position, 0, { key: data.columnKey, width: 100 })

      patch(`/api/report_views/${props.selectedView}`, { columns: newColumns }).then(() => {
        reportView().refetch()
      })
    })
    onCleanup(unsubscribe)
  })

  return (
    <div class="flex flex-col gap-4">
      <EditableSpan
        value={reportView().data?.name || ' '}
        onChange={editName}
        class="font-bold text-lg"
      />
      <select
        class="select"
        onChange={updateMainModel}
        value={reportView().data?.mainModel ?? 'null'}
      >
        <option disabled value="null">
          Choisir les données
        </option>
        <For each={models.data}>{(model) => <option value={model.name}>{model.label}</option>}</For>
      </select>
      <Show when={(currentModel().data?.length || 0) > 0}>
        <div class="flex gap-2">
          <button type="button" class="btn btn-sm" onClick={() => setShowFilterDialog(true)}>
            <FilterIcon size={16} />
            Filtrer les données
          </button>
          <button type="button" class="btn btn-sm" onClick={() => setShowFormattingDialog(true)}>
            <PaletteIcon size={16} />
            Mise en forme
          </button>
        </div>
      </Show>
      <Show when={(currentModel().data?.length || 0) > 0}>
        <div>
          <h3 class="text-md font-semibold">Colonnes</h3>
          <ul class="mb-2">
            <For each={reportView().data?.columns || []}>
              {(column, index) => (
                <li
                  class="flex flex-row items-center justify-between hover:bg-base-200 px-2 py-1 rounded cursor-pointer"
                  classList={{ 'bg-base-200': selectedColumnIndex() === index() }}
                  onClick={() => setSelectedColumnIndex(index())}
                >
                  <EditableSpan
                    value={getColumnLabel(column)}
                    onChange={(val) => updateColumnLabel(index(), val)}
                  />
                  <button
                    type="button"
                    class="btn btn-xs btn-square btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeColumn(index())
                      setSelectedColumnIndex(null)
                    }}
                  >
                    <Trash2Icon size={14} />
                  </button>
                </li>
              )}
            </For>
          </ul>
          <div class="flex gap-2">
            <select
              class="select select-sm flex-1"
              value={selectedColumn()}
              onChange={(e) => setSelectedColumn(e.currentTarget.value)}
            >
              <option value="">Ajouter une colonne...</option>
              <For each={currentModel().data || []}>
                {(column) => (
                  <option
                    value={column.property}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer!.effectAllowed = 'copy'
                      e.dataTransfer!.setData('text/plain', column.property)
                      eventBus.emit('report:column-drag-start', {
                        columnKey: column.property,
                        columnLabel: column.displayName,
                      })
                    }}
                    onDragEnd={() => {
                      eventBus.emit('report:column-drag-end', undefined)
                    }}
                  >
                    {column.displayName}
                  </option>
                )}
              </For>
              <For each={Object.entries(referencedModels())}>
                {([modelName, columns]) => (
                  <optgroup label={modelName}>
                    <For each={columns}>
                      {(column) => {
                        const compositeKey = `${modelName}.${column.property}`
                        return (
                          <option
                            value={compositeKey}
                            draggable="true"
                            onDragStart={(e) => {
                              e.dataTransfer!.effectAllowed = 'copy'
                              e.dataTransfer!.setData('text/plain', compositeKey)
                              eventBus.emit('report:column-drag-start', {
                                columnKey: compositeKey,
                                columnLabel: column.displayName,
                              })
                            }}
                            onDragEnd={() => {
                              eventBus.emit('report:column-drag-end', undefined)
                            }}
                          >
                            {column.displayName}
                          </option>
                        )
                      }}
                    </For>
                  </optgroup>
                )}
              </For>
            </select>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              onClick={addColumn}
              disabled={!selectedColumn()}
            >
              <PlusIcon size={16} />
              Ajouter
            </button>
          </div>
        </div>
        <Show when={selectedColumnData() && selectedColumnIndex() !== null}>
          <ColumnTransformEditor
            columns={reportView().data?.columns || []}
            columnIndex={selectedColumnIndex()!}
            columnLabel={getColumnLabel(selectedColumnData()!)}
            viewId={props.selectedView}
            mainModel={reportView().data?.mainModel || null}
            onUpdate={() => reportView().refetch()}
          />
        </Show>
      </Show>

      <Show when={showFilterDialog()}>
        {(() => {
          const columns = currentModel().data || []
          return (
            <FilterDialog
              viewId={props.selectedView}
              filter={(reportView().data?.filters as any as Condition) || null}
              columns={columns}
              onClose={() => setShowFilterDialog(false)}
              onSaved={() => reportView().refetch()}
            />
          )
        })()}
      </Show>

      <Show when={showFormattingDialog()}>
        {(() => {
          const columns = currentModel().data || []
          return (
            <ConditionalFormattingDialog
              viewId={props.selectedView}
              formatting={(reportView().data?.formatting as any as FormattingRule[]) || null}
              columns={columns}
              onClose={() => setShowFormattingDialog(false)}
              onSaved={() => reportView().refetch()}
            />
          )
        })()}
      </Show>
    </div>
  )
}
