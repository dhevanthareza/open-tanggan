import { requireAdmin } from '~/server/utils/authz'
import { findFamily, deleteFamily } from '~/server/utils/families'
import { deleteMembersByFamily } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  if (user.role !== 'rw_admin') {
    throw createError({ statusCode: 403, message: 'Hanya RW admin yang bisa hapus keluarga' })
  }
  const id = getRouterParam(event, 'id')!

  const existing = await findFamily(id)
  if (!existing) return { ok: true }

  await deleteMembersByFamily(id)
  await deleteFamily(id)
  return { ok: true }
})
