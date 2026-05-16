import { requireSuperAdmin } from '~/server/utils/authz'
import { listAllAdmins } from '~/server/utils/admins'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  return listAllAdmins()
})
