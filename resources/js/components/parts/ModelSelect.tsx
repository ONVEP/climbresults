import type { Component, JSX } from 'solid-js'
import { createMemo, For, Show } from 'solid-js'
import { useModelSummaryQuery } from '../../lib/api'

export const ModelSelect: Component<{
  model: string
  value?: string
  onChange?: (newVal: string) => void
  onBlur?: JSX.FocusEventHandlerUnion<HTMLSelectElement, FocusEvent>
  readonly?: boolean
}> = (props) => {
  const options = createMemo(() => useModelSummaryQuery(props.model))
  const getCurrentValue = () => {
    const option = options().data?.find((item: any) => item.id === props.value)
    return option ? option.summary || option.id : props.value || ''
  }

  return (
    <Show when={!props.readonly} fallback={<span>{getCurrentValue()}</span>}>
      <select
        class="select select-sm select-bordered w-full"
        value={props.value || ''}
        onChange={(e) => props.onChange?.(e.currentTarget.value)}
        onBlur={props.onBlur}
      >
        <option value="">-- Sélectionner --</option>
        <For each={options().data}>
          {(item: any) => <option value={item.id}>{item.summary || item.id}</option>}
        </For>
      </select>
    </Show>
  )
}
