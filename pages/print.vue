<script setup lang="ts">
import { Printer, ArrowLeft, Pencil, Check, X } from 'lucide-vue-next'
import type { FamilyDetail } from '~/types'

const route = useRoute()
const ids = computed(() => String(route.query.ids ?? '').split(',').filter(Boolean))

const { data: families, pending, error } = await useFetch<FamilyDetail[]>('/api/families/print', {
  query: { ids: computed(() => ids.value.join(',')) },
  watch: false,
})

// Configurable print title (persisted in localStorage)
const printTitle = ref('DATA WARGA RW')
const editingTitle = ref(false)
const titleDraft = ref('')

onMounted(() => {
  const saved = localStorage.getItem('print-title')
  if (saved) printTitle.value = saved
})

const startEditTitle = () => {
  titleDraft.value = printTitle.value
  editingTitle.value = true
}
const saveTitle = () => {
  printTitle.value = titleDraft.value
  localStorage.setItem('print-title', titleDraft.value)
  editingTitle.value = false
}

const formatTTL = (tempat: string, tanggal: string) => {
  const parts: string[] = []
  if (tempat) parts.push(tempat)
  if (tanggal) {
    // Convert YYYY-MM-DD to DD-MM-YYYY
    const d = tanggal.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    parts.push(d ? `${d[3]}-${d[2]}-${d[1]}` : tanggal)
  }
  return parts.join(', ')
}

const doPrint = () => window.print()
</script>

<template>
  <div>
    <!-- Screen-only toolbar -->
    <div class="print:hidden fixed top-0 inset-x-0 z-50 bg-white border-b shadow-sm">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft class="h-4 w-4" />
            Kembali
          </NuxtLink>
          <div class="h-4 w-px bg-border" />
          <span class="text-sm font-semibold text-foreground">
            Print Preview — {{ ids.length }} keluarga
          </span>
        </div>
        <button
          @click="doPrint"
          :disabled="pending || !families?.length"
          class="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Printer class="h-4 w-4" />
          Cetak
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="print:hidden min-h-screen flex items-center justify-center pt-14">
      <div class="text-center">
        <div class="h-9 w-9 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
        <p class="text-sm text-muted-foreground">Memuat data keluarga...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="print:hidden min-h-screen flex items-center justify-center pt-14 px-4">
      <div class="text-center max-w-xs">
        <p class="font-semibold text-foreground">Gagal memuat data</p>
        <p class="text-sm text-muted-foreground mt-1">{{ error.message }}</p>
      </div>
    </div>

    <!-- Print document -->
    <div v-else-if="families" class="pt-14 print:pt-0 bg-gray-100 print:bg-white min-h-screen">
      <!-- Screen: paper wrapper -->
      <div class="print:block max-w-[794px] mx-auto print:max-w-none">

        <!-- Screen: title editor -->
        <div class="print:hidden mx-4 mt-4 mb-2 flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">Judul cetak:</span>
          <template v-if="!editingTitle">
            <span class="font-semibold text-foreground">{{ printTitle }}</span>
            <button @click="startEditTitle" class="p-1 text-muted-foreground hover:text-primary transition-colors">
              <Pencil class="h-3.5 w-3.5" />
            </button>
          </template>
          <template v-else>
            <input
              v-model="titleDraft"
              class="flex-1 h-8 border rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              @keydown.enter="saveTitle"
              @keydown.esc="editingTitle = false"
              autofocus
            />
            <button @click="saveTitle" class="p-1 text-green-600 hover:text-green-700 transition-colors"><Check class="h-4 w-4" /></button>
            <button @click="editingTitle = false" class="p-1 text-muted-foreground hover:text-foreground transition-colors"><X class="h-4 w-4" /></button>
          </template>
        </div>

        <!-- Print content (matches the reference image) -->
        <div class="print-page bg-white mx-4 mb-6 print:m-0 p-8 print:p-6 shadow-md print:shadow-none">

          <!-- Document title -->
          <div class="text-center mb-6 print:mb-5">
            <p class="font-bold text-sm print:text-base underline uppercase tracking-wide">{{ printTitle }}</p>
          </div>

          <!-- Family blocks -->
          <div
            v-for="(family, fi) in families"
            :key="family.id"
            class="mb-8 print:mb-6"
            style="page-break-inside: avoid;"
          >
            <!-- Family header info -->
            <table class="w-full mb-2 text-sm print:text-xs" style="border-collapse: collapse;">
              <tbody>
                <tr>
                  <td style="width:38%; padding: 1px 0; vertical-align: top;">Nama Kepala Keluarga</td>
                  <td style="padding: 1px 0; vertical-align: top;">: {{ family.kepala_keluarga }}</td>
                </tr>
                <tr>
                  <td style="padding: 1px 0; vertical-align: top;">Alamat, RT/ RW</td>
                  <td style="padding: 1px 0; vertical-align: top;">: {{ family.alamat }} - RT.{{ family.rt }} / RW.{{ family.rw }}</td>
                </tr>
                <tr>
                  <td style="padding: 1px 0; vertical-align: top;">Nomor Telp. Rumah</td>
                  <td style="padding: 1px 0; vertical-align: top;">: {{ family.no_telp_rumah || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Members table -->
            <table class="w-full text-sm print:text-xs" style="border-collapse: collapse; border: 1px solid #000;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 40px;">No.</th>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center;">Nama Lengkap</th>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 160px;">
                    Tempat<br />tanggal lahir
                  </th>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 64px;">Hub kel.</th>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 54px;">Gol drh</th>
                  <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 110px;">No. HP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(m, idx) in family.members" :key="m.id">
                  <td style="border: 1px solid #000; padding: 4px 6px; text-align: center;">{{ idx + 1 }}</td>
                  <td style="border: 1px solid #000; padding: 4px 6px;">{{ m.nama_lengkap }}</td>
                  <td style="border: 1px solid #000; padding: 4px 6px;">{{ formatTTL(m.tempat_lahir, m.tanggal_lahir) }}</td>
                  <td style="border: 1px solid #000; padding: 4px 6px; text-align: center;">{{ m.hub_kel }}</td>
                  <td style="border: 1px solid #000; padding: 4px 6px; text-align: center;">{{ m.gol_darah !== '-' ? m.gol_darah : '' }}</td>
                  <td style="border: 1px solid #000; padding: 4px 6px;">{{ m.no_hp }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body { margin: 0; padding: 0; background: white; }
  .print-page { font-family: Arial, sans-serif; }
}
</style>
