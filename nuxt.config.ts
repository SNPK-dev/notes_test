// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  typescript: {
    strict: true,
  },
})
