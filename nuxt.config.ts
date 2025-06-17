// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', '@tresjs/nuxt', '@nuxt/eslint'],
  ssr: false,

  css: ['@/assets/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['three']
    }
  }
});
