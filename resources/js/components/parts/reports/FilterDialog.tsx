import type { DataColumnSchema } from '#common/api_types'
import type { Condition } from '#common/condition_types'
import { patch } from '#lib/api'
import XIcon from 'lucide-solid/icons/x'
import { createSignal, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { ConditionEditor } from '../ConditionEditor'

export const FilterDialog: Component<{
  viewId: number
  filter: Condition | null
  columns: DataColumnSchema[]
  onClose: () => void
  onSaved: () => void
}> = (props) => {
  const [filter, setFilter] = createSignal<Condition | null>(props.filter)
  const [isSaving, setIsSaving] = createSignal(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await patch(`/api/report_views/${props.viewId}`, { filters: filter() })
      props.onSaved()
      props.onClose()
    } catch (error) {
      console.error('Failed to save filter:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Portal>
      <div class="modal modal-open">
        <div class="modal-box max-w-4xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg">Filtrer les données</h3>
            <button type="button" class="btn btn-sm btn-square btn-ghost" onClick={props.onClose}>
              <XIcon size={20} />
            </button>
          </div>

          <div class="mb-4">
            <ConditionEditor condition={filter()} onChange={setFilter} columns={props.columns} />
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onClick={props.onClose}>
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving()}
            >
              {isSaving() ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" onClick={props.onClose} />
      </div>
    </Portal>
  )
}
