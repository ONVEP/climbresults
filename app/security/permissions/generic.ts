import { RuleType } from '#common/api_types'
import Rule from '#models/rule'
import type User from '#models/user'

export const getRules = (options?: {
  active?: boolean
  model?: string | string[]
  userId?: User['id']
  type?: RuleType | RuleType[]
}) => {
  return Rule.query()
    .innerJoin('rulesets', 'rules.ruleset_id', 'rulesets.id')
    .innerJoin('user_ruleset', 'rulesets.id', 'user_ruleset.ruleset_id')
    .if(options?.active, (q) => {
      q.where('rulesets.active', true).andWhere('rules.active', true)
    })
    .if(options?.model !== undefined, (q) => {
      if (Array.isArray(options!.model!)) {
        q.whereIn('rules.target_model', options!.model!)
      } else {
        q.where('rules.target_model', options!.model!)
      }
    })
    .if(options?.type !== undefined && !Array.isArray(options.type), (q) => {
      q.where('rules.type', options!.type!)
    })
    .if(options?.type !== undefined && Array.isArray(options.type), (q) => {
      q.whereIn('rules.type', options!.type as RuleType[])
    })
    .if(options?.userId !== undefined, (q) => {
      q.leftJoin('user_user_group', 'user_ruleset.user_group_id', 'user_user_group.user_group_id')
        .innerJoin('users', (j) =>
          j.on('users.id', 'user_ruleset.user_id').orOn('users.id', 'user_user_group.user_id')
        )
        .where('users.id', options!.userId!)
    })
}

export async function canAccessModel(model: string, userId: User['id']): Promise<boolean> {
  const rules = await getRules({
    active: true,
    model,
    userId,
    type: RuleType.ALLOW_READ,
  })
  return rules.length > 0
}
