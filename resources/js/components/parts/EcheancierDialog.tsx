type NotificationSetting = {
  offset: DurationLikeObject
  message: string
  emails: string[]
}
import { DataColumnType, type EcheancierData } from '#common/api_types'
import type { Condition } from '#common/condition_types'
import { OFFSET_FUNCTION_LABELS } from '#common/labels'
import { patch, post, useListQuery, useModelSchemaQuery } from '#lib/api'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import type { DateTimeUnit, DurationLikeObject } from 'luxon'
import { createEffect, createMemo, createSignal, For, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Choices } from './common/Choices'
import { Fieldset, FormField } from './common/Fieldset'
import { OffsetInput } from './common/OffsetInput'
import { ConditionEditor } from './ConditionEditor'

export const EcheancierDialog: Component<{
  echeancier?: EcheancierData
  onClose: () => void
  onSaved: () => void
}> = (props) => {
  const isEdit = () => !!props.echeancier
  const models = useListQuery('models')
  const [targetModel, setTargetModel] = createSignal(props.echeancier?.targetModel || '')
  const [name, setName] = createSignal(props.echeancier?.name || '')
  const [targetColumn, setTargetColumn] = createSignal(props.echeancier?.targetColumn || '')
  const [offset, setOffset] = createSignal(props.echeancier?.offset || 0)
  const [offsetUnit, setOffsetUnit] = createSignal<DateTimeUnit>(
    props.echeancier?.offsetUnit || 'day'
  )
  const [offsetFunction, setOffsetFunction] = createSignal<string>(
    props.echeancier?.offsetFunction || ''
  )
  const [condition, setCondition] = createSignal<Condition | null>(
    props.echeancier?.condition || null
  )

  const [notificationSettings, setNotificationSettings] = createSignal<NotificationSetting[]>(
    Array.isArray((props.echeancier as any)?.notificationSettings)
      ? (props.echeancier as any).notificationSettings.map((n: any) => ({
          offset:
            typeof n.offset === 'object' && n.offset !== null
              ? n.offset
              : { value: Number(n.offset) || 0, unit: 'day' },
          message: n.message || '',
          emails: Array.isArray(n.emails) ? n.emails : [],
        }))
      : []
  )

  const addNotification = () => {
    setNotificationSettings([
      ...notificationSettings(),
      { offset: { day: 0 }, message: '', emails: [] },
    ])
  }
  const updateNotification = (idx: number, field: keyof NotificationSetting, value: any) => {
    setNotificationSettings(
      notificationSettings().map((n, i) => {
        if (i !== idx) return n
        if (field === 'emails') {
          return { ...n, emails: value.map((e: string) => e.trim()) }
        }
        if (field === 'offset') {
          return { ...n, offset: value }
        }
        return { ...n, [field]: value }
      })
    )
  }
  const updateNotificationOffset = (idx: number, key: 'value' | 'unit', val: any) => {
    const currentOffset = notificationSettings()[idx].offset
    const currentUnit = (Object.keys(currentOffset)[0] as DateTimeUnit) || 'day'
    const currentValue = currentOffset[currentUnit] || 0
    const newOffset = key === 'unit' ? { [val]: currentValue } : { [currentUnit]: Number(val) || 0 }
    setNotificationSettings(
      notificationSettings().map((n, i) => (i === idx ? { ...n, offset: newOffset } : n))
    )
  }
  const removeNotification = (idx: number) => {
    setNotificationSettings(notificationSettings().filter((_, i) => i !== idx))
  }

  const columnsQuery = createMemo(() => useModelSchemaQuery(targetModel() || null))
  const allColumns = createMemo(() => columnsQuery().data || [])
  const dateColumns = createMemo(
    () => allColumns().filter((col) => col.type === DataColumnType.DATE) || []
  )

  const modelOptions = createMemo(
    () =>
      models.data?.map((model) => ({ value: model.name, label: model.label })) || [
        { value: '', label: 'Sélectionner un modèle...' },
      ]
  )
  createEffect(() => {
    if (!targetModel() && modelOptions().length > 0) setTargetModel(modelOptions()[0].value)
  })

  const columnOptions = createMemo(() => [
    { value: '', label: "Aujourd'hui" },
    ...dateColumns().map((col) => ({ value: col.property, label: col.displayName })),
  ])

  const offsetFunctionOptions = [
    { value: '', label: 'Aucune' },
    ...Object.entries(OFFSET_FUNCTION_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ]

  const handleSave = async () => {
    const data = {
      targetModel: targetModel(),
      name: name() || 'Nouvel échéancier',
      targetColumn: targetColumn(),
      offset: offset(),
      offsetUnit: offsetUnit(),
      offsetFunction: offsetFunction() || null,
      condition: condition(),
      notificationSettings: notificationSettings().map((n) => ({
        offset: n.offset,
        message: n.message,
        emails: n.emails,
      })),
    }

    if (isEdit()) {
      await patch(`/api/echeanciers/${props.echeancier!.id}`, data)
    } else {
      await post(`/api/echeanciers`, data)
    }

    props.onSaved()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-4xl flex flex-col gap-4">
          <h2 class="text-xl font-bold">
            {isEdit() ? "Modifier l'échéancier" : 'Créer un échéancier'}
          </h2>

          <div class="grid lg:grid-cols-2 gap-6">
            <div>
              <div class="grid md:grid-cols-2 gap-4">
                <FormField
                  legend="Modèle cible"
                  type="select"
                  value={targetModel()}
                  onChange={(val) => {
                    setTargetModel(val || '')
                    setTargetColumn('')
                  }}
                  options={modelOptions()}
                />

                <FormField
                  legend="Date cible"
                  type="select"
                  value={targetColumn()}
                  onChange={setTargetColumn}
                  options={columnOptions()}
                />

                <FormField
                  legend="Fonction de décalage (optionnel)"
                  type="select"
                  value={offsetFunction()}
                  onChange={(val) => setOffsetFunction(val || '')}
                  options={offsetFunctionOptions}
                />

                <Fieldset legend="Décalage">
                  <OffsetInput
                    value={offset()}
                    unit={offsetUnit()}
                    onValueChange={setOffset}
                    onUnitChange={setOffsetUnit}
                  />
                </Fieldset>
              </div>

              <FormField
                legend="Nom"
                type="text"
                value={name()}
                onChange={setName}
                placeholder="Description courte de l'échéancier"
              />

              <Fieldset legend="Condition (optionnel)">
                <ConditionEditor
                  condition={condition()}
                  onChange={setCondition}
                  columns={allColumns()}
                />
              </Fieldset>
            </div>
            <div class="max-h-[70dvh] overflow-auto">
              <Fieldset legend="Notifications">
                <For each={notificationSettings()}>
                  {(notif, idx) => (
                    <div class="border border-base-200 rounded p-2 mb-2 relative">
                      <div class="flex flex-wrap gap-2 items-center mb-2">
                        <OffsetInput
                          value={Object.values(notif.offset)[0] ?? 0}
                          unit={(Object.keys(notif.offset)[0] as DateTimeUnit) ?? 'day'}
                          onValueChange={(val) => updateNotificationOffset(idx(), 'value', val)}
                          onUnitChange={(unit) => updateNotificationOffset(idx(), 'unit', unit)}
                          class="flex gap-2"
                        />
                        <span class="text-lg">&nbsp;avant l'échéance</span>
                      </div>
                      <input
                        type="text"
                        class="input w-full mb-2"
                        value={notif.message}
                        onInput={(e) => updateNotification(idx(), 'message', e.currentTarget.value)}
                        placeholder="Message (facultatif)"
                      />
                      <div class="flex flex-wrap gap-2 items-end">
                        <Choices
                          class="flex-1"
                          options={[{ value: '', label: 'Sélectionner...' }]}
                          value={notif.emails}
                          onChange={(vals) => updateNotification(idx(), 'emails', vals)}
                          multiple
                          allowCustom
                          customPlaceholder="Ajouter un email..."
                        />
                        <button
                          class="btn btn-error btn-square"
                          type="button"
                          title="Supprimer la notification"
                          onClick={() => removeNotification(idx())}
                        >
                          <Trash2Icon size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </For>
                <button class="btn btn-xs btn-primary mt-2" type="button" onClick={addNotification}>
                  Ajouter une notification
                </button>
              </Fieldset>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button class="btn" onClick={props.onClose}>
              Annuler
            </button>
            <button class="btn btn-primary" onClick={handleSave}>
              {isEdit() ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
