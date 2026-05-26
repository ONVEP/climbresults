import PlusIcon from 'lucide-solid/icons/plus'
import XIcon from 'lucide-solid/icons/x'
import type { Component, ParentProps } from 'solid-js'
import { For } from 'solid-js'

type KeyValue = { key: any; value: any }

const CollectionSelector: Component<
  ParentProps<{
    collection: KeyValue[]
    choices: KeyValue[]
    onAddItem?: (item: KeyValue) => void
    onRemoveItem?: (item: KeyValue) => void
  }>
> = (props) => {
  return (
    <div>
      <h3 class="text-lg font-semibold">{props.children}</h3>
      <div class="flex flex-col gap-2 my-2 items-stretch">
        <For each={props.collection}>
          {(user: any) => (
            <div class="bg-base-content/10 flex justify-between items-center gap-2 px-2 rounded-sm">
              {user.value}{' '}
              <XIcon
                onClick={() => {
                  props.onRemoveItem && props.onRemoveItem(user)
                }}
                class="inline size-4 hover:bg-base-300 rounded-full"
              />
            </div>
          )}
        </For>
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-sm btn-primary w-full">
            <PlusIcon class="size-4" />
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <For each={props.choices}>
              {(choice) => (
                <li>
                  <a
                    onClick={() => {
                      props.onAddItem && props.onAddItem(choice)
                    }}
                  >
                    {choice.value}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CollectionSelector
