import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Admin } from '~/types'
import type { AdminInput, AdminUpdateInput } from '~/schemas'

export const adminKeys = {
  all: ['admins'] as const,
  list: () => [...adminKeys.all, 'list'] as const,
}

export const useAdmins = () =>
  useQuery({
    queryKey: adminKeys.list(),
    queryFn: () => $fetch<Admin[]>('/api/admins'),
  })

export const useCreateAdmin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminInput) =>
      $fetch('/api/admins', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  })
}

export const useUpdateAdmin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email, data }: { email: string; data: AdminUpdateInput }) =>
      $fetch(`/api/admins/${encodeURIComponent(email)}`, { method: 'PUT', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  })
}

export const useDeleteAdmin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) =>
      $fetch(`/api/admins/${encodeURIComponent(email)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  })
}
