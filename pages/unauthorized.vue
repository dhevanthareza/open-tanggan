<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="text-center max-w-sm">
      <div class="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <svg class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h1 class="text-xl font-bold text-foreground">Akses Ditolak</h1>
      <p class="text-sm text-muted-foreground mt-2">
        Akun Anda tidak memiliki izin untuk mengakses sistem ini. Hubungi administrator RW Anda.
      </p>
      <a
        href="/auth/logout"
        class="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Kembali ke Login
      </a>
    </div>
  </div>
</template>
