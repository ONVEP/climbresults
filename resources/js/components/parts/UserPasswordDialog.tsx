import { patch } from '#lib/api'
import { createSignal, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import type { UserData } from '../UsersPage'

export const UserPasswordDialog: Component<{
  user: UserData
  onClose: () => void
}> = (props) => {
  const [password, setPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')

  const handleSave = async () => {
    if (password() !== confirmPassword()) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    if (password().length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    await patch(`/api/users/${props.user.id}/password`, {
      password: password(),
    })
    props.onClose()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-2xl">
          <h2 class="text-xl font-bold mb-4">
            Changer le mot de passe de {props.user.fullName || props.user.email}
          </h2>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Nouveau mot de passe</span>
            </label>
            <input
              type="password"
              class="input input-bordered w-full"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Confirmer le mot de passe</span>
            </label>
            <input
              type="password"
              class="input input-bordered w-full"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button class="btn" onClick={props.onClose}>
              Annuler
            </button>
            <button class="btn btn-primary" onClick={handleSave}>
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
