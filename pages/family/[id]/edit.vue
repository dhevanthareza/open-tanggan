<script setup lang="ts">
import { useFamily, useUpdateFamily } from '~/queries/families'
import { familyInput, type FamilyInput } from '~/schemas'

const route = useRoute()
const router = useRouter()
const { user } = useUserSession()
const id = computed(() => route.params.id as string)
const { data: family, isLoading } = useFamily(id)
const { mutate, isPending, error } = useUpdateFamily(id.value)

const canEdit = computed(() => {
  if (!family.value) return false
  if (user.value?.role === 'rw_admin' || user.value?.role === 'developer') return true
  return user.value?.role === 'rt_admin' && user.value?.rt === family.value.rt
})

const initial = computed<FamilyInput | undefined>(() => {
  if (!family.value) return undefined
  return {
    kepala_keluarga: family.value.kepala_keluarga,
    alamat: family.value.alamat,
    rt: family.value.rt,
    rw: family.value.rw,
    no_telp_rumah: family.value.no_telp_rumah,
    members: family.value.members.map(m => ({
      nama_lengkap: m.nama_lengkap,
      tempat_lahir: m.tempat_lahir,
      tanggal_lahir: m.tanggal_lahir,
      hub_kel: m.hub_kel,
      gol_darah: m.gol_darah,
      no_hp: m.no_hp,
    })),
  }
})

const submit = (data: FamilyInput) => {
  const parsed = familyInput.safeParse(data)
  if (!parsed.success) {
    error.value = { message: parsed.error.issues.map(i => i.message).join(' · ') } as any
    return
  }
  mutate(parsed.data, {
    onSuccess: () => router.push(`/family/${id.value}`),
  })
}
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-background flex items-center justify-center">
    <div class="text-center">
      <div class="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
      <p class="text-muted-foreground text-sm">Memuat data...</p>
    </div>
  </div>
  <div v-else-if="!canEdit" class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="text-center max-w-sm">
      <p class="text-muted-foreground text-sm">Anda tidak memiliki akses untuk mengedit keluarga ini.</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Kembali ke Beranda
      </NuxtLink>
    </div>
  </div>
  <FamilyForm v-else :initial="initial" :loading="isPending" :error="error?.message" @submit="submit" />
</template>
