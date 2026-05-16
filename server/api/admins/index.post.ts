import { adminInput } from '~/schemas'
import { requireSuperAdmin } from '~/server/utils/authz'
import { createAdmin } from '~/server/utils/admins'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const body = adminInput.parse(await readBody(event))
  await createAdmin(body)
  return { ok: true }
})
