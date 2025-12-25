import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import pkg from './package.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(async () => {
  const plugins = [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: pkg.name,
        short_name: pkg.title,
        description: 'Conquer the stars',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image' || request.destination === 'audio',
            handler: 'CacheFirst', // 优先使用缓存
            options: {
              cacheName: 'game-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 缓存 30 天
              }
            }
          }
        ]
      }
    })
  ]

  // 只在 ELECTRON_BUILD 环境变量存在时才加载 Electron 插件
  if (process.env.ELECTRON_BUILD) {
    // @ts-ignore - 动态导入 electron 插件
    const { default: electron } = await import('vite-plugin-electron/simple')
    const electronPlugins = await electron({
      main: {
        entry: 'electron/main.ts'
      },
      renderer: {}
    })
    plugins.push(...electronPlugins)
  }

  return {
    base: './',
    build: {
      outDir: 'docs',
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Vue 核心框架
            if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) return 'vendor-vue-core'
            // Vue 生态
            if (id.includes('node_modules/vue-router')) return 'vendor-vue-router'
            if (id.includes('node_modules/pinia')) return 'vendor-pinia'
            // UI 组件库
            if (id.includes('node_modules/reka-ui')) return 'vendor-reka-ui'
            if (id.includes('node_modules/@vueuse/core')) return 'vendor-vueuse'
            if (id.includes('node_modules/lucide-vue-next')) return 'vendor-icons'
            // 工具库
            if (id.includes('node_modules/crypto-js')) return 'vendor-crypto'
            if (id.includes('node_modules/file-saver')) return 'vendor-utils'
            if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) return 'vendor-utils'
            // Tailwind CSS
            if (id.includes('node_modules/@tailwindcss') || id.includes('node_modules/tailwindcss')) return 'vendor-tailwind'
            // 游戏逻辑模块
            if (id.includes('/src/logic/')) return 'game-logic'
            // 配置和类型
            if (id.includes('/src/config/') || id.includes('/src/types/')) return 'game-config'
            // 本地化 - 只打包默认语言和index，其他语言通过动态导入自动分割
            if (id.includes('/src/locales/index') || id.includes('/src/locales/zh-CN')) return 'locale-default'
            // 其他语言文件不指定chunk，让Vite根据动态导入自动分割
            // 其他 node_modules 依赖
            if (id.includes('node_modules/')) return 'vendor-others'
          },
          // 优化输出文件名
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    plugins,
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: ['Android >= 4.1', 'iOS >= 7.1', 'Chrome >= 31', 'Firefox >= 31', 'ie >= 8']
          })
        ]
      }
    },
    // 优化依赖预构建
    optimizeDeps: { include: ['vue', 'vue-router', 'pinia', 'reka-ui', '@vueuse/core', 'lucide-vue-next', 'crypto-js', 'file-saver'] }
  }
})
