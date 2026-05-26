import { post } from '#lib/api'
import { createSignal, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'

export const UserCreateDialog: Component<{
  onClose: () => void
}> = (props) => {
  const [firstName, setFirstName] = createSignal('')
  const [lastName, setLastName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [userName, setUserName] = createSignal('')
  const [password, setPassword] = createSignal('')

  const handleSave = async () => {
    await post(`/api/users`, {
      firstName: firstName(),
      lastName: lastName(),
      email: email(),
      userName: userName(),
      password: password(),
    })
    props.onClose()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-2xl">
          <h2 class="text-xl font-bold mb-4">Créer un utilisateur</h2>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Prénom</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              value={firstName()}
              onInput={(e) => setFirstName(e.currentTarget.value)}
            />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Nom</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              value={lastName()}
              onInput={(e) => setLastName(e.currentTarget.value)}
            />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Nom d'utilisateur</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              value={userName()}
              onInput={(e) => setUserName(e.currentTarget.value)}
            />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              class="input input-bordered w-full"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Mot de passe</span>
            </label>
            <input
              type="password"
              class="input input-bordered w-full"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
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
