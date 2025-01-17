// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false,
  devtools: { enabled: true },
  css: [
    '~/assets/css/satoshi.css',
    '~/assets/css/style.css',
    'jsvectormap/dist/jsvectormap.min.css',
    'flatpickr/dist/flatpickr.min.css'
  ],
  modules: [
    '@nuxtjs/tailwindcss', 
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],
  routeRules: {
    
},
})