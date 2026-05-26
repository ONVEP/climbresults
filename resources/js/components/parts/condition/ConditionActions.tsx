import { ConditionOperator } from '#common/condition_types'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import WrapTextIcon from 'lucide-solid/icons/wrap-text'
import type { Component } from 'solid-js'

export const ConditionActions: Component<{
  onWrap?: (operator: ConditionOperator.AND | ConditionOperator.OR) => void
  onDelete: () => void
  showWrap?: boolean
  horizontal?: boolean
}> = (props) => {
  return (
    <div class="flex gap-1" classList={{ 'flex-col': props.horizontal !== true }}>
      {props.showWrap !== false && props.onWrap && (
        <div class="dropdown dropdown-right">
          <button tabindex="0" class="btn btn-xs btn-square btn-ghost" title="Grouper avec...">
            <WrapTextIcon size={14} />
          </button>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow border border-base-300"
          >
            <li>
              <a onClick={() => props.onWrap?.(ConditionOperator.AND)}>ET</a>
            </li>
            <li>
              <a onClick={() => props.onWrap?.(ConditionOperator.OR)}>OU</a>
            </li>
          </ul>
        </div>
      )}
      <button
        class="btn btn-xs btn-square btn-ghost text-error"
        onClick={props.onDelete}
        title="Supprimer"
      >
        <Trash2Icon size={14} />
      </button>
    </div>
  )
}
