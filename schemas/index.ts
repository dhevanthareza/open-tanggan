import { z } from 'zod'

export const memberInput = z.object({
  nama_lengkap: z.string().min(1, 'Nama wajib diisi'),
  tempat_lahir: z.string().optional().default(''),
  tanggal_lahir: z.string().optional().default(''),
  hub_kel: z.enum(['Suami', 'Istri', 'Anak', 'Lainnya']),
  gol_darah: z.enum(['A', 'B', 'AB', 'O', '-']).optional().default('-'),
  no_hp: z.string().optional().default(''),
})

export const familyInput = z.object({
  kepala_keluarga: z.string().min(1, 'Nama kepala keluarga wajib diisi'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  rt: z.string().min(1, 'RT wajib diisi'),
  rw: z.string().min(1, 'RW wajib diisi'),
  no_telp_rumah: z.string().optional().default(''),
  members: z.array(memberInput).min(1, 'Minimal 1 anggota'),
})

export const adminInput = z.object({
  email: z.string().email('Email tidak valid'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['rw_admin', 'rt_admin', 'developer']),
  rt: z.string().min(1, 'RT wajib diisi'),
})

export const adminUpdateInput = adminInput.partial().extend({
  active: z.boolean().optional(),
})

export type FamilyInput = z.infer<typeof familyInput>
export type MemberInput = z.infer<typeof memberInput>
export type AdminInput = z.infer<typeof adminInput>
export type AdminUpdateInput = z.infer<typeof adminUpdateInput>
