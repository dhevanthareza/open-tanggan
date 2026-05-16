import { familyInput } from '~/schemas'
import { requireAdmin, assertCanEditRt } from '~/server/utils/authz'
import { findFamily, updateFamily } from '~/server/utils/families'
import { replaceMembers } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = familyInput.parse(await readBody(event))

  const existing = await findFamily(id)
  if (!existing) throw createError({ statusCode: 404 })
  assertCanEditRt(user, existing.rt)
  assertCanEditRt(user, body.rt)

  const { members, ...familyFields } = body
  await updateFamily(id, familyFields)
  await replaceMembers(id, members)
  return { id }
})
