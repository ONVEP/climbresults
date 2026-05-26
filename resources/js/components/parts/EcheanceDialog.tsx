import type { EcheanceData } from '#common/api_types'
import { patch, post, useModelSummaryQuery } from '#lib/api'
import type { NotificationSettings } from '#models/echeancier'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import type { DateTimeUnit } from 'luxon'
import { createSignal, For, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Choices } from './common/Choices'
import { Fieldset, FormField } from './common/Fieldset'
import { OffsetInput } from './common/OffsetInput'

export const EcheanceDialog: Component<{
  echeance?: EcheanceData
  onClose: () => void
  onSaved: () => void
}> = (props) => {
  const isEditMode = () => !!props.echeance
  const beneficiaires = useModelSummaryQuery('Beneficiaire')

  const [beneficiaireId, setBeneficiaireId] = createSignal<number | null>(
    props.echeance?.beneficiaireId ?? null
  )
  const [echeance, setEcheance] = createSignal(
    props.echeance?.echeance.split('T')[0] ?? '' // Extract date part only
  )
  const [name, setName] = createSignal(props.echeance?.name ?? '')
  const [comment, setComment] = createSignal(props.echeance?.comment ?? '')
  const [notificationSettings, setNotificationSettings] = createSignal<NotificationSettings[]>(
    Array.isArray((props.echeance as any)?.notificationSettings)
      ? (props.echeance as any).notificationSettings.map((n: any) => ({
          offset:
            typeof n.offset === 'object' && n.offset !== null
              ? n.offset
              : { day: Number(n.offset) || 0 },
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

  const updateNotification = (idx: number, field: keyof NotificationSettings, value: any) => {
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

  const handleSave = async () => {
    if (!beneficiaireId() || !echeance()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const data = {
      beneficiaireId: beneficiaireId()!,
      name: name(),
      echeance: echeance(),
      comment: comment() || null,
      notificationSettings: notificationSettings().map((n) => ({
        offset: n.offset,
        message: n.message,
        emails: n.emails,
      })),
    }

    if (isEditMode()) {
      await patch(`/api/echeances/${props.echeance!.id}`, data)
    } else {
      await post('/api/echeances', data)
    }

    props.onSaved()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 lg:min-w-2xl max-w-4xl flex flex-col gap-4">
          <h2 class="text-xl font-bold">
            {isEditMode() ? "Modifier l'échéance" : 'Créer une échéance'}
          </h2>

          <div class="grid lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-4">
              <FormField
                legend="Bénéficiaire"
                type="select"
                value={beneficiaireId()?.toString() ?? null}
                onChange={(val) => setBeneficiaireId(val ? Number(val) : null)}
                options={[
                  { value: null, label: 'Sélectionner un bénéficiaire...' },
                  ...(beneficiaires.data || []).map((b: { id: number; summary: string }) => ({
                    value: b.id.toString(),
                    label: b.summary,
                  })),
                ]}
                required
              />

              <FormField legend="Nom" type="text" value={name()} onChange={setName} required />

              <FormField
                legend="Date d'échéance"
                type="date"
                value={echeance()}
                onChange={setEcheance}
                required
              />

              <FormField
                legend="Commentaire"
                type="textarea"
                value={comment()}
                onChange={setComment}
                placeholder="Détails sur l'échéance..."
              />
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
                        value={notif.message || ''}
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
              {isEditMode() ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
