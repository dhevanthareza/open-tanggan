export type Role = 'rw_admin' | 'rt_admin' | 'developer'

export interface SessionUser {
  email: string
  nama: string
  picture?: string
  role: Role
  rt: string  // '*' for rw_admin, specific RT for rt_admin
}

export interface Admin extends Omit<SessionUser, 'picture'> {
  active: boolean
}

export interface Family {
  id: string
  kepala_keluarga: string
  alamat: string
  rt: string
  rw: string
  no_telp_rumah: string
  created_at: string
  updated_at: string
}

export interface FamilyWithCount extends Family {
  member_count: number
}

export interface Member {
  id: string
  family_id: string
  urutan: number
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string  // YYYY-MM-DD
  hub_kel: 'Suami' | 'Istri' | 'Anak' | 'Lainnya'
  gol_darah: 'A' | 'B' | 'AB' | 'O' | '-'
  no_hp: string
  created_at: string
}

export interface FamilyDetail extends Family {
  members: Member[]
}
