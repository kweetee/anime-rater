import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// ВАЖНО: это имя репозитория на GitHub. Адрес сайта будет
// https://ВАШ-ЛОГИН.github.io/anime-rater/ — если назовёте репозиторий иначе, поменяйте здесь.
const BASE = '/anime-rater/'

// Конфигурация Vite: React + Tailwind CSS + PWA (установка на телефон и офлайн).
// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Новая версия приложения подтягивается сама при следующем открытии
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Anime Rater',
        short_name: 'Anime Rater',
        description: 'Личное приложение для калибровки оценок аниме',
        lang: 'ru',
        theme_color: '#131110',
        background_color: '#131110',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // Кэшируем все файлы сборки: после первого открытия приложение работает без интернета
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
