import type { H3Event } from 'h3'
import type { SessionUser } from '~/types'

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const session = await requireUserSession(event)
  return session.user as SessionUser
}

/** Only rw_admin and developer can manage users / do super-admin actions */
export async function requireSuperAdmin(event: H3Event): Promise<SessionUser> {
  const user = await requireAdmin(event)
  if (user.role !== 'rw_admin' && user.role !== 'developer') {
    throw createError({ statusCode: 403, message: 'Akses ditolak' })
  }
  return user
}

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === 'rw_admin' || user.role === 'developer'
}

export function canEditRt(user: SessionUser, targetRt: string): boolean {
  if (user.role === 'rw_admin' || user.role === 'developer') return true
  return user.role === 'rt_admin' && user.rt === targetRt
}

export function assertCanEditRt(user: SessionUser, targetRt: string): void {
  if (!canEditRt(user, targetRt)) {
    throw createError({ statusCode: 403, message: 'Tidak boleh mengubah data RT lain' })
  }
}
