// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@tresjs/nuxt'],
  ssr: false,

  css: ['@/assets/main.css'],
  imports: {
    dirs: ['types']
  },

  vite: {
    plugins: [tailwindcss(), glsl()],
    assetsInclude: ['**/*.glsl'],
    optimizeDeps: {
      exclude: ['three']
    }
  }
});
