// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },
  app: {
    head: {
      title: "SiangLao - Lao Speech to Text",
      meta: [
        {
          name: "description",
          content:
            "Convert Lao speech to text with advanced AI technology. Accurate transcription for Lao language audio recordings.",
        },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/fonts", "@nuxt/icon", "@pinia/nuxt"],
  icon: {
    provider: 'iconify',
    collections: ['mdi'],
    serverBundle: {
      collections: ['mdi']
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      backendUrl: process.env.BACKEND_URL || 'https://sianglao-backend-production.up.railway.app'
    }
  },
  // Proxy configuration for development
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:5005',
        changeOrigin: true
      }
    }
  }
});
