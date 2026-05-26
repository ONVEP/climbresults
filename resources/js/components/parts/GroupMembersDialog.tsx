import { patch } from '#lib/api'
import { createSignal, For, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import type { GroupData, UserData } from '../UsersPage'

export const GroupMembersDialog: Component<{
  group: GroupData
  allUsers: UserData[]
  onClose: () => void
}> = (props) => {
  const [selectedUserIds, setSelectedUserIds] = createSignal<number[]>(
    props.group.members.map((m) => m.id)
  )

  const isUserSelected = (userId: number) => selectedUserIds().includes(userId)

  const toggleUser = (userId: number) => {
    const current = selectedUserIds()
    if (current.includes(userId)) {
      setSelectedUserIds(current.filter((id) => id !== userId))
    } else {
      setSelectedUserIds([...current, userId])
    }
  }

  const handleSave = async () => {
    await patch(`/api/groups/${props.group.id}/members`, {
      memberIds: selectedUserIds(),
    })
    props.onClose()
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-2xl">
          <h2 class="text-xl font-bold mb-4">Membres du groupe {props.group.name}</h2>

          <div class="space-y-1 max-h-96 overflow-y-auto">
            <For each={props.allUsers}>
              {(user) => (
                <label class="flex items-center gap-2 px-1 py-0.5 hover:bg-base-200 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-xs"
                    checked={isUserSelected(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <div class="flex-1 text-sm">
                    <span class="font-medium">{user.fullName || user.userName || user.email}</span>
                    <span class="text-base-content/70"> ({user.email})</span>
                  </div>
                </label>
              )}
            </For>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button class="btn" onClick={props.onClose}>
              Annuler
            </button>
            <button class="btn btn-primary" onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
