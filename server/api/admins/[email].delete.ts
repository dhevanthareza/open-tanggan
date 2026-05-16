import { requireSuperAdmin } from '~/server/utils/authz'
import { deleteAdmin } from '~/server/utils/admins'

export default defineEventHandler(async (event) => {
  const currentUser = await requireSuperAdmin(event)
  const email = decodeURIComponent(getRouterParam(event, 'email') ?? '')

  if (email === currentUser.email) {
    throw createError({ statusCode: 400, message: 'Tidak dapat menghapus akun sendiri' })
  }

  await deleteAdmin(email)
  return { ok: true }
})
