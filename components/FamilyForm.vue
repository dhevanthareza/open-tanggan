<script setup lang="ts">
import type { FamilyInput, MemberInput } from '~/schemas'
import { Trash2, UserPlus, ChevronLeft, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  initial?: FamilyInput
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{ submit: [data: FamilyInput] }>()

const blankMember = (): MemberInput => ({
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  hub_kel: 'Anak',
  gol_darah: '-',
  no_hp: '',
})

const form = ref<FamilyInput>(props.initial ?? {
  kepala_keluarga: '',
  alamat: '',
  rt: '',
  rw: '',
  no_telp_rumah: '',
  members: [blankMember()],
})

const addMember = () => form.value.members.push(blankMember())
const removeMember = (i: number) => {
  if (form.value.members.length > 1) form.value.members.splice(i, 1)
}

const hubOptions = ['Suami', 'Istri', 'Anak', 'Lainnya']
const golDarahOptions = ['-', 'A', 'B', 'AB', 'O']

const inputClass = 'flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-muted-foreground/50'
const selectClass = 'flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer appearance-none'
const labelClass = 'block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide'
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft class="h-4 w-4" />
          Kembali
        </NuxtLink>
        <div class="h-4 w-px bg-border" />
        <h1 class="text-sm font-semibold text-foreground">
          {{ initial ? 'Edit Data Keluarga' : 'Tambah Keluarga Baru' }}
        </h1>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <!-- Family data card -->
      <div class="bg-white rounded-xl border overflow-hidden">
        <div class="px-5 py-4 border-b bg-muted/30">
          <h2 class="font-semibold text-sm text-foreground">Data Kepala Keluarga</h2>
          <p class="text-xs text-muted-foreground mt-0.5">Informasi utama identitas keluarga</p>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label :class="labelClass">Nama Kepala Keluarga <span class="text-destructive normal-case">*</span></label>
            <input
              v-model="form.kepala_keluarga"
              :class="inputClass"
              placeholder="Masukkan nama lengkap kepala keluarga"
              required
            />
          </div>
          <div>
            <label :class="labelClass">Alamat <span class="text-destructive normal-case">*</span></label>
            <input
              v-model="form.alamat"
              :class="inputClass"
              placeholder="Jl. Contoh No. 1 RT..."
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="labelClass">RT <span class="text-destructive normal-case">*</span></label>
              <input v-model="form.rt" :class="inputClass" placeholder="001" required />
            </div>
            <div>
              <label :class="labelClass">RW <span class="text-destructive normal-case">*</span></label>
              <input v-model="form.rw" :class="inputClass" placeholder="005" required />
            </div>
          </div>
          <div>
            <label :class="labelClass">No Telp Rumah <span class="text-muted-foreground font-normal normal-case">(opsional)</span></label>
            <input v-model="form.no_telp_rumah" :class="inputClass" placeholder="021-XXXXXXX" />
          </div>
        </div>
      </div>

      <!-- Members card -->
      <div class="bg-white rounded-xl border overflow-hidden">
        <div class="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-sm text-foreground">Anggota Keluarga</h2>
            <p class="text-xs text-muted-foreground mt-0.5">{{ form.members.length }} anggota ditambahkan</p>
          </div>
        </div>

        <div class="p-5 space-y-4">
          <div
            v-for="(_, i) in form.members"
            :key="i"
            class="rounded-lg border bg-muted/20 overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
              <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anggota #{{ i + 1 }}</span>
              <button
                v-if="form.members.length > 1"
                type="button"
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                @click="removeMember(i)"
              >
                <Trash2 class="h-3.5 w-3.5" />
                Hapus
              </button>
            </div>

            <div class="p-4 space-y-3">
              <div>
                <label :class="labelClass">Nama Lengkap <span class="text-destructive normal-case">*</span></label>
                <input
                  v-model="form.members[i].nama_lengkap"
                  :class="inputClass"
                  placeholder="Nama lengkap sesuai KTP"
                  required
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label :class="labelClass">Tempat Lahir</label>
                  <input v-model="form.members[i].tempat_lahir" :class="inputClass" placeholder="Jakarta" />
                </div>
                <div>
                  <label :class="labelClass">Tanggal Lahir</label>
                  <input v-model="form.members[i].tanggal_lahir" :class="inputClass" type="date" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label :class="labelClass">Hub. Keluarga <span class="text-destructive normal-case">*</span></label>
                  <div class="relative">
                    <select v-model="form.members[i].hub_kel" :class="selectClass" required>
                      <option v-for="opt in hubOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                <div>
                  <label :class="labelClass">Gol. Darah</label>
                  <div class="relative">
                    <select v-model="form.members[i].gol_darah" :class="selectClass">
                      <option v-for="opt in golDarahOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                <div>
                  <label :class="labelClass">No HP</label>
                  <input v-model="form.members[i].no_hp" :class="inputClass" placeholder="08xx" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="addMember"
            class="w-full flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <UserPlus class="h-4 w-4" />
            Tambah Anggota
          </button>
        </div>
      </div>

      <!-- Error + submit -->
      <div class="space-y-3">
        <p v-if="error" class="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-3 flex items-start gap-2">
          <svg class="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          {{ error }}
        </p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          {{ loading ? 'Menyimpan...' : (initial ? 'Simpan Perubahan' : 'Tambahkan Keluarga') }}
        </button>
      </div>
    </main>
  </form>
</template>
