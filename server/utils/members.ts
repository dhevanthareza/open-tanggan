import { getSheet } from './sheets'
import type { Member } from '~/types'
import type { MemberInput } from '~/schemas'

function rowToMember(r: any): Member {
  return {
    id: r.get('id'),
    family_id: r.get('family_id'),
    urutan: Number(r.get('urutan') ?? 0),
    nama_lengkap: r.get('nama_lengkap'),
    tempat_lahir: r.get('tempat_lahir') ?? '',
    tanggal_lahir: r.get('tanggal_lahir') ?? '',
    hub_kel: r.get('hub_kel'),
    gol_darah: r.get('gol_darah') ?? '-',
    no_hp: r.get('no_hp') ?? '',
    created_at: r.get('created_at'),
  }
}

export async function listMembersByFamily(familyId: string): Promise<Member[]> {
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  return rows
    .filter(r => r.get('family_id') === familyId)
    .map(rowToMember)
    .sort((a, b) => a.urutan - b.urutan)
}

export async function addMembers(familyId: string, members: MemberInput[]): Promise<void> {
  const sheet = await getSheet('members')
  const now = new Date().toISOString()
  const rows = members.map((m, i) => ({
    id: `M${Date.now()}${i}`,
    family_id: familyId,
    urutan: i + 1,
    ...m,
    created_at: now,
  }))
  await sheet.addRows(rows)
}

export async function replaceMembers(familyId: string, members: MemberInput[]): Promise<void> {
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  const toDelete = rows.filter(r => r.get('family_id') === familyId)
  for (const row of toDelete.reverse()) await row.delete()
  await addMembers(familyId, members)
}

export async function deleteMembersByFamily(familyId: string): Promise<void> {
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  const toDelete = rows.filter(r => r.get('family_id') === familyId)
  for (const row of toDelete.reverse()) await row.delete()
}
