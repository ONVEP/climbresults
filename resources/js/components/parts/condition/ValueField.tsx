import { DataColumnType, type DataColumnSchema } from '#common/api_types'
import type { LiteralValue } from '#common/condition_types'
import { Match, Switch, type Component } from 'solid-js'
import { FormField } from '../common/Fieldset'

export const ValueField: Component<{
  column: string
  value: LiteralValue
  onChange: (value: LiteralValue) => void
  columns: DataColumnSchema[]
  class?: string
}> = (props) => {
  const columnType = () => props.columns.find((c) => c.property === props.column)?.type

  return (
    <Switch>
      <Match when={columnType() === DataColumnType.BOOLEAN}>
        <FormField
          legend="Valeur"
          type="toggle"
          value={Boolean(props.value)}
          onChange={(val) => props.onChange(val)}
          class={props.class}
        />
      </Match>
      <Match when={columnType() === DataColumnType.NUMBER}>
        <FormField
          legend="Valeur"
          type="number"
          value={Number(props.value) || 0}
          onChange={(val) => props.onChange(Number(val))}
          class={props.class}
        />
      </Match>
      <Match when={columnType() === DataColumnType.DATE}>
        <FormField
          legend="Valeur"
          type="date"
          value={String(props.value) || ''}
          onChange={(val) => props.onChange(String(val))}
          class={props.class}
        />
      </Match>
      <Match when={columnType() === DataColumnType.PATH}>
        <FormField
          legend="Valeur"
          type="text"
          value={String(props.value) || ''}
          onChange={(val) => props.onChange(String(val))}
          class={props.class}
        />
      </Match>
      <Match when={true}>
        <FormField
          legend="Valeur"
          type="text"
          value={String(props.value)}
          onChange={(val) => props.onChange(String(val))}
          class={props.class}
        />
      </Match>
    </Switch>
  )
}
