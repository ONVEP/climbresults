import XIcon from 'lucide-solid/icons/x'
import { createMemo, createSignal, For, Show } from 'solid-js'

export type ChoiceOption = {
  value: string
  label: string
  disabled?: boolean
}

type ChoicesProps = {
  options: ChoiceOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  allowCustom?: boolean
  customPlaceholder?: string
  class?: string
}

export const Choices = (props: ChoicesProps) => {
  const [inputValue, setInputValue] = createSignal('')
  const [dropdownOpen, setDropdownOpen] = createSignal(false)

  const values = createMemo(() =>
    Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
  )

  const filteredOptions = createMemo(() => {
    const val = inputValue().toLowerCase()
    return props.options.filter(
      (opt: ChoiceOption) =>
        !values().includes(opt.value) &&
        (!val || opt.label.toLowerCase().includes(val) || opt.value.toLowerCase().includes(val))
    )
  })

  const handleSelect = (val: string) => {
    if (props.multiple) {
      if (!Array.isArray(props.value)) return
      if (!props.value.includes(val)) {
        props.onChange([...props.value, val])
      }
    } else {
      props.onChange(val)
      setDropdownOpen(false)
    }
    setInputValue('')
  }

  const handleRemove = (val: string) => {
    if (props.multiple && Array.isArray(props.value)) {
      props.onChange(props.value.filter((v: string) => v !== val))
    }
  }

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && inputValue().trim()) {
      e.preventDefault()
      const val = inputValue().trim()
      if (
        props.allowCustom &&
        (!props.options.some((o: ChoiceOption) => o.value === val) || !filteredOptions().length)
      ) {
        handleSelect(val)
      } else if (filteredOptions().length === 1) {
        handleSelect(filteredOptions()[0].value)
      }
    } else if (e.key === 'Backspace' && !inputValue() && props.multiple && values().length) {
      handleRemove(values()[values().length - 1])
    }
  }

  return (
    <div class={props.class} style={{ position: 'relative' }}>
      <div class="flex flex-wrap gap-1 mb-1">
        <Show when={props.multiple}>
          <For each={values()}>
            {(val: string) => (
              <span class="badge badge-primary gap-1">
                {props.options.find((o: ChoiceOption) => o.value === val)?.label || val}
                <button
                  type="button"
                  class="ml-1 btn btn-xs btn-circle btn-ghost"
                  onClick={() => handleRemove(val)}
                  tabIndex={-1}
                >
                  <XIcon size={12} />
                </button>
              </span>
            )}
          </For>
        </Show>
      </div>
      <div class="relative">
        <input
          type="text"
          class="input w-full"
          value={inputValue()}
          placeholder={props.customPlaceholder || 'Choisir...'}
          onInput={(e) => {
            setInputValue(e.currentTarget.value)
            setDropdownOpen(true)
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              const val = inputValue().trim()
              if (val) {
                if (
                  props.allowCustom &&
                  (!props.options.some((o: ChoiceOption) => o.value === val) ||
                    !filteredOptions().length)
                ) {
                  handleSelect(val)
                } else if (filteredOptions().length === 1) {
                  handleSelect(filteredOptions()[0].value)
                }
              }
              setDropdownOpen(false)
            }, 150)
          }}
          onKeyDown={handleInputKeyDown as any}
        />
        <Show
          when={
            dropdownOpen() &&
            (filteredOptions().length > 0 || (props.allowCustom && inputValue().trim()))
          }
        >
          <div class="absolute z-10 mt-1 w-full bg-base-100 border border-base-200 rounded shadow max-h-48 overflow-auto">
            <For each={filteredOptions()}>
              {(opt) => (
                <div
                  class={`px-3 py-2 cursor-pointer hover:bg-base-200 ${opt.disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  onMouseDown={() => !opt.disabled && handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              )}
            </For>
            <Show
              when={
                props.allowCustom &&
                inputValue().trim() &&
                !props.options.some((o: ChoiceOption) => o.value === inputValue().trim())
              }
            >
              <div
                class="px-3 py-2 cursor-pointer hover:bg-base-200 text-base-content/70"
                onMouseDown={() => handleSelect(inputValue().trim())}
              >
                Ajouter "{inputValue().trim()}"
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}
