import type { DataColumnSchema } from '#common/api_types'
import {
  ConditionOperator,
  type AndCondition,
  type Condition,
  type OrCondition,
} from '#common/condition_types'
import PlusIcon from 'lucide-solid/icons/plus'
import { createMemo, Index, Match, Show, Switch, type Component } from 'solid-js'
import { ConditionActions } from './condition/ConditionActions'
import { SimpleConditionRow } from './condition/SimpleConditionRow'

export const ConditionEditor: Component<{
  condition: Condition | null
  onChange: (condition: Condition | null) => void
  columns: DataColumnSchema[]
  depth?: number
}> = (props) => {
  const depth = () => props.depth ?? 0
  const isLogical = createMemo(
    () =>
      props.condition &&
      (props.condition.operator === ConditionOperator.AND ||
        props.condition.operator === ConditionOperator.OR)
  )

  const addCondition = () => {
    if (!props.condition) {
      props.onChange({
        operator: ConditionOperator.EQUALS,
        compare: props.columns[0]?.property || '',
        compareToValue: '',
      })
    } else if (isLogical()) {
      const logical = props.condition as AndCondition | OrCondition
      props.onChange({
        ...logical,
        conditions: [
          ...logical.conditions,
          {
            operator: ConditionOperator.EQUALS,
            compare: props.columns[0]?.property || '',
            compareToValue: '',
          },
        ],
      })
    }
  }

  const removeCondition = (index: number) => {
    if (isLogical()) {
      const logical = props.condition as AndCondition | OrCondition
      const newConditions = logical.conditions.filter((_, i) => i !== index)
      if (newConditions.length === 0) {
        props.onChange(null)
      } else if (newConditions.length === 1) {
        // Unwrap if only one condition left
        props.onChange(newConditions[0])
      } else {
        props.onChange({ ...logical, conditions: newConditions })
      }
    }
  }

  const updateCondition = (index: number, newCondition: Condition) => {
    if (isLogical()) {
      const logical = props.condition as AndCondition | OrCondition
      const newConditions = [...logical.conditions]
      newConditions[index] = newCondition
      props.onChange({ ...logical, conditions: newConditions })
    }
  }

  const wrapInLogical = (operator: ConditionOperator.AND | ConditionOperator.OR) => {
    if (props.condition && !isLogical()) {
      props.onChange({
        operator,
        conditions: [
          props.condition,
          {
            operator: ConditionOperator.EQUALS,
            compare: props.columns[0]?.property || '',
            compareToValue: '',
          },
        ],
      })
    } else if (isLogical()) {
      // Wrap the entire logical group in another logical operator
      props.onChange({
        operator,
        conditions: [
          props.condition!,
          {
            operator: ConditionOperator.EQUALS,
            compare: props.columns[0]?.property || '',
            compareToValue: '',
          },
        ],
      })
    }
  }

  const deleteCondition = () => {
    props.onChange(null)
  }

  return (
    <div
      class="border border-base-300 rounded p-3"
      classList={{ 'ml-4': depth() > 0, 'bg-base-100': depth() % 2 === 0 }}
    >
      <Show
        when={props.condition}
        fallback={
          <button class="btn btn-sm btn-primary" onClick={addCondition}>
            <PlusIcon size={16} />
            Ajouter une condition
          </button>
        }
      >
        <Switch>
          <Match when={isLogical()}>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-soft badge-secondary">
                  {props.condition!.operator === ConditionOperator.AND ? 'ET' : 'OU'}
                </span>
                <ConditionActions
                  onWrap={wrapInLogical}
                  onDelete={deleteCondition}
                  showWrap={depth() === 0}
                  horizontal
                />
              </div>
              <Index each={(props.condition as AndCondition | OrCondition).conditions}>
                {(subCondition, index) => (
                  <ConditionEditor
                    condition={subCondition()}
                    onChange={(newCond) =>
                      newCond ? updateCondition(index, newCond) : removeCondition(index)
                    }
                    columns={props.columns}
                    depth={depth() + 1}
                  />
                )}
              </Index>
              <button class="btn btn-sm btn-ghost w-fit" onClick={addCondition}>
                <PlusIcon size={16} />
                Ajouter une condition
              </button>
            </div>
          </Match>

          <Match when={!isLogical()}>
            <SimpleConditionRow
              condition={props.condition!}
              onChange={props.onChange}
              onDelete={() => props.onChange(null)}
              onWrap={wrapInLogical}
              columns={props.columns}
            />
          </Match>
        </Switch>
      </Show>
    </div>
  )
}
