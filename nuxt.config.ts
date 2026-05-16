export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],

  components: [
    { path: '~/components/ui', pathPrefix: false, extensions: ['vue'] },
    { path: '~/components', extensions: ['vue'] },
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (NOT exposed to client)
    sessionPassword: '',
    oauthGoogleClientId: '',
    oauthGoogleClientSecret: '',
    googleServiceAccountEmail: '',
    googleServiceAccountKey: '',
    sheetId: '',

    public: {
      appName: 'Data Warga RW',
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Data Warga RW',
      short_name: 'Warga RW',
      description: 'Manajemen data warga RW',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      lang: 'id',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: null,
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/families'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-families',
            expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
})
