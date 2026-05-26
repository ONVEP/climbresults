import type { DataColumnSchema } from '#common/api_types'
import { DataColumnType } from '#common/api_types'
import { useApiItemQuery } from '#lib/api'
import { renderTransformedCellValue } from '#lib/data_rendering'
import type { ReportViewColumnTransform } from '#models/report_view'
import { DateTime } from 'luxon'
import type { Component, JSX } from 'solid-js'
import { Match, Show, Switch, createMemo } from 'solid-js'
import { ModelSelect } from '../ModelSelect'

export const DataCellRenderer: Component<{
  column: DataColumnSchema
  value: any
  readonly?: boolean
  onChange?: (newVal: any) => void
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement | HTMLSelectElement, FocusEvent>
  transforms?: ReportViewColumnTransform[]
}> = (props) => {
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    props.onChange?.(target.value)
  }

  // Extract tableId from correspondance transform if present
  const tableId = createMemo(() => {
    const correspondanceTransform = props.transforms?.find((t) => t.type === 'correspondance')
    return (correspondanceTransform as any)?.tableId
  })

  // Fetch translation table data if needed
  const tableQuery = useApiItemQuery('correspondances', tableId())

  const displayValue = () =>
    renderTransformedCellValue(
      props.column,
      props.value,
      props.transforms,
      tableQuery.data?.table ?? {}
    )

  return (
    <Switch fallback={displayValue()}>
      <Match
        when={
          props.column.type === DataColumnType.STRING || props.column.type === DataColumnType.PATH
        }
      >
        <Show when={!props.readonly} fallback={displayValue()}>
          <input
            type="text"
            class="input input-sm input-bordered w-full"
            name={props.column.property}
            value={props.value || ''}
            onInput={handleInput}
            onBlur={props.onBlur}
          />
        </Show>
      </Match>
      <Match when={props.column.type === DataColumnType.NUMBER}>
        <Show when={!props.readonly} fallback={displayValue()}>
          <input
            type="number"
            class="input input-sm input-bordered w-full"
            name={props.column.property}
            value={props.value || ''}
            onInput={handleInput}
            onBlur={props.onBlur}
          />
        </Show>
      </Match>
      <Match when={props.column.type === DataColumnType.BOOLEAN}>
        <Show when={!props.readonly} fallback={displayValue()}>
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            name={props.column.property}
            checked={!!props.value}
            onInput={(e) => props.onChange?.((e.target as HTMLInputElement).checked)}
            onBlur={props.onBlur}
          />
        </Show>
      </Match>
      <Match when={props.column.type === DataColumnType.DATE}>
        <Show when={!props.readonly} fallback={displayValue()}>
          <input
            type="date"
            class="input input-sm input-bordered w-full"
            name={props.column.property}
            value={props.value ? DateTime.fromISO(props.value).toFormat('yyyy-MM-dd') : ''}
            onInput={handleInput}
            onBlur={props.onBlur}
          />
        </Show>
      </Match>
      <Match when={props.column.type === DataColumnType.MODEL_REFERENCE}>
        <ModelSelect
          model={props.column.model!}
          value={props.value}
          readonly={props.readonly}
          onChange={props.onChange}
          onBlur={props.onBlur}
        />
      </Match>
    </Switch>
  )
}
