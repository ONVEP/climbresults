import { post } from '#lib/api'
import { createSignal, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'

export const GroupCreateDialog: Component<{
  onClose: () => void
}> = (props) => {
  const [name, setName] = createSignal('')

  const handleSave = async () => {
    await post(`/api/groups`, {
      name: name(),
    })
    props.onClose()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-2xl">
          <h2 class="text-xl font-bold mb-4">Créer un groupe</h2>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Nom du groupe</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button class="btn" onClick={props.onClose}>
              Annuler
            </button>
            <button class="btn btn-primary" onClick={handleSave}>
              Créer
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
