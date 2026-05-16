import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { FamilyWithCount, FamilyDetail } from '~/types'
import type { FamilyInput } from '~/schemas'

export const familyKeys = {
  all: ['families'] as const,
  list: () => [...familyKeys.all, 'list'] as const,
  detail: (id: string) => [...familyKeys.all, 'detail', id] as const,
}

export const useFamilies = () =>
  useQuery({
    queryKey: familyKeys.list(),
    queryFn: () => $fetch<FamilyWithCount[]>('/api/families'),
  })

export const useFamily = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => familyKeys.detail(toValue(id))),
    queryFn: () => $fetch<FamilyDetail>(`/api/families/${toValue(id)}`),
  })

export const useCreateFamily = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FamilyInput) =>
      $fetch<{ id: string }>('/api/families', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: familyKeys.all }),
  })
}

export const useUpdateFamily = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FamilyInput) =>
      $fetch(`/api/families/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: familyKeys.list() })
      qc.invalidateQueries({ queryKey: familyKeys.detail(id) })
    },
  })
}

export const useDeleteFamily = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/families/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: familyKeys.all }),
  })
}
