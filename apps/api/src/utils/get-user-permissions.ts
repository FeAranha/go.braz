import { defineAbilityFor, type Role, userSchema } from '@saas/auth'

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  })
  // DEBUG user ability
  console.log('authUser=>', authUser)
  const ability = defineAbilityFor(authUser)
  console.log('ability=>', ability)
  return ability
}
