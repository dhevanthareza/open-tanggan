import { familyInput } from '~/schemas'
import { requireAdmin, assertCanEditRt } from '~/server/utils/authz'
import { createFamily } from '~/server/utils/families'
import { addMembers } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = familyInput.parse(await readBody(event))
  assertCanEditRt(user, body.rt)

  const id = await createFamily(body)
  await addMembers(id, body.members)
  return { id }
})
