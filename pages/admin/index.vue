<script setup lang="ts">
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from '~/queries/admins'
import { ChevronLeft, Plus, Trash2, Pencil, X, Check, ShieldCheck, Users2, Loader2 } from 'lucide-vue-next'
import type { AdminInput, AdminUpdateInput } from '~/schemas'
import type { Admin } from '~/types'

const { user } = useUserSession()
const { ask } = useConfirm()
const toast = useToast()

// Guard: only super-admins can access
if (user.value?.role !== 'rw_admin' && user.value?.role !== 'developer') {
  await navigateTo('/')
}

const { data: admins, isLoading } = useAdmins()
const { mutate: createAdmin, isPending: isCreating, error: createError } = useCreateAdmin()
const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin()
const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin()

// --- Add form state ---
const showAddForm = ref(false)
const addForm = ref<AdminInput>({ email: '', nama: '', role: 'rt_admin', rt: '' })
const addFormError = ref('')

const resetAddForm = () => {
  addForm.value = { email: '', nama: '', role: 'rt_admin', rt: '' }
  addFormError.value = ''
  showAddForm.value = false
}

const submitAdd = () => {
  addFormError.value = ''
  createAdmin(addForm.value, {
    onSuccess: () => {
      resetAddForm()
      toast.success('Admin baru berhasil ditambahkan.')
    },
    onError: (e: any) => { addFormError.value = e?.data?.message ?? 'Gagal menambahkan admin' },
  })
}

// --- Edit inline state ---
const editingEmail = ref<string | null>(null)
const editForm = ref<AdminUpdateInput & { active: boolean }>({ nama: '', role: 'rt_admin', rt: '', active: true })

const startEdit = (admin: Admin) => {
  editingEmail.value = admin.email
  editForm.value = { nama: admin.nama, role: admin.role, rt: admin.rt, active: admin.active }
}
const cancelEdit = () => { editingEmail.value = null }

const submitEdit = () => {
  if (!editingEmail.value) return
  updateAdmin({ email: editingEmail.value, data: editForm.value }, {
    onSuccess: () => {
      editingEmail.value = null
      toast.success('Data admin berhasil diperbarui.')
    },
    onError: (e: any) => toast.error(e?.data?.message ?? 'Gagal memperbarui admin'),
  })
}

const onDelete = async (admin: Admin) => {
  const confirmed = await ask({
    title: 'Hapus Admin?',
    message: `Akun "${admin.nama}" (${admin.email}) akan dihapus dan tidak bisa lagi masuk ke sistem.`,
    confirmLabel: 'Ya, Hapus Admin',
    destructive: true,
  })
  if (!confirmed) return
  deleteAdmin(admin.email, {
    onSuccess: () => toast.success(`Admin ${admin.nama} berhasil dihapus.`),
    onError: (e: any) => toast.error(e?.data?.message ?? 'Gagal menghapus admin'),
  })
}

const roleLabel: Record<string, string> = {
  rw_admin: 'RW Admin',
  rt_admin: 'RT Admin',
  developer: 'Developer',
}
const roleBadge: Record<string, string> = {
  rw_admin: 'bg-blue-50 text-blue-700',
  rt_admin: 'bg-green-50 text-green-700',
  developer: 'bg-purple-50 text-purple-700',
}

const inputClass = 'flex h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'
const selectClass = 'flex h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer'
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft class="h-4 w-4" />
          Kembali
        </NuxtLink>
        <div class="h-4 w-px bg-border" />
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-primary" />
          <h1 class="text-sm font-bold text-foreground">Manajemen Admin</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <!-- Info banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
        <span class="text-lg shrink-0">⚠️</span>
        <div>
          <span class="font-bold">Perhatian:</span> Perubahan hak akses baru aktif setelah pengguna login ulang. Perlu waktu hingga 60 detik untuk pembaruan akses.
        </div>
      </div>

      <!-- Admin list card -->
      <div class="bg-white rounded-xl border overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
          <div class="flex items-center gap-2">
            <Users2 class="h-4 w-4 text-muted-foreground" />
            <h2 class="font-bold text-base text-foreground">Daftar Admin</h2>
            <span v-if="admins" class="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full ml-1">
              {{ admins.length }}
            </span>
          </div>
          <button
            @click="showAddForm = !showAddForm"
            class="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus class="h-4 w-4" />
            Tambah Admin
          </button>
        </div>

        <!-- Add form -->
        <div v-if="showAddForm" class="border-b bg-muted/20 px-5 py-4">
          <p class="text-sm font-bold text-foreground mb-4">➕ Tambah Admin Baru</p>
          <form @submit.prevent="submitAdd" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-foreground mb-1.5 block">Email *</label>
              <input v-model="addForm.email" :class="inputClass" type="email" placeholder="admin@gmail.com" required />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground mb-1.5 block">Nama Lengkap *</label>
              <input v-model="addForm.nama" :class="inputClass" placeholder="Nama lengkap" required />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground mb-1.5 block">Role / Jabatan *</label>
              <select v-model="addForm.role" :class="selectClass">
                <option value="rw_admin">RW Admin (akses penuh)</option>
                <option value="rt_admin">RT Admin (akses terbatas)</option>
                <option value="developer">Developer (akses penuh)</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground mb-1.5 block">
                Nomor RT <span class="text-muted-foreground font-normal">(isi * untuk akses penuh)</span>
              </label>
              <input v-model="addForm.rt" :class="inputClass" placeholder="001 atau *" required />
            </div>
            <div v-if="addFormError" class="sm:col-span-2">
              <p class="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
                ⚠️ {{ addFormError }}
              </p>
            </div>
            <div class="sm:col-span-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white h-11 px-5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <Loader2 v-if="isCreating" class="h-4 w-4 animate-spin" />
                <Check v-else class="h-4 w-4" />
                {{ isCreating ? 'Menyimpan...' : 'Simpan Admin Baru' }}
              </button>
              <button
                type="button"
                @click="resetAddForm"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold bg-muted text-muted-foreground h-11 px-5 rounded-xl hover:bg-muted/80 transition-colors"
              >
                <X class="h-4 w-4" />
                Batal
              </button>
            </div>
          </form>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p class="text-sm font-medium text-muted-foreground">Memuat data admin...</p>
        </div>

        <!-- Desktop table (sm+) -->
        <div v-else-if="admins" class="hidden sm:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/20">
                <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Nama / Email</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Role</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">RT</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="admin in admins" :key="admin.email">
                <!-- Normal row -->
                <tr v-if="editingEmail !== admin.email" class="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-foreground">{{ admin.nama }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ admin.email }}</div>
                    <span v-if="admin.email === user?.email" class="text-xs text-primary font-semibold">(Akun Anda)</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg', roleBadge[admin.role] ?? 'bg-muted text-muted-foreground']">
                      {{ roleLabel[admin.role] ?? admin.role }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {{ admin.rt === '*' ? 'Semua RT' : `RT ${admin.rt}` }}
                  </td>
                  <td class="px-4 py-3">
                    <span :class="admin.active ? 'text-green-700 bg-green-50' : 'text-muted-foreground bg-muted'" class="text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {{ admin.active ? '✓ Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="startEdit(admin)"
                        class="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Pencil class="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        v-if="admin.email !== user?.email"
                        @click="onDelete(admin)"
                        :disabled="isDeleting"
                        class="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Loader2 v-if="isDeleting" class="h-3.5 w-3.5 animate-spin" />
                        <Trash2 v-else class="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Edit row -->
                <tr v-else class="border-b last:border-0 bg-blue-50/40">
                  <td colspan="5" class="px-4 py-4">
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div>
                        <label class="text-xs font-bold text-foreground mb-1.5 block">Nama</label>
                        <input v-model="editForm.nama" :class="inputClass" placeholder="Nama" />
                      </div>
                      <div>
                        <label class="text-xs font-bold text-foreground mb-1.5 block">Role</label>
                        <select v-model="editForm.role" :class="selectClass">
                          <option value="rw_admin">RW Admin</option>
                          <option value="rt_admin">RT Admin</option>
                          <option value="developer">Developer</option>
                        </select>
                      </div>
                      <div>
                        <label class="text-xs font-bold text-foreground mb-1.5 block">RT</label>
                        <input v-model="editForm.rt" :class="inputClass" placeholder="001 atau *" />
                      </div>
                      <div>
                        <label class="text-xs font-bold text-foreground mb-1.5 block">Status</label>
                        <select v-model="editForm.active" :class="selectClass">
                          <option :value="true">Aktif</option>
                          <option :value="false">Nonaktif</option>
                        </select>
                      </div>
                      <div class="sm:col-span-4 flex gap-2 mt-1">
                        <button
                          @click="submitEdit"
                          :disabled="isUpdating"
                          class="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-white h-10 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                          <Loader2 v-if="isUpdating" class="h-4 w-4 animate-spin" />
                          <Check v-else class="h-4 w-4" />
                          {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
                        </button>
                        <button
                          @click="cancelEdit"
                          class="inline-flex items-center gap-1.5 text-sm font-semibold bg-muted text-muted-foreground h-10 px-4 rounded-xl hover:bg-muted/80 transition-colors"
                        >
                          <X class="h-4 w-4" />
                          Batal
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards (< sm) -->
        <div v-else-if="admins" class="sm:hidden divide-y">
          <template v-for="admin in admins" :key="admin.email">
            <!-- View card -->
            <div v-if="editingEmail !== admin.email" class="p-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-base text-foreground">{{ admin.nama }}</span>
                    <span v-if="admin.email === user?.email" class="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">Anda</span>
                  </div>
                  <p class="text-sm text-muted-foreground mt-0.5 truncate">{{ admin.email }}</p>
                </div>
                <span :class="admin.active ? 'text-green-700 bg-green-50' : 'text-muted-foreground bg-muted'" class="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
                  {{ admin.active ? '✓ Aktif' : 'Nonaktif' }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-3 flex-wrap">
                <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg', roleBadge[admin.role] ?? 'bg-muted text-muted-foreground']">
                  {{ roleLabel[admin.role] ?? admin.role }}
                </span>
                <span class="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                  {{ admin.rt === '*' ? 'Semua RT' : `RT ${admin.rt}` }}
                </span>
              </div>
              <div class="flex gap-2 mt-3">
                <button
                  @click="startEdit(admin)"
                  class="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold border-2 border-border text-foreground h-10 rounded-xl hover:bg-muted transition-colors"
                >
                  <Pencil class="h-4 w-4" /> Edit
                </button>
                <button
                  v-if="admin.email !== user?.email"
                  @click="onDelete(admin)"
                  :disabled="isDeleting"
                  class="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold border-2 border-red-200 text-destructive h-10 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" />
                  <Trash2 v-else class="h-4 w-4" /> Hapus
                </button>
              </div>
            </div>

            <!-- Edit card -->
            <div v-else class="p-4 bg-blue-50/40">
              <p class="text-sm font-bold text-foreground mb-4">✏️ Edit: {{ admin.nama }}</p>
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-semibold text-foreground mb-1.5 block">Nama</label>
                  <input v-model="editForm.nama" :class="inputClass" placeholder="Nama" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-sm font-semibold text-foreground mb-1.5 block">Role</label>
                    <select v-model="editForm.role" :class="selectClass">
                      <option value="rw_admin">RW Admin</option>
                      <option value="rt_admin">RT Admin</option>
                      <option value="developer">Developer</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-foreground mb-1.5 block">RT</label>
                    <input v-model="editForm.rt" :class="inputClass" placeholder="001 atau *" />
                  </div>
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground mb-1.5 block">Status</label>
                  <select v-model="editForm.active" :class="selectClass">
                    <option :value="true">Aktif</option>
                    <option :value="false">Nonaktif</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2 pt-1">
                  <button
                    @click="submitEdit"
                    :disabled="isUpdating"
                    class="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white h-12 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    <Loader2 v-if="isUpdating" class="h-4 w-4 animate-spin" />
                    <Check v-else class="h-4 w-4" />
                    {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                  <button
                    @click="cancelEdit"
                    class="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold border-2 border-border text-foreground h-12 rounded-xl hover:bg-muted transition-colors"
                  >
                    <X class="h-4 w-4" />
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Role reference card -->
      <div class="bg-white rounded-xl border p-5">
        <h3 class="text-base font-bold text-foreground mb-4">📋 Panduan Role Admin</h3>
        <div class="space-y-3">
          <div class="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
            <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5">Developer</span>
            <p class="text-sm text-purple-900">Akses penuh seperti RW Admin. Isi RT dengan <code class="bg-purple-100 px-1.5 py-0.5 rounded font-mono text-xs">*</code></p>
          </div>
          <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5">RW Admin</span>
            <p class="text-sm text-blue-900">Akses penuh: baca, ubah, dan hapus semua data. Isi RT dengan <code class="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">*</code></p>
          </div>
          <div class="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
            <span class="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5">RT Admin</span>
            <p class="text-sm text-green-900">Hanya bisa ubah data keluarga di RT-nya sendiri (tidak bisa hapus). Isi RT dengan nomor RT, contoh: <code class="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">001</code></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
