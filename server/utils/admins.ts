import { defineCachedFunction } from 'nitropack/runtime'
import { getSheet } from './sheets'
import type { Admin } from '~/types'
import type { AdminInput } from '~/schemas'

function rowToAdmin(r: any): Admin {
  return {
    email: String(r.get('email') ?? '').toLowerCase().trim(),
    nama: String(r.get('nama') ?? ''),
    role: r.get('role') as Admin['role'],
    rt: String(r.get('rt') ?? ''),
    active: String(r.get('active')).toUpperCase() === 'TRUE',
  }
}

/** Cached version used for auth lookups (60s TTL) */
export const getAdmins = defineCachedFunction(
  async (): Promise<Admin[]> => {
    const sheet = await getSheet('admins')
    const rows = await sheet.getRows()
    return rows
      .map(rowToAdmin)
      .filter(a => a.active && a.email)
  },
  { maxAge: 60, name: 'admins-list', getKey: () => 'all' },
)

export async function findAdmin(email: string): Promise<Admin | null> {
  const admins = await getAdmins()
  return admins.find(a => a.email === email.toLowerCase()) ?? null
}

/** Fresh (non-cached) read for admin management UI */
export async function listAllAdmins(): Promise<Admin[]> {
  const sheet = await getSheet('admins')
  const rows = await sheet.getRows()
  return rows.map(rowToAdmin).filter(a => a.email)
}

export async function createAdmin(input: AdminInput): Promise<void> {
  const sheet = await getSheet('admins')
  const rows = await sheet.getRows()
  const exists = rows.find(r => String(r.get('email')).toLowerCase() === input.email.toLowerCase())
  if (exists) throw createError({ statusCode: 409, message: 'Email sudah terdaftar' })

  await sheet.addRow({
    email: input.email.toLowerCase().trim(),
    nama: input.nama,
    role: input.role,
    rt: input.rt,
    active: 'TRUE',
  })
}

export async function updateAdmin(email: string, input: Partial<AdminInput & { active: boolean }>): Promise<void> {
  const sheet = await getSheet('admins')
  const rows = await sheet.getRows()
  const row = rows.find(r => String(r.get('email')).toLowerCase() === email.toLowerCase())
  if (!row) throw createError({ statusCode: 404, message: 'Admin tidak ditemukan' })

  if (input.nama !== undefined) row.set('nama', input.nama)
  if (input.role !== undefined) row.set('role', input.role)
  if (input.rt !== undefined) row.set('rt', input.rt)
  if (input.active !== undefined) row.set('active', input.active ? 'TRUE' : 'FALSE')
  await row.save()
}

export async function deleteAdmin(email: string): Promise<void> {
  const sheet = await getSheet('admins')
  const rows = await sheet.getRows()
  const row = rows.find(r => String(r.get('email')).toLowerCase() === email.toLowerCase())
  if (!row) throw createError({ statusCode: 404, message: 'Admin tidak ditemukan' })
  await row.delete()
}
