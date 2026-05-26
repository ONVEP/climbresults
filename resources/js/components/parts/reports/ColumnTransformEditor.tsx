import type { DataColumnType } from '#common/api_types'
import { patch, useApiCollectionQuery, useModelSchemaQuery } from '#lib/api'
import { TRANSFORM_DEFINITIONS, TRANSFORM_LABELS } from '#lib/data_rendering'
import type { ReportViewColumn, ReportViewColumnTransform } from '#models/report_view'
import PencilIcon from 'lucide-solid/icons/pencil'
import PlusIcon from 'lucide-solid/icons/plus'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import XIcon from 'lucide-solid/icons/x'
import { createMemo, createSignal, For, Match, Show, Switch, type Component } from 'solid-js'

export const ColumnTransformEditor: Component<{
  columns: ReportViewColumn[]
  columnIndex: number
  columnLabel: string
  viewId: number
  mainModel: string | null
  onUpdate: () => void
}> = (props) => {
  const translationTables = useApiCollectionQuery<{ id: number; name: string }>('correspondances')
  const modelSchema = useModelSchemaQuery(props.mainModel)
  const [selectedTransformType, setSelectedTransformType] = createSignal<string>('')
  const [transformParams, setTransformParams] = createSignal<Record<string, any>>({})
  const [editingTransformIndex, setEditingTransformIndex] = createSignal<number | null>(null)

  const column = () => props.columns[props.columnIndex]

  const getColumnDataType = (): DataColumnType | 'any' => {
    const schemaColumn = modelSchema.data?.find((c) => c.property === column().key)
    if (!schemaColumn) return 'any'
    return schemaColumn.type
  }

  const getCurrentOutputType = (): DataColumnType | 'any' => {
    const transforms = column().transform
    if (!transforms || transforms.length === 0) {
      return getColumnDataType()
    }

    // Get the output type of the last transform
    const lastTransform = transforms[transforms.length - 1]
    const transformDef = TRANSFORM_DEFINITIONS.find((def) => def.type === lastTransform.type)
    return transformDef?.outputType || 'any'
  }

  const availableTransforms = createMemo(() => {
    const currentType = getCurrentOutputType()
    return TRANSFORM_DEFINITIONS.filter((def) => {
      return def.inputType === 'any' || currentType === 'any' || def.inputType === currentType
    })
  })

  const selectedTransformDef = createMemo(() => {
    const type = selectedTransformType()
    if (!type) return null
    return TRANSFORM_DEFINITIONS.find((def) => def.type === type) || null
  })

  const canAddTransform = createMemo(() => {
    const def = selectedTransformDef()
    if (!def) return false
    if (!def.parameters) return true
    // Check if all required text parameters have values
    const params = transformParams()
    return def.parameters
      .filter((param) => param.type !== 'checkbox')
      .every((param) => params[param.key]?.toString().trim())
  })

  const handleAddTransform = () => {
    const type = selectedTransformType()
    if (!type) return

    const def = selectedTransformDef()
    const params = { ...transformParams() }

    // Set default values for checkbox parameters not explicitly set
    if (def?.parameters) {
      def.parameters.forEach((param) => {
        if (param.type === 'checkbox' && params[param.key] === undefined) {
          params[param.key] = param.defaultValue ?? false
        }
      })
    }

    const editIndex = editingTransformIndex()
    if (editIndex !== null) {
      updateTransform(editIndex, params)
    } else {
      addTransform(type as ReportViewColumnTransform['type'], params)
    }
  }

  const addTransform = (
    type: ReportViewColumnTransform['type'],
    params: Record<string, any> = {}
  ) => {
    const currentTransforms = column().transform || []
    const newTransform = { type, ...params } as ReportViewColumnTransform

    const newColumns = [...props.columns]
    newColumns[props.columnIndex] = {
      ...column(),
      transform: [...currentTransforms, newTransform],
    }

    patch(`/api/report_views/${props.viewId}`, { columns: newColumns }).then(() => {
      props.onUpdate()
      setSelectedTransformType('')
      setTransformParams({})
    })
  }

  const editTransform = (transformIndex: number) => {
    const transform = column().transform?.[transformIndex]
    if (!transform) return

    setEditingTransformIndex(transformIndex)
    setSelectedTransformType(transform.type)

    // Extract parameters from transform (exclude 'type')
    const { type, ...params } = transform
    setTransformParams(params)
  }

  const cancelEdit = () => {
    setEditingTransformIndex(null)
    setSelectedTransformType('')
    setTransformParams({})
  }

  const updateTransform = (transformIndex: number, params: Record<string, any>) => {
    const currentTransforms = column().transform || []
    const type = selectedTransformType() as ReportViewColumnTransform['type']
    const updatedTransform = { type, ...params } as ReportViewColumnTransform

    const newColumns = [...props.columns]
    newColumns[props.columnIndex] = {
      ...column(),
      transform: currentTransforms.map((t, i) => (i === transformIndex ? updatedTransform : t)),
    }

    patch(`/api/report_views/${props.viewId}`, { columns: newColumns }).then(() => {
      props.onUpdate()
      cancelEdit()
    })
  }

  const removeTransform = (transformIndex: number) => {
    const currentTransforms = column().transform || []
    const newColumns = [...props.columns]
    newColumns[props.columnIndex] = {
      ...column(),
      transform: currentTransforms.filter((_, i) => i !== transformIndex),
    }

    patch(`/api/report_views/${props.viewId}`, { columns: newColumns }).then(() => {
      props.onUpdate()
    })
  }

  return (
    <fieldset class="border border-base-300 rounded p-3">
      <legend class="text-sm font-semibold px-2">{props.columnLabel}</legend>
      <div class="flex flex-col gap-2">
        <div class="text-sm">
          <h4 class="font-semibold mb-1">Transformations appliquées</h4>
          <Show
            when={column().transform?.length}
            fallback={<p class="italic text-base-content/70">Aucune transformation</p>}
          >
            <ul class="space-y-1">
              <For each={column().transform}>
                {(transform, idx) => (
                  <li class="flex items-center justify-between bg-base-200 px-2 py-1 rounded">
                    <span>
                      {TRANSFORM_LABELS.get(transform.type)}
                      {transform.type === 'date_format' && ` (${transform.format})`}
                    </span>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        class="btn btn-xs btn-square btn-ghost"
                        onClick={() => editTransform(idx())}
                        title="Modifier"
                      >
                        <PencilIcon size={12} />
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-square btn-ghost"
                        onClick={() => removeTransform(idx())}
                        title="Supprimer"
                      >
                        <Trash2Icon size={12} />
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
        <div class="divider my-0" />
        <div class="text-sm">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-semibold">
              {editingTransformIndex() !== null
                ? 'Modifier la transformation'
                : 'Ajouter une transformation'}
            </h4>
            <Show when={editingTransformIndex() !== null}>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-circle"
                onClick={cancelEdit}
                title="Annuler"
              >
                <XIcon size={14} />
              </button>
            </Show>
          </div>
          <div class="flex flex-col gap-2">
            <Show when={editingTransformIndex() === null}>
              <select
                class="select select-sm"
                value={selectedTransformType()}
                onChange={(e) => {
                  const newType = e.currentTarget.value
                  setSelectedTransformType(newType)

                  // Initialize params with default values
                  const def = TRANSFORM_DEFINITIONS.find((d) => d.type === newType)
                  const defaultParams: Record<string, any> = {}
                  if (def?.parameters) {
                    def.parameters.forEach((param) => {
                      if (param.defaultValue !== undefined) {
                        defaultParams[param.key] = param.defaultValue
                      }
                    })
                  }
                  setTransformParams(defaultParams)
                }}
              >
                <option value="">Choisir une transformation...</option>
                <For each={availableTransforms()}>
                  {(transformDef) => (
                    <option value={transformDef.type}>{transformDef.label}</option>
                  )}
                </For>
              </select>
            </Show>
            <Show when={selectedTransformDef()?.parameters}>
              <For each={selectedTransformDef()!.parameters}>
                {(param) => (
                  <div class="flex flex-col gap-1">
                    <Switch>
                      <Match when={param.type === 'checkbox'}>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            class="checkbox checkbox-sm"
                            checked={
                              transformParams()[param.key] !== undefined
                                ? transformParams()[param.key]
                                : param.defaultValue
                            }
                            onChange={(e) =>
                              setTransformParams({
                                ...transformParams(),
                                [param.key]: e.currentTarget.checked,
                              })
                            }
                          />
                          <span class="text-sm">{param.label}</span>
                        </label>
                      </Match>
                      <Match when={param.type === 'select'}>
                        <label class="text-xs font-medium">{param.label}</label>
                        <select
                          class="select select-sm"
                          value={
                            transformParams()[param.key] !== undefined
                              ? transformParams()[param.key]
                              : param.defaultValue || ''
                          }
                          onChange={(e) =>
                            setTransformParams({
                              ...transformParams(),
                              [param.key]: e.currentTarget.value,
                            })
                          }
                        >
                          <Show when={param.defaultValue === undefined}>
                            <option value="">{param.placeholder || 'Sélectionner...'}</option>
                          </Show>
                          <Show when={param.optionsSource === 'translation_tables'}>
                            <For each={translationTables.data || []}>
                              {(table) => <option value={table.id.toString()}>{table.name}</option>}
                            </For>
                          </Show>
                          <Show when={param.options}>
                            <For each={param.options}>
                              {(option) => <option value={option.value}>{option.label}</option>}
                            </For>
                          </Show>
                        </select>
                      </Match>
                      <Match when={param.type === 'textarea'}>
                        <label class="text-xs font-medium">{param.label}</label>
                        <textarea
                          class="textarea textarea-sm"
                          placeholder={param.placeholder}
                          rows={3}
                          value={
                            transformParams()[param.key] !== undefined
                              ? transformParams()[param.key]
                              : param.defaultValue || ''
                          }
                          onInput={(e) =>
                            setTransformParams({
                              ...transformParams(),
                              [param.key]: e.currentTarget.value,
                            })
                          }
                        />
                      </Match>
                      <Match when={true}>
                        <label class="text-xs font-medium">{param.label}</label>
                        <input
                          type="text"
                          class="input input-sm"
                          placeholder={param.placeholder}
                          value={
                            transformParams()[param.key] !== undefined
                              ? transformParams()[param.key]
                              : param.defaultValue || ''
                          }
                          onInput={(e) =>
                            setTransformParams({
                              ...transformParams(),
                              [param.key]: e.currentTarget.value,
                            })
                          }
                        />
                      </Match>
                    </Switch>
                  </div>
                )}
              </For>
            </Show>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              onClick={handleAddTransform}
              disabled={!canAddTransform()}
            >
              {editingTransformIndex() !== null ? (
                <>
                  <PencilIcon size={14} />
                  Mettre à jour
                </>
              ) : (
                <>
                  <PlusIcon size={14} />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
