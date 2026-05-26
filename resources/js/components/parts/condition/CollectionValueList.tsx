import type { LiteralValue } from '#common/condition_types'
import PlusIcon from 'lucide-solid/icons/plus'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import { createSignal, For, type Component } from 'solid-js'

export const CollectionValueList: Component<{
  values: LiteralValue[]
  onChange: (values: LiteralValue[]) => void
  class?: string
}> = (props) => {
  const [newValue, setNewValue] = createSignal('')

  const addValue = () => {
    const value = newValue().trim()
    if (value) {
      props.onChange([...props.values, value])
      setNewValue('')
    }
  }

  const removeValue = (index: number) => {
    props.onChange(props.values.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValue()
    }
  }

  return (
    <fieldset class={`border border-base-300 rounded-lg p-2 ${props.class || ''}`}>
      <legend class="text-xs px-1">Valeurs</legend>
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-1">
          <For each={props.values}>
            {(value, index) => (
              <div class="badge badge-soft gap-1">
                <span>{String(value)}</span>
                <button
                  class="btn btn-xs btn-circle btn-ghost h-4 w-4 min-h-0"
                  onClick={() => removeValue(index())}
                  title="Retirer"
                >
                  <Trash2Icon size={10} />
                </button>
              </div>
            )}
          </For>
        </div>
        <div class="flex gap-1">
          <input
            type="text"
            class="input input-sm input-bordered flex-1"
            placeholder="Nouvelle valeur..."
            value={newValue()}
            onInput={(e) => setNewValue(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
          />
          <button class="btn btn-sm btn-square btn-ghost" onClick={addValue} title="Ajouter">
            <PlusIcon size={16} />
          </button>
        </div>
      </div>
    </fieldset>
  )
}
