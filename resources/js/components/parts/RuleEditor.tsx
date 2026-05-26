import type { DataColumnSchema } from '#common/api_types'
import { RuleType } from '#common/api_types'
import type { Condition } from '#common/condition_types'
import type Rule from '#models/rule'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import type { Component } from 'solid-js'
import { createMemo, createSignal } from 'solid-js'
import { patch, useListQuery } from '../../lib/api'
import { ConditionEditor } from './ConditionEditor'
import { FormField } from './common/Fieldset'

const RULE_TYPES: Record<RuleType, { label: string; class: string }> = {
  [RuleType.ALLOW_READ]: { label: 'Lecture', class: 'badge-info' },
  [RuleType.ALLOW_WRITE]: { label: 'Écriture', class: 'badge-warning' },
  [RuleType.REQUIRED]: { label: 'Obligatoire', class: 'badge-accent' },
  [RuleType.RESTRICT_VALUES]: { label: 'Choix', class: 'badge-secondary' },
  [RuleType.SUGGEST_VALUES]: { label: 'Suggestion', class: 'badge-secondary' },
}

export const RuleEditor: Component<{ rule: Rule; onDelete?: () => void }> = (props) => {
  const models = useListQuery('models')

  const [rule, setRule] = createSignal(props.rule)
  const ruleType = () => RULE_TYPES[rule().type]
  const modelColumns = createMemo(() => {
    return useListQuery<DataColumnSchema>(
      rule().targetModel ? 'models/' + rule().targetModel + '/columns' : null
    )
  })

  const editRule = (r: Partial<Rule>) => {
    patch(`/api/rules/${rule().id}/`, r).then((res) => setRule(res as Rule))
  }

  const columnName = (property: string | null) => {
    return modelColumns().data?.find((c) => c.property === property)?.displayName ?? property
  }

  return (
    <div class="collapse collapse-arrow bg-base-200 rounded">
      <input type="checkbox" />
      <h3 class="collapse-title text-lg font-semibold">
        <span>{rule().name}</span>
        <span class="ml-4 badge badge-soft" classList={{ [ruleType().class]: true }}>
          {ruleType().label}
        </span>
        <span class="ml-4 badge badge-soft">
          {rule().targetModel} ({columnName(rule().targetColumn) ?? 'Toutes les colonnes'})
        </span>
      </h3>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <div class="flex gap-4">
            <FormField
              legend="Activer"
              type="toggle"
              value={rule().active}
              onChange={(active) => editRule({ active })}
            />
            <FormField
              legend="Nom"
              type="text"
              value={rule().name}
              onChange={(name) => editRule({ name: name as string })}
              class="flex-grow min-w-[300px]"
            />
          </div>
          <div class="flex gap-4">
            <FormField
              legend="Modèle"
              type="select"
              value={rule().targetModel}
              onChange={(targetModel) => editRule({ targetModel: targetModel! })}
              options={models.data?.map((m) => ({ value: m.name, label: m.label })) ?? []}
            />
            <FormField
              legend="Colonne"
              type="select"
              value={rule().targetColumn}
              onChange={(targetColumn) => editRule({ targetColumn })}
              options={[
                { value: null, label: 'Toutes les colonnes' },
                ...(modelColumns().data?.map((c) => ({
                  value: c.property,
                  label: c.displayName,
                })) ?? []),
              ]}
            />
            <FormField
              legend="Type"
              type="select"
              value={rule().type}
              onChange={(type) => editRule({ type: type as RuleType })}
              options={Object.entries(RULE_TYPES).map(([value, ruleType]) => ({
                value,
                label: ruleType.label,
              }))}
            />
          </div>
          <div>
            <h4 class="text-sm font-semibold mb-2">Conditions</h4>
            <ConditionEditor
              condition={rule().condition as Condition | null}
              onChange={(condition) => editRule({ condition: condition as any })}
              columns={modelColumns().data ?? []}
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button class="btn btn-sm btn-error ml-4" onClick={props.onDelete} title="Supprimer">
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RuleEditor
