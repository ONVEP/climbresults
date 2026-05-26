import {
  PermissionDescription,
  PermissionHierarchy,
  unfoldPermissions,
  type Permission,
} from '#security/permissions'
import { createSignal, For, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'

type PermissionTreeNode = {
  permission: Permission
  depth: number
}

// Build a flat tree structure from the hierarchy
function buildPermissionTree(): PermissionTreeNode[] {
  const tree: PermissionTreeNode[] = []
  const addedPermissions = new Set<Permission>()

  const addPermissionWithChildren = (permission: Permission, depth: number) => {
    if (addedPermissions.has(permission)) return

    tree.push({ permission, depth })
    addedPermissions.add(permission)

    const children = PermissionHierarchy[permission]
    if (children) {
      children.forEach((child) => addPermissionWithChildren(child, depth + 1))
    }
  }

  // Start with root permissions (those that aren't children of any other permission)
  const allPermissions = Object.keys(PermissionDescription) as Permission[]
  const childPermissions = new Set(
    Object.values(PermissionHierarchy).flatMap((children) => children || [])
  )
  const rootPermissions = allPermissions.filter((p) => !childPermissions.has(p))

  rootPermissions.forEach((permission) => addPermissionWithChildren(permission, 0))

  return tree
}

export const PermissionsDialog: Component<{
  title: string
  permissions: Permission[]
  onSave: (permissions: Permission[]) => Promise<void>
  onClose: () => void
}> = (props) => {
  const [selectedPermissions, setSelectedPermissions] = createSignal<Permission[]>(
    props.permissions
  )

  const permissionTree = buildPermissionTree()

  const unfoldedPermissions = () => unfoldPermissions(selectedPermissions())

  const isPermissionEnabled = (permission: Permission) => {
    return unfoldedPermissions().includes(permission)
  }

  const isPermissionDirectlySelected = (permission: Permission) => {
    return selectedPermissions().includes(permission)
  }

  const togglePermission = (permission: Permission) => {
    const current = selectedPermissions()
    if (current.includes(permission)) {
      setSelectedPermissions(current.filter((p) => p !== permission))
    } else {
      setSelectedPermissions([...current, permission])
    }
  }

  const handleSave = async () => {
    await props.onSave(selectedPermissions())
  }

  return (
    <Portal>
      <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded shadow-lg min-w-96 max-w-2xl">
          <h2 class="text-xl font-bold mb-4">{props.title}</h2>

          <div class="space-y-0.5 max-h-96 overflow-y-auto">
            <For each={permissionTree}>
              {(node) => (
                <label
                  class="flex items-center gap-2 cursor-pointer px-1 py-0.5 hover:bg-base-200 rounded"
                  style={{ 'padding-left': `${0.25 + node.depth * 1.5}rem` }}
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-xs"
                    checked={isPermissionDirectlySelected(node.permission)}
                    disabled={
                      isPermissionEnabled(node.permission) &&
                      !isPermissionDirectlySelected(node.permission)
                    }
                    onChange={() => togglePermission(node.permission)}
                  />
                  <div class="flex-1 text-sm">{PermissionDescription[node.permission]}</div>
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
