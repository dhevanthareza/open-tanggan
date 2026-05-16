<script setup lang="ts">
const route = useRoute()
const error = computed(() => route.query.error)
const config = useRuntimeConfig()
const isLoggingIn = ref(false)

const handleGoogleLogin = () => {
  isLoggingIn.value = true
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
    <!-- Decorative blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-3xl" />
    </div>

    <div class="relative w-full max-w-sm">
      <!-- Logo & branding -->
      <div class="text-center mb-8">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30 mb-4">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">{{ config.public.appName }}</h1>
        <p class="text-blue-200/70 text-sm mt-1">Sistem Manajemen Data Warga</p>
      </div>

      <!-- Login card -->
      <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-white">Selamat datang 👋</h2>
          <p class="text-sm text-blue-200/60 mt-1">Tekan tombol di bawah untuk masuk ke sistem</p>
        </div>

        <a
          href="/auth/google"
          @click="handleGoogleLogin"
          :class="[
            'flex items-center justify-center gap-3 w-full rounded-xl bg-white px-4 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all',
            isLoggingIn ? 'opacity-75 cursor-wait' : 'hover:bg-white/95 active:scale-[0.98]'
          ]"
        >
          <div v-if="isLoggingIn" class="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin shrink-0" />
          <svg v-else class="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ isLoggingIn ? 'Sedang masuk, mohon tunggu...' : 'Masuk dengan Akun Google' }}
        </a>

        <p v-if="error" class="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
          ⚠️ Login gagal. Pastikan akun Anda sudah terdaftar sebagai admin.
        </p>

        <p class="text-center text-xs text-blue-200/40 mt-5">
          Hanya akun yang telah didaftarkan oleh administrator yang bisa masuk
        </p>
      </div>
    </div>
  </div>
</template>
