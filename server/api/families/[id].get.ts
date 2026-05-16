import { findFamily } from '~/server/utils/families'
import { listMembersByFamily } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  const family = await findFamily(id)
  if (!family) throw createError({ statusCode: 404 })

  const members = await listMembersByFamily(id)
  return { ...family, members }
})
