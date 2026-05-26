import type { Component } from 'solid-js'
import { createEffect, createSignal } from 'solid-js'

export const EditableSpan: Component<{
  value: string
  onChange?: (val: string) => void
  class?: string
}> = (props) => {
  const [editing, setEditing] = createSignal(false)
  const [val, setVal] = createSignal(props.value)

  const handleDblClick = () => {
    setEditing(true)
    setEditing(true)
    setTimeout(() => {
      const input = document.activeElement?.closest('*')?.querySelector('input')
      input?.focus()
    }, 0)
  }
  const handleBlur = () => {
    setEditing(false)
    props.onChange?.(val())
  }
  const handleInput = (e: Event) => setVal((e.target as HTMLInputElement).value)
  createEffect(() => {
    setVal(props.value)
  })

  return (
    <div class={props.class}>
      {editing() ? (
        <input value={val()} onInput={handleInput} onBlur={handleBlur} autofocus />
      ) : (
        <span ondblclick={handleDblClick}>{val()}</span>
      )}
    </div>
  )
}
