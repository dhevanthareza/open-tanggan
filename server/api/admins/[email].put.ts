import { adminUpdateInput } from '~/schemas'
import { requireSuperAdmin } from '~/server/utils/authz'
import { updateAdmin } from '~/server/utils/admins'

export default defineEventHandler(async (event) => {
  const currentUser = await requireSuperAdmin(event)
  const email = decodeURIComponent(getRouterParam(event, 'email') ?? '')
  const body = adminUpdateInput.parse(await readBody(event))

  // Prevent removing own super-admin access
  if (email === currentUser.email && body.role === 'rt_admin') {
    throw createError({ statusCode: 400, message: 'Tidak dapat mengubah role akun sendiri' })
  }

  await updateAdmin(email, body)
  return { ok: true }
})
