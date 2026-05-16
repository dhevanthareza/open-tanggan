import { getSheet } from './sheets'
import type { Family, FamilyWithCount } from '~/types'
import type { FamilyInput } from '~/schemas'

function rowToFamily(r: any): Family {
  return {
    id: r.get('id'),
    kepala_keluarga: r.get('kepala_keluarga'),
    alamat: r.get('alamat'),
    rt: r.get('rt'),
    rw: r.get('rw'),
    no_telp_rumah: r.get('no_telp_rumah') ?? '',
    created_at: r.get('created_at'),
    updated_at: r.get('updated_at'),
  }
}

export async function listFamilies(): Promise<FamilyWithCount[]> {
  const [famSheet, memSheet] = await Promise.all([getSheet('families'), getSheet('members')])
  const [famRows, memRows] = await Promise.all([famSheet.getRows(), memSheet.getRows()])

  const counts = memRows.reduce<Record<string, number>>((acc, r) => {
    const fid = r.get('family_id')
    acc[fid] = (acc[fid] ?? 0) + 1
    return acc
  }, {})

  return famRows.map(rowToFamily).map(f => ({ ...f, member_count: counts[f.id] ?? 0 }))
}

export async function findFamily(id: string): Promise<Family | null> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  return row ? rowToFamily(row) : null
}

export async function createFamily(input: FamilyInput): Promise<string> {
  const now = new Date().toISOString()
  const id = `F${Date.now()}`

  const sheet = await getSheet('families')
  await sheet.addRow({
    id,
    kepala_keluarga: input.kepala_keluarga,
    alamat: input.alamat,
    rt: input.rt,
    rw: input.rw,
    no_telp_rumah: input.no_telp_rumah,
    created_at: now,
    updated_at: now,
  })
  return id
}

export async function updateFamily(id: string, input: Omit<FamilyInput, 'members'>): Promise<void> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  if (!row) throw createError({ statusCode: 404, message: 'Keluarga tidak ditemukan' })

  row.assign({ ...input, updated_at: new Date().toISOString() })
  await row.save()
}

export async function deleteFamily(id: string): Promise<void> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  if (row) await row.delete()
}
