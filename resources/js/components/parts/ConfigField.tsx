import RotateCcwIcon from 'lucide-solid/icons/rotate-ccw'
import { Match, Switch, type Component } from 'solid-js'

type ConfigValue<T extends string | boolean | number = string | boolean | number> = {
  defaultValue: T
  value: T
  isModified: boolean
  isSecret?: boolean
}

type ConfigOptionDescription = {
  category: string
  name: string
  description: string
}

export const ConfigField: Component<{
  description: ConfigOptionDescription
  value: ConfigValue
  unsavedValue?: any
  onInputChange: (value: any) => void
  onReset: () => void
}> = (props) => {
  const isUnsaved = () => props.unsavedValue !== undefined
  const displayValue = () =>
    isUnsaved() ? (props.unsavedValue ?? props.value.defaultValue) : props.value.value

  return (
    <fieldset class="card bg-base-100 shadow-md">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2">
          <legend class="card-title text-lg">{props.description.name}</legend>
          <button
            classList={{
              'btn': true,
              'btn-circle': true,
              'btn-sm': true,
              'btn-error': isUnsaved() || props.value.isModified,
              'btn-ghost': !isUnsaved() && !props.value.isModified,
            }}
            disabled={!props.value.isModified && !isUnsaved()}
            title="Reset to default"
            onClick={props.onReset}
          >
            <RotateCcwIcon size={16} />
          </button>
        </div>
        <p class="text-sm text-base-content/70">{props.description.description}</p>
        <Switch>
          <Match when={typeof props.value.value === 'boolean'}>
            <input
              type="checkbox"
              classList={{
                'toggle': true,
                'toggle-warning': isUnsaved(),
                'toggle-primary': !isUnsaved() && props.value.isModified,
              }}
              checked={displayValue() as boolean}
              onChange={(e) => props.onInputChange(e.currentTarget.checked)}
            />
          </Match>
          <Match when={typeof props.value.value === 'number'}>
            <input
              type="number"
              value={displayValue() as number}
              classList={{
                'input': true,
                'input-bordered': true,
                'input-warning': isUnsaved(),
                'input-primary': !isUnsaved() && props.value.isModified,
                'w-full': true,
              }}
              onInput={(e) => props.onInputChange(parseFloat(e.currentTarget.value))}
            />
          </Match>
          <Match when={typeof props.value.value === 'string'}>
            <input
              type={props.value.isSecret ? 'password' : 'text'}
              value={displayValue() as string}
              classList={{
                'input': true,
                'input-bordered': true,
                'input-warning': isUnsaved(),
                'input-primary': !isUnsaved() && props.value.isModified,
                'w-full': true,
              }}
              onInput={(e) => props.onInputChange(e.currentTarget.value)}
            />
          </Match>
        </Switch>
      </div>
    </fieldset>
  )
}
