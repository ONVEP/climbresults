export type Permission = ''

export const PermissionHierarchy: Partial<Record<Permission, Permission[]>> = {}

export const unfoldPermissions: (permissions: Permission[]) => Permission[] = (permissions) => {
  let unfolded = [...permissions]
  for (let i = 0; i < unfolded.length; i++) {
    const children = PermissionHierarchy[unfolded[i]]
    if (!children) continue
    for (const permission of children) {
      if (!unfolded.includes(permission)) unfolded.push(permission)
    }
  }
  return unfolded
}

export const PermissionDescription: Record<Permission, string> = {
  '': '',
}
