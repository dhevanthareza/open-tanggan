<script setup lang="ts">
import { useFamilies } from '~/queries/families'
import { Users, Plus, Search, LogOut, MapPin, ChevronDown, Home, ShieldCheck, Printer, CheckSquare, Square, X, Loader2 } from 'lucide-vue-next'

const { data: families, isLoading, error } = useFamilies()
const { user } = useUserSession()
const search = ref('')
const rtFilter = ref('')
const isLoggingOut = ref(false)

const isSuperAdmin = computed(() => user.value?.role === 'rw_admin' || user.value?.role === 'developer')

const filtered = computed(() => {
  if (!families.value) return []
  return families.value.filter((f) => {
    const matchSearch = !search.value
      || f.kepala_keluarga.toLowerCase().includes(search.value.toLowerCase())
      || f.alamat.toLowerCase().includes(search.value.toLowerCase())
    const matchRt = !rtFilter.value || f.rt === rtFilter.value
    return matchSearch && matchRt
  })
})

const allRts = computed(() => {
  if (!families.value) return []
  return [...new Set(families.value.map(f => f.rt))].sort()
})

const totalMembers = computed(() => {
  if (!families.value) return 0
  return families.value.reduce((sum, f) => sum + (f.member_count ?? 0), 0)
})

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  } catch {
    isLoggingOut.value = false
  }
}

// Print selection mode
const printMode = ref(false)
const selected = ref<Set<string>>(new Set())

const togglePrintMode = () => {
  printMode.value = !printMode.value
  if (!printMode.value) selected.value = new Set()
}

const toggleSelect = (id: string) => {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

const selectAll = () => {
  selected.value = new Set(filtered.value.map(f => f.id))
}

const clearSelection = () => {
  selected.value = new Set()
}

const NuxtLinkComponent = resolveComponent('NuxtLink')

const goToPrint = () => {
  if (!selected.value.size) return
  const ids = [...selected.value].join(',')
  navigateTo(`/print?ids=${ids}`)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center gap-2">
        <!-- Left: branding -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Home class="h-4 w-4 text-white" />
          </div>
          <div class="min-w-0">
            <span class="font-bold text-sm text-foreground leading-none block truncate">Data Warga RW</span>
            <span class="text-xs text-muted-foreground truncate">
              {{ user?.rt === '*' ? 'Akses Penuh (RW)' : `RT ${user?.rt}` }}
            </span>
          </div>
        </div>

        <!-- Right: action buttons -->
        <div class="flex items-center gap-1">
          <!-- Print toggle -->
          <button
            v-if="!isLoading && families?.length"
            @click="togglePrintMode"
            :class="[
              'flex items-center gap-1.5 font-medium px-2.5 py-2 rounded-lg transition-colors text-sm',
              printMode
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            ]"
            title="Cetak data"
          >
            <Printer class="h-4 w-4 shrink-0" />
            <span class="hidden sm:inline">{{ printMode ? 'Batal' : 'Cetak' }}</span>
          </button>

          <!-- Admin link -->
          <NuxtLink
            v-if="isSuperAdmin"
            to="/admin"
            class="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors px-2.5 py-2 rounded-lg hover:bg-primary/5 text-sm"
            title="Manajemen Admin"
          >
            <ShieldCheck class="h-4 w-4 shrink-0" />
            <span class="hidden sm:inline">Admin</span>
          </NuxtLink>

          <!-- User avatar -->
          <div class="flex items-center gap-2 px-1">
            <img
              v-if="user?.picture"
              :src="user.picture"
              :alt="user.nama"
              class="h-8 w-8 rounded-full object-cover ring-2 ring-border shrink-0"
            />
            <div v-else class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {{ user?.nama?.charAt(0) }}
            </div>
            <span class="hidden md:inline text-sm font-medium text-foreground truncate max-w-[120px]">{{ user?.nama }}</span>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors px-2.5 py-2 rounded-lg hover:bg-destructive/5 disabled:opacity-50 text-sm"
            title="Keluar"
          >
            <Loader2 v-if="isLoggingOut" class="h-4 w-4 animate-spin shrink-0" />
            <LogOut v-else class="h-4 w-4 shrink-0" />
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-5 space-y-5">
      <!-- Stats strip -->
      <div class="grid grid-cols-3 gap-3" v-if="!isLoading && families">
        <div class="bg-white rounded-xl border p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div class="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users class="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-bold text-foreground leading-none">{{ families.length }}</p>
            <p class="text-xs text-muted-foreground mt-0.5 leading-tight">Keluarga</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div class="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="h-4 w-4 sm:h-5 sm:w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-bold text-foreground leading-none">{{ totalMembers }}</p>
            <p class="text-xs text-muted-foreground mt-0.5 leading-tight">Total Warga</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div class="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <MapPin class="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-bold text-foreground leading-none">{{ allRts.length }}</p>
            <p class="text-xs text-muted-foreground mt-0.5 leading-tight">RT Aktif</p>
          </div>
        </div>
      </div>

      <!-- Page title + action -->
      <div class="flex justify-between items-center gap-3">
        <div class="min-w-0">
          <h2 class="text-xl font-bold text-foreground leading-tight">
            {{ printMode ? '🖨️ Pilih Data untuk Dicetak' : 'Daftar Keluarga' }}
          </h2>
          <p class="text-sm text-muted-foreground mt-0.5">
            <template v-if="printMode">{{ selected.size }} keluarga dipilih</template>
            <template v-else>{{ filtered.length }} dari {{ families?.length ?? 0 }} keluarga</template>
          </p>
        </div>
        <NuxtLink
          v-if="!printMode"
          to="/family/new"
          class="shrink-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm text-sm"
        >
          <Plus class="h-4 w-4" />
          <span>Tambah</span>
        </NuxtLink>
        <!-- Print mode quick actions -->
        <div v-else class="flex items-center gap-2 shrink-0">
          <button @click="selectAll" class="text-sm font-semibold text-primary hover:underline">Pilih Semua</button>
          <button v-if="selected.size > 0" @click="clearSelection" class="text-sm text-muted-foreground hover:text-foreground">Hapus</button>
        </div>
      </div>

      <!-- Search + Filter -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama kepala keluarga atau alamat..."
            class="w-full pl-9 pr-4 h-11 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div class="relative shrink-0">
          <select
            v-model="rtFilter"
            class="appearance-none h-11 rounded-xl border border-input bg-white pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">Semua RT</option>
            <option v-for="rt in allRts" :key="rt" :value="rt">RT {{ rt }}</option>
          </select>
          <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p class="text-base text-muted-foreground font-medium">Sedang memuat data keluarga...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex items-center justify-center py-24">
        <div class="text-center max-w-xs bg-white border rounded-2xl p-8">
          <div class="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg class="h-7 w-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="font-bold text-foreground text-lg">Gagal memuat data</p>
          <p class="text-sm text-muted-foreground mt-2">{{ error.message }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
          <Users class="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div class="text-center">
          <p class="font-bold text-foreground text-lg">Belum ada data keluarga</p>
          <p class="text-sm text-muted-foreground mt-1">
            {{ search || rtFilter ? 'Coba ubah filter atau kata pencarian' : 'Mulai dengan menambahkan keluarga pertama' }}
          </p>
        </div>
        <NuxtLink
          v-if="!search && !rtFilter"
          to="/family/new"
          class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm mt-1"
        >
          <Plus class="h-4 w-4" /> Tambah Keluarga Pertama
        </NuxtLink>
      </div>

      <!-- Family grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
        <component
          :is="printMode ? 'div' : NuxtLinkComponent"
          v-for="family in filtered"
          :key="family.id"
          v-bind="!printMode ? { to: `/family/${family.id}` } : {}"
          @click="printMode ? toggleSelect(family.id) : undefined"
          :class="[
            'group bg-white rounded-xl border transition-all duration-200 overflow-hidden',
            printMode
              ? 'cursor-pointer select-none'
              : 'hover:border-primary/40 hover:shadow-md active:scale-[0.99]',
            printMode && selected.has(family.id)
              ? 'border-primary ring-2 ring-primary/30 shadow-md'
              : printMode
                ? 'hover:border-primary/30'
                : '',
          ]"
        >
          <!-- Card top accent -->
          <div :class="[
            'h-1 bg-gradient-to-r from-primary/60 to-primary transition-all duration-300',
            printMode && selected.has(family.id) ? 'w-full' : 'w-0 group-hover:w-full'
          ]" />
          <div class="p-4">
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                  {{ family.kepala_keluarga }}
                </h3>
                <p class="text-sm text-muted-foreground mt-1 flex items-start gap-1 leading-relaxed">
                  <MapPin class="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span class="line-clamp-2">{{ family.alamat }}</span>
                </p>
              </div>
              <!-- Print mode checkbox -->
              <div v-if="printMode" class="shrink-0 mt-0.5">
                <CheckSquare v-if="selected.has(family.id)" class="h-6 w-6 text-primary" />
                <Square v-else class="h-6 w-6 text-muted-foreground/30" />
              </div>
            </div>
            <div class="flex items-center gap-1.5 pt-3 border-t border-border/60 flex-wrap">
              <span class="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold">RT {{ family.rt }}</span>
              <span class="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-semibold">RW {{ family.rw }}</span>
              <span class="ml-auto inline-flex items-center text-xs bg-primary/8 text-primary px-2 py-1 rounded-lg font-semibold">
                👥 {{ family.member_count }} orang
              </span>
            </div>
          </div>
        </component>
      </div>

      <!-- Floating print action bar — full-width on mobile, pill on desktop -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="translate-y-20 opacity-0"
          leave-active-class="transition-all duration-200"
          leave-to-class="translate-y-20 opacity-0"
        >
          <div
            v-if="printMode"
            class="fixed bottom-0 inset-x-0 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-gray-900 text-white sm:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl"
          >
            <div class="px-5 py-4 flex flex-col sm:flex-row items-center gap-3">
              <div class="text-base font-semibold w-full sm:w-auto text-center sm:text-left">
                <span class="text-white">{{ selected.size }}</span>
                <span class="text-white/60 ml-1 text-sm">keluarga dipilih</span>
              </div>
              <div class="hidden sm:block w-px h-5 bg-white/20" />
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button @click="selectAll" class="flex-1 sm:flex-none text-sm font-medium text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10">
                  Pilih Semua
                </button>
                <button v-if="selected.size" @click="clearSelection" class="text-sm text-white/50 hover:text-white/80 transition-colors py-2 px-2 rounded-lg hover:bg-white/10">
                  <X class="h-4 w-4" />
                </button>
                <button
                  @click="goToPrint"
                  :disabled="selected.size === 0"
                  class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Printer class="h-4 w-4" />
                  Lihat Preview Cetak
                </button>
                <button @click="togglePrintMode" class="text-white/40 hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/10">
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>
  </div>
</template>
