<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow max-w-sm w-full text-center">
      <h1 class="text-2xl font-bold mb-2">Kesalahan</h1>
      <p class="text-gray-600 mb-6">{{ error?.message || 'Terjadi kesalahan yang tidak terduga' }}</p>
      <NuxtLink to="/" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Kembali ke Beranda
      </NuxtLink>
    </div>
  </div>
</template>
