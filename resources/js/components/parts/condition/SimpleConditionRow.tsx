import type { DataColumnSchema } from '#common/api_types'
import {
  COLLECTION_OPERATORS,
  COMPARISON_OPERATORS,
  ConditionOperator,
  type CollectionCondition,
  type ComparisonCondition,
  type Condition,
  type ValueComparisonCondition,
} from '#common/condition_types'
import ArrowLeftRightIcon from 'lucide-solid/icons/arrow-left-right'
import { createMemo, Match, Show, Switch, type Component } from 'solid-js'
import { FormField } from '../common/Fieldset'
import { CollectionValueList } from './CollectionValueList'
import { ConditionActions } from './ConditionActions'
import { ValueField } from './ValueField'

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  [ConditionOperator.EQUALS]: 'Égal à',
  [ConditionOperator.NOT_EQUALS]: 'Différent de',
  [ConditionOperator.IN]: 'Dans',
  [ConditionOperator.NOT_IN]: 'Pas dans',
  [ConditionOperator.GREATER_THAN]: 'Plus grand que',
  [ConditionOperator.LESS_THAN]: 'Plus petit que',
  [ConditionOperator.AND]: 'ET',
  [ConditionOperator.OR]: 'OU',
}

// All non-logical operators
const ALL_OPERATORS = [...COMPARISON_OPERATORS, ...COLLECTION_OPERATORS]

export const SimpleConditionRow: Component<{
  condition: Condition
  onChange: (condition: Condition) => void
  onDelete: () => void
  onWrap?: (operator: ConditionOperator.AND | ConditionOperator.OR) => void
  columns: DataColumnSchema[]
}> = (props) => {
  const isValueMode = () => 'compareToValue' in props.condition
  const isCollectionOp = () => COLLECTION_OPERATORS.includes(props.condition.operator)

  const valueCond = createMemo(
    () => props.condition as ValueComparisonCondition | CollectionCondition
  )
  const comparisonCond = createMemo(() => props.condition as ComparisonCondition)

  const columnOptions = createMemo(() =>
    props.columns.map((c) => ({
      value: c.property,
      label: c.displayName,
    }))
  )

  const allOperatorOptions = createMemo(() =>
    ALL_OPERATORS.map((op) => ({
      value: op,
      label: OPERATOR_LABELS[op],
    }))
  )

  const comparisonOperatorOptions = createMemo(() =>
    COMPARISON_OPERATORS.map((op) => ({
      value: op,
      label: OPERATOR_LABELS[op],
    }))
  )

  const updateCompare = (compare: string | null) => {
    if (!compare) return
    props.onChange({
      ...props.condition,
      compare,
    } as any)
  }

  const updateOperator = (op: string | number | null) => {
    if (!op) return
    const operator = op as ConditionOperator
    const cond = props.condition as ValueComparisonCondition | CollectionCondition
    const isNewCollection = COLLECTION_OPERATORS.includes(operator)
    const wasCollection = isCollectionOp()

    if (isNewCollection && !wasCollection) {
      props.onChange({
        operator,
        compare: cond.compare,
        compareToValue: [],
      } as CollectionCondition)
    } else if (!isNewCollection && wasCollection) {
      props.onChange({
        operator,
        compare: cond.compare,
        compareToValue: '',
      } as ValueComparisonCondition)
    } else {
      props.onChange({
        ...props.condition,
        operator,
      } as any)
    }
  }

  const updateValue = (compareToValue: any) => {
    props.onChange({
      ...props.condition,
      compareToValue,
    } as any)
  }

  const updateCompareTo = (compareTo: string | null) => {
    if (!compareTo) return
    props.onChange({
      ...props.condition,
      compareTo,
    } as any)
  }

  const toggleComparisonMode = () => {
    if (isValueMode()) {
      // Switch to column comparison
      const valueCond = props.condition as ValueComparisonCondition | CollectionCondition
      props.onChange({
        operator: COMPARISON_OPERATORS.includes(valueCond.operator)
          ? valueCond.operator
          : ConditionOperator.EQUALS,
        compare: valueCond.compare,
        compareTo: props.columns[0]?.property || '',
      } as ComparisonCondition)
    } else {
      // Switch to value comparison
      const compCond = props.condition as ComparisonCondition
      props.onChange({
        operator: compCond.operator,
        compare: compCond.compare,
        compareToValue: '',
      } as ValueComparisonCondition)
    }
  }

  return (
    <div class="flex gap-2 items-end">
      <ConditionActions onWrap={props.onWrap} onDelete={props.onDelete} showWrap={!!props.onWrap} />

      <Switch>
        {/* Value comparison (column operator value/array) */}
        <Match when={isValueMode()}>
          <FormField
            legend="Colonne"
            type="select"
            value={valueCond().compare}
            onChange={updateCompare}
            options={columnOptions()}
            class="flex-1"
          />
          <FormField
            legend="Opérateur"
            type="select"
            value={valueCond().operator}
            onChange={updateOperator}
            options={allOperatorOptions()}
            class="flex-1"
          />
          <Show
            when={isCollectionOp()}
            fallback={
              <>
                <ValueField
                  column={valueCond().compare}
                  value={(valueCond() as ValueComparisonCondition).compareToValue}
                  onChange={updateValue}
                  columns={props.columns}
                  class="flex-1"
                />
                <button
                  class="btn btn-xs btn-square btn-ghost mb-2"
                  onClick={toggleComparisonMode}
                  title="Comparer à une colonne"
                >
                  <ArrowLeftRightIcon size={14} />
                </button>
              </>
            }
          >
            <CollectionValueList
              values={(valueCond() as CollectionCondition).compareToValue}
              onChange={updateValue}
              class="flex-1"
            />
          </Show>
        </Match>

        {/* Column comparison (column operator column) */}
        <Match when={!isValueMode()}>
          <FormField
            legend="Colonne 1"
            type="select"
            value={comparisonCond().compare}
            onChange={updateCompare}
            options={columnOptions()}
            class="flex-1"
          />
          <FormField
            legend="Opérateur"
            type="select"
            value={comparisonCond().operator}
            onChange={updateOperator}
            options={comparisonOperatorOptions()}
            class="flex-1"
          />
          <FormField
            legend="Colonne 2"
            type="select"
            value={comparisonCond().compareTo}
            onChange={updateCompareTo}
            options={columnOptions()}
            class="flex-1"
          />
          <button
            class="btn btn-xs btn-square btn-ghost mb-2"
            onClick={toggleComparisonMode}
            title="Comparer à une valeur"
          >
            <ArrowLeftRightIcon size={14} />
          </button>
        </Match>
      </Switch>
    </div>
  )
}
