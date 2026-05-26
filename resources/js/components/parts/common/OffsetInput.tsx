import type { Component } from 'solid-js'

export const OffsetInput: Component<{
  value: number
  unit: string
  onValueChange: (val: number) => void
  onUnitChange: (unit: string) => void
  class?: string
}> = (props) => {
  return (
    <div class={props.class ?? 'flex gap-2'}>
      <input
        type="number"
        class="input w-24"
        value={props.value}
        min={0}
        onInput={(e) => props.onValueChange(Number(e.currentTarget.value))}
      />
      <select
        class="select flex-1"
        value={props.unit}
        onChange={(e) => props.onUnitChange(e.currentTarget.value)}
      >
        <option value="day">Jour(s)</option>
        <option value="month">Mois</option>
        <option value="year">Année(s)</option>
      </select>
    </div>
  )
}
