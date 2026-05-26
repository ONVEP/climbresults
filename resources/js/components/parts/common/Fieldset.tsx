import { cn } from '#lib/utils'
import type { Component, JSX } from 'solid-js'
import { For, Match, Switch } from 'solid-js'

export const Fieldset: Component<{
  legend: string
  children: JSX.Element
  class?: string
}> = (props) => {
  return (
    <fieldset class={cn('fieldset', props.class)}>
      <legend class="text-sm font-semibold">{props.legend}</legend>
      {props.children}
    </fieldset>
  )
}

type FormFieldBaseProps = {
  legend: string
  class?: string
  required?: boolean
}

type FormFieldProps =
  | (FormFieldBaseProps & {
      type: 'text' | 'number' | 'password'
      value: string | number
      onChange: (value: string | number) => void
      placeholder?: string
    })
  | (FormFieldBaseProps & {
      type: 'date'
      value: string
      onChange: (value: string) => void
    })
  | (FormFieldBaseProps & {
      type: 'textarea'
      value: string
      onChange: (value: string) => void
      placeholder?: string
    })
  | (FormFieldBaseProps & {
      type: 'toggle'
      value: boolean
      onChange: (value: boolean) => void
    })
  | (FormFieldBaseProps & {
      type: 'select'
      value: string | null
      onChange: (value: string | null) => void
      options: Array<{ value: string | null; label: string }>
    })

export const FormField: Component<FormFieldProps> = (props) => {
  return (
    <fieldset class="fieldset" classList={{ [props.class || '']: !!props.class }}>
      <legend class="text-sm font-semibold">
        {props.legend}
        {props.required && <span class="text-error"> *</span>}
      </legend>
      <Switch>
        <Match when={props.type === 'toggle'}>
          <input
            type="checkbox"
            class="toggle toggle-sm m-2"
            checked={(props as Extract<FormFieldProps, { type: 'toggle' }>).value}
            onChange={(e) =>
              (props as Extract<FormFieldProps, { type: 'toggle' }>).onChange(
                e.currentTarget.checked
              )
            }
          />
        </Match>
        <Match when={props.type === 'select'}>
          <select
            class="select w-full"
            value={(props as Extract<FormFieldProps, { type: 'select' }>).value ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value || null
              ;(props as Extract<FormFieldProps, { type: 'select' }>).onChange(val)
            }}
          >
            <For each={(props as Extract<FormFieldProps, { type: 'select' }>).options}>
              {(option) => (
                <option
                  value={option.value ?? ''}
                  selected={
                    option.value === (props as Extract<FormFieldProps, { type: 'select' }>).value
                  }
                >
                  {option.label}
                </option>
              )}
            </For>
          </select>
        </Match>
        <Match when={props.type === 'date'}>
          <input
            type="date"
            class="input w-full"
            value={(props as Extract<FormFieldProps, { type: 'date' }>).value}
            onInput={(e) =>
              (props as Extract<FormFieldProps, { type: 'date' }>).onChange(e.currentTarget.value)
            }
          />
        </Match>
        <Match when={props.type === 'textarea'}>
          <textarea
            class="textarea w-full"
            value={(props as Extract<FormFieldProps, { type: 'textarea' }>).value}
            placeholder={(props as Extract<FormFieldProps, { type: 'textarea' }>).placeholder}
            onInput={(e) =>
              (props as Extract<FormFieldProps, { type: 'textarea' }>).onChange(
                e.currentTarget.value
              )
            }
          />
        </Match>
        <Match when={props.type === 'text' || props.type === 'number' || props.type === 'password'}>
          <input
            type={props.type as 'text' | 'number' | 'password'}
            class="input w-full"
            value={
              (props as Extract<FormFieldProps, { type: 'text' | 'number' | 'password' }>).value
            }
            placeholder={
              (props as Extract<FormFieldProps, { type: 'text' | 'number' | 'password' }>)
                .placeholder
            }
            onInput={(e) => {
              const val =
                props.type === 'number' ? parseFloat(e.currentTarget.value) : e.currentTarget.value
              ;(
                props as Extract<FormFieldProps, { type: 'text' | 'number' | 'password' }>
              ).onChange(val)
            }}
          />
        </Match>
      </Switch>
    </fieldset>
  )
}
