<script setup lang="ts">
import { useFamily, useDeleteFamily } from '~/queries/families'
import { ChevronLeft, Pencil, Trash2, Phone, MapPin, Users, Calendar, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user } = useUserSession()
const { ask } = useConfirm()
const id = computed(() => route.params.id as string)
const { data: family, isLoading } = useFamily(id)
const { mutate: remove, isPending: isDeleting } = useDeleteFamily()

const isSuperAdmin = computed(() => user.value?.role === 'rw_admin' || user.value?.role === 'developer')

const canEdit = computed(() => {
  if (!family.value) return false
  if (isSuperAdmin.value) return true
  return user.value?.role === 'rt_admin' && user.value?.rt === family.value.rt
})

const onDelete = async () => {
  const confirmed = await ask({
    title: 'Hapus Data Keluarga?',
    message: `Data keluarga "${family.value?.kepala_keluarga}" beserta semua anggota akan dihapus permanen dan tidak bisa dikembalikan.`,
    confirmLabel: 'Ya, Hapus Sekarang',
    destructive: true,
  })
  if (!confirmed) return
  remove(id.value, { onSuccess: () => router.push('/') })
}

const hubColor: Record<string, string> = {
  'Suami':  'bg-blue-50 text-blue-700',
  'Istri':  'bg-pink-50 text-pink-700',
  'Anak':   'bg-green-50 text-green-700',
  'Lainnya':'bg-slate-100 text-slate-600',
}
const golDarahColor: Record<string, string> = {
  'A': 'text-red-600', 'B': 'text-orange-600', 'AB': 'text-purple-600', 'O': 'text-blue-600',
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <ChevronLeft class="h-4 w-4" />
          Kembali
        </NuxtLink>
        <div class="h-4 w-px bg-border" />
        <h1 class="text-sm font-semibold truncate text-foreground">
          {{ family?.kepala_keluarga ?? 'Detail Keluarga' }}
        </h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p class="text-base text-muted-foreground font-medium">Memuat data keluarga...</p>
      </div>

      <template v-else-if="family">
        <!-- Family info card -->
        <div class="bg-white rounded-xl border overflow-hidden">
          <div class="h-1.5 bg-gradient-to-r from-blue-500 to-blue-400" />
          <div class="p-5">
            <div class="flex flex-wrap gap-1.5 mb-3">
              <span class="inline-flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">RT {{ family.rt }}</span>
              <span class="inline-flex items-center text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-semibold">RW {{ family.rw }}</span>
            </div>
            <h2 class="text-2xl font-bold text-foreground">{{ family.kepala_keluarga }}</h2>
            <div class="mt-3 space-y-2">
              <p class="flex items-start gap-2 text-base text-muted-foreground">
                <MapPin class="h-4 w-4 mt-1 shrink-0 text-muted-foreground/60" />
                {{ family.alamat }}
              </p>
              <p v-if="family.no_telp_rumah" class="flex items-center gap-2 text-base text-muted-foreground">
                <Phone class="h-4 w-4 shrink-0 text-muted-foreground/60" />
                {{ family.no_telp_rumah }}
              </p>
            </div>

            <!-- Action buttons — stacked on mobile -->
            <div v-if="canEdit || isSuperAdmin" class="flex flex-col sm:flex-row gap-3 mt-5 pt-5 border-t border-border/60">
              <NuxtLink
                v-if="canEdit"
                :to="`/family/${id}/edit`"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold bg-white border-2 border-border text-foreground px-4 py-3 rounded-xl hover:bg-muted hover:border-primary/30 transition-colors"
              >
                <Pencil class="h-4 w-4" />
                Edit Data Keluarga
              </NuxtLink>
              <button
                v-if="isSuperAdmin"
                :disabled="isDeleting"
                @click="onDelete"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold bg-red-50 border-2 border-red-200 text-destructive px-4 py-3 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" />
                <Trash2 v-else class="h-4 w-4" />
                {{ isDeleting ? 'Sedang menghapus...' : 'Hapus Data Keluarga' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Members card -->
        <div class="bg-white rounded-xl border overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-muted-foreground" />
              <h3 class="font-bold text-base text-foreground">Anggota Keluarga</h3>
            </div>
            <span class="text-sm font-bold bg-primary text-white px-3 py-1 rounded-full">
              {{ family.members.length }} orang
            </span>
          </div>

          <!-- Desktop table -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b bg-muted/20">
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide w-8">#</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Nama</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Tempat, Tgl Lahir</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Darah</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">No HP</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(m, idx) in family.members"
                  :key="m.id"
                  class="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td class="px-4 py-3 text-xs text-muted-foreground font-mono">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-foreground">{{ m.nama_lengkap }}</td>
                  <td class="px-4 py-3 text-muted-foreground">
                    <span v-if="m.tempat_lahir || m.tanggal_lahir" class="flex items-center gap-1">
                      <Calendar class="h-3 w-3 shrink-0 text-muted-foreground/50" />
                      {{ [m.tempat_lahir, m.tanggal_lahir].filter(Boolean).join(', ') }}
                    </span>
                    <span v-else class="text-muted-foreground/30">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg', hubColor[m.hub_kel] ?? 'bg-slate-100 text-slate-600']">
                      {{ m.hub_kel }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="m.gol_darah && m.gol_darah !== '-'" :class="['font-bold text-sm', golDarahColor[m.gol_darah] ?? 'text-foreground']">
                      {{ m.gol_darah }}
                    </span>
                    <span v-else class="text-muted-foreground/30">—</span>
                  </td>
                  <td class="px-4 py-3 text-muted-foreground text-xs">{{ m.no_hp || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards (large, easy to read) -->
          <div class="sm:hidden divide-y">
            <div v-for="(m, idx) in family.members" :key="m.id" class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">{{ idx + 1 }}</span>
                  <span class="font-bold text-base text-foreground">{{ m.nama_lengkap }}</span>
                </div>
                <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ml-2', hubColor[m.hub_kel] ?? 'bg-slate-100 text-slate-600']">
                  {{ m.hub_kel }}
                </span>
              </div>
              <div class="ml-9 space-y-1">
                <p v-if="m.tempat_lahir || m.tanggal_lahir" class="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar class="h-3.5 w-3.5 shrink-0" />
                  {{ [m.tempat_lahir, m.tanggal_lahir].filter(Boolean).join(', ') }}
                </p>
                <div class="flex items-center gap-3 text-sm text-muted-foreground">
                  <span v-if="m.no_hp">📱 {{ m.no_hp }}</span>
                  <span v-if="m.gol_darah && m.gol_darah !== '-'" :class="['font-bold', golDarahColor[m.gol_darah]]">
                    Gol. {{ m.gol_darah }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
