import { requireAdmin } from '~/server/utils/authz'
import { getSheet } from '~/server/utils/sheets'
import type { FamilyDetail } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const ids = String(query.ids ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (!ids.length) return []

  const [famSheet, memSheet] = await Promise.all([getSheet('families'), getSheet('members')])
  const [famRows, memRows] = await Promise.all([famSheet.getRows(), memSheet.getRows()])

  const idSet = new Set(ids)

  const familyMap = new Map(
    famRows
      .filter(r => idSet.has(r.get('id')))
      .map(r => [r.get('id'), {
        id: r.get('id'),
        kepala_keluarga: r.get('kepala_keluarga'),
        alamat: r.get('alamat'),
        rt: r.get('rt'),
        rw: r.get('rw'),
        no_telp_rumah: r.get('no_telp_rumah') ?? '',
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at'),
        members: [] as any[],
      }]),
  )

  for (const row of memRows) {
    const fid = row.get('family_id')
    if (!familyMap.has(fid)) continue
    familyMap.get(fid)!.members.push({
      id: row.get('id'),
      family_id: fid,
      urutan: Number(row.get('urutan') ?? 0),
      nama_lengkap: row.get('nama_lengkap'),
      tempat_lahir: row.get('tempat_lahir') ?? '',
      tanggal_lahir: row.get('tanggal_lahir') ?? '',
      hub_kel: row.get('hub_kel'),
      gol_darah: row.get('gol_darah') ?? '-',
      no_hp: row.get('no_hp') ?? '',
      created_at: row.get('created_at'),
    })
  }

  // Sort members per family and return in requested order
  return ids
    .filter(id => familyMap.has(id))
    .map(id => {
      const f = familyMap.get(id)!
      f.members.sort((a, b) => a.urutan - b.urutan)
      return f
    }) as FamilyDetail[]
})
