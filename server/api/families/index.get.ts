import { listFamilies } from '~/server/utils/families'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listFamilies()
})
